from django.urls import path
from . import views

app_name = 'surveys'

urlpatterns = [
    path('', views.survey_list, name='survey_list'),
    path('list/', views.survey_list, name='student_surveys'),
    
    path('create/', views.create_survey, name='create_survey'),
    path('<int:survey_id>/edit/', views.edit_survey, name='edit_survey'),
    path('<int:survey_id>/delete/', views.delete_survey, name='delete_survey'),
    path('<int:survey_id>/restore/', views.restore_survey, name='restore_survey'),
    path('<int:survey_id>/publish/', views.publish_survey, name='publish_survey'),
    path('<int:survey_id>/unpublish/', views.unpublish_survey, name='unpublish_survey'),
    path('<int:survey_id>/question/add/', views.add_question, name='add_question'),
    path('question/<int:question_id>/edit/', views.edit_question, name='edit_question'),
    path('question/<int:question_id>/delete/', views.delete_question, name='delete_question'),
    path('question/<int:question_id>/restore/', views.restore_question, name='restore_question'),
    path('<int:survey_id>/questions/reorder/', views.reorder_questions, name='reorder_questions'),
    
    # Survey Builder (Drag-and-Drop)
    path('builder/', views.survey_builder, name='survey_builder'),
    path('builder/<int:survey_id>/', views.survey_builder, name='survey_builder_edit'),
    path('builder/save/', views.save_survey_builder, name='save_survey_builder'),
    
    # Survey Taking
    path('<int:survey_id>/take/', views.take_survey, name='take_survey'),
    path('take/<int:survey_id>/', views.take_survey, name='take_survey_alt'),
    path('submit/<int:survey_id>/', views.submit_survey, name='submit_survey'),
    path('save-progress/<int:survey_id>/', views.save_survey_progress, name='save_progress'),
    path('validate/<int:survey_id>/', views.validate_survey_access, name='validate_access'),
    path('history/', views.response_history, name='response_history'),
    path('response/<int:response_id>/', views.survey_detail, name='survey_detail'),
]




