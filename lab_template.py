# lab_template.py
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QFormLayout,
    QLabel, QLineEdit, QPushButton, QFileDialog, QMessageBox
)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont
from matplotlib.backends.backend_qt5agg import (
    FigureCanvasQTAgg as FigureCanvas, NavigationToolbar2QT
)
from matplotlib.figure import Figure
from pydantic import BaseModel


# ============================
# Виджет для отображения графика с возможностью приближения
# ============================
class GraphWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.figure = Figure()
        self.canvas = FigureCanvas(self.figure)
        self.ax = self.figure.add_subplot(111)
        # Создаем панель инструментов для навигации (перемещаем её под график)
        self.toolbar = NavigationToolbar2QT(self.canvas, self)
        layout = QVBoxLayout()
        layout.addWidget(self.canvas)
        layout.addWidget(self.toolbar)
        self.setLayout(layout)
        self.ax.grid(True)
        self.lines = []
        self.clear_graph()

    def add_graph_line(self, x, y, label, color=None, axis_labels=("W", "Y"), xlim=None, ylim=None):
        # Рисуем линию с увеличенной толщиной (linewidth=2)
        line, = self.ax.plot(x, y, label=label, linewidth=2, color=color)
        self.lines.append(line)
        # Настройка подписей осей: крупный шрифт, жирное начертание
        self.ax.set_xlabel(axis_labels[0], fontdict={'fontsize': 16, 'fontweight': 'bold'}, labelpad=10)
        self.ax.set_ylabel(axis_labels[1], fontdict={'fontsize': 16, 'fontweight': 'bold'}, labelpad=10)
        # Обновляем размеры подписей тиков
        self.ax.tick_params(axis='both', which='major', labelsize=14)
        if xlim:
            self.ax.set_xlim(xlim)
        if ylim:
            self.ax.set_ylim(ylim)
        self.ax.legend(fontsize='small')
        self.canvas.draw()

    def clear_graph(self):
        self.ax.cla()
        self.ax.grid(True)
        self.lines = []
        self.canvas.draw()

    def save_graph_image(self, filename):
        self.figure.savefig(filename)

    def save_data_csv(self, filename, x, y):
        df = pd.DataFrame({'W': x, 'Y': y})
        df.to_csv(filename, index=False)


# ============================
# Модель для графических параметров (с дополнительным полем "Время наблюдения")
# ============================
class GraphParameters(BaseModel):
    w_start: float
    w_end: float
    step: float
    obs_time: float  # время наблюдения (сек)


