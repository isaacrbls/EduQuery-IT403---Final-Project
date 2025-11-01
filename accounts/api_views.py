from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from .models import User, Section
from .serializers import UserSerializer, UserRegistrationSerializer, SectionSerializer


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

