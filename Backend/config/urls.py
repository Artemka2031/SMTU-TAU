import os

from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from labs.views import DirectionViewSet, LabWorkViewSet


# Эндпоинт для отладки staticfiles
def debug_staticfiles(request):
    staticfiles_dir = settings.STATIC_ROOT
    files = []
    for root, dirs, filenames in os.walk(staticfiles_dir):
        for filename in filenames:
            files.append(os.path.join(root, filename))
    return HttpResponse("<br>".join(files), content_type="text/plain")

# Эндпоинт для отладки index.html
def debug_index_html(request):
    with open(os.path.join(settings.FRONTEND_DIST_DIR, 'index.html'), 'r') as f:
        content = f.read()
    return HttpResponse(content, content_type="text/plain")

router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')

directions_router = NestedDefaultRouter(router, r'directions', lookup='direction')
directions_router.register(r'labs', LabWorkViewSet, basename='direction-labs')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include(directions_router.urls)),
    path('debug/staticfiles/', debug_staticfiles, name='debug_staticfiles'),
    path('debug/index-html/', debug_index_html, name='debug_index_html'),
    re_path(r'^(?!assets/|api/|admin/).*$', TemplateView.as_view(
        template_name='index.html',
        extra_context={'name': 'SMTU-TAU'}
    ), name='home'),
]
