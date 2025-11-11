from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_migrate
from django.dispatch import receiver

class Section(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Survey(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title


QUESTION_TYPES = (
    ('text', 'Text'),
    ('radio', 'Multiple Choice'),
    ('checkbox', 'Checkboxes'),
)


class Question(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name="questions")
    text = models.CharField(max_length=255)
    question_type = models.CharField(max_length=50, choices=QUESTION_TYPES)
    order = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.text} ({self.question_type})"


# 🧠 Auto-create admin account and sample data after migrate
@receiver(post_migrate)
def create_sample_data(sender, **kwargs):
    if sender.name == 'survey':
        from django.contrib.auth.models import User
        from datetime import date

        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            print("✅ Created default admin account: admin / admin123")

        # Create sample section
        section, _ = Section.objects.get_or_create(name="Section A")

        # Create sample survey
        survey, _ = Survey.objects.get_or_create(
            title="Student Feedback Form",
            description="Sample feedback survey for testing",
            due_date=date.today(),
            section=section
        )

        # Add sample questions
        if not survey.questions.exists():
            Question.objects.create(survey=survey, text="What is your favorite subject?", question_type="text", order=1)
            Question.objects.create(survey=survey, text="Rate the cleanliness of classrooms", question_type="radio", order=2)
            Question.objects.create(survey=survey, text="Facilities you often use", question_type="checkbox", order=3)
            print("✅ Created sample survey and questions")
