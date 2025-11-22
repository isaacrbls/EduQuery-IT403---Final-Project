from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q, Count, Prefetch
from django.core.exceptions import PermissionDenied
from django.db import transaction
import json
from datetime import datetime

from .models import Survey, Question, QuestionOption, LikertScale
from .forms import SurveyForm, QuestionForm
from responses.models import Response, Answer
from analytics.models import ActivityLog
from accounts.models import Section


@login_required
def create_survey(request):
    if not request.user.is_teacher:
        messages.error(request, 'Access denied. Teachers only.')
        return redirect('accounts:index')
    
    survey = None
    questions = []
    
    if request.method == 'POST':
        form = SurveyForm(request.POST, user=request.user)
        if form.is_valid():
            survey = form.save(commit=False)
            survey.creator = request.user
            # Set status to published if is_active is checked
            if survey.is_active:
                survey.status = 'published'
            survey.save()
            form.save_m2m()
            
            messages.success(request, f'Survey "{survey.title}" created successfully! Now add questions below.')
            questions = survey.questions.filter(is_active=True).order_by('order')
    else:
        form = SurveyForm(user=request.user)
    
    context = {
        'form': form,
        'survey': survey,
        'questions': questions,
        'question_form': QuestionForm() if survey else None,
        'action': 'Create'
    }
    return render(request, 'surveys/create_survey.html', context)


@login_required
def edit_survey(request, survey_id):
    if not request.user.is_teacher:
        messages.error(request, 'Access denied. Teachers only.')
        return redirect('accounts:index')
    
    survey = get_object_or_404(Survey, id=survey_id, creator=request.user)
    
    if request.method == 'POST':
        form = SurveyForm(request.POST, instance=survey, user=request.user)
        if form.is_valid():
            old_title = survey.title
            old_description = survey.description
            
            survey = form.save(commit=False)
            # Set status to published if is_active is checked, otherwise set to draft
            if survey.is_active:
                survey.status = 'published'
            else:
                survey.status = 'draft'
            survey.save()
            form.save_m2m()
            
            if (old_title != survey.title or old_description != survey.description) and survey.response_count > 0:
                survey.version += 1
                survey.save()
                messages.warning(request, f'Survey version incremented to {survey.version}. Students with incomplete responses must retake the survey.')
            else:
                messages.success(request, 'Survey settings updated successfully!')
            
            return redirect('surveys:edit_survey', survey_id=survey.id)
    else:
        form = SurveyForm(instance=survey, user=request.user)
    
    questions = survey.questions.filter(is_active=True).order_by('order')
    
    context = {
        'survey': survey,
        'form': form,
        'questions': questions,
        'question_form': QuestionForm(),
        'response_count': survey.response_count,
    }
    return render(request, 'surveys/edit_survey.html', context)


def handle_batch_save(request, survey, questions_data):
    try:
        with transaction.atomic():
            existing_count = survey.questions.filter(is_active=True).count()
            
            from django.db.models import F
            survey.questions.filter(is_active=True).update(order=F('order') + len(questions_data))
            
            created_questions = []
            for i, q_data in enumerate(questions_data):
                question_text = q_data.get('question_text', '').strip()
                if not question_text:
                    continue
                
                question = Question.objects.create(
                    survey=survey,
                    question_text=question_text,
                    question_type=q_data.get('question_type', 'short_answer'),
                    is_required=q_data.get('is_required', True),
                    order=i,
                    options=q_data.get('options', []),
                    likert_min=q_data.get('likert_min', 1),
                    likert_max=q_data.get('likert_max', 5),
                    likert_labels=q_data.get('likert_labels', []),
                )
                created_questions.append(question)
            
            version_incremented = False
            if survey.response_count > 0:
                survey.version += 1
                survey.save()
                version_incremented = True
            
            return JsonResponse({
                'success': True,
                'message': f'Successfully saved {len(created_questions)} question(s)',
                'version_incremented': version_incremented,
                'new_version': survey.version if version_incremented else None,
                'questions': [{'id': q.id, 'order': q.order} for q in created_questions]
            })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error saving questions: {str(e)}'
        }, status=400)


