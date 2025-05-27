# labs/directions/tau_lin/lab5_1.py

import numpy as np
from labs.base_lab import BaseLab


# ==============================
# Лабораторная работа 5:
# Исследование разомкнутой системы
# (рассчитываются только частотные характеристики)
# ==============================
class Lab5_2_TAU_Lin(BaseLab):
    short = "5.2"
    full = "Исследование разомкнутой системы"
    note = "Примечание для ЛР5 (Исследование разомкнутой системы). Вариант 2"
    active_graph = "АЧХ"
    default_params = {
        "K1": "10.0",  # Пример значения из таблицы (устойчивая система)
        "K2": "0.5",
        "T1": "0.5",
        "T2": "10.0",
        "xi": "0.5"
    }
    default_graphs = {
        "АЧХ": ("Частота, рад/с", "Амплитуда", True),
        "АФЧХ": ("Re", "Im", False),
        "ЛАФЧХ (амплитуда)": ("Частота, рад/с", "дБ", True),
        "ЛАФЧХ (фаза)": ("Частота, рад/с", "°", True)
    }
    expected_params = ["K1", "K2", "T1", "T2", "xi"]

    @staticmethod
    def calculate_ACH(K1, K2, T1, T2, xi, count_of_dots, w_end):
        """Расчёт амплитудно-частотной характеристики (АЧХ)"""
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        amplitude = (K1 * K2) / np.sqrt(
            (1 + T1 ** 2 * omega ** 2) * ((1 - T2 ** 2 * omega ** 2) ** 2 + (2 * xi * T2 * omega) ** 2))
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_AFCH(K1, K2, T1, T2, xi, count_of_dots, w_end):
        """Расчёт амплитудно-фазовой частотной характеристики (АФЧХ, годограф Найквиста)"""
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        Re = (K1 * K2 * (1 - T2 ** 2 * omega ** 2 - xi * T1 * T2 * omega ** 2)) / (
                (1 + T1 ** 2 * omega ** 2) * ((1 - T2 ** 2 * omega ** 2) ** 2 + (2 * xi * T2 * omega) ** 2)
        )
        Im = (K1 * K2 * (T1 * T2 ** 2 * omega ** 3 - 2 * xi * T2 * omega - T1 * omega)) / (
                (1 + T1 ** 2 * omega ** 2) * ((1 - T2 ** 2 * omega ** 2) ** 2 + (2 * xi * T2 * omega) ** 2)
        )
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K1, K2, T1, T2, xi, count_of_dots, w_end):
        """Расчёт логарифмической амплитудно-фазовой частотной характеристики (ЛАФЧХ)"""
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        # Амплитуда в дБ
        magnitude = 20 * np.log10(
            (K1 * K2) / np.sqrt(
                (1 + T1 ** 2 * omega ** 2) * ((1 - T2 ** 2 * omega ** 2) ** 2 + (2 * xi * T2 * omega) ** 2))
        )
        # Фаза в градусах
        phase = -np.degrees(
            np.arctan(T1 * omega) + np.arctan2(2 * xi * T2 * omega, 1 - T2 ** 2 * omega ** 2)
        )
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        """Расчёт всех характеристик системы"""
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        K1 = float(params["K1"])
        K2 = float(params["K2"])
        T1 = float(params["T1"])
        T2 = float(params["T2"])
        xi = float(params["xi"])
        count_of_dots = int(graph_params.get("count_of_points", 500))
        w_end = float(graph_params.get("w_end", 100.0))

        x_ACH, y_ACH = cls.calculate_ACH(K1, K2, T1, T2, xi, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K1, K2, T1, T2, xi, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K1, K2, T1, T2, xi, count_of_dots, w_end)

        return {
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}, xi={xi}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K1={K1}, K2={K2}, T1={T1}, T2={T2}, xi={xi}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag,
                                  "desc": f"ЛАФЧХ (амплитуда): K1={K1}, K2={K2}, T1={T1}, T2={T2}, xi={xi}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase,
                             "desc": f"ЛАФЧХ (фаза): K1={K1}, K2={K2}, T1={T1}, T2={T2}, xi={xi}"}
        }