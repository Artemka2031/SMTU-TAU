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

# Копируем собранный фронтенд из предыдущего этапа
COPY --from=frontend-build /frontend/dist /frontend_dist

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]