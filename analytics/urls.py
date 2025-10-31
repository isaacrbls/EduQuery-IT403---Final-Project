from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Analytics dashboard URLs
    path('', views.analytics_dashboard, name='analytics_dashboard'),
    path('survey/<int:survey_id>/', views.survey_analytics, name='survey_analytics'),

    # API endpoints for chart data
    path('api/survey/<int:survey_id>/mcq-data/', views.api_mcq_data, name='api_mcq_data'),
    path('api/survey/<int:survey_id>/likert-data/', views.api_likert_data, name='api_likert_data'),
    path('api/survey/<int:survey_id>/text-data/', views.api_text_data, name='api_text_data'),
    path('api/survey/<int:survey_id>/summary/', views.api_survey_summary, name='api_survey_summary'),
]

