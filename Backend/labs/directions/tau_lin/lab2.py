# labs/directions/tau_lin/lab2.py

import numpy as np
from labs.base_lab import BaseLab

# ==============================
# Лабораторная работа 2:
# Аперодическое звено первого порядка
# ==============================
class Lab2_TAU_Lin(BaseLab):
    short = "2"
    full = "Аперодическое звено первого порядка"
    note = "Примечание для ЛР2 (Аперодическое звено I порядка)"
    active_graph = "ПХ"
    default_params = {
        "K": "3.0",
        "Xm": "4.0",
        "T": "2.0",
        "t": "25",
        "w": "100"
    }

    default_graphs = {
        "ПХ": ("Время", "Амплитуда", False),
        "АЧХ": ("Частота, рад/с", "Амплитуда", False),
        "ФЧХ": ("Частота, рад/с", "Фаза, °", False),
        "АФЧХ": ("Re", "Im", False),
        "ЛАФЧХ (амплитуда)": ("Частота, рад/с", "дБ", True),
        "ЛАФЧХ (фаза)": ("Частота, рад/с", "°", True)
    }
    expected_params = ["K", "Xm", "T", "t", "w"]

    @staticmethod
    def calculate_PH(K, T, Xm, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = K * Xm * (1 - np.exp(-time / T))
        return time.tolist(), response.tolist()

    @staticmethod
    def calculate_ACH(K, T, count_of_dots, w_end):
        omega = np.linspace(0.001, w_end, count_of_dots)
        amplitude = K / np.sqrt(T**2 * omega**2 + 1)
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_FCHH(T, count_of_dots, w_end):
        omega = np.linspace(0.001, w_end, count_of_dots)
        phase = -np.arctan(T * omega)
        return omega.tolist(), phase.tolist()

    @staticmethod
    def calculate_AFCH(K, T, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        Re = K / (T**2 * omega**2 + 1)
        Im = -K * omega / (T**2 * omega**2 + 1)
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K, T, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        magnitude = 20 * np.log10(K / np.sqrt(T**2 * omega**2 + 1))
        phase = -np.degrees(np.arctan(T * omega))
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        K  = float(params["K"])
        Xm = float(params["Xm"])
        T  = float(params["T"])
        t  = float(params["t"])
        count_of_dots = 10000
        w_end = float(params["w"])
        # count_of_dots = int(graph_params.get("count_of_points", 500))
        # w_end = float(graph_params.get("w_end", 100.0))

        x_PH, y_PH = cls.calculate_PH(K, T, Xm, t, count_of_dots)
        x_ACH, y_ACH = cls.calculate_ACH(K, T, count_of_dots, w_end)
        x_FCHH, y_FCHH = cls.calculate_FCHH(T, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K, T, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K, T, count_of_dots, w_end)

        return {
            "ПХ": {"x": x_PH, "y": y_PH, "desc": f"ПХ: K={K}, T={T}, Xm={Xm}"},
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K={K}, Xm={Xm}, T={T}"},
            "ФЧХ": {"x": x_FCHH, "y": y_FCHH, "desc": f"ФЧХ: K={K}, Xm={Xm}, T={T}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K={K}, Xm={Xm}, T={T}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag, "desc": f"ЛАФЧХ (амплитуда): K={K}, Xm={Xm}, T={T}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase, "desc": f"ЛАФЧХ (фаза): K={K}, Xm={Xm}, T={T}"}
        }