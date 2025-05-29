# Этап 1: Сборка фронтенда
FROM node:22 AS frontend-build

WORKDIR /frontend

# Копируем файлы фронтенда
COPY FrontEnd/package.json FrontEnd/package-lock.json ./
RUN npm install

# Копируем исходники и собираем
COPY FrontEnd .
RUN npm run build

# Этап 2: Сборка бэкенда
FROM python:3.11-slim

WORKDIR /app

# Устанавливаем зависимости для бэкенда
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код бэкенда
COPY Backend .

# Копируем собранный фронтенд
COPY --from=frontend-build /frontend/dist /frontend_dist

# Проверяем содержимое /frontend_dist
RUN ls -la /frontend_dist && ls -la /frontend_dist/assets

# Устанавливаем права
RUN chmod -R 755 /frontend_dist

ENV PYTHONUNBUFFERED=1
ENV DOMAIN_NAME=smtu-tau.onrender.com
ENV DEBUG=0

EXPOSE 8000

# Переносим шаги из docker-compose.yml
CMD ["sh", "-c", "echo 'Starting server on https://${DOMAIN_NAME}' && \
                 echo 'Checking /frontend_dist contents:' && \
                 ls -la /frontend_dist && \
                 echo 'Checking /frontend_dist/assets contents:' && \
                 ls -la /frontend_dist/assets && \
                 echo 'Running migrations...' && \
                 python manage.py migrate && \
                 echo 'Running scan_labs...' && \
                 python manage.py scan_labs && \
                 echo 'Running collectstatic...' && \
                 python manage.py collectstatic --noinput --verbosity 2 && \
                 echo 'Setting permissions for staticfiles...' && \
                 chmod -R 755 /app/staticfiles && \
                 echo 'Checking /app/staticfiles contents after collectstatic:' && \
                 ls -la /app/staticfiles && \
                 ls -la /app/staticfiles/assets && \
                 find /app/staticfiles -type f && \
                 echo 'Starting Gunicorn...' && \
                 gunicorn --bind 0.0.0.0:8000 --timeout 120 --workers 4 --log-level debug config.wsgi:application"]