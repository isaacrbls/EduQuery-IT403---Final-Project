from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Q, Avg
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
import datetime
from django.db.models.functions import TruncMonth

from .models import User, Section
from surveys.models import Survey
from responses.models import Response
from analytics.models import ActivityLog

# Create your views here.

def index(request):
    """Home page - redirects to login or dashboard"""
    if request.user.is_authenticated:
        if request.user.is_student:
            return redirect('accounts:student_dashboard')
        elif request.user.is_teacher:
            return redirect('accounts:teacher_dashboard')
        else:
            return redirect('admin:index')
    return redirect('accounts:login')


def signup_view(request):
    """User registration"""
    if request.user.is_authenticated:
        return redirect('accounts:index')

    # Get all active sections for the dropdown
    sections = Section.objects.filter(is_archived=False).order_by('name')

    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        user_type = request.POST.get('user_type', 'student')
        section_id = request.POST.get('section', '')

        # Validation
        if not all([username, email, password, password_confirm]):
            messages.error(request, 'All fields are required.')
            return render(request, 'accounts/SignUp.html', {'sections': sections})

        if password != password_confirm:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'accounts/SignUp.html', {'sections': sections})

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'accounts/SignUp.html', {'sections': sections})

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
            return render(request, 'accounts/SignUp.html', {'sections': sections})

        # Create user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                user_type=user_type
            )

            # Enroll student in selected section
            if user_type == 'student' and section_id:
                try:
                    section = Section.objects.get(id=section_id, is_archived=False)
                    section.students.add(user)
                    ActivityLog.objects.create(
                        user=user,
                        action='section_enrolled',
                        description=f'Enrolled in section: {section.name}'
                    )
                except Section.DoesNotExist:
                    pass

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
            return render(request, 'accounts/SignUp.html', {'sections': sections})

    return render(request, 'accounts/SignUp.html', {'sections': sections})


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

    # Calculate statistics
    context = {}
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

    if request.method == 'POST':
        # Update profile
        new_username = request.POST.get('username', user.username)
        
        # Check if username is taken by another user
        if new_username != user.username and User.objects.filter(username=new_username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'accounts/Profile.html', context, status=400)
            
        user.username = new_username
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.phone_number = request.POST.get('phone_number', user.phone_number)
        user.bio = request.POST.get('bio', user.bio)

        user.save()

        ActivityLog.objects.create(
            user=user,
            action='profile_updated',
            description='Profile information updated'
        )

        messages.success(request, 'Profile updated successfully!')
        return redirect('accounts:profile')

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

    # Get completed surveys (checking version)
    submitted_responses = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).values('survey_id', 'survey_version')
    
    submitted_map = {}
    for resp in submitted_responses:
        sid = resp['survey_id']
        ver = resp['survey_version']
        if sid not in submitted_map or ver > submitted_map[sid]:
            submitted_map[sid] = ver

    pending_surveys = []
    completed_surveys = []
    
    for survey in assigned_surveys:
        last_completed_version = submitted_map.get(survey.id, 0)
        if last_completed_version >= survey.version:
            completed_surveys.append(survey)
        else:
            pending_surveys.append(survey)

    # Calculate statistics
    total_surveys = assigned_surveys.count()
    completed_count = len(completed_surveys)
    pending_count = len(pending_surveys)
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
    
    # 1. Basic Stats
    assigned_surveys_qs = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct()
    
    total_surveys = assigned_surveys_qs.count()
    
    user_responses = Response.objects.filter(respondent=user)
    completed_surveys = user_responses.filter(status='submitted').count()
    in_progress_surveys = user_responses.filter(status='in_progress').count()
    
    # Pending for card display (Total - Completed)
    pending_surveys_card = total_surveys - completed_surveys
    
    # Pending for chart (Assigned - (Completed + In Progress))
    responded_survey_ids = user_responses.values_list('survey_id', flat=True)
    pending_surveys_chart = assigned_surveys_qs.exclude(id__in=responded_survey_ids).count()
    
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

    # 2. Chart Data Preparation
    
    # Status Chart Data: [Completed, Pending (Not Started), In Progress]
    status_data = [completed_surveys, pending_surveys_chart, in_progress_surveys]
    
    # Completion History Chart (Last 6 Months)
    six_months_ago = timezone.now() - datetime.timedelta(days=180)
    monthly_stats = user_responses.filter(
        status='submitted',
        submitted_at__gte=six_months_ago
    ).annotate(
        month=TruncMonth('submitted_at')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')
    
    # Convert to dict for easy lookup: 'YYYY-MM' -> count
    stats_dict = {}
    for item in monthly_stats:
        if item['month']:
            stats_dict[item['month'].strftime('%Y-%m')] = item['count']
            
    completion_labels = []
    completion_data = []
    
    # Generate last 6 months
    today = timezone.now().date()
    for i in range(5, -1, -1):
        # Calculate date for i months ago
        year = today.year
        month = today.month - i
        while month <= 0:
            month += 12
            year -= 1
            
        month_key = f"{year}-{month:02d}"
        month_label = datetime.date(year, month, 1).strftime('%b')
        
        completion_labels.append(month_label)
        completion_data.append(stats_dict.get(month_key, 0))
    
    context = {
        'total_surveys': total_surveys,
        'completed_surveys': completed_surveys,
        'pending_surveys': pending_surveys_card,
        'completion_rate': completion_rate,
        'recent_activities': recent_activities,
        'chart_status_data': json.dumps(status_data),
        'chart_completion_labels': json.dumps(completion_labels),
        'chart_completion_data': json.dumps(completion_data),
    }
    
    return render(request, 'accounts/Analytics.html', context)


@login_required
def student_history(request):
    """Student survey history - all completed surveys"""
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
    
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')
    
    user = request.user
    
    # Get all submitted responses with survey details
    completed_responses = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).select_related('survey', 'survey__creator').order_by('-submitted_at')
    
    # Add answer count to each response
    for response in completed_responses:
        response.answer_count = response.answers.count()
        # Note: completion_time is already a property on the Response model
    
    # Pagination - 8 items per page
    paginator = Paginator(completed_responses, 8)
    page = request.GET.get('page', 1)
    
    try:
        responses_page = paginator.page(page)
    except PageNotAnInteger:
        responses_page = paginator.page(1)
    except EmptyPage:
        responses_page = paginator.page(paginator.num_pages)
    
    context = {
        'responses': responses_page,
        'responses_page': responses_page,  # For template compatibility
        'total_completed': paginator.count,
    }
    
    return render(request, 'accounts/History.html', context)


