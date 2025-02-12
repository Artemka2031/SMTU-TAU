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
# Виджет для отображения графика с панелью навигации (для зума и панорамирования)
# ============================
class GraphWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.figure = Figure(figsize=(12, 8))
        self.canvas = FigureCanvas(self.figure)
        self.ax = self.figure.add_subplot(111)
        self.toolbar = NavigationToolbar2QT(self.canvas, self)
        layout = QVBoxLayout()
        layout.addWidget(self.canvas)
        layout.addWidget(self.toolbar)
        self.setLayout(layout)
        self.ax.grid(True)
        self.lines = []
        self.clear_graph()

    def plot_LAFCH(self, amplitude_data, phase_data):
        """
        Строит комбинированный график ЛАФЧХ с двумя осями:
          - Левая ось: ЛАЧХ (амплитуда, нормированная, в дБ; диапазон от -250 до 100 дБ)
          - Правая ось: ЛФЧХ (фаза, в градусах; диапазон до инверсии от -280 до 70, что обеспечивает
            совпадение физической позиции 0 дБ по амплитуде и -180° по фазе)
        """
        # Очистка и включение сетки
        self.ax.clear()
        self.ax.grid(True)

        # Создаем вторую ось для фазовой характеристики
        ax2 = self.ax.twinx()

        # Отрисовка амплитудной характеристики (ЛАЧХ) на левой оси
        self.ax.set_xscale('log')
        for (x, y, label) in amplitude_data:
            self.ax.plot(x, y, label=f"A(ω): {label}", linewidth=2)
        # Устанавливаем пределы для оси амплитуды от -250 до 100 дБ
        self.ax.set_ylim(-250, 100)

        # Отрисовка фазовой характеристики (ЛФЧХ) на правой оси
        ax2.set_xscale('log')
        for (x, y, label) in phase_data:
            ax2.plot(x, y, label=f"φ(ω): {label}", linewidth=2, linestyle="dashed")
        # Устанавливаем пределы для оси фазы до инверсии (диапазон 350 единиц)
        ax2.set_ylim(-292, 100)
        # Инвертируем ось фазы, чтобы верхняя граница стала -280, а нижняя – 70
        ax2.invert_yaxis()

        # Подписи осей
        self.ax.set_xlabel("ω, рад/с", fontsize=14, fontweight="bold")
        self.ax.set_ylabel("20LogA, дБ/дек", fontsize=14, fontweight="bold", color="black")
        ax2.set_ylabel("φ, °", fontsize=14, fontweight="bold", color="black")

        # Легенды
        self.ax.legend(loc="upper left", fontsize=10)
        ax2.legend(loc="upper right", fontsize=10)

        # Отрисовка графика
        self.canvas.draw()

    def add_graph_line(self, x, y, label, color=None,
                       axis_labels=("W", "Y"), xlim=None, ylim=None,
                       log_x=False):
        """
        log_x=False  --> обычная (линейная) шкала x
        log_x=True   --> логарифмическая шкала x
        """
        if log_x:
            self.ax.set_xscale('log')
        else:
            self.ax.set_xscale('linear')

        line, = self.ax.plot(x, y, label=label, linewidth=2, color=color)
        self.lines.append(line)

        # Подписи осей
        self.ax.set_xlabel(axis_labels[0], fontdict={'fontsize':16, 'fontweight':'bold'}, labelpad=10)
        self.ax.set_ylabel(axis_labels[1], fontdict={'fontsize':16, 'fontweight':'bold'}, labelpad=10)
        self.ax.tick_params(axis='both', which='major', labelsize=14)

        if xlim:
            self.ax.set_xlim(xlim)
        if ylim:
            self.ax.set_ylim(ylim)

        self.ax.grid(True)
        self.ax.legend(fontsize='small')
        self.canvas.draw()

    def clear_graph(self):
        self.figure.clear()
        self.ax = self.figure.add_subplot(111)
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
    t: float  # Время наблюдения (сек)


