from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Count, Prefetch
import json

from .models import Survey, Question, QuestionOption, LikertScale
from responses.models import Response, Answer
from analytics.models import ActivityLog

# Create your views here.

@login_required
def survey_list(request):
    """List all assigned surveys for students"""
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')

    user = request.user

    # Get all assigned surveys
    assigned_surveys = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct().prefetch_related('sections', 'creator').order_by('-created_at')

    # Get completed survey IDs
    completed_survey_ids = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).values_list('survey_id', flat=True)

    # Separate pending and completed
    pending_surveys = assigned_surveys.exclude(id__in=completed_survey_ids)
    completed_surveys = assigned_surveys.filter(id__in=completed_survey_ids)

    # Filter by status if requested
    filter_status = request.GET.get('status', 'all')
    if filter_status == 'pending':
        surveys = pending_surveys
    elif filter_status == 'completed':
        surveys = completed_surveys
    else:
        surveys = assigned_surveys

    # Search functionality
    search_query = request.GET.get('search', '').strip()
    if search_query:
        surveys = surveys.filter(
            Q(title__icontains=search_query) |
            Q(description__icontains=search_query)
        )

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
    """Take/view a specific survey"""
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id, status='published')

    # Check if user has access to this survey
    if not survey.sections.filter(students=user).exists():
        messages.error(request, 'You do not have access to this survey.')
        return redirect('surveys:survey_list')

    # Check if survey is already completed (and multiple submissions not allowed)
    existing_response = Response.objects.filter(
        survey=survey,
        respondent=user,
        status='submitted'
    ).first()

    if existing_response and not survey.allow_multiple_submissions:
        messages.info(request, 'You have already completed this survey.')
        return redirect('surveys:survey_detail', response_id=existing_response.id)

    # Check due date
    if survey.due_date and timezone.now() > survey.due_date:
        messages.warning(request, 'This survey has passed its due date.')

    # Get or create in-progress response
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

    # Get all questions with their options
    questions = survey.questions.all().prefetch_related(
        'options',
        'likert_scale'
    ).order_by('order')

    # Get existing answers
    existing_answers = Answer.objects.filter(response=response).select_related(
        'selected_option'
    ).prefetch_related('selected_options')

    # Create a dict of existing answers by question_id
    answers_dict = {ans.question_id: ans for ans in existing_answers}

    # Attach existing answers to questions
    for question in questions:
        question.existing_answer = answers_dict.get(question.id)

    context = {
        'survey': survey,
        'questions': questions,
        'response': response,
        'progress_percentage': calculate_progress(response, questions),
    }

    return render(request, 'accounts/SurveyForm.html', context)


@login_required
@require_http_methods(["POST"])
def submit_survey(request, survey_id):
    """Submit survey responses"""
    if not request.user.is_student:
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id, status='published')

    # Check access
    if not survey.sections.filter(students=user).exists():
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    # Get or create response
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

    # Process each question
    questions = survey.questions.all()
    errors = []

    for question in questions:
        answer_key = f'question_{question.id}'

        # Check if required
        if question.required and answer_key not in request.POST:
            errors.append(f'Question {question.order} is required')
            continue

        # Get or create answer
        answer, created = Answer.objects.get_or_create(
            response=response,
            question=question
        )

        # Save answer based on question type
        try:
            if question.question_type in ['text', 'textarea', 'email']:
                answer.text_answer = request.POST.get(answer_key, '')

            elif question.question_type == 'mcq':
                option_id = request.POST.get(answer_key)
                if option_id:
                    answer.selected_option_id = option_id

            elif question.question_type == 'checkbox':
                option_ids = request.POST.getlist(answer_key)
                answer.save()  # Save first to enable M2M
                answer.selected_options.set(option_ids)

            elif question.question_type in ['likert', 'rating']:
                value = request.POST.get(answer_key)
                if value:
                    answer.number_answer = int(value)

            elif question.question_type == 'date':
                date_value = request.POST.get(answer_key)
                if date_value:
                    answer.date_answer = date_value

            elif question.question_type == 'dropdown':
                option_id = request.POST.get(answer_key)
                if option_id:
                    answer.selected_option_id = option_id

            answer.save()

        except Exception as e:
            errors.append(f'Error saving answer for question {question.order}: {str(e)}')

    if errors:
        return JsonResponse({'success': False, 'errors': errors}, status=400)

    # Mark response as submitted
    response.status = 'submitted'
    response.submitted_at = timezone.now()
    response.save()

    # Log activity
    ActivityLog.objects.create(
        user=user,
        action='survey_submitted',
        description=f'Submitted survey: {survey.title}'
    )

    return JsonResponse({
        'success': True,
        'message': 'Survey submitted successfully!',
        'redirect_url': f'/surveys/response/{response.id}/'
    })


