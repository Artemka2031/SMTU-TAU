# labs/directions/tau_lin/lab6_3.py

import numpy as np
from labs.base_lab import BaseLab


# ==============================
# Лабораторная работа 6:
# Замкнутая система (с годографом Михайлова). Вариант 3
# ==============================
class Lab5_TDZ(BaseLab):
    short = "5"
    full = "Замкнутая система. Вариант 3"
    note = "Примечание для ЛР5 (Замкнутая система с годографом Михайлова). Вариант 3"
    active_graph = "АЧХ"
    default_params = {
        "K1": "10.0",  # Устойчивая система из таблицы
        "K2": "0.5",
        "K3": "3.0",
        "T1": "0.5",
        "T2": "10.0",
        "T3": "2.0"
    }
    default_graphs = {
        "АЧХ": ("Частота, рад/с", "Амплитуда", True),
        "АФЧХ": ("Re", "Im", False),
        "Годограф Михайлова": ("Re", "Im", False)
    }
    expected_params = ["K1", "K2", "K3", "T1", "T2", "T3"]

    @staticmethod
    def calculate_response(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        """Расчёт передаточной функции замкнутой системы"""
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        p = 1j * omega
        numerator = K1 * (T2 * p + 1) * (T3 * p + 1)
        denominator = (T1 * T2 * T3 * p ** 3 +
                       (T1 * T2 + T1 * T3 + T2 * T3) * p ** 2 +
                       (T1 + T2 + T3) * p +
                       (1 + K1 * K2 * K3))
        H = numerator / denominator
        return omega.tolist(), H.tolist()

    @staticmethod
    def calculate_ACH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        """Расчёт амплитудно-частотной характеристики (АЧХ)"""
        omega, H = Lab6_3_TAU_Lin.calculate_response(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)
        amplitude = [abs(h) for h in H]
        return omega, amplitude

    @staticmethod
    def calculate_AFCH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        """Расчёт амплитудно-фазовой частотной характеристики (АФЧХ)"""
        omega, H = Lab6_3_TAU_Lin.calculate_response(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)
        Re = [np.real(h) for h in H]
        Im = [np.imag(h) for h in H]
        return omega, Re, Im

    @staticmethod
    def calculate_Mikhailov(K1, K2, K3, T1, T2, T3, count_of_dots, w_end):
        """Расчёт годографа Михайлова"""
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        p = 1j * omega
        D = (T1 * T2 * T3 * p ** 3 +
             (T1 * T2 + T1 * T3 + T2 * T3) * p ** 2 +
             (T1 + T2 + T3) * p +
             (1 + K1 * K2 * K3))
        Re = [np.real(d) for d in D]
        Im = [np.imag(d) for d in D]
        return omega.tolist(), Re, Im

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        """Расчёт всех характеристик системы"""
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        K1 = float(params["K1"])
        K2 = float(params["K2"])
        K3 = float(params["K3"])
        T1 = float(params["T1"])
        T2 = float(params["T2"])
        T3 = float(params["T3"])
        count_of_dots = int(graph_params.get("count_of_points", 2000))
        w_end = float(graph_params.get("w_end", 100.0))

        x_ACH, y_ACH = cls.calculate_ACH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)
        x_AFCH, Re_AFCH, Im_AFCH = cls.calculate_AFCH(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)
        x_Mik, Re_Mik, Im_Mik = cls.calculate_Mikhailov(K1, K2, K3, T1, T2, T3, count_of_dots, w_end)

        return {
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"},
            "Годограф Михайлова": {"x": Re_Mik, "y": Im_Mik,
                                   "desc": f"Годограф Михайлова: K1={K1}, K2={K2}, K3={K3}, T1={T1}, T2={T2}, T3={T3}"}
        }