# ============================
# Базовый шаблон лабораторной работы
# ============================
class LabWorkTemplate(QWidget):
    def add_parameter(self, key, label_text, default_value=""):
        line_edit = QLineEdit()
        line_edit.setText(default_value)
        self.param_form.addRow(QLabel(label_text), line_edit)
        self.param_inputs[key] = line_edit

    def set_note_text(self, text):
        self.note_label.setText(text)

    def __init__(self, lab_title="Лабораторная работа", parent=None):
        super().__init__(parent)
        self.lab_title = lab_title
        self.stored_curves = {}  # Словарь для хранения кривых по типам функции
        self.active_function = None
        self.use_log_x_axis = False

        self.main_layout = QVBoxLayout()
        self.setLayout(self.main_layout)

        # Заголовок и кнопка "Назад"
        header_layout = QHBoxLayout()
        self.back_button = QPushButton("Назад")
        self.back_button.setFixedWidth(100)
        header_layout.addWidget(self.back_button, alignment=Qt.AlignLeft)
        title_label = QLabel(self.lab_title)
        title_label.setAlignment(Qt.AlignCenter)
        title_font = QFont("Arial", 28)
        title_label.setFont(title_font)
        header_layout.addWidget(title_label, stretch=1)
        header_layout.addStretch()
        self.main_layout.addLayout(header_layout)

        # Основной горизонтальный блок: левый (параметры) и правый (график)
        content_layout = QHBoxLayout()
        self.main_layout.addLayout(content_layout)

        # Левый блок (20% ширины)
        left_layout = QVBoxLayout()
        left_layout.setSpacing(10)
        self.param_inputs = {}
        self.param_form = QFormLayout()
        self.setup_parameter_inputs()
        left_layout.addLayout(self.param_form)

        self.graph_param_inputs = {}
        self.graph_param_form = QFormLayout()
        self.setup_graph_parameter_inputs()
        left_layout.addLayout(self.graph_param_form)

        # Примечания
        self.note_label = QLabel()
        self.note_label.setWordWrap(True)
        self.note_label.setStyleSheet("color: #0D47A1; font-style: italic; margin: 0px;")
        left_layout.addWidget(self.note_label)

        # Блок кнопок "Добавить график" и "Очистить график"
        control_buttons_layout = QVBoxLayout()  # Вертикально
        self.add_graph_button = QPushButton("Добавить график")
        self.add_graph_button.clicked.connect(self.on_add_graph_button_clicked)
        self.clear_button = QPushButton("Очистить график")
        self.clear_button.clicked.connect(self.on_clear_graph)
        control_buttons_layout.addWidget(self.add_graph_button)
        control_buttons_layout.addWidget(self.clear_button)
        left_layout.addLayout(control_buttons_layout)
        content_layout.addLayout(left_layout, 1)  # Stretch factor 1 (≈20%)

        # Правый блок (80% ширины)
        right_layout = QVBoxLayout()
        right_layout.setSpacing(10)
        self.function_buttons_layout = QHBoxLayout()
        self.setup_function_selection_buttons()  # Переопределяется в наследниках
        right_layout.addLayout(self.function_buttons_layout)

        self.graph_widget = GraphWidget(self)
        right_layout.addWidget(self.graph_widget, 4)

        save_buttons_layout = QHBoxLayout()
        self.save_image_button = QPushButton("Сохранить график (изображение)")
        self.save_image_button.clicked.connect(self.on_save_image)
        self.save_csv_button = QPushButton("Сохранить данные (CSV)")
        self.save_csv_button.clicked.connect(self.on_save_csv)
        save_buttons_layout.addWidget(self.save_image_button)
        save_buttons_layout.addWidget(self.save_csv_button)
        right_layout.addLayout(save_buttons_layout)
        content_layout.addLayout(right_layout, 4)  # Stretch factor 4 (≈80%)

    def setup_function_selection_buttons(self):
        pass

    def setup_parameter_inputs(self):
        self.add_parameter("K", "K", "3.0")
        self.add_parameter("Xm", "Xm", "4.0")
        self.add_parameter("T", "T", "2.0")
        self.add_parameter("t", "t", "25")

    def setup_graph_parameter_inputs(self):
        self.graph_param_inputs['w_start'] = QLineEdit("0")
        self.graph_param_inputs['w_end'] = QLineEdit("10")
        self.graph_param_inputs['step'] = QLineEdit("0.1")
        self.graph_param_inputs['t'] = QLineEdit("0")
        self.graph_param_form.addRow(QLabel("W начальное:"), self.graph_param_inputs['w_start'])
        self.graph_param_form.addRow(QLabel("W конечное:"), self.graph_param_inputs['w_end'])
        self.graph_param_form.addRow(QLabel("Шаг:"), self.graph_param_inputs['step'])
        self.graph_param_form.addRow(QLabel("t (время наблюдения):"), self.graph_param_inputs['t'])

    def on_add_graph_button_clicked(self):
        try:
            graph_params = GraphParameters(
                w_start=float(self.graph_param_inputs['w_start'].text()),
                w_end=float(self.graph_param_inputs['w_end'].text()),
                step=float(self.graph_param_inputs['step'].text()),
                t=float(self.graph_param_inputs['t'].text())
            )
        except Exception as e:
            QMessageBox.warning(self, "Ошибка", f"Неверные параметры графика: {e}")
            return

        try:
            new_results = self.calculate_all_functions(graph_params)

            for func, (x, y, label) in new_results.items():
                if func not in self.stored_curves:
                    self.stored_curves[func] = []
                self.stored_curves[func].append((x, y, label))

            self.update_graph_display()
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
        for key in self.stored_curves:
            self.stored_curves[key] = []

    def update_graph_display(self):
        self.graph_widget.clear_graph()

        if self.active_function in self.stored_curves:
            use_log = self.active_function in ["АЧХ", "ФЧХ", "ЛАФЧХ"]

            for (x, y, label) in self.stored_curves[self.active_function]:
                self.graph_widget.add_graph_line(
                    x, y, label,
                    axis_labels=("ω, рад/с", "Y"),
                    log_x=use_log
                )

            if self.stored_curves[self.active_function]:
                self.current_data = self.stored_curves[self.active_function][0][:2]

    def get_axis_labels(self):
        return ("W", "Y")

    def calculate_all_functions(self, graph_params: GraphParameters):
        raise NotImplementedError("Метод calculate_all_functions должен быть переопределён в подклассе.")
