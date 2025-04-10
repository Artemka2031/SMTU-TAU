import os
import sys
import threading
import webbrowser
from django.core.management import execute_from_command_line

def run_server():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    execute_from_command_line(["runserver.py", "runserver", "0.0.0.0:8000", "--noreload"])

if __name__ == "__main__":
    # Запускаем сервер в отдельном потоке
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True  # Поток завершится при закрытии приложения
    server_thread.start()

    # Открываем браузер
    webbrowser.open("http://localhost:8000")