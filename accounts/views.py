from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from .models import User, Section
from surveys.models import Survey
from responses.models import Response
from analytics.models import ActivityLog

# Create your views here.

def index(request):
    """Home page"""
    if request.user.is_authenticated:
        if request.user.is_student:
            return redirect('accounts:student_dashboard')
        elif request.user.is_teacher:
            return redirect('accounts:teacher_dashboard')
        else:
            return redirect('admin:index')
    return render(request, 'accounts/index.html')


def signup_view(request):
    """User registration"""
    if request.user.is_authenticated:
        return redirect('accounts:index')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        user_type = request.POST.get('user_type', 'student')
        student_id = request.POST.get('student_id', '')

        # Validation
        if not all([username, email, password, password_confirm]):
            messages.error(request, 'All fields are required.')
            return render(request, 'accounts/SignUp.html')

        if password != password_confirm:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'accounts/SignUp.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'accounts/SignUp.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
            return render(request, 'accounts/SignUp.html')

        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                user_type=user_type,
                student_id=student_id if user_type == 'student' else None
            )

            # Log activity
            ActivityLog.objects.create(
                user=user,
                action='user_registered',
                description=f'New {user_type} account created'
            )

            messages.success(request, 'Account created successfully! Please log in.')
            return redirect('accounts:login')
        except Exception as e:
            messages.error(request, f'Error creating account: {str(e)}')
            return render(request, 'accounts/SignUp.html')

    return render(request, 'accounts/SignUp.html')


def login_view(request):
    """User login"""
    if request.user.is_authenticated:
        return redirect('accounts:index')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            # Set session expiry
            if not remember_me:
                request.session.set_expiry(0)  # Session expires on browser close

            # Log activity
            ActivityLog.objects.create(
                user=user,
                action='user_login',
                description=f'User logged in'
            )

            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
            elif user.is_student:
                return redirect('accounts:student_dashboard')
            elif user.is_teacher:
                return redirect('accounts:teacher_dashboard')
            else:
                return redirect('admin:index')
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'accounts/SignIn.html')


@login_required
def logout_view(request):
    """User logout"""
    ActivityLog.objects.create(
        user=request.user,
        action='user_logout',
        description=f'User logged out'
    )
    logout(request)
    return redirect('accounts:login')


@login_required
def profile(request):
    """User profile"""
    user = request.user

    if request.method == 'POST':
        # Update profile
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.phone_number = request.POST.get('phone_number', user.phone_number)
        user.bio = request.POST.get('bio', user.bio)

        # Handle profile picture upload
        if 'profile_picture' in request.FILES:
            user.profile_picture = request.FILES['profile_picture']

        user.save()

        ActivityLog.objects.create(
            user=user,
            action='profile_updated',
            description='Profile information updated'
        )

        messages.success(request, 'Profile updated successfully!')
        return redirect('accounts:profile')

    # Calculate statistics for students
    if user.is_student:
        total_surveys = Survey.objects.filter(
            sections__students=user,
            status='published'
        ).count()

        completed_surveys = Response.objects.filter(
            respondent=user,
            status='submitted'
        ).count()

        completion_rate = (completed_surveys / total_surveys * 100) if total_surveys > 0 else 0

        # Get user sections
        sections = user.enrolled_sections.all()

        context = {
            'completion_rate': round(completion_rate, 1),
            'response_quality': 'Excellent',
            'participation_status': 'Active',
            'total_surveys': total_surveys,
            'completed_surveys': completed_surveys,
            'sections': sections,
        }
    elif user.is_teacher:
        created_surveys = user.created_surveys.count()
        teaching_sections = user.teaching_sections.count()
        total_responses = Response.objects.filter(
            survey__creator=user,
            status='submitted'
        ).count()

        context = {
            'created_surveys': created_surveys,
            'teaching_sections': teaching_sections,
            'total_responses': total_responses,
        }
    else:
        context = {}

    return render(request, 'accounts/Profile.html', context)


@login_required
def settings_view(request):
    """User settings"""
    if request.method == 'POST':
        action = request.POST.get('action')

        if action == 'update_password':
            current_password = request.POST.get('current_password')
            new_password = request.POST.get('new_password')
            confirm_password = request.POST.get('confirm_password')

            if not request.user.check_password(current_password):
                messages.error(request, 'Current password is incorrect.')
            elif new_password != confirm_password:
                messages.error(request, 'New passwords do not match.')
            elif len(new_password) < 8:
                messages.error(request, 'Password must be at least 8 characters long.')
            else:
                request.user.set_password(new_password)
                request.user.save()

                ActivityLog.objects.create(
                    user=request.user,
                    action='password_changed',
                    description='Password changed successfully'
                )

                messages.success(request, 'Password updated successfully!')
                return redirect('accounts:login')

        elif action == 'update_notifications':
            # Handle notification preferences
            messages.success(request, 'Notification settings updated!')

    return render(request, 'accounts/Settings.html')


