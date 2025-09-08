from rest_framework import serializers
from .models import News, Event
from django.contrib.auth.models import User

class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    
    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'category', 'image', 'excerpt', 'read_time', 
                 'views', 'author', 'author_name', 'author_role', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['author', 'excerpt', 'read_time', 'views', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}" if obj.author.first_name else obj.author.username

    def get_author_role(self, obj):
        if obj.author.is_staff:
            return "Administrator"
        elif hasattr(obj.author, 'profile') and obj.author.profile.can_create_content:
            return "Content Creator"
        return "Member"

    def get_tags(self, obj):
        return ["News", obj.category]

    def create(self, validated_data):
        # Calculate read time based on content
        word_count = len(validated_data['content'].split())
        read_time = max(1, word_count // 200)
        validated_data['read_time'] = f"{read_time} min read"
        return super().create(validated_data)

class EventSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    end_date = serializers.DateTimeField(required=False, allow_null=True)
    sponsors = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'category', 'image', 'excerpt', 'date', 'end_date',
                 'location', 'venue_details', 'capacity', 'registered', 'ticket_price', 'agenda',
                 'contact_email', 'author', 'author_name', 'sponsors', 'created_at', 'updated_at']
        read_only_fields = ['author', 'excerpt', 'registered', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}" if obj.author.first_name else obj.author.username

    def get_sponsors(self, obj):
        return []  # Can be enhanced later

    def create(self, validated_data):
        # Set contact email to author's email if not provided
        if not validated_data.get('contact_email'):
            validated_data['contact_email'] = self.context['request'].user.email
        return super().create(validated_data)