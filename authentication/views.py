from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import UserProfile
import logging

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PUT':
        # Only allow updating specific fields, not username
        allowed_fields = ['first_name', 'last_name', 'email']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        serializer = UserSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    # Enhanced debugging
    print(f"🔍 Admin users list called by: {request.user.username}")
    print(f"👨‍💼 Is staff: {request.user.is_staff}, Is superuser: {request.user.is_superuser}")
    print(f"🌐 Request headers: {dict(request.headers)}")
    print(f"🔐 Auth header present: {'Authorization' in request.headers}")
    
    if not (request.user.is_staff or request.user.is_superuser):
        print(f"❌ Permission denied for user: {request.user.username}")
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        users = User.objects.all()
        print(f"✅ Found {users.count()} users")
        
        # Ensure all users have profiles
        for user in users:
            UserProfile.objects.get_or_create(user=user)
        
        serializer = UserSerializer(users, many=True)
        print(f"📊 Serialized data for {len(serializer.data)} users")
        
        return Response(serializer.data)
    except Exception as e:
        print(f"❌ Error in admin_users_list: {str(e)}")
        logger.error(f"Error in admin_users_list: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    print(f"🔄 Admin update user called by: {request.user.username} for user_id: {user_id}")
    print(f"📝 Request data: {request.data}")
    
    if not (request.user.is_staff or request.user.is_superuser):
        return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if created:
            print(f"📝 Created new profile for user: {user.username}")
        
        # Update can_create_content field
        if 'can_create_content' in request.data:
            old_value = profile.can_create_content
            profile.can_create_content = request.data['can_create_content']
            profile.save()
            print(f"✅ Updated can_create_content for {user.username}: {old_value} -> {profile.can_create_content}")
        
        return Response({
            'message': 'User permissions updated successfully',
            'user': UserSerializer(user).data
        })
    except User.DoesNotExist:
        print(f"❌ User not found: {user_id}")
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Error updating user: {str(e)}")
        logger.error(f"Error updating user {user_id}: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)