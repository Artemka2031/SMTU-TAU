# configurator.py
from lab_template import LabWorkTemplate, GraphParameters
import numpy as np
from PyQt5.QtWidgets import QPushButton, QMessageBox


class Lab1(LabWorkTemplate):
    def __init__(self, parent=None):
        # Определяем список доступных функций до вызова конструктора базового класса
        self.available_functions = ["Переходная характеристика", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"]
        super().__init__(lab_title="Лабораторная работа 1: Дифференцирующее звено с замедлением", parent=parent)
        self.set_note_text("Дифференцирующее звено с замедлением (Инерционно-дифференцирующее)")
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
        self.add_parameter("K", "K", "3.0")
        self.add_parameter("Xm", "Xm", "4.0")
        self.add_parameter("T", "T", "2.0")
        self.add_parameter("t", "t", "25")

    def calculate_PH(self, K, Xm, T, t: int, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = (K * Xm / T) * np.exp(-time / T)
        return time, response

    def calculate_ACH(self, K, T, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), int(round(count_of_dots)))
        amplitude = (K * omega) / np.sqrt(T ** 2 * omega ** 2 + 1)
        return omega, amplitude

    def calculate_FCHH(self, T, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), int(round(count_of_dots)))
        phase = np.arctan(1 / (T * omega))
        return omega, phase

    def calculate_AFCH(self, K, T, graph_params, count_of_dots):
        """
        Вычисление Амплитудно-Фазовой Частотной Характеристики (АФЧХ).

        :param K: коэффициент усиления
        :param T: постоянная времени
        :param graph_params: параметры графика
        :param count_of_dots: количество точек
        :return: кортеж (Re(ω), Im(ω))
        """
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), int(round(count_of_dots)))

        # Вычисляем Re(ω) и Im(ω) по формулам
        Re_omega = (K * T ** 2 * omega ** 2) / (T ** 2 * omega ** 2 + 1)
        Im_omega = (K * omega) / (T ** 2 * omega ** 2 + 1)

        return Re_omega, Im_omega

    def calculate_LAFCH(self, K, T, graph_params, count_of_dots):
        """
        Вычисление ЛАФЧХ (Логарифмическая Амплитудно-Фазовая Частотная Характеристика)
        для дифференцирующего звена с замедлением.
        Нормировка амплитуды так, чтобы асимптота при ω→∞ равнялась 0 дБ.
        Фаза вычисляется так, что при ω→∞ получается -180°.
        """
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), int(round(count_of_dots)))

        # Вычисляем амплитуду и нормируем её так, чтобы при ω→∞ она стремилась к 0 дБ:
        magnitude = 20 * np.log10((K * omega) / np.sqrt(1 + (T * omega) ** 2))
        magnitude -= 20 * np.log10(K / T)  # нормировка: высокочастотная асимптота становится 0 дБ

        # Фазовая характеристика: при ω→0 получаем -90°, при ω→∞ – -180°
        phase = 90 - np.degrees(np.arctan(T * omega))


        return omega, magnitude, phase

    def calculate_all_functions(self, graph_params: GraphParameters):
        K = float(self.param_inputs["K"].text())
        Xm = float(self.param_inputs["Xm"].text())
        T = float(self.param_inputs["T"].text())
        t = int(self.param_inputs["t"].text())

        step = int(graph_params.step * 100000)

        x_PH, y_PH = self.calculate_PH(K, Xm, T, t, step)
        x_ACH, y_ACH = self.calculate_ACH(K, T, graph_params, step)
        x_FCHH, y_FCHH = self.calculate_FCHH(T, graph_params, step)
        x_AFCH_Re, y_AFCH_Im = self.calculate_AFCH(K, T, graph_params, step)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = self.calculate_LAFCH(K, T, graph_params, step)

        result = {
            "Переходная характеристика": (x_PH, y_PH, f"Переходная характеристика: K={K}, Xm={Xm}, T={T}"),
            "АЧХ": (x_ACH, y_ACH, f"АЧХ: K={K}, Xm={Xm}, T={T}"),
            "ФЧХ": (x_FCHH, y_FCHH, f"ФЧХ: T={T}"),
            "АФЧХ": (x_AFCH_Re, y_AFCH_Im, f"АФЧХ: K={K}, T={T}"),
            "ЛАФЧХ (амплитуда)": (x_LAFCH, y_LAFCH_mag, f"ЛАЧХ: K={K}, T={T}"),
            "ЛАФЧХ (фаза)": (x_LAFCH, y_LAFCH_phase, f"ЛФЧХ: K={K}, T={T}")
        }

        print("Вычисленные функции:", result.keys())  # Проверка!

        return result

    def get_axis_labels(self):
        return ("W", "Y")


