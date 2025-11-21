#!/usr/bin/env python
"""
Complete Database Setup Script for EduQuery
This script will:
1. Run all database migrations
2. Create database tables
3. Create superuser and sample users
4. Create sections and assign students
5. Create sample surveys with questions
6. Generate activity logs

Run this script once to set up your entire database with sample data.
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduquery.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import Section
from surveys.models import Survey, Question, QuestionOption, LikertScale
from responses.models import Response, Answer
from analytics.models import ActivityLog

User = get_user_model()


def run_migrations():
    """Run all database migrations"""
    print("\n" + "=" * 60)
    print("STEP 1: Running Database Migrations")
    print("=" * 60)
    try:
        call_command('migrate', '--noinput')
        print("✓ All migrations applied successfully")
        return True
    except Exception as e:
        print(f"✗ Error running migrations: {e}")
        return False


def create_users():
    """Create sample users"""
    print("\n" + "=" * 60)
    print("STEP 2: Creating Users")
    print("=" * 60)

    # Create superuser
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@eduquery.com',
            password='admin123',
            user_type='admin'
        )
        print(f"✓ Created superuser: admin / admin123")
    else:
        print("✓ Superuser already exists: admin")

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
        else:
            teachers.append(User.objects.get(username=f'teacher{i}'))
            print(f"✓ Teacher already exists: teacher{i}")

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
        else:
            students.append(User.objects.get(username=f'student{i}'))
            print(f"✓ Student already exists: student{i}")

    print(f"\n📊 Summary: {len(teachers)} teachers, {len(students)} students created/verified")
    return teachers, students


def create_sections(teachers, students):
    """Create sample sections"""
    print("\n" + "=" * 60)
    print("STEP 3: Creating Sections")
    print("=" * 60)

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
            section_students = students[:5] if i == 0 else students[5:]
            section.students.add(*section_students)
            sections.append(section)
            print(f"✓ Created section: {name} ({code})")
            print(f"  ├─ Teacher: {teacher.username}")
            print(f"  └─ Students: {len(section_students)}")
        else:
            section = Section.objects.get(code=code)
            sections.append(section)
            print(f"✓ Section already exists: {code}")

    print(f"\n📚 Summary: {len(sections)} sections created/verified")
    return sections


def create_sample_surveys(teacher, sections):
    """Create multiple sample surveys with various question types"""
    print("\n" + "=" * 60)
    print("STEP 4: Creating Sample Surveys")
    print("=" * 60)

    surveys_created = 0

    # Survey 1: Student Satisfaction Survey
    if not Survey.objects.filter(title='Student Satisfaction Survey').exists():
        survey1 = Survey.objects.create(
            title='Student Satisfaction Survey',
            description='Help us improve our educational services by sharing your feedback.',
            creator=teacher,
            status='published',
            is_active=True,
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=7),
            anonymous=False,
            allow_multiple_submissions=False,
            show_results=True
        )
        survey1.sections.add(sections[0])

        # Question 1: Short text
        Question.objects.create(
            survey=survey1,
            question_text='What is your name?',
            question_type='short_answer',
            is_required=True,
            order=0
        )

        # Question 2: Multiple choice
        q2 = Question.objects.create(
            survey=survey1,
            question_text='How would you rate your overall learning experience?',
            question_type='multiple_choice',
            is_required=True,
            order=1,
            options=['Excellent', 'Good', 'Average', 'Poor', 'Very Poor']
        )

        # Question 3: Likert scale
        Question.objects.create(
            survey=survey1,
            question_text='The course materials were helpful and relevant.',
            question_type='likert_scale',
            is_required=True,
            order=2,
            likert_min=1,
            likert_max=5,
            likert_labels=['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        )

        # Question 4: Checkbox
        Question.objects.create(
            survey=survey1,
            question_text='Which learning resources did you find most useful? (Select all that apply)',
            question_type='checkbox',
            is_required=False,
            order=3,
            options=['Lecture videos', 'Reading materials', 'Practice exercises', 'Discussion forums', 'Office hours']
        )

        # Question 5: Long text
        Question.objects.create(
            survey=survey1,
            question_text='What suggestions do you have for improving this course?',
            question_type='long_answer',
            is_required=False,
            order=4,
            help_text='Please provide detailed feedback'
        )

        print(f"✓ Created survey: '{survey1.title}'")
        print(f"  ├─ Questions: {survey1.questions.count()}")
        print(f"  ├─ Status: {survey1.status}")
        print(f"  └─ Assigned to: {survey1.sections.count()} section(s)")
        surveys_created += 1

        # Log activity
        ActivityLog.objects.create(
            user=teacher,
            action='survey_created',
            description=f"Created survey: {survey1.title}"
        )
        ActivityLog.objects.create(
            user=teacher,
            action='survey_published',
            description=f"Published survey: {survey1.title}"
        )
    else:
        print("✓ Survey already exists: 'Student Satisfaction Survey'")

    # Survey 2: Course Feedback
    if not Survey.objects.filter(title='Course Feedback - IT 403').exists():
        survey2 = Survey.objects.create(
            title='Course Feedback - IT 403',
            description='Share your thoughts about the Information Systems course.',
            creator=teacher,
            status='published',
            is_active=True,
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=14),
            anonymous=True,
            allow_multiple_submissions=False,
            show_results=False
        )
        survey2.sections.add(sections[0])

        # Question 1: Likert - Instructor effectiveness
        Question.objects.create(
            survey=survey2,
            question_text='The instructor explains concepts clearly',
            question_type='likert_scale',
            is_required=True,
            order=0,
            likert_min=1,
            likert_max=5,
            likert_labels=['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        )

        # Question 2: Likert - Course difficulty
        Question.objects.create(
            survey=survey2,
            question_text='The course difficulty level is appropriate',
            question_type='likert_scale',
            is_required=True,
            order=1,
            likert_min=1,
            likert_max=5,
            likert_labels=['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        )

        # Question 3: Multiple choice - Study time
        Question.objects.create(
            survey=survey2,
            question_text='How many hours per week do you spend studying for this course?',
            question_type='multiple_choice',
            is_required=True,
            order=2,
            options=['Less than 2 hours', '2-4 hours', '4-6 hours', '6-8 hours', 'More than 8 hours']
        )

        # Question 4: Checkbox - Challenges
        Question.objects.create(
            survey=survey2,
            question_text='What challenges have you faced in this course? (Select all that apply)',
            question_type='checkbox',
            is_required=False,
            order=3,
            options=['Time management', 'Understanding concepts', 'Technical issues', 'Group work', 'Assessment difficulty', 'Other']
        )

        # Question 5: Long text - Comments
        Question.objects.create(
            survey=survey2,
            question_text='Any additional comments or suggestions?',
            question_type='long_answer',
            is_required=False,
            order=4,
            placeholder='Share your thoughts here...'
        )

        print(f"✓ Created survey: '{survey2.title}'")
        print(f"  ├─ Questions: {survey2.questions.count()}")
        print(f"  ├─ Status: {survey2.status}")
        print(f"  ├─ Anonymous: {survey2.anonymous}")
        print(f"  └─ Assigned to: {survey2.sections.count()} section(s)")
        surveys_created += 1

        ActivityLog.objects.create(
            user=teacher,
            action='survey_created',
            description=f"Created survey: {survey2.title}"
        )
    else:
        print("✓ Survey already exists: 'Course Feedback - IT 403'")

    # Survey 3: Quick Poll
    if not Survey.objects.filter(title='Quick Poll - Learning Preferences').exists():
        survey3 = Survey.objects.create(
            title='Quick Poll - Learning Preferences',
            description='Quick poll to understand your learning preferences.',
            creator=teacher,
            status='published',
            is_active=True,
            start_date=timezone.now(),
            due_date=timezone.now() + timedelta(days=3),
            anonymous=True,
            allow_multiple_submissions=False,
            show_results=True
        )
        survey3.sections.add(sections[0])  # Assign to IT 403 section

        # Question 1: Multiple choice
        Question.objects.create(
            survey=survey3,
            question_text='Which learning format do you prefer?',
            question_type='multiple_choice',
            is_required=True,
            order=0,
            options=['Online lectures', 'Face-to-face classes', 'Hybrid (mix of both)', 'Self-paced learning']
        )

        # Question 2: Checkbox
        Question.objects.create(
            survey=survey3,
            question_text='What study materials help you learn best? (Select all that apply)',
            question_type='checkbox',
            is_required=True,
            order=1,
            options=['Videos', 'Written notes', 'Interactive exercises', 'Diagrams and charts', 'Audio recordings', 'Real-world examples']
        )

        # Question 3: Likert
        Question.objects.create(
            survey=survey3,
            question_text='I feel comfortable asking questions during class',
            question_type='likert_scale',
            is_required=True,
            order=2,
            likert_min=1,
            likert_max=5,
            likert_labels=['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
        )

        print(f"✓ Created survey: '{survey3.title}'")
        print(f"  ├─ Questions: {survey3.questions.count()}")
        print(f"  ├─ Status: {survey3.status}")
        print(f"  └─ Assigned to: {survey3.sections.count()} section(s)")
        surveys_created += 1

        ActivityLog.objects.create(
            user=teacher,
            action='survey_created',
            description=f"Created survey: {survey3.title}"
        )
    else:
        print("✓ Survey already exists: 'Quick Poll - Learning Preferences'")

    print(f"\n📋 Summary: {surveys_created} new surveys created")
    return surveys_created


def main():
    """Main setup function"""
    print("\n")
    print("=" * 60)
    print(" " * 15 + "EDUQUERY DATABASE SETUP")
    print("=" * 60)
    print("\nThis script will:")
    print("  1. Run database migrations")
    print("  2. Create admin, teachers, and students")
    print("  3. Create sections and assign students")
    print("  4. Create sample surveys with questions")
    print("  5. Generate activity logs")
    print("\n" + "=" * 60)

    # Step 1: Run migrations
    if not run_migrations():
        print("\n✗ Setup failed at migration step")
        sys.exit(1)

    # Step 2: Create users
    try:
        teachers, students = create_users()
        if not teachers or not students:
            print("\n✗ Failed to create users")
            sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error creating users: {e}")
        sys.exit(1)

    # Step 3: Create sections
    try:
        sections = create_sections(teachers, students)
        if not sections:
            print("\n✗ Failed to create sections")
            sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error creating sections: {e}")
        sys.exit(1)

    # Step 4: Create sample surveys
    try:
        create_sample_surveys(teachers[0], sections)
    except Exception as e:
        print(f"\n✗ Error creating surveys: {e}")
        sys.exit(1)

    # Final summary
    print("\n" + "=" * 60)
    print(" " * 15 + "SETUP COMPLETE!")
    print("=" * 60)
    
    print("\n📊 Database Summary:")
    print(f"  ├─ Users: {User.objects.count()}")
    print(f"  │  ├─ Admins: {User.objects.filter(user_type='admin').count()}")
    print(f"  │  ├─ Teachers: {User.objects.filter(user_type='teacher').count()}")
    print(f"  │  └─ Students: {User.objects.filter(user_type='student').count()}")
    print(f"  ├─ Sections: {Section.objects.count()}")
    print(f"  ├─ Surveys: {Survey.objects.count()}")
    print(f"  ├─ Questions: {Question.objects.count()}")
    print(f"  └─ Activity Logs: {ActivityLog.objects.count()}")

    print("\n🔑 Login Credentials:")
    print("  " + "-" * 56)
    print("  │ Role    │ Username  │ Password    │")
    print("  " + "-" * 56)
    print("  │ Admin   │ admin     │ admin123    │")
    print("  │ Teacher │ teacher1  │ teacher123  │")
    print("  │ Student │ student1  │ student123  │")
    print("  " + "-" * 56)

    print("\n🚀 Next Steps:")
    print("  1. Run the development server:")
    print("     python manage.py runserver")
    print("\n  2. Access the application:")
    print("     Main App: http://127.0.0.1:8000/")
    print("     Admin Panel: http://127.0.0.1:8000/admin/")
    print("\n  3. Verify setup:")
    print("     python verify_setup.py")

    print("\n" + "=" * 60)
    print(" " * 10 + "Database is ready! Happy coding! 🎉")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n✗ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

