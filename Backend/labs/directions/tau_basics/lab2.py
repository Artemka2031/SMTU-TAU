import numpy as np
from labs.base_lab import BaseLab


class Lab2_TAU_Basics(BaseLab):
    short = "2"
    full = "2 ЛР: Основы автоматизации"
    note = "2 лабораторная работа"
    active_graph = "μ(t)"

    default_params = {
        "μ0": "0.0",
        "μ̇0": "0.0",
        "φ0": "0.0",
        "Tr": "1.0",
        "Tk": "1.0",
        "t": "10.0",
    }

    default_graphs = {
        "μ(t)": ("Время", "μ", False),
        "dμ/dt": ("Время", "dμ/dt", False),
    }

    expected_params = ["μ0", "μ̇0", "φ0", "Tr", "Tk", "t"]

    @staticmethod
    def _calc_mu_series(mu0, mudot0, phi0, Tr, Tk, t_max, count_of_dots):
        time = np.linspace(0.0, t_max, count_of_dots)
        a = Tk / (Tr ** 2)
        coef = (Tr ** 2) / Tk
        mu_t = mu0 + coef * (mudot0 + phi0 / Tk) * (1.0 - np.exp(-a * time)) + (phi0 / Tk) * time
        dmu_dt = (mudot0 + phi0 / Tk) * np.exp(-a * time) + (phi0 / Tk)
        return time.tolist(), mu_t.tolist(), dmu_dt.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        mu0 = float(params["μ0"])     # μ_o
        mudot0 = float(params["μ̇0"])  # μ̇_o
        phi0 = float(params["φ0"])    # φ_o
        Tr = float(params["Tr"])      # T_r
        Tk = float(params["Tk"])      # T_k
        t_max = float(params["t"])    # верхняя граница времени

        count_of_dots = int(graph_params.get("count_of_points", 2000))

        x, mu_series, dmu_series = cls._calc_mu_series(mu0, mudot0, phi0, Tr, Tk, t_max, count_of_dots)

        return {
            "μ(t)": {"x": x, "y": mu_series, "desc": f"μ(t): μ0={mu0}, μ̇0={mudot0}, φ0={phi0}, Tr={Tr}, Tk={Tk}"},
            "dμ/dt": {"x": x, "y": dmu_series, "desc": f"dμ/dt: μ0={mu0}, μ̇0={mudot0}, φ0={phi0}, Tr={Tr}, Tk={Tk}"},
        }


