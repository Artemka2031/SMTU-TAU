# SMTU-TAU : лабораторные по ТАУ (Django + React)

| Среда | Стек | Назначение |
|-------|------|------------|
| **Prod** | Docker + Gunicorn + Nginx | Публичный сервер / HTTPS |
| **Dev (локально)** | Vite dev‑server + Django runserver | Горячая разработка |

---

## 🚀 Быстрый деплой на Debian / Ubuntu

```bash
git clone https://github.com/Artemka2031/SMTU-TAU.git
cd SMTU-TAU
cp .env.prod.sample .env.prod      # заполните DOMAIN_NAME и др.
sudo bash install_on_debian.sh     # или  sudo bash install_on_debian.sh --no-ssl
```

**Скрипт** `install_on_debian.sh`:

* ставит Docker CE + compose‑plugin и Nginx;  
* генерирует `DJANGO_SECRET_KEY`, если пуст;  
* `docker compose -f docker-compose.prod.yml up -d --build`;  
* создаёт proxy‑хост Nginx (`80 → 127.0.0.1:8000`);  
* по умолчанию выпускает сертификат Let’s Encrypt и включает HTTPS;  
* оформляет `systemd`‑юнит **smtu-tau.service** (автозапуск).

### Что править администратору

| Файл | Поля |
|------|------|
| `.env.prod` | `DOMAIN_NAME`, `VITE_API_BASE_URL`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_SECRET_KEY` |
| `Backend/config/settings.py` | при необходимости `FRONTEND_DIST_DIR` / `STATIC_URL` |
| `docker-compose.prod.yml` | порты, healthcheck, `restart:` |

---

## 💻 Локальная разработка

```bash
# терминал 1 — Vite
cd FrontEnd && npm i && npm run dev          # http://localhost:5173

# терминал 2 — Django
cd Backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export $(cat ../.env.dev | xargs)            # Windows → вручную set ...
python manage.py runserver 0.0.0.0:8000      # API http://localhost:8000/api/
```

React берёт URL API из `VITE_API_BASE_URL`  
(в `.env.dev` по умолчанию `http://localhost:8000/api`).

---

## 🗄 Структура репозитория

```
SMTU-TAU/
│  .env.dev  .env.prod  install_on_debian.sh
├─ FrontEnd/         # Vite + React + Redux Toolkit
└─ Backend/
     ├─ config/      # settings.py, urls.py, wsgi.py
     ├─ labs/        # вычислительные модули (ТАУ лин/нелин, ТДЗ …)
     ├─ requirements.txt
     └─ Dockerfile   # многоэтапная сборка (Node → Python + Gunicorn)
```

---

## 🛠 Обновление сервера

```bash
cd /root/SMTU-TAU
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
systemctl restart smtu-tau.service   # необязательно — healthcheck перезапустит сам
```

---

## ⚖️ Лицензия

Проект предназначен для учебных целей, лицензия не задана.