@login_required
def add_question(request, survey_id):
    if not request.user.is_teacher:
        return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, creator=request.user)
    
    if request.method == 'POST':
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                
                if data.get('batch_save'):
                    questions_data = data.get('questions', [])
                    return handle_batch_save(request, survey, questions_data)
                
            except json.JSONDecodeError:
                return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
        
        form = QuestionForm(request.POST)
        if form.is_valid():
            with transaction.atomic():
                from django.db.models import F
                survey.questions.filter(is_active=True).update(order=F('order') + 1)
                
                question = form.save(commit=False)
                question.survey = survey
                question.order = 0
                question.save()
                
                if survey.response_count > 0:
                    survey.version += 1
                    survey.save()
                    messages.warning(request, f'Survey version incremented to {survey.version}.')
                
                messages.success(request, 'Question added successfully!')
            return redirect('surveys:edit_survey', survey_id=survey.id)
    else:
        form = QuestionForm()
    
    context = {
        'survey': survey,
        'form': form,
        'action': 'Add'
    }
    return render(request, 'surveys/question_form.html', context)


@login_required
def edit_question(request, question_id):
    if not request.user.is_teacher:
        messages.error(request, 'Access denied. Teachers only.')
        return redirect('accounts:index')
    
    question = get_object_or_404(Question, id=question_id, survey__creator=request.user)
    survey = question.survey
    
    if request.method == 'POST':
        form = QuestionForm(request.POST, instance=question)
        if form.is_valid():
            old_text = question.question_text
            old_type = question.question_type
            old_options = question.options
            
            question = form.save()
            
            if (old_text != question.question_text or 
                old_type != question.question_type or 
                old_options != question.options) and survey.response_count > 0:
                survey.version += 1
                survey.save()
                messages.warning(request, f'Survey version incremented to {survey.version}.')
            
            messages.success(request, 'Question updated successfully!')
            return redirect('surveys:edit_survey', survey_id=survey.id)
    else:
        form = QuestionForm(instance=question)
    
    context = {
        'survey': survey,
        'question': question,
        'form': form,
        'action': 'Edit'
    }
    return render(request, 'surveys/question_form.html', context)


@login_required
@require_http_methods(["POST"])
def delete_question(request, question_id):
    if not request.user.is_teacher:
        return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
    
    question = get_object_or_404(Question, id=question_id, survey__creator=request.user)
    survey = question.survey
    
    question.is_active = False
    question.save()
    
    if survey.response_count > 0:
        survey.version += 1
        survey.save()
        messages.warning(request, f'Question deactivated. Survey version incremented to {survey.version}.')
    else:
        messages.success(request, 'Question deactivated successfully!')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'message': 'Question deactivated'})
    
    return redirect('surveys:edit_survey', survey_id=survey.id)


@login_required
@require_http_methods(["POST"])
def restore_question(request, question_id):
    if not request.user.is_teacher:
        return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
    
    question = get_object_or_404(Question, id=question_id, survey__creator=request.user)
    survey = question.survey
    
    question.is_active = True
    question.save()
    
    if survey.response_count > 0:
        survey.version += 1
        survey.save()
        messages.warning(request, f'Question restored. Survey version incremented to {survey.version}.')
    else:
        messages.success(request, 'Question restored successfully!')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'message': 'Question restored'})
    
    return redirect('surveys:edit_survey', survey_id=survey.id)


@login_required
@require_http_methods(["POST"])
def reorder_questions(request, survey_id):
    if not request.user.is_teacher:
        return JsonResponse({'success': False, 'message': 'Access denied'}, status=403)
    
    survey = get_object_or_404(Survey, id=survey_id, creator=request.user)
    
    try:
        data = json.loads(request.body)
        order_updates = data.get('orders', [])
        
        with transaction.atomic():
            for item in order_updates:
                question_id = item.get('question_id')
                new_order = item.get('order')
                
                question = Question.objects.get(id=question_id, survey=survey)
                question.order = new_order
                question.save()
        
        return JsonResponse({'success': True, 'message': 'Question order updated'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@login_required
def survey_builder(request, survey_id=None):
    """
    Legacy survey builder view - redirects to the new form-based builder.
    For creating new surveys, redirect to create_survey.
    For editing existing surveys, redirect to edit_survey.
    """
    if not request.user.is_teacher:
        messages.error(request, 'Access denied. Teachers only.')
        return redirect('accounts:index')
    
    if survey_id:
        # Editing existing survey - redirect to edit_survey
        return redirect('surveys:edit_survey', survey_id=survey_id)
    else:
        # Creating new survey - redirect to create_survey
        return redirect('surveys:create_survey')


@login_required
def survey_list(request):
    if request.user.is_teacher:
        surveys = request.user.created_surveys.all().order_by('-created_at')
        return render(request, 'accounts/TCsurveyList.html', {'surveys': surveys})

    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')

    user = request.user

    assigned_surveys = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct().prefetch_related('sections', 'creator').annotate(
        total_responses=Count('responses')
    ).order_by('-created_at')

    completed_survey_ids = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).values_list('survey_id', flat=True)

    pending_surveys = assigned_surveys.exclude(id__in=completed_survey_ids)
    completed_surveys = assigned_surveys.filter(id__in=completed_survey_ids)

    filter_status = request.GET.get('status', 'all')
    if filter_status == 'pending':
        surveys = pending_surveys
    elif filter_status == 'completed':
        surveys = completed_surveys
    else:
        surveys = assigned_surveys

    search_query = request.GET.get('search', '').strip()
    if search_query:
        surveys = surveys.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )

    for survey in surveys:
        survey.is_completed = survey.id in completed_survey_ids
        survey.is_overdue = survey.due_date and timezone.now() > survey.due_date if survey.due_date else False
        
        if not survey.is_completed:
            in_progress_response = Response.objects.filter(
                survey=survey,
                respondent=user,
                status='in_progress'
            ).first()
            survey.has_progress = in_progress_response is not None

    context = {
        'surveys': surveys,
        'pending_count': pending_surveys.count(),
        'completed_count': completed_surveys.count(),
        'total_count': assigned_surveys.count(),
        'filter_status': filter_status,
        'search_query': search_query,
        'completed_survey_ids': list(completed_survey_ids),
    }

    return render(request, 'accounts/SurveyListdashboard.html', context)


