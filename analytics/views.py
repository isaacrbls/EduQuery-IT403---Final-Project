from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from surveys.models import Survey, Question
from responses.models import Response as SurveyResponse, Answer
from django.db.models import Count

# Create your views here.

@login_required
def analytics_dashboard(request):
    """Main analytics dashboard"""
    return render(request, 'analytics/analytics_dashboard.html')

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

