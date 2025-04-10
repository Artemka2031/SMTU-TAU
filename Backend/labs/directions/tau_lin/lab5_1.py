# labs/directions/tau_lin/lab5_1.py

import numpy as np
from labs.base_lab import BaseLab


# ==============================
# Лабораторная работа 5:
# Исследование разомкнутой системы
# (рассчитываются только частотные характеристики)
# ==============================
class Lab5_1_TAU_Lin(BaseLab):
    short = "5.1 ЛР"
    full = "Исследование разомкнутой системы. Вариант 1"
    note = "Примечание для ЛР5 (Исследование разомкнутой системы)"
    active_graph = "АЧХ"
    default_params = {
        "K1": "1.0",
        "K2": "1.0",
        "K3": "1.0",
        "T1": "1.0",
        "T2": "1.0",
        "T3": "1.0"
    }
    default_graphs = {
        "АЧХ": ("Частота, рад/с", "Амплитуда", True),
        "АФЧХ": ("Re", "Im", False),
        "ЛАФЧХ (амплитуда)": ("Частота, рад/с", "дБ", True),
        "ЛАФЧХ (фаза)": ("Частота, рад/с", "°", True)
    }
    expected_params = ["K1", "K2", "K3", "T1", "T2", "T3"]

    @staticmethod
    def calculate_ACH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        amplitude = (K1 * K2 * K3) / np.sqrt((1 + T1**2 * omega**2) *
                                               (1 + T2**2 * omega**2) *
                                               (1 + T3**2 * omega**2))
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_AFCH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        Re = (K1 * K2 * K3) * (1 - omega**2 * T1 * T2 - omega**2 * T2 * T3 - omega**2 * T1 * T3) / ((1 + T1**2 * omega**2) *
                                (1 + T2**2 * omega**2) *
                                (1 + T3**2 * omega**2))
        Im = (K1 * K2 * K3 * (omega**2 * T1 * T2 * T3 - omega * T1 - omega * T2 - omega * T3)) / ((1 + T1**2 * omega**2) *
                                                           (1 + T2**2 * omega**2) *
                                                           (1 + T3**2 * omega**2))
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        magnitude = 20 * np.log10((K1 * K2 * K3) / np.sqrt((1 + T1**2 * omega**2) *
                                                            (1 + T2**2 * omega**2) *
                                                            (1 + T3**2 * omega**2)))
        phase = -np.degrees(np.arctan(T1 * omega) +
                            np.arctan(T2 * omega) +
                            np.arctan(T3 * omega))
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        K1 = float(params["K1"])
        K2 = float(params["K2"])
        K3 = float(params["K3"])
        T1 = float(params["T1"])
        T2 = float(params["T2"])
        T3 = float(params["T3"])
        count_of_dots = int(graph_params.get("count_of_points", 500))
        w_end = float(graph_params.get("w_end", 100.0))

        x_ACH, y_ACH = cls.calculate_ACH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)

        return {
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag, "desc": f"ЛАФЧХ (амплитуда): K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase, "desc": f"ЛАФЧХ (фаза): K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"}
        }