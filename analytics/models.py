from django.db import models
from django.conf import settings
from surveys.models import Survey, Question

# Create your models here.

class SurveyAnalytics(models.Model):
    """Model for caching survey analytics data"""
    survey = models.OneToOneField(Survey, on_delete=models.CASCADE, related_name='analytics')

    total_responses = models.IntegerField(default=0)
    completed_responses = models.IntegerField(default=0)
    average_completion_time = models.DurationField(null=True, blank=True)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage

    last_calculated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Survey Analytics"

    def __str__(self):
        return f"Analytics for {self.survey.title}"


class QuestionAnalytics(models.Model):
    """Model for caching question-level analytics"""
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='analytics')

    total_answers = models.IntegerField(default=0)

    # For MCQ/Checkbox questions
    most_common_answer = models.CharField(max_length=255, blank=True, null=True)

    # For numeric questions (Likert, Rating)
    average_rating = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    min_rating = models.IntegerField(null=True, blank=True)
    max_rating = models.IntegerField(null=True, blank=True)

    # For text questions
    word_count_average = models.IntegerField(null=True, blank=True)

    last_calculated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Question Analytics"

    def __str__(self):
        return f"Analytics for Question: {self.question.question_text[:50]}"


class ActivityLog(models.Model):
    """Model for tracking user activities"""
    ACTION_CHOICES = (
        ('survey_created', 'Survey Created'),
        ('survey_published', 'Survey Published'),
        ('survey_closed', 'Survey Closed'),
        ('response_started', 'Response Started'),
        ('response_submitted', 'Response Submitted'),
        ('user_registered', 'User Registered'),
        ('user_login', 'User Login'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    description = models.TextField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Activity Logs"

    def __str__(self):
        user_name = self.user.username if self.user else "Anonymous"
        return f"{user_name} - {self.get_action_display()} at {self.timestamp}"

