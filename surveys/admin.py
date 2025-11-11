from django.contrib import admin
from .models import Survey, Question, QuestionOption, LikertScale, MatchingPair


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 1
    ordering = ['order']


class LikertScaleInline(admin.StackedInline):
    model = LikertScale
    max_num = 1


class MatchingPairInline(admin.TabularInline):
    model = MatchingPair
    extra = 1
    ordering = ['order']


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1
    ordering = ['order']


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'status', 'is_active', 'version', 'question_count', 'response_count', 'due_date', 'created_at']
    list_filter = ['status', 'is_active', 'anonymous', 'created_at', 'due_date']
    search_fields = ['title', 'description', 'creator__username']
    filter_horizontal = ['sections']
    inlines = [QuestionInline]
    readonly_fields = ['version', 'created_at', 'updated_at']

    def question_count(self, obj):
        return obj.question_count
    question_count.short_description = 'Questions'

    def response_count(self, obj):
        return obj.response_count
    response_count.short_description = 'Responses'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text_short', 'survey', 'question_type', 'is_required', 'is_active', 'order', 'created_at']
    list_filter = ['question_type', 'is_required', 'is_active', 'created_at']
    search_fields = ['question_text', 'survey__title']
    inlines = [QuestionOptionInline, LikertScaleInline, MatchingPairInline]
    readonly_fields = ['created_at', 'updated_at']

    def question_text_short(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'question', 'order']
    list_filter = ['question__question_type']
    search_fields = ['option_text', 'question__question_text']


@admin.register(LikertScale)
class LikertScaleAdmin(admin.ModelAdmin):
    list_display = ['question', 'min_value', 'max_value', 'min_label', 'max_label']
    search_fields = ['question__question_text']

