from django.contrib import admin
from .models import SurveyAnalytics, QuestionAnalytics, ActivityLog

# Register your models here.

@admin.register(SurveyAnalytics)
class SurveyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['survey', 'total_responses', 'completed_responses', 'completion_rate', 'average_completion_time', 'last_calculated']
    list_filter = ['last_calculated']
    search_fields = ['survey__title']
    readonly_fields = ['last_calculated']


@admin.register(QuestionAnalytics)
class QuestionAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['question_short', 'total_answers', 'most_common_answer', 'average_rating', 'last_calculated']
    list_filter = ['last_calculated']
    search_fields = ['question__question_text', 'question__survey__title']
    readonly_fields = ['last_calculated']

    def question_short(self, obj):
        return obj.question.question_text[:50] + '...' if len(obj.question.question_text) > 50 else obj.question.question_text
    question_short.short_description = 'Question'


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'description_short', 'ip_address', 'timestamp']
    list_filter = ['action', 'timestamp']
    search_fields = ['user__username', 'description', 'ip_address']
    readonly_fields = ['user', 'action', 'description', 'ip_address', 'timestamp']

    def description_short(self, obj):
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    description_short.short_description = 'Description'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

