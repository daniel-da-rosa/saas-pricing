import os
from pathlib import Path
import dj_database_url

# --- CONFIGURAÇÕES BASE ---
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# URL do Frontend (Next.js)
FRONTEND_URL = 'http://localhost:3000'

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Necessário para o Allauth funcionar
    'django.contrib.sites',
    
    # Aplicações do Django-Allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    
    # Provedor Específico do Google
    'allauth.socialaccount.providers.google',
    
    # Third party
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_spectacular',
    
    # Integração REST com Allauth
    'dj_rest_auth',
    'dj_rest_auth.registration', 
    
    # Local apps
    'users',
    'subscriptions',
    'payments',
    'pricing',
    'quotes',
]

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'allauth.account.middleware.AccountMiddleware', 
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

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

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = os.environ.get('LANGUAGE_CODE', 'pt-br')
TIME_ZONE = os.environ.get('TIME_ZONE', 'America/Sao_Paulo')
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CORS_ALLOW_CREDENTIALS = True

# DRF
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# Celery
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/1')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://redis:6379/1')


# ===============================================
# === CONFIGURAÇÕES PARA ALLAUTH E GOOGLE LOGIN ===
# ===============================================

# 1. AUTHENTICATION BACKENDS
AUTHENTICATION_BACKENDS = (
    'allauth.account.auth_backends.AuthenticationBackend',
    'django.contrib.auth.backends.ModelBackend',
)

# 2. DJANGO SITES FRAMEWORK
SITE_ID = 1

# 3. ALLAUTH ACCOUNT SETTINGS
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False 
ACCOUNT_AUTHENTICATION_METHOD = 'email' 
ACCOUNT_EMAIL_VERIFICATION = 'optional'

# 4. ADAPTERS CUSTOMIZADOS (IMPORTANTE!)
ACCOUNT_ADAPTER = 'users.adapter.AccountAdapter' 
SOCIALACCOUNT_ADAPTER = 'users.adapter.SocialAccountAdapter'

# 5. CONFIGURAÇÕES DE SOCIAL ACCOUNT
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_LOGIN_ON_GET = True

# 6. URLS DE LOGIN (fallback caso adapter não funcione)
LOGIN_URL = '/accounts/login/'

# 7. CONFIGURAÇÕES DE AMBIENTE DOCKER/WSL (HTTPS/HTTP)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_URL_SCHEME = 'http' 
USE_X_FORWARDED_HOST = True 

# 8. DJ-REST-AUTH SETTINGS
REST_AUTH = {
    'USE_JWT': True, 
    'REGISTER_SERIALIZER': 'dj_rest_auth.registration.serializers.RegisterSerializer',
    'USER_DETAILS_SERIALIZER': 'users.serializers.UserSerializer', 
}

# 9. SOCIAL ACCOUNT PROVIDER SETTINGS (GOOGLE)
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'offline', 
        },
    }
}