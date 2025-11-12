#!/usr/bin/env python
"""
Create a sample survey with questions for testing
"""
import os
import sys
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduquery.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import Section
from surveys.models import Survey, Question

User = get_user_model()

def create_sample_survey():
    """Create a comprehensive sample survey"""
    print("Creating sample survey...")
    
    # Get or create a teacher
    teacher = User.objects.filter(user_type='teacher').first()
    if not teacher:
        teacher = User.objects.create_user(
            username='sample_teacher',
            email='teacher@example.com',
            password='teacher123',
            first_name='Sample',
            last_name='Teacher',
            user_type='teacher'
        )
        print(f"✓ Created teacher: {teacher.username}")
    else:
        print(f"✓ Using existing teacher: {teacher.username}")
    
    # Get or create a section
    section = Section.objects.first()
    if not section:
        section = Section.objects.create(
            name='IT 403',
            code='IT403-SAMPLE',
            description='Sample Section for Testing',
            academic_year='2024-2025',
            semester='1st Semester',
            teacher=teacher
        )
        print(f"✓ Created section: {section.code}")
    else:
        print(f"✓ Using existing section: {section.code}")
    
    # Create the survey
    survey = Survey.objects.create(
        title='Course Feedback Survey',
        description='Please share your feedback about this course to help us improve the learning experience.',
        creator=teacher,
        due_date=timezone.now() + timedelta(days=14),
        is_active=True
    )
    survey.sections.add(section)
    print(f"✓ Created survey: {survey.title}")
    
    # Question 1: Multiple Choice
    q1 = Question.objects.create(
        survey=survey,
        question_text='How would you rate the overall course content?',
        question_type='multiple_choice',
        is_required=True,
        order=0,
        options=['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
    )
    print(f"  ✓ Added Question 1: Multiple Choice")
    
    # Question 2: Likert Scale
    q2 = Question.objects.create(
        survey=survey,
        question_text='The instructor explained concepts clearly and effectively.',
        question_type='likert_scale',
        is_required=True,
        order=1,
        likert_min=1,
        likert_max=5,
        likert_labels=['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    )
    print(f"  ✓ Added Question 2: Likert Scale")
    
    # Question 3: Checkbox (Multiple Select)
    q3 = Question.objects.create(
        survey=survey,
        question_text='Which topics did you find most interesting? (Select all that apply)',
        question_type='checkbox',
        is_required=False,
        order=2,
        options=[
            'Web Development',
            'Database Design',
            'System Analysis',
            'Project Management',
            'User Interface Design',
            'Software Testing'
        ]
    )
    print(f"  ✓ Added Question 3: Checkbox")
    
    # Question 4: Short Answer
    q4 = Question.objects.create(
        survey=survey,
        question_text='What is one thing you would improve about this course?',
        question_type='short_answer',
        is_required=False,
        order=3
    )
    print(f"  ✓ Added Question 4: Short Answer")
    
    # Question 5: Long Answer
    q5 = Question.objects.create(
        survey=survey,
        question_text='Please share any additional comments or suggestions about the course.',
        question_type='long_answer',
        is_required=False,
        order=4
    )
    print(f"  ✓ Added Question 5: Long Answer")
    
    # Question 6: Likert Scale (Another one)
    q6 = Question.objects.create(
        survey=survey,
        question_text='The course materials and resources were helpful.',
        question_type='likert_scale',
        is_required=True,
        order=5,
        likert_min=1,
        likert_max=5,
        likert_labels=['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    )
    print(f"  ✓ Added Question 6: Likert Scale")
    
    # Question 7: Multiple Choice
    q7 = Question.objects.create(
        survey=survey,
        question_text='How much time did you spend on coursework per week?',
        question_type='multiple_choice',
        is_required=True,
        order=6,
        options=[
            'Less than 3 hours',
            '3-5 hours',
            '6-8 hours',
            '9-12 hours',
            'More than 12 hours'
        ]
    )
    print(f"  ✓ Added Question 7: Multiple Choice")
    
    print(f"\n{'='*70}")
    print(f"✅ SUCCESS! Sample survey created successfully!")
    print(f"{'='*70}")
    print(f"\nSurvey Details:")
    print(f"  Title: {survey.title}")
    print(f"  ID: {survey.id}")
    print(f"  Questions: {survey.questions.count()}")
    print(f"  Assigned to: {section.code}")
    print(f"  Due Date: {survey.due_date.strftime('%Y-%m-%d %H:%M')}")
    print(f"  Status: {'Active' if survey.is_active else 'Inactive'}")
    print(f"\nYou can now:")
    print(f"  1. View the survey in the Teacher Dashboard")
    print(f"  2. Edit the survey at: /surveys/edit/{survey.id}/")
    print(f"  3. Students can respond to the survey")
    print(f"{'='*70}\n")

if __name__ == '__main__':
    try:
        create_sample_survey()
    except Exception as e:
        print(f"\n❌ Error creating sample survey: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
