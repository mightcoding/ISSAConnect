from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/content/', include('content.urls')),
]

# Serve media files during development and production
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # For production, you might want to serve media files differently
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)