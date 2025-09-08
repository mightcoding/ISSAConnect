from django.db import models
from django.contrib.auth.models import User

class News(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50, default='General')
    image = models.URLField(blank=True, null=True)
    excerpt = models.TextField(blank=True)
    read_time = models.CharField(max_length=20, default='5 min read')
    views = models.IntegerField(default=0)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "News"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.excerpt:
            self.excerpt = self.content[:150] + '...' if len(self.content) > 150 else self.content
        super().save(*args, **kwargs)

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=50, default='Workshop')
    image = models.URLField(blank=True, null=True)
    excerpt = models.TextField(blank=True)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    venue_details = models.TextField(blank=True)
    capacity = models.IntegerField(default=50)
    registered = models.IntegerField(default=0)
    ticket_price = models.CharField(max_length=50, default='Free')
    agenda = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.excerpt:
            self.excerpt = self.description[:150] + '...' if len(self.description) > 150 else self.description
        if not self.venue_details:
            self.venue_details = self.location
        super().save(*args, **kwargs)