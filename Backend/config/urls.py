from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.views.static import serve  # Import serve to fix the NameError
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from labs.views import DirectionViewSet, LabWorkViewSet

# Main router for directions
router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')

# Nested router for lab works within directions
directions_router = NestedDefaultRouter(router, r'directions', lookup='direction')
directions_router.register(r'labs', LabWorkViewSet, basename='direction-labs')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(directions_router.urls)),
    path('', serve, {'path': 'index.html', 'document_root': settings.BASE_DIR / "dist"}),
]

# Статические файлы
urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / "dist" / "assets")