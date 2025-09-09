from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from authentication.models import UserProfile
from .models import News, Event
from .serializers import NewsSerializer, EventSerializer
from urllib.parse import urlparse

def can_create_content(user):
    """Check if user can create content"""
    if user.is_staff or user.is_superuser:
        return True
    if hasattr(user, 'profile'):
        return user.profile.can_create_content
    return False

def is_valid_image_url(url):
    """Validate if URL is a valid image URL"""
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return False
        
        # Check if URL ends with common image extensions
        image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
        path = parsed.path.lower()
        
        # Check if URL ends with image extension or contains image-like patterns
        if any(path.endswith(ext) for ext in image_extensions):
            return True
            
        # Check for common image hosting patterns
        image_hosts = [
            'imgur.com', 'i.imgur.com',
            'gravatar.com',
            'cloudinary.com',
            'unsplash.com',
            'pexels.com',
            'pixabay.com',
            'images.unsplash.com',
            'cdn.pixabay.com'
        ]
        
        if any(host in parsed.netloc for host in image_hosts):
            return True
            
        return False
    except:
        return False

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def news_list(request):
    if request.method == 'GET':
        news = News.objects.all()[:10]  # Limit to 10 items
        serializer = NewsSerializer(news, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not can_create_content(request.user):
            return Response(
                {'error': 'You do not have permission to create content'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = NewsSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def news_detail(request, pk):
    news = get_object_or_404(News, pk=pk)
    
    if request.method == 'GET':
        # Increment view count
        news.views += 1
        news.save()
        serializer = NewsSerializer(news)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Check if user can edit (author or staff)
        if request.user != news.author and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to edit this article'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = NewsSerializer(news, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Check if user can delete (author or staff)
        if request.user != news.author and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to delete this article'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        news.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def events_list(request):
    if request.method == 'GET':
        events = Event.objects.all()[:10]  # Limit to 10 items
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not can_create_content(request.user):
            return Response(
                {'error': 'You do not have permission to create content'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EventSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def event_detail(request, pk):
    event = get_object_or_404(Event, pk=pk)
    
    if request.method == 'GET':
        serializer = EventSerializer(event)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Check if user can edit (author or staff)
        if request.user != event.author and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to edit this event'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = EventSerializer(event, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Check if user can delete (author or staff)
        if request.user != event.author and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to delete this event'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        event.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'You do not have permission to view users'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    users = User.objects.all()
    users_data = []
    for user in users:
        # Ensure user has a profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        users_data.append({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_staff': user.is_staff,
            'can_create_content': profile.can_create_content,
            'avatar_url': profile.get_avatar_url(),
            'date_joined': user.date_joined
        })
    
    return Response(users_data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_permissions(request, user_id):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'You do not have permission to update user permissions'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        
        # Ensure user has a profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update can_create_content field
        if 'can_create_content' in request.data:
            profile.can_create_content = request.data['can_create_content']
            profile.save()
        
        return Response({'message': 'User permissions updated successfully'})
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_avatar(request, user_id):
    """Update user avatar URL"""
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'You do not have permission to update user avatars'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        avatar_url = request.data.get('avatar_url', '').strip()
        
        if not avatar_url:
            return Response(
                {'error': 'Avatar URL is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate URL format
        if not is_valid_image_url(avatar_url):
            return Response(
                {'error': 'Invalid image URL. Please provide a valid image URL'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update avatar URL
        profile.avatar_url = avatar_url
        profile.save()
        
        return Response({
            'message': 'Avatar updated successfully',
            'avatar_url': avatar_url,
            'user_id': user.id,
            'username': user.username
        })
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Failed to update avatar: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_avatar(request, user_id):
    """Delete user avatar URL"""
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {'error': 'You do not have permission to delete user avatars'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        profile.avatar_url = None
        profile.save()
        
        return Response({'message': 'Avatar deleted successfully'})
    
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Failed to delete avatar: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )