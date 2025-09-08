from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/content/', include('content.urls')),
    path('api/admin/', include('authentication.admin_urls')),
]