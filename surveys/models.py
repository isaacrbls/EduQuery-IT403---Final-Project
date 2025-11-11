from django.db import models
from django.conf import settings
from django.utils import timezone
from accounts.models import Section

# Create your models here.

class Survey(models.Model):
    """Model for survey/questionnaire"""
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('closed', 'Closed'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_surveys')
    sections = models.ManyToManyField(Section, related_name='surveys', blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    is_active = models.BooleanField(default=True)
    version = models.PositiveIntegerField(default=1)

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
        return self.questions.filter(is_active=True).count()

    @property
    def response_count(self):
        return self.responses.count()

    @property
    def is_open(self):
        if not self.is_active:
            return False
        if self.due_date and timezone.now() > self.due_date:
            return False
        return True


class Question(models.Model):
    QUESTION_TYPES = (
        ('multiple_choice', 'Multiple Choice'),
        ('likert_scale', 'Likert Scale'),
        ('short_answer', 'Short Answer'),
        ('long_answer', 'Long Answer'),
        ('text', 'Short Text'),
        ('textarea', 'Long Text'),
        ('mcq', 'Multiple Choice (Single)'),
        ('checkbox', 'Multiple Choice (Multiple)'),
        ('likert', 'Likert Scale'),
        ('rating', 'Rating'),
        ('dropdown', 'Dropdown'),
        ('date', 'Date'),
        ('email', 'Email'),
        ('matching', 'Matching'),
    )

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    is_required = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    help_text = models.CharField(max_length=255, blank=True, null=True)
    placeholder = models.CharField(max_length=100, blank=True, null=True)
    
    options = models.JSONField(default=list, blank=True)
    likert_min = models.IntegerField(default=1)
    likert_max = models.IntegerField(default=5)
    likert_labels = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['survey', 'order']

    def __str__(self):
        return f"{self.survey.title} - Q{self.order}: {self.question_text[:50]}"


class QuestionOption(models.Model):
    """Model for multiple choice/dropdown options"""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='option_choices')
    option_text = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question', 'order']

    def __str__(self):
        return f"{self.question.question_text[:30]} - {self.option_text}"


class LikertScale(models.Model):
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='likert_scale')
    min_value = models.IntegerField(default=1)
    max_value = models.IntegerField(default=5)
    min_label = models.CharField(max_length=50, default='Strongly Disagree')
    max_label = models.CharField(max_length=50, default='Strongly Agree')

    def __str__(self):
        return f"{self.question.question_text[:30]} ({self.min_value}-{self.max_value})"


class MatchingPair(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='matching_pairs')
    left_item = models.CharField(max_length=255)
    right_item = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['question', 'order']

    def __str__(self):
        return f"{self.left_item} - {self.right_item}"


