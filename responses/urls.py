from django.urls import path
from . import views

app_name = 'responses'

urlpatterns = [
    # Response management URLs
    path('', views.response_list, name='response_list'),
    path('survey/<int:survey_id>/', views.survey_responses, name='survey_responses'),
    path('<int:response_id>/', views.response_detail, name='response_detail'),
    path('my-history/', views.my_response_history, name='my_response_history'),

    # API endpoints for filtering and searching
    path('api/survey/<int:survey_id>/filter/', views.api_filter_responses, name='api_filter_responses'),
    path('api/survey/<int:survey_id>/export/', views.api_export_responses, name='api_export_responses'),
]

