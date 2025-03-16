# config/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from labs.views import DirectionViewSet, LabWorkViewSet

router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')
router.register(r'labs', LabWorkViewSet, basename='lab')

urlpatterns = [
    path('api/', include(router.urls)),
]
