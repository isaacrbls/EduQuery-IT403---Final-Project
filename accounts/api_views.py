from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from .models import User, Section
from .serializers import UserSerializer, UserRegistrationSerializer, SectionSerializer
from surveys.models import Survey
from surveys.serializers import SurveyListSerializer
from responses.models import Response as SurveyResponse


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """User login"""
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """User logout"""
        logout(request)
        return Response({'message': 'Logout successful'})

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter sections based on user type"""
        user = self.request.user
        if user.is_teacher:
            return Section.objects.filter(teacher=user)
        elif user.is_student:
            return Section.objects.filter(students=user)
        return Section.objects.all()

    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get list of students in a section"""
        section = self.get_object()
        students = section.students.all()
        serializer = UserSerializer(students, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll a student in a section"""
        section = self.get_object()
        student_id = request.data.get('student_id')

        try:
            student = User.objects.get(id=student_id, user_type='student')
            section.students.add(student)
            return Response({'message': 'Student enrolled successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Student not found'},
                          status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unanswered_surveys(request):
    """
    API endpoint to get unanswered surveys for a student with optional search filter
    """
    user = request.user
    
    # Check if user is a student
    if not user.is_student:
        return Response(
            {'error': 'Access denied. Students only.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get search query from request
    search_query = request.query_params.get('search', '').strip()
    
    # Get surveys assigned to student's sections that are published
    assigned_surveys = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct()
    
    # Filter out surveys that the student has already answered
    answered_survey_ids = SurveyResponse.objects.filter(
        respondent=user,
        status='submitted'
    ).values_list('survey_id', flat=True)
    
    unanswered_surveys = assigned_surveys.exclude(id__in=answered_survey_ids)
    
    # Apply search filter if provided
    if search_query:
        unanswered_surveys = unanswered_surveys.filter(
            Q(title__icontains=search_query) | 
            Q(description__icontains=search_query)
        )
    
    # Order by most recent
    unanswered_surveys = unanswered_surveys.order_by('-created_at')
    
    # Serialize the data
    serializer = SurveyListSerializer(unanswered_surveys, many=True)
    
    return Response({
        'surveys': serializer.data,
        'count': unanswered_surveys.count(),
        'search_query': search_query
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_sections(request):
    """
    API endpoint to get all sections for the current teacher
    """
    user = request.user
    
    # Check if user is a teacher
    if not user.is_teacher:
        return Response(
            {'error': 'Access denied. Teachers only.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get teacher's non-archived sections
    sections = Section.objects.filter(
        teacher=user,
        is_archived=False
    ).order_by('name')
    
    # Serialize the data
    serializer = SectionSerializer(sections, many=True)
    
    return Response(serializer.data)
