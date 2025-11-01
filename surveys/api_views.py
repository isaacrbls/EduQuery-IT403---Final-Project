from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Survey, Question, QuestionOption
from .serializers import (
    SurveyListSerializer,
    SurveyDetailSerializer,
    SurveyCreateSerializer,
    QuestionSerializer
)


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
        """Get surveys assigned to student"""
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


class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get questions for surveys created by user"""
        survey_id = self.request.query_params.get('survey')
        if survey_id:
            return Question.objects.filter(survey_id=survey_id)
        return Question.objects.filter(survey__creator=self.request.user)

    def perform_create(self, serializer):
        """Ensure user owns the survey before adding questions"""
        survey = serializer.validated_data['survey']
        if survey.creator != self.request.user:
            raise PermissionError("You cannot add questions to this survey")
        serializer.save()

