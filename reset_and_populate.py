#!/usr/bin/env python
"""
Reset and Populate Database Script for EduQuery
This script will:
1. Flush the database (delete all data)
2. Create 3 teachers
3. Create 10 students
4. Create surveys with questions
5. Generate random responses for analytics
"""
import os
import sys
import django
import random
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduquery.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import Section
from surveys.models import Survey, Question, QuestionOption
from responses.models import Response, Answer

User = get_user_model()

def reset_db():
    print("\n" + "=" * 60)
    print("STEP 1: Resetting Database")
    print("=" * 60)
    # Flush database
    call_command('flush', '--no-input')
    print("✓ Database flushed successfully")

def create_users():
    print("\n" + "=" * 60)
    print("STEP 2: Creating Users")
    print("=" * 60)

    # Create superuser
    User.objects.create_superuser(
        username='admin',
        email='admin@eduquery.com',
        password='admin123',
        user_type='admin'
    )
    print("✓ Created superuser: admin")

    # Create 3 teachers
    teachers = []
    for i in range(1, 4):
        teacher = User.objects.create_user(
            username=f'teacher{i}',
            email=f'teacher{i}@eduquery.com',
            password='teacher123',
            user_type='teacher',
            first_name='Teacher',
            last_name=f'{i}'
        )
        teachers.append(teacher)
        print(f"✓ Created teacher: teacher{i}")

    # Create 10 students
    students = []
    for i in range(1, 11):
        student = User.objects.create_user(
            username=f'student{i}',
            email=f'student{i}@eduquery.com',
            password='student123',
            user_type='student',
            student_id=f'2024-{i:04d}',
            first_name='Student',
            last_name=f'{i}'
        )
        students.append(student)
        print(f"✓ Created student: student{i}")

    return teachers, students

def create_surveys(teachers, students):
    print("\n" + "=" * 60)
    print("STEP 3: Creating Surveys and Responses")
    print("=" * 60)

    teacher1 = teachers[0]
    
    # Create a section
    section = Section.objects.create(
        name="Section A",
        code="SEC-A",
        teacher=teacher1
    )
    section.students.set(students)
    print("✓ Created Section A and assigned students")

    # Survey 1: Course Feedback
    survey1 = Survey.objects.create(
        title="Course Feedback Survey",
        description="Please provide your feedback on the course content and delivery.",
        creator=teacher1,
        status='published',
        is_active=True,
        start_date=timezone.now() - timedelta(days=7),
        due_date=timezone.now() + timedelta(days=7)
    )
    survey1.sections.add(section)
    print(f"✓ Created Survey: {survey1.title}")

    # Questions for Survey 1
    q1 = Question.objects.create(
        survey=survey1,
        question_text="How satisfied are you with the course material?",
        question_type='likert_scale',
        order=1,
        likert_min=1,
        likert_max=5,
        likert_labels=["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    )
    
    q2 = Question.objects.create(
        survey=survey1,
        question_text="Which topic did you find most difficult?",
        question_type='multiple_choice',
        order=2
    )
    q2_opts = [
        QuestionOption.objects.create(question=q2, option_text="Python Basics", order=1),
        QuestionOption.objects.create(question=q2, option_text="Data Structures", order=2),
        QuestionOption.objects.create(question=q2, option_text="Algorithms", order=3),
        QuestionOption.objects.create(question=q2, option_text="Web Development", order=4),
    ]

    q3 = Question.objects.create(
        survey=survey1,
        question_text="Any additional comments?",
        question_type='short_answer',
        order=3
    )

    # Generate Responses for Survey 1
    print("  Generating responses...")
    for student in students:
        # Randomize submission time
        submitted_at = timezone.now() - timedelta(days=random.randint(0, 5), hours=random.randint(0, 23))
        
        response = Response.objects.create(
            survey=survey1,
            respondent=student,
            status='submitted',
            started_at=submitted_at - timedelta(minutes=random.randint(5, 30)),
            submitted_at=submitted_at
        )

        # Answer Q1 (Likert)
        Answer.objects.create(
            response=response,
            question=q1,
            number_answer=random.randint(3, 5)  # Mostly positive
        )

        # Answer Q2 (Multiple Choice)
        Answer.objects.create(
            response=response,
            question=q2,
            selected_option=random.choice(q2_opts)
        )

        # Answer Q3 (Text)
        comments = ["Great course!", "Needs more examples.", "I learned a lot.", "The pace was good.", "No comments."]
        Answer.objects.create(
            response=response,
            question=q3,
            text_answer=random.choice(comments)
        )
    
    print(f"✓ Generated {len(students)} responses for {survey1.title}")

    # Survey 2: Student Satisfaction (Mixed responses)
    survey2 = Survey.objects.create(
        title="Student Satisfaction Survey",
        description="General satisfaction survey for the semester.",
        creator=teacher1,
        status='published',
        is_active=True,
        start_date=timezone.now() - timedelta(days=14),
        due_date=timezone.now() + timedelta(days=14)
    )
    survey2.sections.add(section)
    print(f"✓ Created Survey: {survey2.title}")

    q2_1 = Question.objects.create(
        survey=survey2,
        question_text="How likely are you to recommend this school?",
        question_type='likert_scale',
        order=1,
        likert_min=1,
        likert_max=10
    )

    # Generate Responses for Survey 2 (only 8 students responded)
    print("  Generating responses...")
    for student in students[:8]:
        submitted_at = timezone.now() - timedelta(days=random.randint(0, 10))
        response = Response.objects.create(
            survey=survey2,
            respondent=student,
            status='submitted',
            started_at=submitted_at - timedelta(minutes=10),
            submitted_at=submitted_at
        )
        
        Answer.objects.create(
            response=response,
            question=q2_1,
            number_answer=random.randint(1, 10)
        )
    print(f"✓ Generated 8 responses for {survey2.title}")

if __name__ == '__main__':
    reset_db()
    teachers, students = create_users()
    create_surveys(teachers, students)
    print("\n" + "=" * 60)
    print("DONE! Database reset and populated.")
    print("=" * 60)
