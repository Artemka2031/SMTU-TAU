import numpy as np
from labs.base_lab import BaseLab


class Lab1_TAU_Basics(BaseLab):
    short = "1"
    full = "1 ЛР: Основы автоматизации"
    note = "1 лабораторная работа"
    active_graph = "φ(t)"

    # Параметры по умолчанию. Все значения приходят строками с фронта
    default_params = {
        "θ": "0.1",
        "Ta": "1.0",
        "φ0": "0.0",
        "μ": "1.0",
        "f": "0.0",
        "t": "10.0",
    }

    # Конфигурация доступных графиков: имя -> (подпись X, подпись Y, логарифмическая ось X)
    default_graphs = {
        "φ(t)": ("Время", "φ", False),
    }

    expected_params = ["θ", "Ta", "φ0", "μ", "f", "t"]

    @staticmethod
    def _integrate_phi(theta, Ta, phi0, mu, f, t_max, count_of_dots):
        time = np.linspace(0.0, t_max, count_of_dots)
        dt = time[1] - time[0] if count_of_dots > 1 else t_max

        phi_values = np.zeros(count_of_dots)
        phi = phi0

        for i in range(count_of_dots):
            phi_values[i] = phi
            dphi_dt = -(theta / Ta) * phi + (1.0 / Ta) * mu - (1.0 / Ta) * f
            phi = phi + dt * dphi_dt

        return time.tolist(), phi_values.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        theta = float(params["θ"])  # коэффициент при φ
        Ta = float(params["Ta"])     # постоянная времени
        phi0 = float(params["φ0"])   # начальное значение φ(0)
        mu = float(params["μ"])      # управляющее воздействие (постоянное)
        f = float(params["f"])       # возмущение (постоянное)
        t_max = float(params["t"])   # конец интервала моделирования

        count_of_dots = int(graph_params.get("count_of_points", 2000))

        x_phi, y_phi = cls._integrate_phi(theta, Ta, phi0, mu, f, t_max, count_of_dots)

        return {
            "φ(t)": {
                "x": x_phi,
                "y": y_phi,
                "desc": f"φ(t): θ={theta}, Ta={Ta}, φ0={phi0}, μ={mu}, f={f}",
            }
        }


