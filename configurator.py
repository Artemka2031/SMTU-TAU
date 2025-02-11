# configurator.py
from lab_template import LabWorkTemplate, GraphParameters
import numpy as np
from PyQt5.QtWidgets import QComboBox, QMessageBox, QPushButton

#############################
# Лабораторная работа 1:
# "Парабола и корневые функции"
#############################
class Lab1(LabWorkTemplate):
    def __init__(self, parent=None):
        super().__init__(lab_title="Лабораторная работа 1: Парабола и корневые функции", parent=parent)
        self.set_note_text("Примечание: Для функций 'Квадратный корень' и 'Кубический корень' значение W должно быть >= 0.")
        # Инициализируем список наборов графиков и активный индекс (общий для всех функций)
        self.stored_graphs = []  # Каждый элемент – словарь: { "Парабола": (x,y,label), "Квадратный корень": (...), "Кубический корень": (...) }
        self.active_graph_index = None

        # Связываем изменение выбора функции с обновлением отображения
        self.function_combo.currentIndexChanged.connect(self.on_function_selection_changed)
        # Обновляем селектор графиков (на старте он пуст)
        self.update_graph_selector()

    def setup_function_selection_inputs(self):
        self.function_combo = QComboBox()
        self.function_combo.addItems(["Парабола", "Квадратный корень", "Кубический корень"])
        self.function_layout.addRow("Выбор функции:", self.function_combo)
        self.param_inputs["function"] = self.function_combo

    def setup_parameter_inputs(self):
        self.add_parameter("a", "Параметр a", "1.0")
        self.add_parameter("b", "Параметр b", "0.0")
        self.add_parameter("c", "Параметр c", "0.0")

    def calculate_all(self, graph_params: GraphParameters):
        """
        Вычисляет кривые для всех функций (на основе текущих параметров) и возвращает
        словарь: { "Парабола": (x, y_parabola, label1), "Квадратный корень": (x, y_sqrt, label2), "Кубический корень": (x, y_cbrt, label3) }
        """
        a = float(self.param_inputs["a"].text())
        b = float(self.param_inputs["b"].text())
        c = float(self.param_inputs["c"].text())
        x = np.arange(graph_params.w_start, graph_params.w_end, graph_params.step)
        # Вычисляем для каждой функции
        y_parabola = a * x**2 + b * x + c
        label_parabola = f"Парабола: a={a}, b={b}, c={c}"
        y_sqrt = a * np.sqrt(np.clip(x, 0, None)) + b
        label_sqrt = f"Квадратный корень: a={a}, b={b}"
        y_cbrt = a * np.cbrt(x) + b
        label_cbrt = f"Кубический корень: a={a}, b={b}"
        return {
            "Парабола": (x, y_parabola, label_parabola),
            "Квадратный корень": (x, y_sqrt, label_sqrt),
            "Кубический корень": (x, y_cbrt, label_cbrt)
        }

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
            new_graph = self.calculate_all(graph_params)
            self.stored_graphs.append(new_graph)
            # Устанавливаем активный индекс на последний добавленный
            self.active_graph_index = len(self.stored_graphs) - 1
            self.update_graph_selector()
            self.update_graph_display()
        except Exception as e:
            QMessageBox.critical(self, "Ошибка", f"Ошибка при построении графика: {e}")

    def on_function_selection_changed(self):
        self.update_graph_display()

    def update_graph_display(self):
        self.graph_widget.clear_graph()
        if self.active_graph_index is not None and self.active_graph_index < len(self.stored_graphs):
            current_func = self.param_inputs["function"].currentText()
            graph = self.stored_graphs[self.active_graph_index]
            if current_func in graph:
                x, y, label = graph[current_func]
                self.graph_widget.add_graph_line(x, y, label, axis_labels=self.get_axis_labels())

    def update_graph_selector(self):
        # Очищаем layout селектора графиков
        for i in reversed(range(self.graph_selector_layout.count())):
            widget = self.graph_selector_layout.itemAt(i).widget()
            if widget:
                widget.setParent(None)
        # Добавляем кнопку для каждого набора графика
        for idx in range(len(self.stored_graphs)):
            btn = QPushButton(f"График {idx+1}")
            # Если эта кнопка соответствует активному графику, выделяем её (например, меняем фон)
            if idx == self.active_graph_index:
                btn.setStyleSheet("background-color: #42A5F5;")
            else:
                btn.setStyleSheet("")
            # При нажатии меняем активный индекс и обновляем отображение
            btn.clicked.connect(lambda checked, i=idx: self.set_active_graph(i))
            self.graph_selector_layout.addWidget(btn)

    def set_active_graph(self, index):
        self.active_graph_index = index
        self.update_graph_selector()
        self.update_graph_display()

    def get_axis_labels(self):
        return ("W", "Y")

    def get_initial_plot_limits(self):
        return (None, None)

