from django.contrib import admin
from .models import Response, Answer

# Register your models here.

class AnswerInline(admin.TabularInline):
    model = Answer
    extra = 0
    readonly_fields = ['question', 'text_answer', 'selected_option', 'number_answer', 'date_answer']
    can_delete = False


@admin.register(Response)
class ResponseAdmin(admin.ModelAdmin):
    list_display = ['survey', 'respondent_display', 'status', 'started_at', 'submitted_at', 'completion_time_display']
    list_filter = ['status', 'survey', 'started_at', 'submitted_at']
    search_fields = ['survey__title', 'respondent__username', 'respondent__email']
    readonly_fields = ['started_at', 'submitted_at', 'ip_address']
    inlines = [AnswerInline]

    def respondent_display(self, obj):
        return obj.respondent.username if obj.respondent else "Anonymous"
    respondent_display.short_description = 'Respondent'

    def completion_time_display(self, obj):
        time = obj.completion_time
        if time:
            total_seconds = int(time.total_seconds())
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            return f"{minutes}m {seconds}s"
        return "-"
    completion_time_display.short_description = 'Completion Time'


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['response', 'question_short', 'question_type', 'answer_display']
    list_filter = ['question__question_type', 'created_at']
    search_fields = ['response__survey__title', 'question__question_text', 'text_answer']

    def question_short(self, obj):
        return obj.question.question_text[:40] + '...' if len(obj.question.question_text) > 40 else obj.question.question_text
    question_short.short_description = 'Question'

    def question_type(self, obj):
        return obj.question.get_question_type_display()
    question_type.short_description = 'Type'

    def answer_display(self, obj):
        answer = obj.get_answer_display()
        if answer and len(str(answer)) > 50:
            return str(answer)[:50] + '...'
        return answer or '-'
    answer_display.short_description = 'Answer'