@login_required
def take_survey(request, survey_id):
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id, status='published')

    if not survey.sections.filter(students=user).exists():
        messages.error(request, 'You do not have access to this survey.')
        return redirect('surveys:survey_list')

    existing_submitted = Response.objects.filter(
        survey=survey,
        respondent=user,
        status='submitted'
    ).first()

    if existing_submitted and not survey.allow_multiple_submissions:
        messages.info(request, 'You have already completed this survey.')
        return redirect('surveys:survey_detail', response_id=existing_submitted.id)

    if survey.due_date and timezone.now() > survey.due_date:
        messages.warning(request, 'This survey has passed its due date.')

    response, created = Response.objects.get_or_create(
        survey=survey,
        respondent=user if not survey.anonymous else None,
        status='in_progress',
        defaults={'ip_address': get_client_ip(request)}
    )

    if created:
        ActivityLog.objects.create(
            user=user,
            action='survey_started',
            description=f'Started survey: {survey.title}'
        )

    questions = survey.questions.filter(is_active=True).prefetch_related(
        'option_choices',
        'likert_scale'
    )
    
    if survey.randomize_questions and created:
        questions = questions.order_by('?')
    else:
        questions = questions.order_by('order')

    existing_answers = Answer.objects.filter(response=response).select_related(
        'selected_option'
    ).prefetch_related('selected_options')

    answers_dict = {ans.question_id: ans for ans in existing_answers}

    questions_with_answers = []
    for question in questions:
        question.existing_answer = answers_dict.get(question.id)
        questions_with_answers.append(question)

    context = {
        'survey': survey,
        'questions': questions_with_answers,
        'response': response,
        'progress_percentage': calculate_progress(response, questions_with_answers),
    }

    return render(request, 'accounts/SurveyForm.html', context)


