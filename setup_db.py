#!/usr/bin/env python
"""
Database setup script for EduQuery
Creates superuser and sample data for testing
"""
import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduquery.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import Section
from surveys.models import Survey, Question, QuestionOption, LikertScale
from responses.models import Response, Answer
from analytics.models import ActivityLog

User = get_user_model()

def create_users():
    """Create sample users"""
    print("Creating users...")

    # Create superuser
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@eduquery.com',
            password='admin123',
            user_type='admin'
        )
        print(f"✓ Created superuser: admin / admin123")

    # Create teachers
    teachers = []
    for i in range(1, 3):
        if not User.objects.filter(username=f'teacher{i}').exists():
            teacher = User.objects.create_user(
                username=f'teacher{i}',
                email=f'teacher{i}@eduquery.com',
                password='teacher123',
                user_type='teacher',
                first_name=f'Teacher',
                last_name=f'{i}'
            )
            teachers.append(teacher)
            print(f"✓ Created teacher: teacher{i} / teacher123")

    # Create students
    students = []
    for i in range(1, 11):
        if not User.objects.filter(username=f'student{i}').exists():
            student = User.objects.create_user(
                username=f'student{i}',
                email=f'student{i}@eduquery.com',
                password='student123',
                user_type='student',
                student_id=f'2024-{i:04d}',
                first_name=f'Student',
                last_name=f'{i}'
            )
            students.append(student)
            print(f"✓ Created student: student{i} / student123 (ID: 2024-{i:04d})")

    return teachers, students


def create_sections(teachers, students):
    """Create sample sections"""
    print("\nCreating sections...")

    sections = []
    section_data = [
        ('IT 403', 'IT403-A', 'Information Systems', '2024-2025', '1st Semester'),
        ('IT 301', 'IT301-B', 'Database Systems', '2024-2025', '1st Semester'),
    ]

    for i, (name, code, desc, year, sem) in enumerate(section_data):
        if not Section.objects.filter(code=code).exists():
            teacher = teachers[i % len(teachers)]
            section = Section.objects.create(
                name=name,
                code=code,
                teacher=teacher,
                description=desc,
                academic_year=year,
                semester=sem
            )
            # Add students to section
            section.students.add(*students[:5] if i == 0 else students[5:])
            sections.append(section)
            print(f"✓ Created section: {name} ({code}) - Teacher: {teacher.username}")

    return sections


def create_sample_survey(teacher, section):
    """Create a sample survey with questions"""
    print("\nCreating sample survey...")

    if Survey.objects.filter(title='Student Satisfaction Survey').exists():
        print("✓ Sample survey already exists")
        return

    survey = Survey.objects.create(
        title='Student Satisfaction Survey',
        description='Help us improve our educational services by sharing your feedback.',
        creator=teacher,
        status='published',
        start_date=timezone.now(),
        due_date=timezone.now() + timedelta(days=7),
        anonymous=False,
        allow_multiple_submissions=False,
        show_results=True
    )
    survey.sections.add(section)

    # Question 1: Short text
    q1 = Question.objects.create(
        survey=survey,
        question_text='What is your name?',
        question_type='text',
        required=True,
        order=1
    )

    # Question 2: Multiple choice
    q2 = Question.objects.create(
        survey=survey,
        question_text='How would you rate your overall learning experience?',
        question_type='mcq',
        required=True,
        order=2
    )
    options = ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
    for i, opt in enumerate(options):
        QuestionOption.objects.create(
            question=q2,
            option_text=opt,
            order=i+1
        )

    # Question 3: Likert scale
    q3 = Question.objects.create(
        survey=survey,
        question_text='The course materials were helpful and relevant.',
        question_type='likert',
        required=True,
        order=3
    )
    LikertScale.objects.create(
        question=q3,
        min_value=1,
        max_value=5,
        min_label='Strongly Disagree',
        max_label='Strongly Agree'
    )

    # Question 4: Checkbox
    q4 = Question.objects.create(
        survey=survey,
        question_text='Which of the following learning resources did you find most useful? (Select all that apply)',
        question_type='checkbox',
        required=False,
        order=4
    )
    resources = ['Lecture videos', 'Reading materials', 'Practice exercises', 'Discussion forums', 'Office hours']
    for i, res in enumerate(resources):
        QuestionOption.objects.create(
            question=q4,
            option_text=res,
            order=i+1
        )

    # Question 5: Long text
    q5 = Question.objects.create(
        survey=survey,
        question_text='What suggestions do you have for improving this course?',
        question_type='textarea',
        required=False,
        order=5,
        help_text='Please provide detailed feedback'
    )

    # Question 6: Rating
    q6 = Question.objects.create(
        survey=survey,
        question_text='How would you rate the instructor\'s teaching effectiveness?',
        question_type='rating',
        required=True,
        order=6,
        help_text='Rate from 1 to 10'
    )

    print(f"✓ Created survey: '{survey.title}' with {survey.question_count} questions")

    # Log activity
    ActivityLog.objects.create(
        user=teacher,
        action='survey_created',
        description=f"Created survey: {survey.title}"
    )
    ActivityLog.objects.create(
        user=teacher,
        action='survey_published',
        description=f"Published survey: {survey.title}"
    )


def main():
    print("=" * 60)
    print("EduQuery Database Setup")
    print("=" * 60)

    # Create users
    teachers, students = create_users()

    # Create sections
    if teachers and students:
        sections = create_sections(teachers, students)

        # Create sample survey
        if sections and teachers:
            create_sample_survey(teachers[0], sections[0])

    print("\n" + "=" * 60)
    print("Database setup complete!")
    print("=" * 60)
    print("\nLogin credentials:")
    print("-" * 60)
    print("Admin:    admin / admin123")
    print("Teacher:  teacher1 / teacher123")
    print("Student:  student1 / student123")
    print("-" * 60)
    print("\nYou can now run: python manage.py runserver")
    print("Admin panel: http://127.0.0.1:8000/admin/")
    print("=" * 60)


if __name__ == '__main__':
    main()

