from django.urls import path
from . import views

app_name = 'surveys'

urlpatterns = [
    # Survey management URLs
    path('dashboard/', views.dashboard, name='dashboard'),
    path('create/', views.survey_create, name='survey_create'),
    path('<int:survey_id>/', views.survey_detail, name='survey_detail'),
    path('<int:survey_id>/edit/', views.survey_edit, name='survey_edit'),
    path('<int:survey_id>/delete/', views.survey_delete, name='survey_delete'),
    path('<int:survey_id>/assign/', views.survey_assign, name='survey_assign'),

    # Student survey URLs
    path('my-surveys/', views.student_surveys, name='student_surveys'),
    path('<int:survey_id>/take/', views.take_survey, name='take_survey'),
    path('<int:survey_id>/submit/', views.submit_survey, name='submit_survey'),

    # API endpoints for dynamic survey builder
    path('api/questions/create/', views.api_create_question, name='api_create_question'),
    path('api/questions/<int:question_id>/update/', views.api_update_question, name='api_update_question'),
    path('api/questions/<int:question_id>/delete/', views.api_delete_question, name='api_delete_question'),
]

