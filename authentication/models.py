from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    can_create_content = models.BooleanField(default=False)
    phone_number = models.CharField(
        max_length=15, 
        blank=True, 
        null=True,
        help_text="User's phone number"
    )
    avatar_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL of the user's avatar image"
    )

    def __str__(self):
        return f"{self.user.username} Profile"

    def get_avatar_url(self):
        """Get avatar URL or return None"""
        return self.avatar_url if self.avatar_url else None

    def get_phone_number(self):
        """Get phone number or return None"""
        return self.phone_number if self.phone_number else None

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        UserProfile.objects.create(user=instance)