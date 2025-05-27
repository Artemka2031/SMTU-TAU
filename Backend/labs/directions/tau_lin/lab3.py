# labs/directions/tau_lin/lab3.py

import numpy as np
from labs.base_lab import BaseLab


# ==============================
# Лабораторная работа 3:
# Аперодическое звено второго порядка
# ==============================
class Lab3_TAU_Lin(BaseLab):
    short = "3"
    full = "Аперодическое звено II порядка"
    note = "Примечание для ЛР3 (Аперодическое звено II порядка)"
    active_graph = "ПХ"
    default_params = {
        "K1": "3.0",
        "K2": "2.0",
        "Xm": "4.0",
        "T1": "2.0",
        "T2": "1.0",
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
    expected_params = ["K1", "K2", "Xm", "T1", "T2", "t"]

    @staticmethod
    def calculate_PH(K1, K2, Xm, T1, T2, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = K1 * K2 * Xm * (1 - (T1 / (T1 - T2)) * np.exp(-time / T1) + (T2 / (T1 - T2)) * np.exp(-time / T2))
        return time.tolist(), response.tolist()

    @staticmethod
    def calculate_ACH(K1, K2, T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        amplitude = (K1 * K2) / np.sqrt((T1**2 * omega**2 + 1) * (T2**2 * omega**2 + 1))
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_FCHH(T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        phase = - (np.arctan(T1 * omega) + np.arctan(T2 * omega))
        return omega.tolist(), phase.tolist()

    @staticmethod
    def calculate_AFCH(K1, K2, T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        denom = (1 - T1 * T2 * omega**2)**2 + (T1 + T2)**2 * omega**2
        Re = (K1 * K2 * (1 - T1 * T2 * omega**2)) / denom
        Im = (-K1 * K2 * omega * (T1 + T2)) / denom
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K1, K2, T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        magnitude = 20 * np.log10(K1 * K2 / np.sqrt((T1**2 * omega**2 + 1) * (T2**2 * omega**2 + 1)))
        phase = -np.degrees(np.arctan(T1 * omega) + np.arctan(T2 * omega))
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        K1 = float(params["K1"])
        K2 = float(params["K2"])
        Xm = float(params["Xm"])
        T1 = float(params["T1"])
        T2 = float(params["T2"])
        t = float(params["t"])
        count_of_dots = int(graph_params.get("count_of_points", 500))
        w_end = float(graph_params.get("w_end", 100.0))

        x_PH, y_PH = cls.calculate_PH(K1, K2, Xm, T1, T2, t, count_of_dots)
        x_ACH, y_ACH = cls.calculate_ACH(K1, K2, T1, T2, count_of_dots, w_end)
        x_FCHH, y_FCHH = cls.calculate_FCHH(T1, T2, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K1, K2, T1, T2, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K1, K2, T1, T2, count_of_dots, w_end)

        return {
            "ПХ": {"x": x_PH, "y": y_PH, "desc": f"ПХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}"},
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}"},
            "ФЧХ": {"x": x_FCHH, "y": y_FCHH, "desc": f"ФЧХ: T1={T1}, T2={T2}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag, "desc": f"ЛАФЧХ (амплитуда): K1={K1}, K2={K2}, T1={T1}, T2={T2}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase, "desc": f"ЛАФЧХ (фаза): K1={K1}, K2={K2}, T1={T1}, T2={T2}"}
        }
