from django.db import models
from django.conf import settings
from accounts.models import Section

# Create your models here.

class Survey(models.Model):
    """Model for survey/questionnaire"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_surveys')
    sections = models.ManyToManyField(Section, related_name='surveys', blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')

    # Survey settings
    anonymous = models.BooleanField(default=False)
    allow_multiple_submissions = models.BooleanField(default=False)
    randomize_questions = models.BooleanField(default=False)
    show_results = models.BooleanField(default=False)

    # Dates
    start_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def question_count(self):
        return self.questions.count()

    @property
    def response_count(self):
        return self.responses.count()

    @property
    def is_active(self):
        return self.status == 'published'


class Question(models.Model):
    """Model for survey questions"""
    QUESTION_TYPES = (
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('mcq', 'Multiple Choice (Single)'),
        ('checkbox', 'Multiple Choice (Multiple)'),
        ('likert', 'Likert Scale'),
        ('rating', 'Rating'),
        ('dropdown', 'Dropdown'),
        ('date', 'Date'),
        ('email', 'Email'),
    )

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    # Additional settings
    help_text = models.CharField(max_length=255, blank=True, null=True)
    placeholder = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['survey', 'order']

    def __str__(self):
        return f"{self.survey.title} - Q{self.order}: {self.question_text[:50]}"


class QuestionOption(models.Model):
    """Model for multiple choice/dropdown options"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question', 'order']

    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.option_text}"


class LikertScale(models.Model):
    """Model for Likert scale configuration"""
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='likert_scale')
    min_value = models.IntegerField(default=1)
    max_value = models.IntegerField(default=5)
    min_label = models.CharField(max_length=50, default='Strongly Disagree')
    max_label = models.CharField(max_length=50, default='Strongly Agree')

    def __str__(self):
        return f"{self.question.question_text[:30]} ({self.min_value}-{self.max_value})"

