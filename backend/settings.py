from pathlib import Path
from datetime import timedelta
import os
import re

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = '10miy#k-qw-zjmu3^be$kmq3fs-u@yorahz7nl+1mao)(unhjc'

DEBUG = True

# ALLOWED_HOSTS should include your Railway domain
ALLOWED_HOSTS = [
    'issaconnect-production.up.railway.app',
    'localhost',
    '127.0.0.1',
    '.vercel.app',  # Allow all Vercel domains
    '.railway.app',  # Allow all Railway domains
]

# CORS settings - REMOVE THE DUPLICATE AT THE BOTTOM!
CORS_ALLOWED_ORIGINS = [
    "https://issa-connect-snyk.vercel.app",
    "https://issa-connect-rje3.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Allow all Vercel preview deployments using regex
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

# Also make sure you have these:
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # Keep this False for security

# ... rest of your settings remain the same ...

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'authentication',
    'content',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # This should be at the top!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
}

# Add this to handle CSRF with different domains
CSRF_TRUSTED_ORIGINS = [
    'https://issaconnect-production.up.railway.app',
    'https://*.vercel.app',
    'https://*.railway.app',
]

# For production, you might want to set DEBUG=False
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# If using Railway, you might need to configure database
if 'DATABASE_URL' in os.environ:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
    }