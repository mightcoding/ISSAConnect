from django.urls import path
from . import views

urlpatterns = [
    # News URLs
    path('news/', views.news_list, name='news-list'),
    path('news/<int:pk>/', views.news_detail, name='news-detail'),
    
    # Events URLs
    path('events/', views.events_list, name='events-list'),
    path('events/<int:pk>/', views.event_detail, name='event-detail'),
    
    # Event Registration URLs
    path('events/<int:pk>/register/', views.register_for_event, name='event-register'),
    path('events/<int:pk>/unregister/', views.unregister_from_event, name='event-unregister'),
    path('events/<int:pk>/registrations/', views.event_registrations, name='event-registrations'),
    path('events/<int:pk>/registrations/<int:user_id>/', views.remove_event_registration, name='remove-event-registration'),
    
    # Admin URLs
    path('admin/users/', views.users_list, name='admin-users-list'),
    path('admin/users/<int:user_id>/', views.update_user_permissions, name='admin-update-permissions'),
    path('admin/events/', views.admin_events_overview, name='admin-events-overview'),
    
    # Avatar management URLs
    path('admin/users/<int:user_id>/avatar/', views.update_user_avatar, name='admin-update-avatar'),
    path('admin/users/<int:user_id>/avatar/delete/', views.delete_user_avatar, name='admin-delete-avatar'),
]