# labs/directions/tau_lin/lab4.py

import numpy as np
from labs.base_lab import BaseLab


# ==============================
# Лабораторная работа 4:
# Колебательное звено
# ==============================
class Lab4_TAU_Lin(BaseLab):
    short = "4 ЛР"
    full = "Лабораторная работа 4: Колебательное звено"
    note = "Примечание для ЛР4 (Колебательное звено)"
    active_graph = "ПХ"
    default_params = {
        "K": "3.0",
        "Xm": "4.0",
        "T": "2.0",
        "xi": "0.5",
        "t": "25"
    }
    default_graphs = {
        "ПХ": ("Время", "Амплитуда", False),
        "АЧХ": ("Частота, рад/с", "Амплитуда", True),
        "ФЧХ": ("Частота, рад/с", "Фаза, °", True),
        "АФЧХ": ("Re", "Im", False),
        "ЛАФЧХ (амплитуда)": ("Частота, рад/с", "дБ", True),
        "ЛАФЧХ (фаза)": ("Частота, рад/с", "°", True)
    }
    expected_params = ["K", "Xm", "T", "xi", "t"]

    @staticmethod
    def calculate_PH(K, Xm, T, xi, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        # Расчёт переходной характеристики для колебательного звена
        wn = np.sqrt(1 - xi**2) / T
        response = K * Xm * (1 - np.exp(-xi * time / T) *
                             (np.cos(wn * time) + (xi / np.sqrt(1 - xi**2)) * np.sin(wn * time)))
        return time.tolist(), response.tolist()

    @staticmethod
    def calculate_ACH(K, T, xi, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        amplitude = K / np.sqrt((1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2)
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_FCHH(T, xi, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        phase = -np.arctan((2 * xi * T * omega) / (1 - T**2 * omega**2))
        return omega.tolist(), phase.tolist()

    @staticmethod
    def calculate_AFCH(K, T, xi, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        denom = (1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2
        Re = K * (1 - T**2 * omega**2) / denom
        Im = -K * (2 * xi * T * omega) / denom
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K, T, xi, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        magnitude = 20 * np.log10(K / np.sqrt((1 - T**2 * omega**2)**2 + (2 * xi * T * omega)**2))
        phase = -np.degrees(np.arctan2(2 * xi * T * omega, (1 - T**2 * omega**2)))
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        K = float(params["K"])
        Xm = float(params["Xm"])
        T = float(params["T"])
        xi = float(params["xi"])
        t = float(params["t"])
        count_of_dots = int(graph_params.get("count_of_points", 500))
        w_end = float(graph_params.get("w_end", 100.0))

        x_PH, y_PH = cls.calculate_PH(K, Xm, T, xi, t, count_of_dots)
        x_ACH, y_ACH = cls.calculate_ACH(K, T, xi, count_of_dots, w_end)
        x_FCHH, y_FCHH = cls.calculate_FCHH(T, xi, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K, T, xi, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K, T, xi, count_of_dots, w_end)

        return {
            "Переходная характеристика": {"x": x_PH, "y": y_PH, "desc": f"ПХ: K={K}, T={T}, ξ={xi}"},
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K={K}, T={T}, ξ={xi}"},
            "ФЧХ": {"x": x_FCHH, "y": y_FCHH, "desc": f"ФЧХ: T={T}, ξ={xi}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K={K}, T={T}, ξ={xi}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag, "desc": f"ЛАФЧХ (амплитуда): K={K}, T={T}, ξ={xi}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase, "desc": f"ЛАФЧХ (фаза): K={K}, T={T}, ξ={xi}"}
        }
