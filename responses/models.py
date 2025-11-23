from django.db import models
from django.conf import settings
from surveys.models import Survey, Question, QuestionOption

# Create your models here.

class Response(models.Model):
    """Model for survey responses/submissions"""
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
    )

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    respondent = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='survey_responses', null=True, blank=True)
    survey_version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-submitted_at', '-started_at']

    def __str__(self):
        respondent_name = self.respondent.username if self.respondent else "Anonymous"
        return f"{self.survey.title} - {respondent_name} ({self.status})"

    @property
    def is_complete(self):
        return self.status == 'submitted'

    @property
    def completion_time(self):
        if self.submitted_at and self.started_at:
            return self.submitted_at - self.started_at
        return None
    
    @property
    def completion_time_minutes(self):
        """Return completion time in minutes as an integer"""
        if self.completion_time:
            return int(self.completion_time.total_seconds() / 60)
        return None

    @property
    def completion_time_formatted(self):
        """Return formatted completion time string"""
        if self.completion_time:
            total_seconds = int(self.completion_time.total_seconds())
            if total_seconds < 60:
                return f"{total_seconds} second{'s' if total_seconds != 1 else ''}"
            elif total_seconds < 3600:
                minutes = total_seconds // 60
                seconds = total_seconds % 60
                return f"{minutes} min {seconds} sec"
            else:
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                return f"{hours} hr {minutes} min"
        return "N/A"


class Answer(models.Model):
    """Model for individual question answers"""
    response = models.ForeignKey(Response, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')

    # Different answer types
    text_answer = models.TextField(blank=True, null=True)
    selected_option = models.ForeignKey(QuestionOption, on_delete=models.CASCADE, null=True, blank=True, related_name='single_answers')
    selected_options = models.ManyToManyField(QuestionOption, blank=True, related_name='multiple_answers')
    number_answer = models.IntegerField(null=True, blank=True)  # For ratings and likert
    date_answer = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['response', 'question']
        ordering = ['response', 'question__order']

    def __str__(self):
        return f"Answer to {self.question.question_text[:30]} by {self.response.respondent}"

    def get_answer_display(self):
        """Return the answer in a readable format"""
        if self.question.question_type in ['short_answer', 'long_answer']:
            return self.text_answer
        elif self.question.question_type == 'multiple_choice':
            return self.text_answer
        elif self.question.question_type == 'checkbox':
            return self.text_answer
        elif self.question.question_type == 'likert_scale':
            return str(self.number_answer)
        return None