# ============================
# Базовый шаблон лабораторной работы
# ============================
class LabWorkTemplate(QWidget):
    """
    Базовый шаблон лабораторной работы.
    Содержит:
      - Заголовок с названием лабораторной работы и кнопку "Назад".
      - Блок выбора функции (если требуется) – метод setup_function_selection_inputs().
      - Блок ввода параметров лабораторной работы.
      - Блок примечаний (без дополнительных отступов).
      - Область с графиком, под которым размещены графические параметры (W начальное, W конечное, Шаг, Время наблюдения).
      - Кнопки управления графиком (Сохранить, Очистить) и кнопку "Добавить график".
    """

    def __init__(self, lab_title="Лабораторная работа", parent=None):
        super().__init__(parent)
        self.lab_title = lab_title

        self.main_layout = QVBoxLayout()
        self.setLayout(self.main_layout)

        # Заголовок и кнопка "Назад"
        header_layout = QHBoxLayout()
        self.back_button = QPushButton("Назад")
        self.back_button.setFixedWidth(100)
        header_layout.addWidget(self.back_button, alignment=Qt.AlignLeft)
        title_label = QLabel(self.lab_title)
        title_label.setAlignment(Qt.AlignCenter)
        title_font = QFont("Arial", 20)
        title_label.setFont(title_font)
        header_layout.addWidget(title_label, stretch=1)
        header_layout.addStretch()
        self.main_layout.addLayout(header_layout)

        # Основное содержимое: левый и правый блоки
        content_layout = QHBoxLayout()
        self.main_layout.addLayout(content_layout)

        # Левый блок: блок выбора функции и параметры + примечания
        left_layout = QVBoxLayout()
        # Создаем словарь для входов заранее
        self.param_inputs = {}
        self.function_layout = QFormLayout()
        self.setup_function_selection_inputs()  # Переопределяется в лабораторных работах, если нужно
        left_layout.addLayout(self.function_layout)

        self.param_form = QFormLayout()
        self.setup_parameter_inputs()  # Переопределяется в лабораторных работах
        left_layout.addLayout(self.param_form)

        # Примечания – объединенные без лишних отступов
        self.note_label = QLabel()
        self.note_label.setWordWrap(True)
        self.note_label.setStyleSheet("color: #0D47A1; font-style: italic; margin: 0px;")
        left_layout.addWidget(QLabel("Примечания:"))
        left_layout.addWidget(self.note_label)

        content_layout.addLayout(left_layout, 1)

        # Правый блок: график и под ним – графические параметры
        right_layout = QVBoxLayout()

        # Добавляем горизонтальный селектор для выбора набора графика
        self.graph_selector_layout = QHBoxLayout()
        right_layout.addLayout(self.graph_selector_layout)

        self.graph_widget = GraphWidget(self)
        right_layout.addWidget(self.graph_widget, 4)

        self.graph_param_form = QFormLayout()
        self.graph_param_inputs = {}
        self.setup_graph_parameter_inputs()
        right_layout.addLayout(self.graph_param_form)

        content_layout.addLayout(right_layout, 2)

        # Нижний блок: кнопки для сохранения/очистки графика
        self.bottom_layout = QHBoxLayout()
        self.setup_bottom_buttons()
        self.main_layout.addLayout(self.bottom_layout)

        # Кнопка "Добавить график" по центру внизу
        self.add_graph_button = QPushButton("Добавить график")
        self.add_graph_button.clicked.connect(self.on_add_graph_button_clicked)
        self.main_layout.addWidget(self.add_graph_button, alignment=Qt.AlignCenter)

    def setup_function_selection_inputs(self):
        """
        Метод для добавления элементов выбора функции.
        По умолчанию оставляем пустым; переопределяется в лабораторных работах, если нужно.
        """
        pass

    def setup_parameter_inputs(self):
        """
        Метод для добавления полей ввода специфичных параметров лабораторной работы.
        Переопределяется в наследниках.
        """
        pass

    def add_parameter(self, key, label_text, default_value=""):
        line_edit = QLineEdit()
        line_edit.setText(default_value)
        self.param_form.addRow(QLabel(label_text), line_edit)
        self.param_inputs[key] = line_edit

    def set_note_text(self, text):
        self.note_label.setText(text)

    def setup_graph_parameter_inputs(self):
        # Параметры графика, размещенные под графиком.
        self.graph_param_inputs['w_start'] = QLineEdit("0")
        self.graph_param_inputs['w_end'] = QLineEdit("10")
        self.graph_param_inputs['step'] = QLineEdit("0.1")
        self.graph_param_inputs['obs_time'] = QLineEdit("0")  # Время наблюдения

        self.graph_param_form.addRow(QLabel("W начальное:"), self.graph_param_inputs['w_start'])
        self.graph_param_form.addRow(QLabel("W конечное:"), self.graph_param_inputs['w_end'])
        self.graph_param_form.addRow(QLabel("Шаг:"), self.graph_param_inputs['step'])
        self.graph_param_form.addRow(QLabel("Время наблюдения (сек):"), self.graph_param_inputs['obs_time'])

    def setup_bottom_buttons(self):
        self.save_image_button = QPushButton("Сохранить график (изображение)")
        self.save_image_button.clicked.connect(self.on_save_image)
        self.bottom_layout.addWidget(self.save_image_button)

        self.save_csv_button = QPushButton("Сохранить данные (CSV)")
        self.save_csv_button.clicked.connect(self.on_save_csv)
        self.bottom_layout.addWidget(self.save_csv_button)

        self.clear_button = QPushButton("Очистить график")
        self.clear_button.clicked.connect(self.on_clear_graph)
        self.bottom_layout.addWidget(self.clear_button)

    def on_add_graph_button_clicked(self):
        try:
            graph_params = GraphParameters(
                w_start=float(self.graph_param_inputs['w_start'].text()),
                w_end=float(self.graph_param_inputs['w_end'].text()),
                step=float(self.graph_param_inputs['step'].text()),
                obs_time=float(self.graph_param_inputs['obs_time'].text())
            )
        except Exception as e:
            QMessageBox.warning(self, "Ошибка", f"Неверные параметры графика: {e}")
            return
        try:
            x, y = self.calculate(graph_params)
            label = self.get_graph_label()
            axis_labels = self.get_axis_labels()  # (xlabel, ylabel)
            xlim, ylim = self.get_initial_plot_limits()  # начальные пределы (или (None, None))
            self.graph_widget.add_graph_line(x, y, label, axis_labels=axis_labels, xlim=xlim, ylim=ylim)
            self.current_data = (x, y)
        except Exception as e:
            QMessageBox.critical(self, "Ошибка", f"Ошибка при построении графика: {e}")

    def on_save_image(self):
        filename, _ = QFileDialog.getSaveFileName(self, "Сохранить график как изображение", "",
                                                  "PNG Files (*.png);;JPEG Files (*.jpg)")
        if filename:
            self.graph_widget.save_graph_image(filename)

    def on_save_csv(self):
        if hasattr(self, "current_data"):
            x, y = self.current_data
            filename, _ = QFileDialog.getSaveFileName(self, "Сохранить данные в CSV", "", "CSV Files (*.csv)")
            if filename:
                self.graph_widget.save_data_csv(filename, x, y)
        else:
            QMessageBox.information(self, "Информация", "Нет данных для сохранения. Добавьте график.")

    def on_clear_graph(self):
        self.graph_widget.clear_graph()
        # Если в подклассе сохранены наборы графиков, их сбрасываем:
        if hasattr(self, "stored_graphs"):
            self.stored_graphs = []
            self.active_graph_index = None
            # Обновляем селектор графиков:
            for i in reversed(range(self.graph_selector_layout.count())):
                widget = self.graph_selector_layout.itemAt(i).widget()
                if widget:
                    widget.setParent(None)

    def calculate(self, graph_params: GraphParameters):
        """
        Абстрактный метод, который должен быть переопределён в наследниках.
        Принимает объект GraphParameters и возвращает (x, y) – массивы numpy.
        """
        raise NotImplementedError("Метод calculate должен быть переопределён в подклассе.")

    def get_graph_label(self):
        """
        Абстрактный метод для формирования подписи (легенды) построенного графика.
        """
        raise NotImplementedError("Метод get_graph_label должен быть переопределён в подклассе.")

    def get_axis_labels(self):
        """
        Возвращает кортеж (xlabel, ylabel) для графика. По умолчанию ("W", "Y").
        """
        return ("W", "Y")

    def get_initial_plot_limits(self):
        """
        Возвращает кортеж (xlim, ylim) для начальных пределов графика или (None, None).
        """
        return (None, None)
