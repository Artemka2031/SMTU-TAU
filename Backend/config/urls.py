from django.conf import settings
from django.urls import path, include, re_path
from django.views.static import serve
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from labs.views import DirectionViewSet, LabWorkViewSet

router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')

directions_router = NestedDefaultRouter(router, r'directions', lookup='direction')
directions_router.register(r'labs', LabWorkViewSet, basename='direction-labs')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(directions_router.urls)),
    re_path(r'^(?!api/).*', serve, {'path': 'index.html', 'document_root': settings.FRONTEND_DIST_DIR}),
]
