from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Count, Avg, Q
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

from .models import Response, Answer
from surveys.models import Survey, Question
from analytics.models import ActivityLog

# Create your views here.

@login_required
def response_list(request):
    """List all surveys with their response counts (for teachers/admins)"""
    user = request.user

    if user.is_teacher:
        surveys = Survey.objects.filter(creator=user).annotate(
            submission_count=Count('responses', filter=Q(responses__status='submitted'), distinct=True),
            total_questions=Count('questions', distinct=True)
        ).order_by('-created_at')
    elif user.is_admin_user:
        surveys = Survey.objects.annotate(
            submission_count=Count('responses', filter=Q(responses__status='submitted'), distinct=True),
            total_questions=Count('questions', distinct=True)
        ).order_by('-created_at')
    else:
        messages.error(request, 'Access denied.')
        return redirect('accounts:index')

    # Search
    search_query = request.GET.get('search', '').strip()
    if search_query:
        surveys = surveys.filter(title__icontains=search_query)

    # Pagination - 8 items per page
    paginator = Paginator(surveys, 8)
    page = request.GET.get('page', 1)
    
    try:
        surveys_page = paginator.page(page)
    except PageNotAnInteger:
        surveys_page = paginator.page(1)
    except EmptyPage:
        surveys_page = paginator.page(paginator.num_pages)

    context = {
        'surveys': surveys_page,
        'search_query': search_query,
    }

    return render(request, 'responses/response_list.html', context)


@login_required
def survey_responses(request, survey_id):
    """List responses for a specific survey"""
    user = request.user
    survey = get_object_or_404(Survey, id=survey_id)

    # Check permission
    if not user.is_admin_user and survey.creator != user:
        messages.error(request, 'Access denied.')
        return redirect('responses:response_list')

    responses = Response.objects.filter(
        survey=survey,
        status='submitted'
    ).select_related('respondent').order_by('-submitted_at')

    # Search
    search_query = request.GET.get('search', '').strip()
    if search_query:
        responses = responses.filter(
            Q(respondent__username__icontains=search_query) |
            Q(respondent__first_name__icontains=search_query) |
            Q(respondent__last_name__icontains=search_query)
        )

    # Date filtering
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    if date_from:
        responses = responses.filter(submitted_at__date__gte=date_from)
    if date_to:
        responses = responses.filter(submitted_at__date__lte=date_to)

    # Sorting
    sort_by = request.GET.get('sort', '-submitted_at')
    if sort_by in ['-submitted_at', 'submitted_at', 'respondent__username']:
        responses = responses.order_by(sort_by)

    # Pagination
    paginator = Paginator(responses, 20)
    page = request.GET.get('page')
    
    try:
        responses_page = paginator.page(page)
    except PageNotAnInteger:
        responses_page = paginator.page(1)
    except EmptyPage:
        responses_page = paginator.page(paginator.num_pages)

    context = {
        'survey': survey,
        'responses': responses_page,
        'total_responses': paginator.count,
        'search_query': search_query,
        'sort_by': sort_by,
        'date_from': date_from,
        'date_to': date_to,
    }

    return render(request, 'responses/survey_responses.html', context)


@login_required
def response_detail(request, response_id):
    """View a specific response"""
    response = get_object_or_404(Response, id=response_id)

    # Check access permissions
    if request.user.is_student:
        if response.respondent != request.user:
            messages.error(request, 'Access denied.')
            return redirect('surveys:response_history')
    elif request.user.is_teacher:
        if response.survey.creator != request.user:
            messages.error(request, 'Access denied.')
            return redirect('accounts:teacher_dashboard')

    # Get all answers
    answers = response.answers.all().select_related(
        'question',
        'selected_option'
    ).prefetch_related('selected_options').order_by('question__order')

    context = {
        'response': response,
        'survey': response.survey,
        'answers': answers,
    }

    return render(request, 'responses/response_detail.html', context)


@login_required
def delete_response(request, response_id):
    """Delete a response (teachers/admins only)"""
    response = get_object_or_404(Response, id=response_id)

    # Check permissions
    if request.user.is_teacher:
        if response.survey.creator != request.user:
            messages.error(request, 'Access denied.')
            return redirect('accounts:teacher_dashboard')
    elif not request.user.is_admin_user:
        messages.error(request, 'Access denied.')
        return redirect('accounts:index')

    if request.method == 'POST':
        survey_title = response.survey.title
        response.delete()

        ActivityLog.objects.create(
            user=request.user,
            action='response_deleted',
            description=f'Deleted response to survey: {survey_title}'
        )

        messages.success(request, 'Response deleted successfully.')
        return redirect('responses:response_list')

    context = {'response': response}
    return render(request, 'responses/response_confirm_delete.html', context)