@login_required
@require_http_methods(["POST"])
def submit_survey(request, survey_id):
    if not request.user.is_student:
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id, status='published')

    if not survey.sections.filter(students=user).exists():
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    existing_submitted = Response.objects.filter(
        survey=survey,
        respondent=user,
        status='submitted'
    ).first()

    if existing_submitted and not survey.allow_multiple_submissions:
        return JsonResponse({
            'success': False,
            'error': 'You have already submitted this survey'
        }, status=400)

    response = Response.objects.filter(
        survey=survey,
        respondent=user if not survey.anonymous else None,
        status='in_progress'
    ).first()

    if not response:
        response = Response.objects.create(
            survey=survey,
            respondent=user if not survey.anonymous else None,
            ip_address=get_client_ip(request)
        )

    questions = survey.questions.all()
    errors = []
    saved_count = 0

    for question in questions:
        answer_key = f'question_{question.id}'

        if question.required:
            has_answer = False
            
            if question.question_type == 'checkbox':
                has_answer = bool(request.POST.getlist(answer_key))
            else:
                answer_value = request.POST.get(answer_key, '').strip()
                has_answer = bool(answer_value)
            
            if not has_answer:
                errors.append(f'Question "{question.question_text[:50]}" is required')
                continue

        answer, created = Answer.objects.get_or_create(
            response=response,
            question=question
        )

        try:
            if question.question_type in ['text', 'textarea', 'email']:
                answer.text_answer = request.POST.get(answer_key, '').strip()
                answer.save()
                saved_count += 1

            elif question.question_type == 'mcq':
                option_id = request.POST.get(answer_key)
                if option_id:
                    answer.selected_option_id = int(option_id)
                    answer.save()
                    saved_count += 1

            elif question.question_type == 'checkbox':
                option_ids = request.POST.getlist(answer_key)
                if option_ids:
                    answer.save()
                    answer.selected_options.set([int(oid) for oid in option_ids])
                    saved_count += 1

            elif question.question_type in ['likert', 'rating']:
                value = request.POST.get(answer_key)
                if value:
                    answer.number_answer = int(value)
                    answer.save()
                    saved_count += 1

            elif question.question_type == 'date':
                date_value = request.POST.get(answer_key)
                if date_value:
                    answer.date_answer = date_value
                    answer.save()
                    saved_count += 1

            elif question.question_type == 'dropdown':
                option_id = request.POST.get(answer_key)
                if option_id:
                    answer.selected_option_id = int(option_id)
                    answer.save()
                    saved_count += 1

        except Exception as e:
            errors.append(f'Error saving answer for question {question.order}: {str(e)}')

    if errors:
        return JsonResponse({'success': False, 'errors': errors}, status=400)

    response.status = 'submitted'
    response.submitted_at = timezone.now()
    response.save()

    ActivityLog.objects.create(
        user=user,
        action='survey_submitted',
        description=f'Submitted survey: {survey.title}'
    )

    return JsonResponse({
        'success': True,
        'message': 'Survey submitted successfully!',
        'redirect_url': f'/surveys/congratulations/{response.id}/'
    })


@login_required
@require_http_methods(["POST"])
def save_survey_progress(request, survey_id):
    if not request.user.is_student:
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id)

    if not survey.sections.filter(students=user).exists():
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    response, created = Response.objects.get_or_create(
        survey=survey,
        respondent=user if not survey.anonymous else None,
        status='in_progress',
        defaults={'ip_address': get_client_ip(request)}
    )

    try:
        data = json.loads(request.body)
        answers_data = data.get('answers', {})
        saved_count = 0

        for question_id_str, answer_value in answers_data.items():
            question_id = int(question_id_str.replace('question_', ''))
            question = Question.objects.get(id=question_id, survey=survey)
            
            answer, created = Answer.objects.get_or_create(
                response=response,
                question=question
            )

            if question.question_type in ['text', 'textarea', 'email']:
                if answer_value:
                    answer.text_answer = answer_value
                    answer.save()
                    saved_count += 1
                    
            elif question.question_type in ['likert', 'rating']:
                if answer_value:
                    answer.number_answer = int(answer_value)
                    answer.save()
                    saved_count += 1
                    
            elif question.question_type == 'mcq':
                if answer_value:
                    answer.selected_option_id = int(answer_value)
                    answer.save()
                    saved_count += 1
                    
            elif question.question_type == 'checkbox':
                if answer_value and isinstance(answer_value, list):
                    answer.save()
                    answer.selected_options.set([int(oid) for oid in answer_value])
                    saved_count += 1
                    
            elif question.question_type == 'dropdown':
                if answer_value:
                    answer.selected_option_id = int(answer_value)
                    answer.save()
                    saved_count += 1
                    
            elif question.question_type == 'date':
                if answer_value:
                    answer.date_answer = answer_value
                    answer.save()
                    saved_count += 1

        progress = calculate_progress(response, survey.questions.all())

        return JsonResponse({
            'success': True,
            'message': f'Progress saved ({saved_count} answers)',
            'progress': progress
        })

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
def response_history(request):
    user = request.user
    
    # For students: show their response history
    if user.is_student:
        responses = Response.objects.filter(
            respondent=user,
            status='submitted'
        ).select_related('survey', 'survey__creator').annotate(
            answer_count=Count('answers')
        ).order_by('-submitted_at')

        search_query = request.GET.get('search', '').strip()
        if search_query:
            responses = responses.filter(
                Q(survey__title__icontains=search_query) |
                Q(survey__description__icontains=search_query)
            )

        for response in responses:
            if response.submitted_at and response.started_at:
                delta = response.submitted_at - response.started_at
                response.completion_time_minutes = int(delta.total_seconds() / 60)

        context = {
            'responses': responses,
            'total_responses': responses.count(),
            'search_query': search_query,
        }

        return render(request, 'accounts/History.html', context)
    
    # For teachers/admins: show their created surveys with response counts
    else:
        surveys = Survey.objects.filter(
            creator=user
        ).prefetch_related('responses', 'sections').order_by('-created_at')
        
        search_query = request.GET.get('search', '').strip()
        if search_query:
            surveys = surveys.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        context = {
            'surveys': surveys,
            'total_surveys': surveys.count(),
            'search_query': search_query,
        }
        
        return render(request, 'accounts/TCHistory.html', context)