#############################
# Лабораторная работа 2:
# "Синус и косинус"
#############################
class Lab2(LabWorkTemplate):
    def __init__(self, parent=None):
        super().__init__(lab_title="Лабораторная работа 2: Синус и косинус", parent=parent)
        self.set_note_text("Примечание: Укажите амплитуду A. При выборе 'Синус и косинус' будут построены оба графика.")
        self.stored_graphs = []  # Каждый элемент – словарь: { "Синус": (x,y,label), "Косинус": (x,y,label), "Синус и косинус": (x,y1,label1) и (x,y2,label2) }
        self.active_graph_index = None
        self.function_combo.currentIndexChanged.connect(self.on_function_selection_changed)
        self.update_graph_selector()

    def setup_function_selection_inputs(self):
        self.function_combo = QComboBox()
        self.function_combo.addItems(["Синус", "Косинус", "Синус и косинус"])
        self.function_layout.addRow("Выбор функции:", self.function_combo)
        self.param_inputs["function"] = self.function_combo

    def setup_parameter_inputs(self):
        self.add_parameter("A", "Амплитуда A", "1.0")

    def calculate_all(self, graph_params: GraphParameters):
        A = float(self.param_inputs["A"].text())
        x = np.arange(graph_params.w_start, graph_params.w_end, graph_params.step)
        # Вычисляем для каждого типа функции
        y_sin = A * np.sin(x)
        label_sin = f"Синус: A={A}"
        y_cos = A * np.cos(x)
        label_cos = f"Косинус: A={A}"
        # Для опции "Синус и косинус" сохраняем оба графика, но будем отображать их вместе
        return {
            "Синус": (x, y_sin, label_sin),
            "Косинус": (x, y_cos, label_cos),
            "Синус и косинус": (x, (y_sin, y_cos), f"Синус и Косинус: A={A}")
        }

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
            new_graph = self.calculate_all(graph_params)
            self.stored_graphs.append(new_graph)
            self.active_graph_index = len(self.stored_graphs) - 1
            self.update_graph_selector()
            self.update_graph_display()
        except Exception as e:
            QMessageBox.critical(self, "Ошибка", f"Ошибка при построении графика: {e}")

    def on_function_selection_changed(self):
        self.update_graph_display()

    def update_graph_display(self):
        self.graph_widget.clear_graph()
        if self.active_graph_index is not None and self.active_graph_index < len(self.stored_graphs):
            current_func = self.param_inputs["function"].currentText()
            graph = self.stored_graphs[self.active_graph_index]
            if current_func in graph:
                data = graph[current_func]
                x = data[0]
                # Для опции "Синус и косинус" отображаем обе кривые
                if current_func == "Синус и косинус":
                    y1, y2 = data[1]
                    label = data[2]
                    self.graph_widget.add_graph_line(x, y1, f"{label} (Синус)", axis_labels=self.get_axis_labels())
                    self.graph_widget.add_graph_line(x, y2, f"{label} (Косинус)", axis_labels=self.get_axis_labels())
                else:
                    x, y, label = data
                    self.graph_widget.add_graph_line(x, y, label, axis_labels=self.get_axis_labels())

    def update_graph_selector(self):
        for i in reversed(range(self.graph_selector_layout.count())):
            widget = self.graph_selector_layout.itemAt(i).widget()
            if widget:
                widget.setParent(None)
        for idx in range(len(self.stored_graphs)):
            btn = QPushButton(f"График {idx+1}")
            if idx == self.active_graph_index:
                btn.setStyleSheet("background-color: #42A5F5;")
            else:
                btn.setStyleSheet("")
            btn.clicked.connect(lambda checked, i=idx: self.set_active_graph(i))
            self.graph_selector_layout.addWidget(btn)

    def set_active_graph(self, index):
        self.active_graph_index = index
        self.update_graph_selector()
        self.update_graph_display()

    def get_graph_label(self):
        func = self.param_inputs["function"].currentText()
        A = self.param_inputs["A"].text()
        return f"{func}: A={A}"

    def get_axis_labels(self):
        return ("W", "Y")
