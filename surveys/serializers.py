from rest_framework import serializers
from .models import Survey, Question, QuestionOption, LikertScale


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_text', 'order']


class LikertScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LikertScale
        fields = ['id', 'min_value', 'max_value', 'min_label', 'max_label']


class QuestionSerializer(serializers.ModelSerializer):
    options = QuestionOptionSerializer(many=True, read_only=True)
    likert_scale = LikertScaleSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'required',
                  'order', 'help_text', 'placeholder', 'options', 'likert_scale']


class SurveyListSerializer(serializers.ModelSerializer):
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    question_count = serializers.IntegerField(read_only=True)
    response_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'creator', 'creator_name',
                  'status', 'question_count', 'response_count', 'start_date',
                  'due_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SurveyDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    section_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        source='sections',
        read_only=True
    )

    class Meta:
        model = Survey
        fields = ['id', 'title', 'description', 'creator', 'creator_name',
                  'sections', 'section_ids', 'status', 'anonymous',
                  'allow_multiple_submissions', 'randomize_questions',
                  'show_results', 'start_date', 'due_date', 'questions',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SurveyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = ['title', 'description', 'status', 'anonymous',
                  'allow_multiple_submissions', 'randomize_questions',
                  'show_results', 'start_date', 'due_date']

    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)

