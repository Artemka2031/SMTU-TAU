import numpy as np
from labs.base_lab import BaseLab


class Lab3_TAU_Basics(BaseLab):
    short = "3"
    full = "3 ЛР: Основы автоматизации"
    note = "3 лабораторная работа"
    active_graph = "μ(t)"

    # Параметры: начальные условия и коэффициенты уравнения
    # Характеристическое уравнение: Tr^2 * λ^2 + Tk * λ + γ = 0
    # φ(t) = φ0 (постоянное)
    default_params = {
        "μ0": "0.0",
        "μ̇0": "0.0",
        "φ0": "0.0",
        "Tr": "1.0",
        "Tk": "1.0",
        "γ": "1.0",
        "t": "10.0",
    }

    default_graphs = {
        "μ(t)": ("Время", "μ", False),
        "dμ/dt": ("Время", "dμ/dt", False),
        "ФП": ("μ", "dμ/dt", False),
    }

    expected_params = ["μ0", "μ̇0", "φ0", "Tr", "Tk", "γ", "t"]

    @staticmethod
    def _mu_and_derivative(mu0: float, mudot0: float, phi0: float, Tr: float, Tk: float, gamma: float,
                           t_max: float, count_of_dots: int):
        time = np.linspace(0.0, t_max, count_of_dots)

        # Дискриминант характеристического уравнения
        D = Tk ** 2 - 4.0 * (Tr ** 2) * gamma

        if D >= 0.0:
            # Две вещественные корня λ1, λ2
            sqrtD = np.sqrt(D)
            denom = 2.0 * (Tr ** 2)
            lam1 = (-Tk + sqrtD) / denom
            lam2 = (-Tk - sqrtD) / denom

            # Константная составляющая решения
            c = phi0 / gamma if gamma != 0.0 else 0.0

            # Коэффициенты перед экспонентами из условий μ(0)=μ0, μ'(0)=μ̇0
            # Используем удобную запись через систему линейных уравнений для A и B:
            # μ(0) = A + B + c = μ0
            # μ'(0) = A*lam1 + B*lam2 = μ̇0
            A, B = np.linalg.solve(
                np.array([[1.0, 1.0], [lam1, lam2]], dtype=float),
                np.array([mu0 - c, mudot0], dtype=float),
            )

            mu_t = A * np.exp(lam1 * time) + B * np.exp(lam2 * time) + c
            dmu_dt = A * lam1 * np.exp(lam1 * time) + B * lam2 * np.exp(lam2 * time)

        else:
            # Комплексно-сопряжённые корни: λ = β ± jω
            beta = -Tk / (2.0 * (Tr ** 2))
            omega = np.sqrt(4.0 * (Tr ** 2) * gamma - Tk ** 2) / (2.0 * (Tr ** 2))

            c = phi0 / gamma if gamma != 0.0 else 0.0

            C1 = (mu0 + c)
            C2 = (mudot0 - beta * mu0 - beta * c) / omega if omega != 0.0 else 0.0

            exp_bt = np.exp(beta * time)
            cos_wt = np.cos(omega * time)
            sin_wt = np.sin(omega * time)

            mu_t = exp_bt * (C1 * cos_wt + C2 * sin_wt) + c
            dmu_dt = exp_bt * (
                (-beta * C1 + omega * C2) * cos_wt +
                (-beta * C2 - omega * C1) * sin_wt
            )

        return time.tolist(), mu_t.tolist(), dmu_dt.tolist()

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        mu0 = float(params["μ0"])     # μ(0)
        mudot0 = float(params["μ̇0"])  # μ̇(0)
        phi0 = float(params["φ0"])    # φ0
        Tr = float(params["Tr"])      # Tr
        Tk = float(params["Tk"])      # Tk
        gamma = float(params["γ"])    # γ
        t_max = float(params["t"])    # длительность

        count_of_dots = int(graph_params.get("count_of_points", 2000))

        t, mu_series, dmu_series = cls._mu_and_derivative(mu0, mudot0, phi0, Tr, Tk, gamma, t_max, count_of_dots)

        # Фазовый портрет: dμ/dt(μ)
        fp_x = mu_series
        fp_y = dmu_series

        return {
            "μ(t)": {"x": t, "y": mu_series, "desc": f"μ(t): μ0={mu0}, μ̇0={mudot0}, φ0={phi0}, Tr={Tr}, Tk={Tk}, γ={gamma}"},
            "dμ/dt": {"x": t, "y": dmu_series, "desc": f"dμ/dt: μ0={mu0}, μ̇0={mudot0}, φ0={phi0}, Tr={Tr}, Tk={Tk}, γ={gamma}"},
            "ФП": {"x": fp_x, "y": fp_y, "desc": "Фазовый портрет dμ/dt(μ)"},
        }


