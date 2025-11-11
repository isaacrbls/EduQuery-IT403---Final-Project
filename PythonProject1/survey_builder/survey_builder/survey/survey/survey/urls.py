from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('builder/<int:survey_id>/', views.builder, name='builder'),
    path('builder/<int:survey_id>/save/', views.save_questions, name='save_questions'),
    path('assign/', views.assign_section, name='assign_section'),
    path('assign/save/', views.save_assignment, name='save_assignment'),
]
