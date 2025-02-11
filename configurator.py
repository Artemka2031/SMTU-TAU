from lab_template import LabWorkTemplate, GraphParameters
import numpy as np
from PyQt5.QtWidgets import QPushButton, QMessageBox


class Lab1(LabWorkTemplate):
    def __init__(self, parent=None):
        self.available_functions = ["Переходная характеристика", "АЧХ", "ФЧХ", "АФЧХ", "ЛАФЧХ"]
        super().__init__(lab_title="Лабораторная работа 1: Дифференцирующее звено с замедлением", parent=parent)
        # self.set_note_text("Дифференцирующее звено с замедлением (Инерционно-дифференцирующее)")
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
        omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), int(round(count_of_dots)))
        Re_omega = (K * T ** 2 * omega ** 2) / (T ** 2 * omega ** 2 + 1)
        Im_omega = (K * omega) / (T ** 2 * omega ** 2 + 1)
        return Re_omega, Im_omega

    def calculate_LAFCH(self, K, T, graph_params, count_of_dots):
        try:
            omega = np.logspace(np.log10(0.001), np.log10(graph_params.w_end), int(round(count_of_dots)))
            magnitude = 20 * np.log10((K * omega) / np.sqrt(T ** 2 * omega ** 2 + 1))
            phase = -np.degrees(np.arctan(T * omega)) - 270
            return omega, magnitude, phase
        except Exception as e:
            # Выводим ошибку в консоль
            print(f"Ошибка при вычислении ЛАФЧХ: {e}")
            return [], [], []

    def calculate_all_functions(self, graph_params: GraphParameters):
        try:
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
        except Exception as e:
            print(f"Ошибка при вычислении всех функций: {e}")
            return {}

    def get_axis_labels(self):
        return ("W", "Y")
