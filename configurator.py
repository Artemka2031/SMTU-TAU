# configurator.py
from lab_template import LabWorkTemplate, GraphParameters
import numpy as np
from PyQt5.QtWidgets import QPushButton, QMessageBox

class Lab1(LabWorkTemplate):
    def __init__(self, parent=None):
        # Определяем список доступных функций до вызова конструктора базового класса
        self.available_functions = ["Парабола", "Квадратный корень", "Кубический корень"]
        super().__init__(lab_title="Лабораторная работа 1: Парабола и корневые функции", parent=parent)
        self.set_note_text("Примечание: Для функций 'Квадратный корень' и 'Кубический корень' значение W должно быть >= 0.")
        self.stored_curves = {func: [] for func in self.available_functions}
        self.active_function = self.available_functions[0]

    def setup_function_selection_buttons(self):
        self.function_buttons = []
        for func in self.available_functions:
            btn = QPushButton(func)
            btn.setCheckable(True)
            if func == self.active_function:
                btn.setChecked(True)
            btn.clicked.connect(self.on_function_button_clicked)
            self.function_buttons.append(btn)
            self.function_buttons_layout.addWidget(btn)

    def on_function_button_clicked(self):
        sender = self.sender()
        selected_func = sender.text()
        self.active_function = selected_func
        for btn in self.function_buttons:
            if btn.text() != selected_func:
                btn.setChecked(False)
        self.update_graph_display()

    def setup_parameter_inputs(self):
        self.add_parameter("a", "Параметр a", "1.0")
        self.add_parameter("b", "Параметр b", "0.0")
        self.add_parameter("c", "Параметр c", "0.0")

    def calculate_all_functions(self, graph_params: GraphParameters):
        a = float(self.param_inputs["a"].text())
        b = float(self.param_inputs["b"].text())
        c = float(self.param_inputs["c"].text())
        x = np.arange(graph_params.w_start, graph_params.w_end, graph_params.step)
        y_parabola = a * x**2 + b * x + c
        y_sqrt = a * np.sqrt(np.clip(x, 0, None)) + b
        y_cbrt = a * np.cbrt(x) + b
        return {
            "Парабола": (x, y_parabola, f"Парабола: a={a}, b={b}, c={c}"),
            "Квадратный корень": (x, y_sqrt, f"Квадратный корень: a={a}, b={b}"),
            "Кубический корень": (x, y_cbrt, f"Кубический корень: a={a}, b={b}")
        }

    def get_axis_labels(self):
        return ("W", "Y")


#### Lab2 (Синус и косинус):

class Lab2(LabWorkTemplate):
    def __init__(self, parent=None):
        # Определяем список функций до вызова базового конструктора
        self.available_functions = ["Синус", "Косинус", "Синус и косинус"]
        super().__init__(lab_title="Лабораторная работа 2: Синус и косинус", parent=parent)
        self.set_note_text("Примечание: Укажите амплитуду A. При выборе 'Синус и косинус' будут построены оба графика.")
        self.stored_curves = {func: [] for func in self.available_functions}
        self.active_function = self.available_functions[0]

    def setup_function_selection_buttons(self):
        self.function_buttons = []
        for func in self.available_functions:
            btn = QPushButton(func)
            btn.setCheckable(True)
            if func == self.active_function:
                btn.setChecked(True)
            btn.clicked.connect(self.on_function_button_clicked)
            self.function_buttons.append(btn)
            self.function_buttons_layout.addWidget(btn)

    def on_function_button_clicked(self):
        sender = self.sender()
        selected_func = sender.text()
        self.active_function = selected_func
        for btn in self.function_buttons:
            if btn.text() != selected_func:
                btn.setChecked(False)
        self.update_graph_display()

    def setup_parameter_inputs(self):
        self.add_parameter("A", "Амплитуда A", "1.0")

    def calculate_all_functions(self, graph_params: GraphParameters):
        A = float(self.param_inputs["A"].text())
        x = np.arange(graph_params.w_start, graph_params.w_end, graph_params.step)
        y_sin = A * np.sin(x)
        y_cos = A * np.cos(x)
        return {
            "Синус": (x, y_sin, f"Синус: A={A}"),
            "Косинус": (x, y_cos, f"Косинус: A={A}"),
            "Синус и косинус": (x, (y_sin, y_cos), f"Синус и косинус: A={A}")
        }

    def get_axis_labels(self):
        return ("W", "Y")
