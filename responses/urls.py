from django.urls import path
from . import views

app_name = 'responses'

urlpatterns = [
    # Response management URLs
    path('', views.response_list, name='response_list'),
    path('<int:response_id>/', views.response_detail, name='response_detail'),
    path('<int:response_id>/delete/', views.delete_response, name='delete_response'),

    # Analytics and export
    path('survey/<int:survey_id>/analytics/', views.survey_analytics, name='survey_analytics'),
    path('survey/<int:survey_id>/export/', views.export_responses, name='export_responses'),
]

