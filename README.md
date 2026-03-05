# SMTU-TAU (EXE source branch)

Эта ветка содержит актуальный код desktop-версии (Next.js + Electron) без бинарных артефактов.

## Ветки

- `master` - docker-версия проекта.
- `release/exe-source` - исходники EXE-варианта (эта ветка).

## Структура

- `app/` - Next.js + Electron приложение.
- `docs/` - формулы и материалы по миграции логики графиков.

## Локальный запуск

```bash
cd app
npm ci
npm run electron:dev
```

## Сборка EXE локально

```bash
cd app
npm ci
npm run electron:dist
```

Сборка появится в `app/release/`, но эта папка игнорируется и не пушится в Git.
