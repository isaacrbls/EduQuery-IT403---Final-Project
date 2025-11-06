from rest_framework import serializers
from .models import Response, Answer
from surveys.models import Survey, Question
from accounts.models import User


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for Answer model"""
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    question_order = serializers.IntegerField(source='question.order', read_only=True)
    answer_display = serializers.SerializerMethodField()
    selected_option_text = serializers.CharField(source='selected_option.option_text', read_only=True, allow_null=True)
    selected_options_text = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = [
            'id', 'question', 'question_text', 'question_type', 'question_order',
            'text_answer', 'selected_option', 'selected_option_text',
            'selected_options', 'selected_options_text',
            'number_answer', 'date_answer', 'answer_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_answer_display(self, obj):
        """Return formatted answer display"""
        return obj.get_answer_display()

    def get_selected_options_text(self, obj):
        """Return list of selected option texts"""
        if obj.selected_options.exists():
            return [opt.option_text for opt in obj.selected_options.all()]
        return []


class ResponseListSerializer(serializers.ModelSerializer):
    """Serializer for Response list view"""
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    respondent_name = serializers.SerializerMethodField()
    respondent_username = serializers.CharField(source='respondent.username', read_only=True, allow_null=True)
    answer_count = serializers.SerializerMethodField()
    completion_time_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Response
        fields = [
            'id', 'survey', 'survey_title', 'respondent', 'respondent_name',
            'respondent_username', 'status', 'ip_address', 'started_at',
            'submitted_at', 'updated_at', 'answer_count', 'completion_time_seconds'
        ]
        read_only_fields = ['id', 'started_at', 'submitted_at', 'updated_at']

    def get_respondent_name(self, obj):
        """Get respondent's full name or username"""
        if obj.respondent:
            full_name = obj.respondent.get_full_name()
            return full_name if full_name else obj.respondent.username
        return "Anonymous"

    def get_answer_count(self, obj):
        """Get count of answers for this response"""
        return obj.answers.count()

    def get_completion_time_seconds(self, obj):
        """Get completion time in seconds"""
        if obj.completion_time:
            return int(obj.completion_time.total_seconds())
        return None


class ResponseDetailSerializer(serializers.ModelSerializer):
    """Serializer for Response detail view with answers"""
    survey_title = serializers.CharField(source='survey.title', read_only=True)
    survey_description = serializers.CharField(source='survey.description', read_only=True)
    respondent_name = serializers.SerializerMethodField()
    respondent_username = serializers.CharField(source='respondent.username', read_only=True, allow_null=True)
    answers = AnswerSerializer(many=True, read_only=True)
    completion_time_seconds = serializers.SerializerMethodField()

    class Meta:
        model = Response
        fields = [
            'id', 'survey', 'survey_title', 'survey_description',
            'respondent', 'respondent_name', 'respondent_username',
            'status', 'ip_address', 'started_at', 'submitted_at',
            'updated_at', 'answers', 'completion_time_seconds'
        ]
        read_only_fields = ['id', 'started_at', 'submitted_at', 'updated_at']

    def get_respondent_name(self, obj):
        """Get respondent's full name or username"""
        if obj.respondent:
            full_name = obj.respondent.get_full_name()
            return full_name if full_name else obj.respondent.username
        return "Anonymous"

    def get_completion_time_seconds(self, obj):
        """Get completion time in seconds"""
        if obj.completion_time:
            return int(obj.completion_time.total_seconds())
        return None