class Lab2(LabWorkTemplate):
    def __init__(self, parent=None):
        self.available_functions = ["Переходная характеристика", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"]
        super().__init__(lab_title="Лабораторная работа 2: Аперодическое звено звено I порядка", parent=parent)
        self.set_note_text("Аперодическое звено первого порядка")
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
        self.add_parameter("K", "K", "3.0")
        self.add_parameter("Xm", "Xm", "4.0")
        self.add_parameter("T", "T", "2.0")
        self.add_parameter("t", "t", "25")

    def calculate_PH(self, K, T, Xm, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = K * Xm * (1 - np.exp(-time / T))
        return time, response

    def calculate_ACH(self, K, T, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        amplitude = K / np.sqrt(T ** 2 * omega ** 2 + 1)
        return omega, amplitude

    def calculate_FCHH(self, T, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        phase = -np.arctan(T * omega)
        return omega, phase

    def calculate_AFCH(self, K, T, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        Re_omega = K / (T ** 2 * omega ** 2 + 1)
        Im_omega = -K * omega / (T ** 2 * omega ** 2 + 1)
        return Re_omega, Im_omega

    def calculate_LAFCH(self, K, T, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        magnitude = 20 * np.log10(K / np.sqrt(T ** 2 * omega ** 2 + 1))
        phase = -np.degrees(np.arctan(T * omega))
        return omega, magnitude, phase

    def calculate_all_functions(self, graph_params: GraphParameters):
        K = float(self.param_inputs["K"].text())
        Xm = float(self.param_inputs["Xm"].text())
        T = float(self.param_inputs["T"].text())
        t = int(self.param_inputs["t"].text())

        step = int(graph_params.step * 100000)

        x_PH, y_PH = self.calculate_PH(K, T, Xm, t, step)
        x_ACH, y_ACH = self.calculate_ACH(K, T, graph_params, step)
        x_FCHH, y_FCHH = self.calculate_FCHH(T, graph_params, step)
        x_AFCH_Re, y_AFCH_Im = self.calculate_AFCH(K, T, graph_params, step)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = self.calculate_LAFCH(K, T, graph_params, step)

        return {
            "Переходная характеристика": (x_PH, y_PH, f"Переходная характеристика: K={K}, T={T}"),
            "АЧХ": (x_ACH, y_ACH, f"АЧХ: K={K}, Xm={Xm}, T={T}"),
            "ФЧХ": (x_FCHH, y_FCHH, f"ФЧХ: K={K}, Xm={Xm},T={T}"),
            "АФЧХ": (x_AFCH_Re, y_AFCH_Im, f"АФЧХ: K={K}, Xm={Xm},T={T}"),
            "ЛАФЧХ (амплитуда)": (x_LAFCH, y_LAFCH_mag, f"ЛАЧХ: K={K}, Xm={Xm},T={T}"),
            "ЛАФЧХ (фаза)": (x_LAFCH, y_LAFCH_phase, f"ЛФЧХ: K={K}, Xm={Xm},T={T}")
        }

    def get_axis_labels(self):
        return ("W", "Y")


class Lab3(LabWorkTemplate):
    def __init__(self, parent=None):
        self.available_functions = ["Переходная характеристика", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"]
        super().__init__(lab_title="Лабораторная работа 3: Аперодическое звено II порядка", parent=parent)
        self.set_note_text("Аперодическое звено второго порядка")
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
        self.add_parameter("K1", "K1", "3.0")
        self.add_parameter("K2", "K2", "2.0")
        self.add_parameter("Xm", "Xm", "4.0")
        self.add_parameter("T1", "T1", "2.0")
        self.add_parameter("T2", "T2", "1.0")
        self.add_parameter("t", "t", "25")

    def calculate_PH(self, K1, K2, Xm, T1, T2, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = K1 * K2 * Xm * (1 - (T1 / (T1 - T2)) * np.exp(-time / T1) + (T2 / (T1 - T2)) * np.exp(-time / T2))
        return time, response

    def calculate_ACH(self, K1, K2, T1, T2, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        amplitude = K1 * K2 / np.sqrt((T1**2 * omega**2 + 1) * (T2**2 * omega**2 + 1))
        return omega, amplitude

    def calculate_FCHH(self, T1, T2, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        phase = -np.arctan(T1 * omega) - np.arctan(T2 * omega)
        return omega, phase

    def calculate_AFCH(self, K1, K2, T1, T2, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        Re_omega = (K1 * K2 * (1 - T1 * T2 * omega**2)) / ((1 - T1 * T2 * omega**2)**2 + (T1 + T2)**2 * omega**2)
        Im_omega = (-K1 * K2 * omega * (T1 + T2)) / ((1 - T1 * T2 * omega**2)**2 + (T1 + T2)**2 * omega**2)
        return Re_omega, Im_omega

    def calculate_LAFCH(self, K1, K2, T1, T2, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        magnitude = 20 * np.log10(K1 * K2 / np.sqrt((T1**2 * omega**2 + 1) * (T2**2 * omega**2 + 1)))
        phase = -np.degrees(np.arctan(T1 * omega) + np.arctan(T2 * omega))
        return omega, magnitude, phase

    def calculate_all_functions(self, graph_params: GraphParameters):
        K1 = float(self.param_inputs["K1"].text())
        K2 = float(self.param_inputs["K2"].text())
        Xm = float(self.param_inputs["Xm"].text())
        T1 = float(self.param_inputs["T1"].text())
        T2 = float(self.param_inputs["T2"].text())
        t = int(self.param_inputs["t"].text())

        step = int(graph_params.step * 100000)

        x_PH, y_PH = self.calculate_PH(K1, K2, Xm, T1, T2, t, step)
        x_ACH, y_ACH = self.calculate_ACH(K1, K2, T1, T2, graph_params, step)
        x_FCHH, y_FCHH = self.calculate_FCHH(T1, T2, graph_params, step)
        x_AFCH_Re, y_AFCH_Im = self.calculate_AFCH(K1, K2, T1, T2, graph_params, step)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = self.calculate_LAFCH(K1, K2, T1, T2, graph_params, step)

        return {
            "Переходная характеристика": (x_PH, y_PH, f"Переходная характеристика: K1={K1}, K2={K2}, T1={T1}, T2={T2}"),
            "АЧХ": (x_ACH, y_ACH, f"АЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}"),
            "ФЧХ": (x_FCHH, y_FCHH, f"ФЧХ: T1={T1}, T2={T2}"),
            "АФЧХ": (x_AFCH_Re, y_AFCH_Im, f"АФЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}"),
            "ЛАФЧХ (амплитуда)": (x_LAFCH, y_LAFCH_mag, f"ЛАЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}"),
            "ЛАФЧХ (фаза)": (x_LAFCH, y_LAFCH_phase, f"ЛФЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}")
        }

    def get_axis_labels(self):
        return ("W", "Y")

class Lab4(LabWorkTemplate):
    def __init__(self, parent=None):
        self.available_functions = ["Переходная характеристика", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"]
        super().__init__(lab_title="Лабораторная работа 4: Колебательное звено", parent=parent)
        self.set_note_text("Колебательное звено")
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
        self.add_parameter("K", "K", "3.0")
        self.add_parameter("Xm", "Xm", "4.0")
        self.add_parameter("T", "T", "2.0")
        self.add_parameter("xi", "Коэффициент демпфирования ξ", "0.5")
        self.add_parameter("t", "t", "25")

    def calculate_PH(self, K, Xm, T, xi, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = K * Xm * (1 - np.exp(-time * xi / T) * (np.cos(time * np.sqrt(1 - xi ** 2) / T) + xi / np.sqrt(1 - xi ** 2) * np.sin(time * np.sqrt(1 - xi ** 2) / T)))
        return time, response

    def calculate_ACH(self, K, T, xi, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        amplitude = K / np.sqrt((1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2)
        return omega, amplitude

    def calculate_FCHH(self, T, xi, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        phase = -np.arctan((2 * xi * T * omega) / (1 - T**2 * omega**2))
        return omega, phase

    def calculate_AFCH(self, K, T, xi, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        Re_omega = K * (1 - T**2 * omega**2) / ((1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2)
        Im_omega = -K * (2 * xi * T * omega) / ((1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2)
        return Re_omega, Im_omega

    def calculate_LAFCH(self, K, T, xi, graph_params, count_of_dots):
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), count_of_dots)
        magnitude = 20 * np.log10(K / np.sqrt((1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2))
        phase = -np.degrees(np.arctan2((2 * xi * T * omega), (1 - T**2 * omega**2)))
        return omega, magnitude, phase

    def calculate_all_functions(self, graph_params: GraphParameters):
        K = float(self.param_inputs["K"].text())
        Xm = float(self.param_inputs["Xm"].text())
        T = float(self.param_inputs["T"].text())
        xi = float(self.param_inputs["xi"].text())
        t = int(self.param_inputs["t"].text())

        step = int(graph_params.step * 100000)

        x_PH, y_PH = self.calculate_PH(K, Xm, T, xi, t, step)
        x_ACH, y_ACH = self.calculate_ACH(K, T, xi, graph_params, step)
        x_FCHH, y_FCHH = self.calculate_FCHH(T, xi, graph_params, step)
        x_AFCH_Re, y_AFCH_Im = self.calculate_AFCH(K, T, xi, graph_params, step)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = self.calculate_LAFCH(K, T, xi, graph_params, step)
        return {
            "Переходная характеристика": (x_PH, y_PH, f"Переходная характеристика: K={K}, T={T}, ξ={xi}"),
            "АЧХ": (x_ACH, y_ACH, f"АЧХ: K={K}, T={T}, ξ={xi}"),
            "ФЧХ": (x_FCHH, y_FCHH, f"ФЧХ: T={T}, ξ={xi}"),
            "АФЧХ": (x_AFCH_Re, y_AFCH_Im, f"АФЧХ: K={K}, T={T}, ξ={xi}"),
            "ЛАФЧХ (амплитуда)": (x_LAFCH, y_LAFCH_mag, f"ЛАЧХ: K={K}, T={T}, ξ={xi}"),
            "ЛАФЧХ (фаза)": (x_LAFCH, y_LAFCH_phase, f"ЛФЧХ: K={K}, T={T}, ξ={xi}")
        }

    def get_axis_labels(self):
        return ("W", "Y")
