# -----------------------------------------------------------------------
# Этап 1: Собираем фронтенд (Vite + React)
# -----------------------------------------------------------------------
FROM node:22	AS frontend-build

# Рабочая директория для фронтенда
WORKDIR /frontend

# Копируем package.json и package-lock.json из папки FrontEnd
COPY FrontEnd/package.json FrontEnd/package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем всю папку FrontEnd (исходники)
COPY FrontEnd/ ./

# Собираем продакшен-версию
RUN npm run build


# -----------------------------------------------------------------------
# Этап 2: Собираем бэкенд (Django)
# -----------------------------------------------------------------------
FROM python:3.11-slim	AS backend-build

# Устанавливаем рабочую директорию для Django-приложения
WORKDIR /app

# Устанавливаем небольшие системные пакеты, необходимые для сборки Python-зависимостей
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Копируем requirements.txt из папки Backend
COPY Backend/requirements.txt .

# Устанавливаем Python-библиотеки
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код бэкенда
COPY Backend/ ./

# Копируем результат сборки фронтенда из предыдущего этапа в директорию,
# которую Django-настройки ожидают как FRONTEND_DIST_DIR:
# то есть путь: /app/FrontEnd/dist
COPY --from=frontend-build /frontend/dist /app/FrontEnd/dist

# Устанавливаем переменные окружения
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=config.settings
ENV DEBUG=0

# Создаём нужные директории для статики и собираем её (collectstatic)
RUN python manage.py collectstatic --noinput

# Порт, который будет слушать Gunicorn/WhiteNoise
EXPOSE 8000

# Команда по умолчанию: запускаем Gunicorn (4 воркера, таймаут 120)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "config.wsgi:application"]
