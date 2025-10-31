from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

@login_required
def analytics_dashboard(request):
    """Main analytics dashboard"""
    return render(request, 'analytics/analytics_dashboard.html')

@login_required
def survey_analytics(request, survey_id):
    """Analytics for a specific survey"""
    return render(request, 'analytics/survey_analytics.html')

# API Views for Chart Data
@api_view(['GET'])
@login_required
def api_mcq_data(request, survey_id):
    """API endpoint to get MCQ data for pie charts"""
    return Response({'status': 'success', 'data': []})

@api_view(['GET'])
@login_required
def api_likert_data(request, survey_id):
    """API endpoint to get Likert scale data for bar charts"""
    return Response({'status': 'success', 'data': []})

@api_view(['GET'])
@login_required
def api_text_data(request, survey_id):
    """API endpoint to get text response data for word clouds"""
    return Response({'status': 'success', 'data': []})

@api_view(['GET'])
@login_required
def api_survey_summary(request, survey_id):
    """API endpoint to get overall survey summary"""
    return Response({'status': 'success', 'data': {}})