@login_required
def survey_analytics(request, survey_id):
    """View analytics for a specific survey"""
    survey = get_object_or_404(Survey, id=survey_id)

    # Check access
    if request.user.is_teacher:
        if survey.creator != request.user:
            messages.error(request, 'Access denied.')
            return redirect('accounts:teacher_dashboard')
    elif not request.user.is_admin_user:
        messages.error(request, 'Access denied.')
        return redirect('accounts:index')

    # Get all submitted responses
    responses = Response.objects.filter(
        survey=survey,
        status='submitted'
    )

    # Get questions with answer statistics
    questions = survey.questions.all().order_by('order')
    question_stats = []

    for question in questions:
        answers = Answer.objects.filter(
            response__in=responses,
            question=question
        )

        stats = {
            'question': question,
            'total_answers': answers.count(),
        }

        if question.question_type in ['mcq', 'checkbox', 'dropdown']:
            # Count responses for each option
            option_counts = {}
            for option in question.options.all():
                if question.question_type == 'mcq' or question.question_type == 'dropdown':
                    count = answers.filter(selected_option=option).count()
                else:  # checkbox
                    count = answers.filter(selected_options=option).count()
                option_counts[option.option_text] = count
            stats['option_counts'] = option_counts

        elif question.question_type in ['likert', 'rating']:
            # Calculate average rating
            avg_rating = answers.aggregate(avg=Avg('number_answer'))['avg']
            stats['average_rating'] = round(avg_rating, 2) if avg_rating else 0

            # Count responses for each rating value
            rating_counts = {}
            for ans in answers:
                if ans.number_answer:
                    rating_counts[ans.number_answer] = rating_counts.get(ans.number_answer, 0) + 1
            stats['rating_counts'] = rating_counts

        elif question.question_type in ['text', 'textarea', 'email']:
            # Get all text responses
            text_responses = [ans.text_answer for ans in answers if ans.text_answer]
            stats['text_responses'] = text_responses[:50]  # Limit to 50 for display
            stats['total_text_responses'] = len(text_responses)

        question_stats.append(stats)

    context = {
        'survey': survey,
        'total_responses': responses.count(),
        'question_stats': question_stats,
        'completion_rate': calculate_completion_rate(survey),
    }

    return render(request, 'responses/survey_analytics.html', context)


@login_required
@require_http_methods(["POST"])
def export_responses(request, survey_id):
    """Export survey responses to CSV"""
    import csv
    from django.http import HttpResponse

    survey = get_object_or_404(Survey, id=survey_id)

    # Check access
    if request.user.is_teacher:
        if survey.creator != request.user:
            return JsonResponse({'error': 'Access denied'}, status=403)
    elif not request.user.is_admin_user:
        return JsonResponse({'error': 'Access denied'}, status=403)

    # Create CSV response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="survey_{survey_id}_responses.csv"'

    writer = csv.writer(response)

    # Write header
    questions = survey.questions.all().order_by('order')
    header = ['Response ID', 'Respondent', 'Submitted At']
    header.extend([f'Q{q.order}: {q.question_text[:50]}' for q in questions])
    writer.writerow(header)

    # Write data
    responses = Response.objects.filter(
        survey=survey,
        status='submitted'
    ).prefetch_related('answers')

    for resp in responses:
        row = [
            resp.id,
            resp.respondent.username if resp.respondent else 'Anonymous',
            resp.submitted_at.strftime('%Y-%m-%d %H:%M:%S') if resp.submitted_at else ''
        ]

        for question in questions:
            answer = resp.answers.filter(question=question).first()
            if answer:
                row.append(answer.get_answer_display() or '')
            else:
                row.append('')

        writer.writerow(row)

    # Log activity
    ActivityLog.objects.create(
        user=request.user,
        action='responses_exported',
        description=f'Exported responses for survey: {survey.title}'
    )

    return response


# Helper functions

def calculate_completion_rate(survey):
    """Calculate the completion rate for a survey"""
    total_assigned = survey.sections.aggregate(
        total=Count('students')
    )['total'] or 0

    completed = Response.objects.filter(
        survey=survey,
        status='submitted'
    ).count()

    if total_assigned == 0:
        return 0

    return round((completed / total_assigned) * 100, 1)

@login_required
def response_viewer(request):
    """Response Viewer page for teachers/admins"""
    user = request.user

    # Check access permissions
    if not (user.is_teacher or user.is_admin_user):
        messages.error(request, 'Access denied. Teachers and admins only.')
        return redirect('accounts:index')

    return render(request, 'responses/response_viewer.html')

