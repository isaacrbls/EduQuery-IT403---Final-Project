from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Response as ResponseModel, Answer
from .serializers import ResponseListSerializer, ResponseDetailSerializer
from surveys.models import Survey
from accounts.models import User


def check_teacher_admin_access(user):
    """Check if user has teacher or admin access"""
    return user.is_teacher or user.is_admin_user


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def response_list_api(request):
    """
    API endpoint to get paginated, sortable, filterable list of responses
    Query parameters:
    - page: Page number (default: 1)
    - page_size: Items per page (default: 10)
    - search: Search by student name/username
    - date_from: Filter responses from this date (YYYY-MM-DD)
    - date_to: Filter responses to this date (YYYY-MM-DD)
    - survey_id: Filter by survey ID
    - sort_by: Field to sort by (default: -submitted_at)
    - status: Filter by status (submitted/in_progress)
    """
    user = request.user

    # Check access permissions
    if not check_teacher_admin_access(user):
        return Response(
            {'error': 'Access denied. Teachers and admins only.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # Base queryset - filter by user type
    if user.is_teacher:
        queryset = ResponseModel.objects.filter(
            survey__creator=user,
            status='submitted'
        ).select_related('survey', 'respondent')
    else:  # admin
        queryset = ResponseModel.objects.filter(
            status='submitted'
        ).select_related('survey', 'respondent')

    # Apply filters
    search_query = request.GET.get('search', '').strip()
    if search_query:
        queryset = queryset.filter(
            Q(respondent__username__icontains=search_query) |
            Q(respondent__first_name__icontains=search_query) |
            Q(respondent__last_name__icontains=search_query) |
            Q(respondent__email__icontains=search_query)
        )

    # Date filtering
    date_from = request.GET.get('date_from', '').strip()
    date_to = request.GET.get('date_to', '').strip()
    
    if date_from:
        try:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            queryset = queryset.filter(submitted_at__date__gte=date_from_obj)
        except ValueError:
            pass

    if date_to:
        try:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            queryset = queryset.filter(submitted_at__date__lte=date_to_obj)
        except ValueError:
            pass

    # Survey filter
    survey_id = request.GET.get('survey_id', '').strip()
    if survey_id:
        try:
            queryset = queryset.filter(survey_id=int(survey_id))
        except ValueError:
            pass

    # Status filter
    status_filter = request.GET.get('status', '').strip()
    if status_filter in ['submitted', 'in_progress']:
        queryset = queryset.filter(status=status_filter)

    # Sorting
    sort_by = request.GET.get('sort_by', '-submitted_at').strip()
    allowed_sort_fields = [
        'id', '-id', 'submitted_at', '-submitted_at',
        'started_at', '-started_at', 'survey__title', '-survey__title',
        'respondent__username', '-respondent__username'
    ]
    if sort_by in allowed_sort_fields:
        queryset = queryset.order_by(sort_by)
    else:
        queryset = queryset.order_by('-submitted_at')

    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    
    # Limit page_size to prevent abuse
    if page_size > 100:
        page_size = 100
    if page_size < 1:
        page_size = 10

    total_count = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    
    responses = queryset[start:end]
    
    serializer = ResponseListSerializer(responses, many=True)

    return Response({
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size,
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def response_detail_api(request, response_id):
    """
    API endpoint to get detailed response with all answers
    """
    user = request.user

    # Check access permissions
    if not check_teacher_admin_access(user):
        return Response(
            {'error': 'Access denied. Teachers and admins only.'},
            status=status.HTTP_403_FORBIDDEN
        )

    try:
        response = ResponseModel.objects.select_related(
            'survey', 'respondent'
        ).prefetch_related(
            'answers__question',
            'answers__selected_option',
            'answers__selected_options'
        ).get(id=response_id)
    except ResponseModel.DoesNotExist:
        return Response(
            {'error': 'Response not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Check if user has access to this response
    if user.is_teacher:
        if response.survey.creator != user:
            return Response(
                {'error': 'Access denied. You can only view responses to your surveys.'},
                status=status.HTTP_403_FORBIDDEN
            )

    serializer = ResponseDetailSerializer(response)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_autocomplete_api(request):
    """
    API endpoint for student name autocomplete
    Returns list of students matching the search query
    """
    user = request.user

    # Check access permissions
    if not check_teacher_admin_access(user):
        return Response(
            {'error': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    query = request.GET.get('q', '').strip()
    
    if len(query) < 2:
        return Response({'results': []})

    # Get students who have submitted responses
    if user.is_teacher:
        # Teachers see students from their surveys
        students = User.objects.filter(
            user_type='student',
            survey_responses__survey__creator=user
        ).distinct()
    else:
        # Admins see all students
        students = User.objects.filter(user_type='student')

    # Filter by search query
    students = students.filter(
        Q(username__icontains=query) |
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query)
    )[:10]  # Limit to 10 results

    results = []
    for student in students:
        full_name = student.get_full_name() or student.username
        results.append({
            'id': student.id,
            'label': f"{full_name} ({student.username})",
            'value': student.username
        })

    return Response({'results': results})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def survey_list_api(request):
    """
    API endpoint to get list of surveys for filtering
    """
    user = request.user

    # Check access permissions
    if not check_teacher_admin_access(user):
        return Response(
            {'error': 'Access denied.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if user.is_teacher:
        surveys = Survey.objects.filter(creator=user)
    else:
        surveys = Survey.objects.all()

    results = []
    for survey in surveys:
        results.append({
            'id': survey.id,
            'title': survey.title,
            'response_count': survey.response_count
        })

    return Response({'results': results})

