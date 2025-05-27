import numpy as np
from labs.base_lab import BaseLab


class Lab1_TAU_Lin(BaseLab):
    short = "1"
    full = "1 ЛР: Линейные системы"
    note = "Лабораторная работа по линейным системам"
    active_graph = "ПХ"
    default_params = {
        "K": "1.0",
        "T1": "1.0",
        "T2": "2.0",
        "t": "10",
    }
    default_graphs = {
        "ПХ": ("Время", "Амплитуда", False),
        "АЧХ": ("ω, рад/с", "дБ", True),
        "ФЧХ": ("ω, рад/с", "°", True),
        "АФЧХ": ("Re", "Im", False),
        "ЛАФЧХ (амплитуда)": ("ω, рад/с", "дБ", True),
        "ЛАФЧХ (фаза)": ("ω, рад/с", "°", True),
    }
    expected_params = ["K", "T1", "T2", "t"]

    @staticmethod
    def calculate_PH(K, T1, T2, t, count_of_dots):
        time = np.linspace(0, t, count_of_dots)
        response = K * (1 - np.exp(-time / (T1 + T2)))
        return time.tolist(), response.tolist()

    @staticmethod
    def calculate_ACH(K, T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        T_sum = T1 + T2
        amplitude = K / np.sqrt((T_sum ** 2 * omega ** 2) + 1)
        return omega.tolist(), amplitude.tolist()

    @staticmethod
    def calculate_FCHH(T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        T_sum = T1 + T2
        phase = -np.arctan(T_sum * omega)
        return omega.tolist(), phase.tolist()

    @staticmethod
    def calculate_AFCH(K, T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        T_sum = T1 + T2
        Re = K / ((T_sum ** 2 * omega ** 2) + 1)
        Im = -K * T_sum * omega / ((T_sum ** 2 * omega ** 2) + 1)
        return Re.tolist(), Im.tolist()

    @staticmethod
    def calculate_LAFCH(K, T1, T2, count_of_dots, w_end):
        omega = np.logspace(np.log10(0.001), np.log10(w_end), count_of_dots)
        T_sum = T1 + T2
        magnitude = 20 * np.log10(K / np.sqrt((T_sum ** 2 * omega ** 2) + 1))
        phase = -np.degrees(np.arctan(T_sum * omega))
        return omega.tolist(), magnitude.tolist(), phase.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        try:
            K = float(params["K"])
            T1 = float(params["T1"])
            T2 = float(params["T2"])
            t = float(params["t"])
        except ValueError as e:
            raise ValueError(f"Некорректные параметры: {e}")

        count_of_dots = int(graph_params.get("count_of_points", 500))
        w_end = float(graph_params.get("w_end", 100.0))

        x_PH, y_PH = cls.calculate_PH(K, T1, T2, t, count_of_dots)
        x_ACH, y_ACH = cls.calculate_ACH(K, T1, T2, count_of_dots, w_end)
        x_FCHH, y_FCHH = cls.calculate_FCHH(T1, T2, count_of_dots, w_end)
        Re_AFCH, Im_AFCH = cls.calculate_AFCH(K, T1, T2, count_of_dots, w_end)
        x_LAFCH, y_LAFCH_mag, y_LAFCH_phase = cls.calculate_LAFCH(K, T1, T2, count_of_dots, w_end)

        return {
            "ПХ": {"x": x_PH, "y": y_PH, "desc": f"ПХ: K={K}, T1={T1}, T2={T2}"},
            "АЧХ": {"x": x_ACH, "y": y_ACH, "desc": f"АЧХ: K={K}, T1={T1}, T2={T2}"},
            "ФЧХ": {"x": x_FCHH, "y": y_FCHH, "desc": f"ФЧХ: K={K}, T1={T1}, T2={T2}"},
            "АФЧХ": {"x": Re_AFCH, "y": Im_AFCH, "desc": f"АФЧХ: K={K}, T1={T1}, T2={T2}"},
            "ЛАФЧХ (амплитуда)": {"x": x_LAFCH, "y": y_LAFCH_mag,
                                  "desc": f"ЛАФЧХ (амплитуда): K={K}, T1={T1}, T2={T2}"},
            "ЛАФЧХ (фаза)": {"x": x_LAFCH, "y": y_LAFCH_phase, "desc": f"ЛАФЧХ (фаза): K={K}, T1={T1}, T2={T2}"},
        }
