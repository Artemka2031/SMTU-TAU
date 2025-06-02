#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

from pathlib import Path
from dotenv import load_dotenv

# ──┬─ корень репозитория   P:\Python\SMTU-TAU
#   └─ Backend\manage.py     ← текущий файл
project_root = Path(__file__).resolve().parent.parent

# выбираем нужный файл-окружение:
env_file = project_root / ".env.dev"        # для локалки
# env_file = project_root / ".env.prod"     # для пред-/прод-сервера

load_dotenv(env_file)        # подгрузит все KEY=value в os.environ

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
