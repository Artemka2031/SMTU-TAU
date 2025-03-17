from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from labs.views import DirectionViewSet, LabWorkViewSet

# Основной роутер для направлений
router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')

# Вложенный роутер для лабораторных работ внутри направления
directions_router = NestedDefaultRouter(router, r'directions', lookup='direction')
directions_router.register(r'labs', LabWorkViewSet, basename='direction-labs')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(directions_router.urls)),
]
