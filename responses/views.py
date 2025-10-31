from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

@login_required
def response_list(request):
    """List all responses (admin/teacher view)"""
    return render(request, 'responses/response_list.html')

@login_required
def survey_responses(request, survey_id):
    """List responses for a specific survey"""
    return render(request, 'responses/survey_responses.html')

@login_required
def response_detail(request, response_id):
    """View detailed response"""
    return render(request, 'responses/response_detail.html')

@login_required
def my_response_history(request):
    """Student's response history"""
    return render(request, 'responses/my_response_history.html')

# API Views
@api_view(['GET'])
@login_required
def api_filter_responses(request, survey_id):
    """API endpoint to filter and search responses"""
    return Response({'status': 'success', 'data': []})

@api_view(['GET'])
@login_required
def api_export_responses(request, survey_id):
    """API endpoint to export responses"""
    return Response({'status': 'success'})

