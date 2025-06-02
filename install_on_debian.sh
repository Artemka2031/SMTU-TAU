#!/usr/bin/env bash
# -----------------------------------------------------------------------------
#  install_on_debian.sh
#  Полностью разворачивает прод-стэк SMTU-TAU на «чистой» Debian/Ubuntu.
#
#  ▸ Шаги:
#    0. Проверка окружения и заполнение .env.prod (SECRET_KEY → auto)
#    1. Установка Docker CE + compose-plugin и Nginx
#    2. docker compose up -d --build   (prod-файл)
#    3. Создание сайта Nginx  → 80 → контейнер:8000
#    4. (опц.) Выпуск certbot и переворот фронта на HTTPS
#    5. systemd-юнит smtu-tau.service  (автозапуск + restart)
#
#  ▸ Запуск СУПЕРОМ:  sudo bash install_on_debian.sh [--no-ssl]
#    Использует переменные .env.prod  (DOMAIN_NAME, VITE_API_BASE_URL и т.д.)
# -----------------------------------------------------------------------------
set -euo pipefail

# ─── 0. Подготовка ────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ENV_FILE=".env.prod"
if [[ ! -f $ENV_FILE ]]; then
  echo "⛔  $ENV_FILE не найден. Скопируйте .env.prod.sample и отредактируйте." >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

# shellcheck disable=SC2120
gen_secret() {
python3 - "$@" <<'PY'
import secrets, string, sys
chars = string.ascii_letters + string.digits + '!@#$%^&*()-_=+'
print(''.join(secrets.choice(chars) for _ in range(50)))
PY
}

if [[ -z "${DJANGO_SECRET_KEY:-}" ]]; then
  DJANGO_SECRET_KEY=$(gen_secret)
  echo "DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}" >>"$ENV_FILE"
  echo "🔑  Сгенерирован DJANGO_SECRET_KEY"
fi

DOMAIN="${DOMAIN_NAME:-}"
[[ -z $DOMAIN ]] && { echo "⛔  В $ENV_FILE нет DOMAIN_NAME"; exit 1; }

echo -e "\n📝  Конфигурация:"
echo "    DOMAIN_NAME          = $DOMAIN"
echo "    VITE_API_BASE_URL    = ${VITE_API_BASE_URL:-}"
echo "    DJANGO_ALLOWED_HOSTS = ${DJANGO_ALLOWED_HOSTS:-}"
echo "    (файл: $ENV_FILE)"

# ─── 1. Docker + compose + Nginx ─────────────────────────────────────────────
echo -e "\n➡️  Устанавливаем Docker CE и Nginx …"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release

install -m 0755 -d /etc/apt/keyrings
# shellcheck disable=SC2046
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg \
  | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
 https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") \
 $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin nginx
systemctl enable --now docker nginx

# ─── 2. docker-compose up ────────────────────────────────────────────────────
echo -e "\n➡️  Сборка и запуск контейнеров …"
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# ─── 3. Nginx proxy :80 → контейнер:8000 ─────────────────────────────────────
echo -e "\n➡️  Генерируем Nginx-конфиг …"
NGX_CONF=/etc/nginx/sites-available/smtu-tau.conf
cat >"$NGX_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN} $(echo "${DJANGO_ALLOWED_HOSTS:-}" | tr ',' ' ');

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 120;
    }
}
EOF
ln -sf "$NGX_CONF" /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
echo "🌀  Nginx проксирует http://$DOMAIN → контейнер:8000"

# ─── 4. HTTPS (certbot) ──────────────────────────────────────────────────────
if [[ "${1:-}" != "--no-ssl" ]]; then
  echo -e "\n➡️  Выпускаем сертификат Let's Encrypt …"
  apt-get install -y certbot python3-certbot-nginx
  certbot --non-interactive --agree-tos -m "admin@${DOMAIN}" \
          --nginx -d "$DOMAIN" || true

  # меняем API-url на https (если ещё http)
  sed -i "s#VITE_API_BASE_URL=http://#VITE_API_BASE_URL=https://#g" "$ENV_FILE"
  docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
  echo "🔒  Доступен https://$DOMAIN/"
fi

# ─── 5. systemd-юнит ─────────────────────────────────────────────────────────
echo -e "\n➡️  Создаём / обновляем systemd-unit smtu-tau.service …"
cat >/etc/systemd/system/smtu-tau.service <<UNIT
[Unit]
Description=SMTU-TAU docker stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=$SCRIPT_DIR
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml --env-file .env.prod down
RemainAfterExit=yes
Restart=on-failure

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now smtu-tau.service

echo -e "\n✅  Готово!\n   ▸ Проверка:  curl -I http://${DOMAIN}/  (или https://)\n"
echo "👉  Изменения в конфиге?  Редактируйте .env.prod и Backend/config/settings.py,"
echo "    затем:  docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build"
