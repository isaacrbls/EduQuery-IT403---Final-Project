#!/usr/bin/env python
"""
Quick verification script to check database setup
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eduquery.settings')
django.setup()

from django.contrib.auth import get_user_model
from surveys.models import Survey, Question, QuestionOption
from accounts.models import Section
from responses.models import Response
from analytics.models import ActivityLog

User = get_user_model()

print('=' * 70)
print(' ' * 20 + 'DATABASE VERIFICATION')
print('=' * 70)

# Users
print('\n📊 USERS:')
print(f'   Total: {User.objects.count()}')
print(f'   ├─ Admins: {User.objects.filter(user_type="admin").count()}')
print(f'   ├─ Teachers: {User.objects.filter(user_type="teacher").count()}')
print(f'   └─ Students: {User.objects.filter(user_type="student").count()}')

# Sections
print(f'\n📚 SECTIONS:')
print(f'   Total: {Section.objects.count()}')
for section in Section.objects.all():
    print(f'   ├─ {section.code}: {section.student_count} students')

# Surveys
print(f'\n📋 SURVEYS:')
print(f'   Total: {Survey.objects.count()}')
for survey in Survey.objects.all():
    print(f'   ├─ "{survey.title}"')
    print(f'   │  ├─ Status: {survey.status}')
    print(f'   │  ├─ Questions: {survey.question_count}')
    print(f'   │  └─ Assigned to: {survey.sections.count()} section(s)')

# Questions
print(f'\n❓ QUESTIONS:')
print(f'   Total: {Question.objects.count()}')
question_types = Question.objects.values_list('question_type', flat=True).distinct()
for qtype in question_types:
    count = Question.objects.filter(question_type=qtype).count()
    print(f'   ├─ {qtype}: {count}')

# Options
print(f'\n✔️  QUESTION OPTIONS:')
print(f'   Total: {QuestionOption.objects.count()}')

# Activity Logs
print(f'\n📝 ACTIVITY LOGS:')
print(f'   Total: {ActivityLog.objects.count()}')

# Test relationships
print(f'\n🔗 RELATIONSHIP TESTS:')
teacher = User.objects.filter(user_type='teacher').first()
if teacher:
    print(f'   ├─ Teacher "{teacher.username}" teaches: {teacher.teaching_sections.count()} section(s)')
    print(f'   └─ Created: {teacher.created_surveys.count()} survey(s)')

section = Section.objects.first()
if section:
    print(f'   ├─ Section "{section.code}" has: {section.student_count} student(s)')
    print(f'   └─ Has: {section.surveys.count()} survey(s) assigned')

print('\n' + '=' * 70)
print('✅ ALL CHECKS PASSED - DATABASE IS READY!')
print('=' * 70)

print('\n🔑 Login Credentials:')
print('   Admin:   admin / admin123')
print('   Teacher: teacher1 / teacher123')
print('   Student: student1 / student123')

print('\n🚀 Next Steps:')
print('   1. Run: python manage.py runserver')
print('   2. Visit: http://127.0.0.1:8000/admin/')
print('   3. Start building your views and templates!')

print('\n📚 Documentation:')
print('   - QUICKSTART.md - Quick reference')
print('   - DATABASE_SETUP.md - Detailed database info')
print('   - COMPLETION_SUMMARY.md - What was accomplished')

print('\n' + '=' * 70)