@login_required
def student_history_details(request, response_id):
    """View detailed responses for a specific survey submission"""
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')
    
    user = request.user
    
    # Get the response with all related data
    response = get_object_or_404(
        Response.objects.select_related('survey', 'survey__creator')
                       .prefetch_related('answers__question', 
                                       'answers__selected_option',
                                       'answers__selected_options'),
        id=response_id,
        respondent=user,
        status='submitted'
    )
    
    # Get all answers with their questions
    answers = response.answers.all().order_by('question__order')
    
    # Calculate completion time
    completion_time = None
    if response.submitted_at and response.started_at:
        delta = response.submitted_at - response.started_at
        total_seconds = int(delta.total_seconds())
        
        if total_seconds < 60:
            completion_time = f"{total_seconds} second{'s' if total_seconds != 1 else ''}"
        elif total_seconds < 3600:
            minutes = total_seconds // 60
            seconds = total_seconds % 60
            completion_time = f"{minutes} min {seconds} sec"
        else:
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            completion_time = f"{hours} hr {minutes} min"
    
    # Organize answers by question
    question_answers = []
    for answer in answers:
        question = answer.question
        answer_text = ""
        
        if question.question_type in ['short_answer', 'long_answer']:
            answer_text = answer.text_answer or "No answer provided"
        elif question.question_type == 'multiple_choice':
            answer_text = answer.selected_option.option_text if answer.selected_option else "No answer selected"
        elif question.question_type == 'checkbox':
            selected = answer.selected_options.all()
            answer_text = ", ".join([opt.option_text for opt in selected]) if selected else "No options selected"
        elif question.question_type == 'likert_scale':
            if answer.number_answer is not None:
                # Get likert labels if available
                if question.likert_labels:
                    try:
                        labels_dict = question.likert_labels
                        answer_text = f"{answer.number_answer} - {labels_dict.get(str(answer.number_answer), '')}"
                    except:
                        answer_text = str(answer.number_answer)
                else:
                    answer_text = f"{answer.number_answer} / {question.likert_max}"
            else:
                answer_text = "No rating provided"
        else:
            answer_text = "No answer provided"
        
        question_answers.append({
            'question': question,
            'answer_text': answer_text,
            'answer': answer
        })
    
    context = {
        'response': response,
        'survey': response.survey,
        'question_answers': question_answers,
        'completion_time': completion_time,
        'total_questions': response.survey.questions.count(),
        'answered_questions': answers.count(),
    }
    
    return render(request, 'accounts/HistoryDetails.html', context)


