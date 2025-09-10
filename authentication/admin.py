# authentication/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

# Inline admin for UserProfile
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('can_create_content', 'phone_number', 'avatar_url')

# Extend the existing User admin
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_can_create_content', 'get_phone_number')
    
    def get_can_create_content(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.can_create_content
    get_can_create_content.short_description = 'Can Create Content'
    get_can_create_content.boolean = True
    
    def get_phone_number(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.phone_number or '-'
    get_phone_number.short_description = 'Phone Number'

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register UserProfile separately
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'can_create_content', 'phone_number', 'avatar_url')
    list_filter = ('can_create_content',)
    search_fields = ('user__username', 'user__email', 'phone_number')
    fields = ('user', 'can_create_content', 'phone_number', 'avatar_url')