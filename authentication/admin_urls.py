from django.urls import path
from content import views

urlpatterns = [
    path('users/', views.users_list, name='admin_users'),
    path('users/<int:user_id>/', views.update_user_permissions, name='update_user_permissions'),
]