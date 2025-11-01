from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import SurveyViewSet, QuestionViewSet

router = DefaultRouter()
router.register('surveys', SurveyViewSet, basename='survey')
router.register('questions', QuestionViewSet, basename='question')

urlpatterns = [
    path('', include(router.urls)),
]

