from django.urls import path
from . import views

urlpatterns = [
    # News URLs
    path('news/', views.news_list, name='news-list'),
    path('news/<int:pk>/', views.news_detail, name='news-detail'),
    
    # Events URLs
    path('events/', views.events_list, name='events-list'),
    path('events/<int:pk>/', views.event_detail, name='event-detail'),
    
    # Admin user management URLs
    path('admin/users/', views.users_list, name='admin-users-list'),
    path('admin/users/<int:user_id>/', views.update_user_permissions, name='admin-update-permissions'),
    
    # Avatar management URLs
    path('admin/users/<int:user_id>/avatar/', views.update_user_avatar, name='admin-update-avatar'),
    path('admin/users/<int:user_id>/avatar/delete/', views.delete_user_avatar, name='admin-delete-avatar'),
]