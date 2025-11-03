from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

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