def forgot_password(request):
    """
    Render the Forgot Password page and accept email submission.
    For now, only show a success flash; integration with Django's
    password reset can be wired later.
    """
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        if email:
            messages.success(request, 'If an account exists for that email, we\'ve sent reset instructions.')
            return redirect('accounts:forgot_password')
        else:
            messages.error(request, 'Please enter a valid email address.')
    return render(request, 'accounts/ForgotPassword.html')


# Student Dashboard Views

@login_required
def student_dashboard(request):
    """Student dashboard - overview"""
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')

    user = request.user

    # Get assigned surveys
    assigned_surveys = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct().order_by('-created_at')

    # Get completed surveys
    completed_survey_ids = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).values_list('survey_id', flat=True)

    # Separate pending and completed
    pending_surveys = assigned_surveys.exclude(id__in=completed_survey_ids)
    completed_surveys = assigned_surveys.filter(id__in=completed_survey_ids)

    # Calculate statistics
    total_surveys = assigned_surveys.count()
    completed_count = completed_surveys.count()
    pending_count = pending_surveys.count()
    completion_rate = (completed_count / total_surveys * 100) if total_surveys > 0 else 0

    # Get recent activity
    recent_responses = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).order_by('-submitted_at')[:5]

    # Get enrolled sections
    sections = user.enrolled_sections.all()

    context = {
        'pending_surveys': pending_surveys[:5],  # Show 5 most recent
        'completed_surveys': completed_surveys[:5],
        'total_surveys': total_surveys,
        'completed_count': completed_count,
        'pending_count': pending_count,
        'completion_rate': round(completion_rate, 1),
        'recent_responses': recent_responses,
        'sections': sections,
    }

    return render(request, 'accounts/StudentDashboard.html', context)


@login_required
def teacher_dashboard(request):
    """Teacher dashboard - overview"""
    if not request.user.is_teacher:
        messages.error(request, 'Access denied. Teachers only.')
        return redirect('accounts:index')

    user = request.user

    # Get teacher's surveys
    surveys = user.created_surveys.all().order_by('-created_at')

    # Get statistics
    total_surveys = surveys.count()
    published_surveys = surveys.filter(status='published').count()
    draft_surveys = surveys.filter(status='draft').count()

    # Get total responses
    total_responses = Response.objects.filter(
        survey__creator=user,
        status='submitted'
    ).count()

    # Get teaching sections
    sections = user.teaching_sections.all()

    # Recent activity
    recent_responses = Response.objects.filter(
        survey__creator=user,
        status='submitted'
    ).order_by('-submitted_at')[:10]

    context = {
        'surveys': surveys[:10],
        'total_surveys': total_surveys,
        'published_surveys': published_surveys,
        'draft_surveys': draft_surveys,
        'total_responses': total_responses,
        'sections': sections,
        'recent_responses': recent_responses,
    }

    return render(request, 'accounts/TeacherDashboard.html', context)


@login_required
def analytics_view(request):
    """Analytics dashboard for students"""
    user = request.user
    
    if not user.is_student:
        return redirect('accounts:index')
    
    total_surveys = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct().count()
    
    completed_surveys = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).count()
    
    pending_surveys = total_surveys - completed_surveys
    
    completion_rate = round((completed_surveys / total_surveys * 100) if total_surveys > 0 else 0, 1)
    
    recent_activities = ActivityLog.objects.filter(
        user=user
    ).order_by('-timestamp')[:10]
    
    for activity in recent_activities:
        if activity.action == 'survey_completed':
            activity.icon = 'check_circle'
        elif activity.action == 'survey_started':
            activity.icon = 'play_circle'
        elif activity.action == 'user_login':
            activity.icon = 'login'
        elif activity.action == 'profile_updated':
            activity.icon = 'person'
        else:
            activity.icon = 'info'
    
    context = {
        'total_surveys': total_surveys,
        'completed_surveys': completed_surveys,
        'pending_surveys': pending_surveys,
        'completion_rate': completion_rate,
        'recent_activities': recent_activities,
    }
    
    return render(request, 'accounts/Analytics.html', context)
