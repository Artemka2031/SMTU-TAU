################ ЭТАП 1 — фронтенд ##################################
FROM node:22 AS frontend-build
WORKDIR /frontend

# <-- переменная приходит из build-args -->
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY FrontEnd/package*.json ./
RUN npm ci
COPY FrontEnd .
RUN npm run build                    # читает .env.production, а VITE_API_BASE_URL перекрывает

################ ЭТАП 2 — бэкенд ####################################
FROM python:3.11-slim AS backend
WORKDIR /app

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY Backend .
COPY --from=frontend-build /frontend/dist /frontend_dist
RUN chmod -R 755 /frontend_dist

# --------- Django env ---------
ENV PYTHONUNBUFFERED=1
# остальные значения Django возьмёт «как есть» из .env.prod

EXPOSE 8000

CMD ["sh", "-c", "\
    python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    gunicorn --bind 0.0.0.0:8000 --workers 4 config.wsgi:application"]
