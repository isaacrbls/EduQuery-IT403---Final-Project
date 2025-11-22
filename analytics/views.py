from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from surveys.models import Survey, Question
from responses.models import Response as SurveyResponse, Answer
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
import json

# Create your views here.

@login_required
def analytics_dashboard(request):
    """Main analytics dashboard"""
    user = request.user
    
    # Base query for user's surveys
    if user.is_teacher:
        surveys = Survey.objects.filter(creator=user)
    elif user.is_admin_user:
        surveys = Survey.objects.all()
    else:
        # Students don't see this dashboard usually, or see their own stats
        context = {
            'total_surveys': 0,
            'total_responses': 0,
            'active_surveys': 0,
            'response_rate': 0,
            'recent_surveys': [],
            'timeline_labels': json.dumps([]),
            'timeline_data': json.dumps([]),
            'performance_labels': json.dumps([]),
            'performance_data': json.dumps([]),
        }
        return render(request, 'analytics/analytics_dashboard.html', context)

    # 1. Total Surveys
    total_surveys = surveys.count()

    # 2. Total Responses
    total_responses = SurveyResponse.objects.filter(
        survey__in=surveys, 
        status='submitted'
    ).count()

    # 3. Active Surveys
    active_surveys = surveys.filter(
        status='published', 
        is_active=True
    ).count()

    # 4. Response Rate Calculation
    # Total potential responses = Sum of students in sections assigned to each survey
    total_potential_responses = 0
    for survey in surveys:
        # Get count of students in all sections assigned to this survey
        # Using distinct() to avoid double counting if a student is in multiple sections assigned to same survey (unlikely but possible)
        student_count = 0
        for section in survey.sections.all():
            student_count += section.students.count()
        total_potential_responses += student_count
    
    response_rate = 0
    if total_potential_responses > 0:
        response_rate = (total_responses / total_potential_responses) * 100

    # 5. Recent Surveys
    recent_surveys = surveys.order_by('-created_at')[:5]

    # 6. Chart Data: Response Timeline (Last 30 days)
    timeline_data = []
    timeline_labels = []
    today = timezone.now().date()
    for i in range(29, -1, -1):
        date = today - timedelta(days=i)
        count = SurveyResponse.objects.filter(
            survey__in=surveys,
            status='submitted',
            submitted_at__date=date
        ).count()
        timeline_labels.append(date.strftime('%b %d'))
        timeline_data.append(count)

    # 7. Chart Data: Top Surveys by Responses
    top_surveys = surveys.annotate(
        total_response_count=Count('responses', filter=Q(responses__status='submitted'))
    ).order_by('-total_response_count')[:5]
    
    performance_labels = [s.title[:20] + '...' if len(s.title) > 20 else s.title for s in top_surveys]
    performance_data = [s.total_response_count for s in top_surveys]

    context = {
        'total_surveys': total_surveys,
        'total_responses': total_responses,
        'active_surveys': active_surveys,
        'response_rate': round(response_rate, 1),
        'recent_surveys': recent_surveys,
        'timeline_labels': json.dumps(timeline_labels),
        'timeline_data': json.dumps(timeline_data),
        'performance_labels': json.dumps(performance_labels),
        'performance_data': json.dumps(performance_data),
    }

    return render(request, 'analytics/analytics_dashboard.html', context)

@login_required
def survey_analytics(request, survey_id):
    """Analytics for a specific survey"""
    survey = get_object_or_404(Survey, id=survey_id)
    return render(request, 'analytics/survey_analytics.html', {'survey': survey})

# API Views for Chart Data
@api_view(['GET'])
@login_required
def api_mcq_data(request, survey_id):
    """API endpoint to get MCQ data for pie charts"""
    survey = get_object_or_404(Survey, id=survey_id)
    data = []
    # Filter for MCQ and Checkbox questions
    questions = survey.questions.filter(question_type__in=['multiple_choice', 'checkbox'])
    
    for question in questions:
        options_data = []
        # Get all options for this question
        options = question.option_choices.all()
        for option in options:
            # Count answers selecting this option
            # For multiple choice (single select)
            count = Answer.objects.filter(question=question, selected_option=option).count()
            # For checkbox (multi select) - check selected_options
            count += Answer.objects.filter(question=question, selected_options=option).count()
            
            options_data.append({
                'label': option.option_text,
                'count': count
            })
        
        data.append({
            'question_id': question.id,
            'question_text': question.question_text,
            'type': 'pie',
            'options': options_data
        })
        
    return Response({'status': 'success', 'data': data})

@api_view(['GET'])
@login_required
def api_likert_data(request, survey_id):
    """API endpoint to get Likert scale data for bar charts"""
    survey = get_object_or_404(Survey, id=survey_id)
    data = []
    questions = survey.questions.filter(question_type='likert_scale')
    
    for question in questions:
        # Likert scale usually 1-5 or min-max
        min_val = question.likert_min
        max_val = question.likert_max
        
        distribution = []
        for i in range(min_val, max_val + 1):
            count = Answer.objects.filter(question=question, number_answer=i).count()
            distribution.append({
                'label': str(i),
                'count': count
            })
            
        data.append({
            'question_id': question.id,
            'question_text': question.question_text,
            'type': 'bar',
            'distribution': distribution
        })
        
    return Response({'status': 'success', 'data': data})

@api_view(['GET'])
@login_required
def api_text_data(request, survey_id):
    """API endpoint to get text response data for word clouds"""
    survey = get_object_or_404(Survey, id=survey_id)
    data = []
    questions = survey.questions.filter(question_type__in=['short_answer', 'long_answer'])
    
    for question in questions:
        answers = Answer.objects.filter(question=question).exclude(text_answer__isnull=True).values_list('text_answer', flat=True)
        data.append({
            'question_id': question.id,
            'question_text': question.question_text,
            'answers': list(answers)
        })
        
    return Response({'status': 'success', 'data': data})

@api_view(['GET'])
@login_required
def api_survey_summary(request, survey_id):
    """API endpoint to get overall survey summary"""
    survey = get_object_or_404(Survey, id=survey_id)
    response_count = survey.responses.filter(status='submitted').count()
    return Response({'status': 'success', 'data': {
        'title': survey.title,
        'response_count': response_count,
        'is_active': survey.is_active
    }})

