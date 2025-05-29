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

# Устанавливаем права
RUN chmod -R 755 /frontend_dist

ENV PYTHONUNBUFFERED=1
ENV DOMAIN_NAME=pereiahe.beget.tech
ENV DEBUG=0

EXPOSE 8000

# Выводим пути и содержимое assets, затем запускаем для продакшена
CMD ["sh", "-c", "echo 'Path to index.html:' && \
                 find /frontend_dist -type f -name 'index.html' && \
                 echo 'Path to JS files:' && \
                 find /frontend_dist -type f -name '*.js' && \
                 echo 'Path to CSS files:' && \
                 find /frontend_dist -type f -name '*.css' && \
                 echo 'Contents of /frontend_dist/assets:' && \
                 ls -la /frontend_dist/assets && \
                 echo 'Running migrations...' && \
                 python manage.py migrate && \
                 echo 'Running collectstatic...' && \
                 python manage.py collectstatic --noinput --verbosity 2 && \
                 echo 'Starting Gunicorn...' && \
                 gunicorn --bind 0.0.0.0:8000 --timeout 120 --workers 4 --log-level debug config.wsgi:application"]