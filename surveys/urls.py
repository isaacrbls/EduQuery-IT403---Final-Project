from django.urls import path
from . import views

app_name = 'surveys'

urlpatterns = [
    path('', views.survey_list, name='survey_list'),
    path('list/', views.survey_list, name='student_surveys'),
    path('take/<int:survey_id>/', views.take_survey, name='take_survey'),
    path('submit/<int:survey_id>/', views.submit_survey, name='submit_survey'),
    path('save-progress/<int:survey_id>/', views.save_survey_progress, name='save_progress'),
    path('validate/<int:survey_id>/', views.validate_survey_access, name='validate_access'),

    path('history/', views.response_history, name='response_history'),
    path('response/<int:response_id>/', views.survey_detail, name='survey_detail'),
    path('congratulations/<int:response_id>/', views.congratulations, name='congratulations'),
]




