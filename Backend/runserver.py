import os
import sys
import threading
import webbrowser
import time
from django.core.management import execute_from_command_line

def run_server():
    try:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
        print("Starting Django server on 0.0.0.0:8000...")
        execute_from_command_line(["runserver.py", "runserver", "0.0.0.0:8000", "--noreload"])
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")  # Оставляет консоль открытой

if __name__ == "__main__":
    # Запускаем сервер в отдельном потоке
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()

    # Даём серверу время запуститься
    time.sleep(2)

    # Открываем браузер
    print("Opening browser at http://localhost:8000...")
    webbrowser.open("http://localhost:8000")