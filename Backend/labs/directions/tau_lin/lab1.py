# labs/directions/tau_lin/lab1.py

import numpy as np
from labs.base_lab import BaseLab


class Lab1_TAU_Lin(BaseLab):
    short = "1 ЛР"
    full = "1 ЛР: Линейные системы, пример"
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
        "ФЧХ": ("Частота, рад/с", "Фаза, °", True)
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

        return {
            "Переходная характеристика": {"x": x_PH, "y": y_PH},
            "АЧХ": {"x": x_ACH, "y": y_ACH},
            "ФЧХ": {"x": x_FCHH, "y": y_FCHH}
        }
