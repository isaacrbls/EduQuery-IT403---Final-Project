from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import UserViewSet, SectionViewSet, get_unanswered_surveys

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('sections', SectionViewSet, basename='section')

urlpatterns = [
    path('', include(router.urls)),
    path('surveys/unanswered/', get_unanswered_surveys, name='unanswered_surveys'),
]