@login_required
def survey_detail(request, response_id):
    response = get_object_or_404(Response, id=response_id)

    if request.user.is_student:
        if response.respondent != request.user:
            messages.error(request, 'Access denied.')
            return redirect('surveys:response_history')
    elif request.user.is_teacher:
        if response.survey.creator != request.user:
            messages.error(request, 'Access denied.')
            return redirect('accounts:teacher_dashboard')
    else:
        messages.error(request, 'Access denied.')
        return redirect('accounts:index')

    answers = response.answers.all().select_related(
        'question',
        'selected_option'
    ).prefetch_related('selected_options').order_by('question__order')

    completion_time = None
    if response.submitted_at and response.started_at:
        delta = response.submitted_at - response.started_at
        minutes = int(delta.total_seconds() / 60)
        if minutes < 60:
            completion_time = f"{minutes} minute{'s' if minutes != 1 else ''}"
        else:
            hours = minutes // 60
            remaining_minutes = minutes % 60
            completion_time = f"{hours} hour{'s' if hours != 1 else ''}"
            if remaining_minutes > 0:
                completion_time += f" {remaining_minutes} minute{'s' if remaining_minutes != 1 else ''}"

    context = {
        'response': response,
        'survey': response.survey,
        'answers': answers,
        'completion_time': completion_time,
    }

    return render(request, 'accounts/HistoryDetails.html', context)


@login_required
def congratulations(request, response_id):
    response = get_object_or_404(Response, id=response_id, respondent=request.user)

    if response.status != 'submitted':
        messages.warning(request, 'This survey has not been submitted yet.')
        return redirect('surveys:take_survey', survey_id=response.survey.id)

    completion_time = None
    if response.submitted_at and response.started_at:
        delta = response.submitted_at - response.started_at
        minutes = int(delta.total_seconds() / 60)
        completion_time = f"{minutes} minute{'s' if minutes != 1 else ''}"

    context = {
        'response': response,
        'survey': response.survey,
        'completion_time': completion_time,
    }

    return render(request, 'accounts/SurveyCongratulations.html', context)


@login_required
@require_http_methods(["POST"])
def validate_survey_access(request, survey_id):
    if not request.user.is_student:
        return JsonResponse({'valid': False, 'error': 'Access denied'}, status=403)

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id)

    has_access = survey.sections.filter(students=user).exists()
    is_published = survey.status == 'published'
    is_overdue = survey.due_date and timezone.now() > survey.due_date if survey.due_date else False
    
    already_submitted = Response.objects.filter(
        survey=survey,
        respondent=user,
        status='submitted'
    ).exists()

    can_submit = (
        has_access and
        is_published and
        not is_overdue and
        (not already_submitted or survey.allow_multiple_submissions)
    )

    return JsonResponse({
        'valid': can_submit,
        'has_access': has_access,
        'is_published': is_published,
        'is_overdue': is_overdue,
        'already_submitted': already_submitted,
        'allow_multiple': survey.allow_multiple_submissions
    })


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def calculate_progress(response, questions):
    if not questions:
        return 0

    total_questions = len(questions) if hasattr(questions, '__len__') else questions.count()
    
    if total_questions == 0:
        return 0

    answered = Answer.objects.filter(
        response=response
    ).exclude(
        Q(text_answer='') | Q(text_answer__isnull=True),
        selected_option__isnull=True,
        number_answer__isnull=True,
        date_answer__isnull=True
    ).filter(
        Q(text_answer__isnull=False) | 
        Q(selected_option__isnull=False) | 
        Q(number_answer__isnull=False) |
        Q(date_answer__isnull=False)
    ).count()

    checkbox_answered = Answer.objects.filter(
        response=response,
        question__question_type='checkbox'
    ).prefetch_related('selected_options').filter(
        selected_options__isnull=False
    ).distinct().count()

    total_answered = answered + checkbox_answered
    
    progress = (total_answered / total_questions * 100) if total_questions > 0 else 0
    return min(progress, 100)



