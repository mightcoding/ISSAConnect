from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(max_length=15, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone_number')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # Update the user's profile with phone number
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.phone_number = phone_number
        profile.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            attrs['user'] = user
        return attrs

class UserSerializer(serializers.ModelSerializer):
    can_create_content = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff',
                 'is_superuser', 'date_joined', 'can_create_content', 'avatar_url', 'phone_number')
    
    def get_can_create_content(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.can_create_content
    
    def get_avatar_url(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.get_avatar_url()
    
    def get_phone_number(self, obj):
        profile, created = UserProfile.objects.get_or_create(user=obj)
        return profile.get_phone_number()