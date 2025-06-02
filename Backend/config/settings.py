# config/settings.py

import os
from pathlib import Path

from django.utils.text import slugify

# ------------------------------------------------------------------------------
# 1. Базовые директории
# ------------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
# Теперь FRONTEND_DIST_DIR указывает на папку FrontEnd/dist (рядом с Backend)
FRONTEND_DIST_DIR = BASE_DIR.parent / "FrontEnd" / "dist"

# ------------------------------------------------------------------------------
# 2. Секретный ключ и отладка
# ------------------------------------------------------------------------------
# SECRET_KEY = "django-insecure-+uz7o8#)z3647+v3^wx$g43#@exdr=xb%szode^bdo#w17"
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-" + slugify(str(BASE_DIR))  # fallback для локалки
)
DEBUG = os.getenv("DJANGO_DEBUG", "0") == "1"

ALLOWED_HOSTS = [
    host.strip() for host in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",") if host.strip()
]

# ------------------------------------------------------------------------------
# 3. Установленные приложения и middleware
# ------------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "labs",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # <–– WhiteNoise для отдачи статики
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ------------------------------------------------------------------------------
# 4. CORS-настройки (для локальной разработки)
# ------------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev-server (если подключаете фронтенд в режиме dev)
    "http://localhost:8000",  # сам Django
]

# ------------------------------------------------------------------------------
# 5. Корневые URL и шаблоны
# ------------------------------------------------------------------------------
ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Django будет искать index.html именно в папке FRONTEND_DIST_DIR
        "DIRS": [FRONTEND_DIST_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ------------------------------------------------------------------------------
# 6. База данных (SQLite для локальной разработки)
# ------------------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ------------------------------------------------------------------------------
# 7. Валидация паролей и локализация
# ------------------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------------------
# 8. Статические файлы
# ------------------------------------------------------------------------------
STATIC_URL = "/assets/"

# STATICFILES_DIRS указывает на папку dist/assets вашего фронтенда.
# Django и WhiteNoise будут оттуда отдавать все файлы по URL /assets/...
STATICFILES_DIRS = [
    FRONTEND_DIST_DIR / "assets",
]

# При collectstatic итоговые файлы попадут в STATIC_ROOT
STATIC_ROOT = BASE_DIR / "staticfiles"

# Хранить статические файлы в виде сжатых и с хэшем имен
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ------------------------------------------------------------------------------
# 9. Логирование (опционально)
# ------------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "{asctime} {levelname} {module} {message}", "style": "{"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "verbose"},
    },
    "loggers": {
        "django": {"handlers": ["console"], "level": "DEBUG" if DEBUG else "INFO"},
        "gunicorn": {"handlers": ["console"], "level": "DEBUG" if DEBUG else "INFO"},
        "whitenoise": {"handlers": ["console"], "level": "DEBUG"},
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
