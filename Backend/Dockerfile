# Используем официальный slim-образ Python
FROM python:3.11-slim

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Задаём рабочую директорию
WORKDIR /app

# Копируем зависимости и устанавливаем их
COPY Backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копируем весь проект
COPY Backend /app

# Запускаем миграции, сканирование и сервер
CMD ["bash", "-c", "python manage.py migrate --noinput && python manage.py scan_labs && python manage.py runserver 0.0.0.0:8000"]
