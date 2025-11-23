import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Survey, Question, QuestionOption, LikertScale
from .serializers import (
    SurveyListSerializer,
    SurveyDetailSerializer,
    SurveyCreateSerializer,
    QuestionSerializer
)
from accounts.models import Section

logger = logging.getLogger(__name__)

class SurveyViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter surveys based on user type"""
        user = self.request.user
        if user.is_teacher:
            return Survey.objects.filter(creator=user)
        elif user.is_student:
            # Return surveys assigned to student's sections
            return Survey.objects.filter(
                sections__students=user,
                status='published'
            ).distinct()
        return Survey.objects.all()

    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return SurveyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SurveyCreateSerializer
        return SurveyDetailSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        logger.info(f"Creating survey with data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract questions and sections from validated_data if present (safer than request.data)
        # Note: We must copy them because serializer.save() might modify validated_data
        questions_data = serializer.validated_data.get('questions', request.data.get('questions', []))
        section_ids = serializer.validated_data.get('section_ids', request.data.get('section_ids', []))
        
        survey = serializer.save()
        
        # Handle sections
        if section_ids:
            survey.sections.set(section_ids)
            
        # Handle questions
        logger.info(f"Questions data: {questions_data}")
        self._save_questions(survey, questions_data)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Extract questions and sections
        questions_data = serializer.validated_data.get('questions', request.data.get('questions', []))
        section_ids = serializer.validated_data.get('section_ids', request.data.get('section_ids', []))
        
        survey = serializer.save()
        
        # Handle sections
        if 'section_ids' in request.data or 'section_ids' in serializer.validated_data:
            survey.sections.set(section_ids)
            
        # Handle questions
        if 'questions' in request.data or 'questions' in serializer.validated_data:
            instance.questions.all().delete()
            self._save_questions(instance, questions_data)
            
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def _save_questions(self, survey, questions_data):
        for q_data in questions_data:
            question = Question.objects.create(
                survey=survey,
                question_text=q_data.get('question_text'),
                question_type=q_data.get('question_type'),
                is_required=q_data.get('required', True),
                order=q_data.get('order', 0)
            )
            
            if question.question_type in ['multiple_choice', 'checkbox']:
                options = q_data.get('options', [])
                # Save to JSONField
                question.options = options
                question.save()
                
                for idx, opt_text in enumerate(options):
                    QuestionOption.objects.create(
                        question=question,
                        option_text=opt_text,
                        order=idx
                    )
            
            elif question.question_type == 'likert_scale':
                likert_data = q_data.get('likert_scale', {})
                # Save to fields
                question.likert_min = likert_data.get('min_value', 1)
                question.likert_max = likert_data.get('max_value', 5)
                question.save()
                
                LikertScale.objects.create(
                    question=question,
                    min_value=likert_data.get('min_value', 1),
                    max_value=likert_data.get('max_value', 5),
                    min_label=likert_data.get('min_label', 'Strongly Disagree'),
                    max_label=likert_data.get('max_label', 'Strongly Agree')
                )

    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a survey"""
        survey = self.get_object()
        questions = survey.questions.all()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish a survey"""
        survey = self.get_object()
        if survey.creator != request.user:
            return Response(
                {'error': 'You do not have permission to publish this survey'},
                status=status.HTTP_403_FORBIDDEN
            )
        survey.status = 'published'
        survey.save()
        return Response({'message': 'Survey published successfully'})

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a survey"""
        survey = self.get_object()
        if survey.creator != request.user:
            return Response(
                {'error': 'You do not have permission to close this survey'},
                status=status.HTTP_403_FORBIDDEN
            )
        survey.status = 'closed'
        survey.save()
        return Response({'message': 'Survey closed successfully'})

    @action(detail=False, methods=['get'])
    def my_surveys(self, request):
        """Get surveys created by the current user"""
        surveys = Survey.objects.filter(creator=request.user)
        serializer = SurveyListSerializer(surveys, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def assigned(self, request):
        if not request.user.is_student:
            return Response(
                {'error': 'Only students can access assigned surveys'},
                status=status.HTTP_403_FORBIDDEN
            )
        surveys = Survey.objects.filter(
            sections__students=request.user,
            status='published'
        ).distinct()
        serializer = SurveyListSerializer(surveys, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_sections(self, request, pk=None):
        survey = self.get_object()
        if survey.creator != request.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        section_ids = request.data.get('section_ids', [])
        sections = Section.objects.filter(id__in=section_ids, teacher=request.user)
        survey.sections.set(sections)
        return Response({'message': 'Sections assigned successfully'})


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        survey_id = self.request.query_params.get('survey')
        if survey_id:
            return Question.objects.filter(survey_id=survey_id)
        return Question.objects.filter(survey__creator=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        survey_id = request.data.get('survey_id')
        survey = get_object_or_404(Survey, id=survey_id, creator=request.user)
        
        question = Question.objects.create(
            survey=survey,
            question_text=request.data.get('question_text'),
            question_type=request.data.get('question_type'),
            required=request.data.get('required', True),
            order=request.data.get('order', 0),
            help_text=request.data.get('help_text', ''),
            placeholder=request.data.get('placeholder', '')
        )
        
        if question.question_type in ['mcq', 'checkbox', 'dropdown']:
            options = request.data.get('options', [])
            for idx, option_text in enumerate(options):
                QuestionOption.objects.create(
                    question=question,
                    option_text=option_text,
                    order=idx
                )
        
        elif question.question_type == 'likert':
            likert_data = request.data.get('likert_scale', {})
            LikertScale.objects.create(
                question=question,
                min_value=likert_data.get('min_value', 1),
                max_value=likert_data.get('max_value', 5),
                min_label=likert_data.get('min_label', 'Strongly Disagree'),
                max_label=likert_data.get('max_label', 'Strongly Agree')
            )
        
        serializer = self.get_serializer(question)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @transaction.atomic
    def update(self, request, *args, **kwargs):
        question = self.get_object()
        
        question.question_text = request.data.get('question_text', question.question_text)
        question.question_type = request.data.get('question_type', question.question_type)
        question.required = request.data.get('required', question.required)
        question.order = request.data.get('order', question.order)
        question.help_text = request.data.get('help_text', question.help_text)
        question.placeholder = request.data.get('placeholder', question.placeholder)
        question.save()
        
        if question.question_type in ['mcq', 'checkbox', 'dropdown']:
            question.options.all().delete()
            options = request.data.get('options', [])
            for idx, option_text in enumerate(options):
                QuestionOption.objects.create(
                    question=question,
                    option_text=option_text,
                    order=idx
                )
        
        elif question.question_type == 'likert':
            likert_data = request.data.get('likert_scale', {})
            likert, created = LikertScale.objects.get_or_create(question=question)
            likert.min_value = likert_data.get('min_value', likert.min_value)
            likert.max_value = likert_data.get('max_value', likert.max_value)
            likert.min_label = likert_data.get('min_label', likert.min_label)
            likert.max_label = likert_data.get('max_label', likert.max_label)
            likert.save()
        
        
        serializer = self.get_serializer(question)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        question_orders = request.data.get('questions', [])
        for item in question_orders:
            Question.objects.filter(id=item['id']).update(order=item['order'])
        return Response({'message': 'Questions reordered successfully'})

