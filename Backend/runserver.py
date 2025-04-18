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

def calculate_window_size(monitor_width, monitor_height, scale=0.8, target_ratio=1920/1080):
    """
    Вычисляет размеры окна (scale% от экрана) с учётом соотношения сторон 1920:1080.
    Возвращает ширину, высоту и координаты для центрирования.
    """
    # Начальные размеры: 80% от монитора
    initial_width = int(monitor_width * scale)
    initial_height = int(monitor_height * scale)

    # Корректируем размеры, чтобы сохранить соотношение
    monitor_ratio = initial_width / initial_height
    if monitor_ratio > target_ratio:
        # Монитор шире, чем нужно, ограничиваем по высоте
        height = initial_height
        width = int(height * target_ratio)
    else:
        # Монитор выше, чем нужно, ограничиваем по ширине
        width = initial_width
        height = int(width / target_ratio)

    # Центрируем окно
    x = (monitor_width - width) // 2
    y = (monitor_height - height) // 2

    return width, height, x, y

def start_app():
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()
    time.sleep(2)

    # Получаем размеры основного монитора
    monitor = get_monitors()[0]
    screen_width = monitor.width
    screen_height = monitor.height

    # Вычисляем размеры окна (80% от экрана) и координаты для центрирования
    window_width, window_height, window_x, window_y = calculate_window_size(screen_width, screen_height)

    # Создаём окно
    window = webview.create_window(
        "Лабораторные работы Автоматизация",
        "http://localhost:8000",
        width=window_width,
        height=window_height,
        x=window_x,
        y=window_y,
        resizable=True,  # Разрешаем изменение размера
        fullscreen=False  # Полноэкранный режим по умолчанию выключен
    )

    # Запускаем pywebview с указанием GUI-бэкенда
    webview.start(gui="edgechromium")
    print("Window closed, shutting down...")
    os._exit(0)

if __name__ == "__main__":
    start_app()