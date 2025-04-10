import os
import sys
import threading
import time
import webview
from django.core.management import execute_from_command_line
from screeninfo import get_monitors

def run_server():
    try:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
        print("Running scan_labs to update the database...")
        execute_from_command_line(["runserver.py", "scan_labs"])
        print("Starting Django server on 0.0.0.0:8000...")
        execute_from_command_line(["runserver.py", "runserver", "0.0.0.0:8000", "--noreload"])
    except Exception as e:
        print(f"Error: {e}")

def start_app():
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    time.sleep(2)

    # Получаем размеры основного монитора
    monitor = get_monitors()[0]
    screen_width = monitor.width
    screen_height = monitor.height

    # Создаём окно без параметра icon
    window = webview.create_window(
        "Лабораторные работы Автоматизация",
        "http://localhost:8000",
        width=screen_width,
        height=screen_height,
        resizable=False,
        fullscreen=False
    )
    webview.start()
    print("Window closed, shutting down...")
    os._exit(0)

if __name__ == "__main__":
    start_app()