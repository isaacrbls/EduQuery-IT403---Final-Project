from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Survey, Question, Section
from django.views.decorators.csrf import csrf_exempt
import json

def home(request):
    surveys = Survey.objects.all()
    return render(request, 'survey/survey_list.html', {'surveys': surveys})

def builder(request, survey_id):
    survey = get_object_or_404(Survey, id=survey_id)
    questions = survey.questions.order_by('order')
    return render(request, 'survey/builder.html', {
        'survey': survey,
        'questions': questions,
    })

@csrf_exempt
def save_questions(request, survey_id):
    """Handles saving of questions via AJAX (from drag-and-drop builder)."""
    if request.method == 'POST':
        data = json.loads(request.body)
        survey = get_object_or_404(Survey, id=survey_id)

        # Clear existing questions
        survey.questions.all().delete()

        # Recreate questions in new order
        for idx, q in enumerate(data.get('questions', []), start=1):
            Question.objects.create(
                survey=survey,
                text=q.get('text', ''),
                question_type=q.get('type', 'text'),
                order=idx
            )
        return JsonResponse({'status': 'success', 'message': 'Questions saved successfully.'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request method.'})

def assign_section(request):
    surveys = Survey.objects.all()
    sections = Section.objects.all()
    return render(request, 'survey/section_assign.html', {'surveys': surveys, 'sections': sections})

@csrf_exempt
def save_assignment(request):
    """Assigns a survey to a section."""
    if request.method == 'POST':
        data = json.loads(request.body)
        survey_id = data.get('survey_id')
        section_id = data.get('section_id')

        survey = get_object_or_404(Survey, id=survey_id)
        section = get_object_or_404(Section, id=section_id)
        survey.section = section
        survey.save()

        return JsonResponse({'status': 'success', 'message': 'Survey assigned successfully!'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request.'})
