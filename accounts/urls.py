from django.urls import path
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
    path('settings/', views.settings_view, name='settings'),

    # Password management
    path('forgot-password/', views.forgot_password, name='forgot_password'),

    # Dashboards
    path('student/dashboard/', views.student_dashboard, name='student_dashboard'),
    path('teacher/dashboard/', views.teacher_dashboard, name='teacher_dashboard'),
]
