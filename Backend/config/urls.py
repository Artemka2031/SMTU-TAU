from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
import os

from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from labs.views import DirectionViewSet, LabWorkViewSet

# Swagger imports
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

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

# Swagger schema view
schema_view = get_schema_view(
   openapi.Info(
      title="SMTU-TAU API",
      default_version='v1',
      description="API для платформы автоматизации университета",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@smtu-tau.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

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
    
    # Swagger URLs
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    re_path(r'^(?!api/|admin/|swagger|redoc).*$', TemplateView.as_view(
        template_name='index.html',
        extra_context={'name': 'SMTU-TAU'}
    ), name='home'),
] + static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])  # Используем STATICFILES_DIRS для отладки
