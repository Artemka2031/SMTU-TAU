# labs/directions/tau_lin/lab1.py

import numpy as np
from labs.base_lab import BaseLab


# ==============================
# Лабораторная работа 1:
# Дифференцирующее звено с замедлением
# ==============================
class Lab1_TAU_Lin(BaseLab):
    short = "1 ЛР"
    full = "1 ЛР: Линейные системы"
    note = "Примечание для 1 ЛР (Лин)"
    active_graph = "ПХ"

    default_params = {
        "K": "3.0",
        "Xm": "4.0",
        "T": "2.0",
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
    expected_params = ["K", "Xm", "T", "t"]

    @staticmethod
    def calculate_PH(K, Xm, T, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = (K * Xm / T) * np.exp(-time / T)
        return time.tolist(), response.tolist()

    @staticmethod
    def calculate_ACH(K, T, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        amplitude = (K * omega) / np.sqrt(T ** 2 * omega ** 2 + 1)
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_FCHH(T, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        phase = np.arctan(1 / (T * omega))
        return omega.tolist(), phase.tolist()

    @staticmethod
    def calculate_AFCH(K, T, count_of_dots, w_end):
        """
        Вычисляет АФЧХ: возвращает кортеж (Re(ω), Im(ω)).
        """
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        Re = (K * T ** 2 * omega ** 2) / (T ** 2 * omega ** 2 + 1)
        Im = (K * omega) / (T ** 2 * omega ** 2 + 1)
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K, T, count_of_dots, w_end):
        """
        Вычисляет ЛАФЧХ: возвращает (ω, magnitude, phase).
        Нормировка амплитуды производится так, чтобы асимптота при ω→∞ равнялась 0 дБ.
        Фаза рассчитывается так, что при ω→∞ получается -180°.
        """
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        magnitude = 20 * np.log10((K * omega) / np.sqrt(1 + (T * omega) ** 2))
        # Нормировка: вычитаем значение асимптоты
        magnitude -= 20 * np.log10(K / T)
        phase = 90 - np.degrees(np.arctan(T * omega))
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict) -> dict:
        # Проверяем, что переданы все необходимые параметры
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        K = float(params["K"])
        Xm = float(params["Xm"])
        T = float(params["T"])
        t = float(params["t"])
        count_of_dots = int(graph_params.get("count_of_points", 500))
        w_end = float(graph_params.get("w_end", 100.0))

        x_PH, y_PH = cls.calculate_PH(K, Xm, T, t, count_of_dots)
        x_ACH, y_ACH = cls.calculate_ACH(K, T, count_of_dots, w_end)
        x_FCHH, y_FCHH = cls.calculate_FCHH(T, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K, T, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K, T, count_of_dots, w_end)

        return {
            "ПХ": {"x": x_PH, "y": y_PH, "desc": f"ПХ: K={K}, Xm={Xm}, T={T}"},
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K={K}, Xm={Xm}, T={T}"},
            "ФЧХ": {"x": x_FCHH, "y": y_FCHH, "desc": f"ФЧХ: T={T}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K={K}, T={T}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag, "desc": f"ЛАФЧХ (амплитуда): K={K}, T={T}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase, "desc": f"ЛАФЧХ (фаза): K={K}, T={T}"}
        }
