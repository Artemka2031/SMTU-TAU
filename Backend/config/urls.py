from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from labs.views import DirectionViewSet, LabWorkViewSet

router = DefaultRouter()
router.register(r'directions', DirectionViewSet, basename='direction')

directions_router = NestedDefaultRouter(router, r'directions', lookup='direction')
directions_router.register(r'labs', LabWorkViewSet, basename='directions-labs')

urlpatterns = [
                  path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include(directions_router.urls)),
                  re_path(r'^(?!assets/|api/|admin/).*$', TemplateView.as_view(template_name='index.html'),
                          name='home'),
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
