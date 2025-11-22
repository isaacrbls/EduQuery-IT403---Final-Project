from django.urls import path
from django.shortcuts import redirect
from . import views

app_name = 'accounts'

urlpatterns = [
    # Home and authentication URLs
    path('', views.index, name='index'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # Profile and settings
    path('profile/', views.profile, name='profile'),
    path('student/analytics/', views.analytics_view, name='analytics'),

    path('forgot-password/', views.forgot_password, name='forgot_password'),

    # Dashboards
    path('student/dashboard/', views.student_dashboard, name='student_dashboard'),
    path('teacher/dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
    
    # Student survey list
    path('student/surveys/', views.student_survey_list, name='student_survey_list'),
    
    # Student history
    path('student/history/', views.student_history, name='student_history'),
    path('student/history/<int:response_id>/', views.student_history_details, name='student_history_details'),
]