@login_required
def student_survey_list(request):
    """Student survey list - displays surveys with teacher-like layout and pagination"""
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
    
    if not request.user.is_student:
        messages.error(request, 'Access denied. Students only.')
        return redirect('accounts:index')
    
    user = request.user
    
    # Get all assigned surveys (published)
    assigned_surveys = Survey.objects.filter(
        sections__students=user,
        status='published'
    ).distinct().order_by('-created_at')
    
    # Get completed survey IDs with versions
    submitted_responses = Response.objects.filter(
        respondent=user,
        status='submitted'
    ).values('survey_id', 'survey_version')
    
    submitted_map = {}
    for resp in submitted_responses:
        sid = resp['survey_id']
        ver = resp['survey_version']
        if sid not in submitted_map or ver > submitted_map[sid]:
            submitted_map[sid] = ver
    
    # Filter by status
    status_filter = request.GET.get('status', 'all')
    if status_filter == 'pending':
        # Only unanswered or old version
        filtered_surveys = [s for s in assigned_surveys if submitted_map.get(s.id, 0) < s.version]
    elif status_filter == 'completed':
        # Only completed current version
        filtered_surveys = [s for s in assigned_surveys if submitted_map.get(s.id, 0) >= s.version]
    else:
        filtered_surveys = list(assigned_surveys)
    
    # Add completion status to each survey
    for survey in filtered_surveys:
        survey.is_completed = submitted_map.get(survey.id, 0) >= survey.version
        survey.is_overdue = survey.due_date and timezone.now() > survey.due_date if survey.due_date else False
    
    # Pagination - 8 items per page (same as teacher)
    paginator = Paginator(filtered_surveys, 8)
    page = request.GET.get('page', 1)
    
    try:
        surveys_page = paginator.page(page)
    except PageNotAnInteger:
        surveys_page = paginator.page(1)
    except EmptyPage:
        surveys_page = paginator.page(paginator.num_pages)
    
    context = {
        'surveys': surveys_page,
    }
    
    return render(request, 'accounts/SurveyListdashboard.html', context)


@login_required
def section_list(request):
    """View for listing and managing sections"""
    if not request.user.is_teacher:
        return redirect('accounts:student_dashboard')
    
    from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
        
    all_sections = Section.objects.filter(teacher=request.user).order_by('-created_at')
    active_sections = all_sections.filter(is_archived=False)
    archived_sections = all_sections.filter(is_archived=True)
    
    # Pagination for active sections - 8 items per page
    page = request.GET.get('page', 1)
    paginator_active = Paginator(active_sections, 8)
    
    try:
        active_sections_page = paginator_active.page(page)
    except PageNotAnInteger:
        active_sections_page = paginator_active.page(1)
    except EmptyPage:
        active_sections_page = paginator_active.page(paginator_active.num_pages)
    
    # Pagination for archived sections - 8 items per page
    archived_page = request.GET.get('archived_page', 1)
    paginator_archived = Paginator(archived_sections, 8)
    
    try:
        archived_sections_page = paginator_archived.page(archived_page)
    except PageNotAnInteger:
        archived_sections_page = paginator_archived.page(1)
    except EmptyPage:
        archived_sections_page = paginator_archived.page(paginator_archived.num_pages)
    
    context = {
        'active_sections': active_sections_page,
        'archived_sections': archived_sections_page,
    }
    return render(request, 'accounts/Sections.html', context)
