FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend code
COPY Backend .

# Copy FrontEnd/dist to /frontend_dist
COPY FrontEnd/dist /frontend_dist

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "config.wsgi:application"]