@login_required
@require_http_methods(["POST"])
def save_survey_progress(request, survey_id):
    """Save survey progress without submitting"""
    if not request.user.is_student:
        return JsonResponse({'success': False, 'error': 'Access denied'}, status=403)

    user = request.user
    survey = get_object_or_404(Survey, id=survey_id)

    # Get or create response
    response, created = Response.objects.get_or_create(
        survey=survey,
        respondent=user if not survey.anonymous else None,
        status='in_progress',
        defaults={'ip_address': get_client_ip(request)}
    )

    # Parse JSON data
    try:
        data = json.loads(request.body)
        answers_data = data.get('answers', {})

        for question_id, answer_value in answers_data.items():
            question = Question.objects.get(id=question_id)
            answer, created = Answer.objects.get_or_create(
                response=response,
                question=question
            )

            # Save based on type
            if question.question_type in ['text', 'textarea', 'email']:
                answer.text_answer = answer_value
            elif question.question_type in ['likert', 'rating']:
                answer.number_answer = int(answer_value) if answer_value else None
            elif question.question_type == 'mcq':
                answer.selected_option_id = answer_value
            elif question.question_type == 'checkbox':
                answer.save()
                answer.selected_options.set(answer_value)

            answer.save()

        return JsonResponse({'success': True, 'message': 'Progress saved'})

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@login_required
def response_history(request):
    """View response history"""
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')

    user = request.user

    # Get all submitted responses
    responses = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).select_related('survey', 'survey__creator').order_by('-submitted_at')

    # Filter by search
    search_query = request.GET.get('search', '').strip()
    if search_query:
        responses = responses.filter(
            Q(survey__title__icontains=search_query) |
            Q(survey__description__icontains=search_query)
        )

    context = {
        'responses': responses,
        'total_responses': responses.count(),
        'search_query': search_query,
    }

    return render(request, 'accounts/History.html', context)


@login_required
def survey_detail(request, response_id):
    """View details of a submitted response"""
    response = get_object_or_404(Response, id=response_id)

    # Check access
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

    # Get all answers with questions
    answers = response.answers.all().select_related(
        'question',
        'selected_option'
    ).prefetch_related('selected_options').order_by('question__order')

    # Calculate completion time
    completion_time = None
    if response.submitted_at and response.started_at:
        delta = response.submitted_at - response.started_at
        minutes = delta.total_seconds() / 60
        completion_time = f"{int(minutes)} minutes"

    context = {
        'response': response,
        'survey': response.survey,
        'answers': answers,
        'completion_time': completion_time,
    }

    return render(request, 'accounts/HistoryDetails.html', context)


@login_required
def congratulations(request, response_id):
    """Show congratulations page after survey submission"""
    response = get_object_or_404(Response, id=response_id, respondent=request.user)

    context = {
        'response': response,
        'survey': response.survey,
    }

    return render(request, 'accounts/SurveyCongratulations.html', context)


# Helper functions

def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def calculate_progress(response, questions):
    """Calculate survey completion progress"""
    if not questions:
        return 0

    answered_count = Answer.objects.filter(
        response=response
    ).exclude(
        text_answer='',
        selected_option__isnull=True,
        number_answer__isnull=True
    ).count()

    total_questions = questions.count()
    return (answered_count / total_questions * 100) if total_questions > 0 else 0

@login_required
def dashboard(request):
    """Survey management dashboard (Student view)"""
    return render(request, 'accounts/StudentDashboard.html')

@login_required
def survey_create(request):
    """Create a new survey"""
    return render(request, 'surveys/survey_form.html')

@login_required
def survey_detail(request, survey_id):
    """View survey details"""
    return render(request, 'surveys/survey_detail.html')

@login_required
def survey_edit(request, survey_id):
    """Edit an existing survey"""
    return render(request, 'surveys/survey_form.html')

@login_required
def survey_delete(request, survey_id):
    """Delete a survey"""
    return redirect('surveys:dashboard')

@login_required
def survey_assign(request, survey_id):
    """Assign survey to sections"""
    return render(request, 'surveys/survey_assign.html')

@login_required
def student_surveys(request):
    """List of surveys assigned to student"""
    return render(request, 'surveys/student_surveys.html')

@login_required
def take_survey(request, survey_id):
    """Take a survey"""
    return render(request, 'surveys/take_survey.html')

@login_required
def submit_survey(request, survey_id):
    """Submit survey responses"""
    return redirect('responses:my_response_history')

# API Views
@api_view(['POST'])
@login_required
def api_create_question(request):
    """API endpoint to create a question"""
    return Response({'status': 'success'})

@api_view(['PUT'])
@login_required
def api_update_question(request, question_id):
    """API endpoint to update a question"""
    return Response({'status': 'success'})

@api_view(['DELETE'])
@login_required
def api_delete_question(request, question_id):
    """API endpoint to delete a question"""
    return Response({'status': 'success'})


