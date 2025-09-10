from rest_framework import serializers
from .models import News, Event, EventRegistration
from django.contrib.auth.models import User

class NewsSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'category', 'image', 'excerpt', 'read_time',
                 'views', 'author', 'author_name', 'author_role', 'author_avatar', 'tags',
                 'created_at', 'updated_at']
        read_only_fields = ['author', 'excerpt', 'read_time', 'views', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}" if obj.author.first_name else obj.author.username

    def get_author_role(self, obj):
        if obj.author.is_staff:
            return "Administrator"
        elif hasattr(obj.author, 'profile') and obj.author.profile.can_create_content:
            return "Content Creator"
        return "Member"

    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile'):
            return obj.author.profile.get_avatar_url()
        return None

    def get_tags(self, obj):
        return ["News", obj.category]

    def create(self, validated_data):
        word_count = len(validated_data['content'].split())
        read_time = max(1, word_count // 200)
        validated_data['read_time'] = f"{read_time} min read"
        return super().create(validated_data)

class EventSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_avatar = serializers.SerializerMethodField()
    end_date = serializers.DateTimeField(required=False, allow_null=True)
    sponsors = serializers.SerializerMethodField()
    
    # New fields for registration
    is_registered = serializers.SerializerMethodField()
    current_registrations = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = ['id', 'title', 'description', 'category', 'image', 'excerpt', 'date', 'end_date',
                 'location', 'venue_details', 'capacity', 'registered', 'ticket_price', 'agenda',
                 'contact_email', 'author', 'author_name', 'author_avatar', 'sponsors',
                 'is_registered', 'current_registrations', 'is_full', 'available_spots',
                 'created_at', 'updated_at']
        read_only_fields = ['author', 'excerpt', 'registered', 'created_at', 'updated_at',
                           'is_registered', 'current_registrations', 'is_full', 'available_spots']

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}" if obj.author.first_name else obj.author.username

    def get_author_avatar(self, obj):
        if hasattr(obj.author, 'profile'):
            return obj.author.profile.get_avatar_url()
        return None

    def get_sponsors(self, obj):
        return []

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return EventRegistration.objects.filter(event=obj, user=request.user).exists()
        return False

    def get_current_registrations(self, obj):
        return obj.current_registrations

    def get_is_full(self, obj):
        return obj.is_full

    def get_available_spots(self, obj):
        return obj.available_spots

    def create(self, validated_data):
        if not validated_data.get('contact_email'):
            validated_data['contact_email'] = self.context['request'].user.email
        return super().create(validated_data)

class EventRegistrationSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()

    class Meta:
        model = EventRegistration
        fields = ['id', 'user', 'user_name', 'user_email', 'user_avatar', 'registered_at']
        read_only_fields = ['registered_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}" if obj.user.first_name else obj.user.username

    def get_user_email(self, obj):
        return obj.user.email

    def get_user_avatar(self, obj):
        if hasattr(obj.user, 'profile'):
            return obj.user.profile.get_avatar_url()
        return None