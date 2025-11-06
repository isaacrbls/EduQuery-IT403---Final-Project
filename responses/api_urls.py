from django.urls import path
from . import api_views

app_name = 'responses_api'

urlpatterns = [
    path('', api_views.response_list_api, name='response_list'),
    path('<int:response_id>/', api_views.response_detail_api, name='response_detail'),
    path('students/autocomplete/', api_views.student_autocomplete_api, name='student_autocomplete'),
    path('surveys/list/', api_views.survey_list_api, name='survey_list'),
]

