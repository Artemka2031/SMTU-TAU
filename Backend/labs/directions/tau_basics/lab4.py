import numpy as np
from labs.base_lab import BaseLab


class Lab4_TAU_Basics(BaseLab):
    short = "4"
    full = "4 ЛР: Основы автоматизации"
    note = "4 лабораторная работа"
    active_graph = "μ(t)"

    # Модель:
    #   Tr^2 Ta μ¨ + (Tr^2 Θ + Tk Ta) μ˙ + Tk Θ μ = f         (4.3)
    #   φ'(t) = -(Θ/Ta) φ + (1/Ta)(μ - f)                     (из (4.2) при ḟ=0)
    # Параметры и начусловия
    default_params = {
        "μ0": "0.0",
        "μ̇0": "0.0",
        "φ0": "0.0",
        "Tr": "1.0",
        "Ta": "1.0",
        "Tk": "1.0",
        "Θ": "1.0",
        "f": "0.0",
        "t": "10.0",
    }

    default_graphs = {
        "μ(t)": ("Время", "μ", False),
        "φ(t)": ("Время", "φ", False),
        "ε(t)": ("Время", "ε", False),
        "ФП μ": ("μ", "dμ/dt", False),
        "ФП φ": ("φ", "dφ/dt", False),
    }

    expected_params = ["μ0", "μ̇0", "φ0", "Tr", "Ta", "Tk", "Θ", "f", "t"]

    @staticmethod
    def _solve_mu_series(mu0: float, mudot0: float, Tr: float, Ta: float, Tk: float, Theta: float,
                         f: float, t_max: float, count_of_dots: int):
        time = np.linspace(0.0, t_max, count_of_dots)

        a = (Tr ** 2) * Ta
        b = (Tr ** 2) * Theta + Tk * Ta
        c = Tk * Theta

        # Частное решение при постоянном f
        mu_p = f / c if c != 0.0 else 0.0

        # Дискриминант для однородного решения
        D = b ** 2 - 4.0 * a * c
        if a == 0.0:
            # Вырожденный случай: переходим к упрощенному уравнению первого порядка
            lam = -c / b if b != 0.0 else 0.0
            A = mu0 - mu_p
            mu_t = A * np.exp(lam * time) + mu_p
            dmu_dt = lam * A * np.exp(lam * time)
            return time, mu_t, dmu_dt

        eps = 1e-12
        if D > eps:
            sqrtD = np.sqrt(D)
            lam1 = (-b + sqrtD) / (2.0 * a)
            lam2 = (-b - sqrtD) / (2.0 * a)

            # Система для коэффициентов A, B: μ(0)=A+B+μ_p, μ'(0)=A λ1 + B λ2
            A, B = np.linalg.solve(
                np.array([[1.0, 1.0], [lam1, lam2]], dtype=float),
                np.array([mu0 - mu_p, mudot0], dtype=float),
            )
            e1 = np.exp(lam1 * time)
            e2 = np.exp(lam2 * time)
            mu_t = A * e1 + B * e2 + mu_p
            dmu_dt = A * lam1 * e1 + B * lam2 * e2
        elif abs(D) <= eps:
            # Кратный корень λ, решение: (A + B t) e^{λ t} + μ_p
            lam = -b / (2.0 * a)
            A = mu0 - mu_p
            B = mudot0 - lam * A
            e = np.exp(lam * time)
            mu_t = (A + B * time) * e + mu_p
            dmu_dt = (B + lam * (A + B * time)) * e
        else:
            beta = -b / (2.0 * a)
            omega = np.sqrt(-D) / (2.0 * a)
            C1 = mu0 - mu_p
            C2 = (mudot0 - beta * C1) / omega if omega != 0.0 else 0.0
            exp_bt = np.exp(beta * time)
            cos_wt = np.cos(omega * time)
            sin_wt = np.sin(omega * time)
            mu_t = exp_bt * (C1 * cos_wt + C2 * sin_wt) + mu_p
            dmu_dt = exp_bt * ((-beta * C1 + omega * C2) * cos_wt + (-beta * C2 - omega * C1) * sin_wt)

        return time, mu_t, dmu_dt

    @staticmethod
    def _solve_phi_from_mu(phi0: float, Ta: float, Theta: float, f: float,
                           t: np.ndarray, mu_t: np.ndarray):
        # Корректная динамика из уравнения двигателя: Ta·φ' + Θ·φ = -μ - f
        # => φ'(t) = ( - μ(t) - f - Θ·φ(t) ) / Ta
        if len(t) < 2:
            return np.array([0.0]), np.array([phi0])
        dt = t[1] - t[0]
        phi = np.zeros_like(t)
        phi[0] = phi0
        inv_Ta = 1.0 / Ta
        coef_theta = Theta
        for i in range(1, len(t)):
            dphi = inv_Ta * ( - mu_t[i - 1] - f - coef_theta * phi[i - 1] )
            phi[i] = phi[i - 1] + dt * dphi
        # Производная по формуле напрямую
        dphi_dt = inv_Ta * ( - mu_t - f - coef_theta * phi )
        return dphi_dt, phi

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        mu0 = float(params["μ0"])     # μ(0)
        mudot0 = float(params["μ̇0"])  # μ̇(0)
        phi0 = float(params["φ0"])    # φ(0)
        Tr = float(params["Tr"])      # Tr
        Ta = float(params["Ta"])      # Ta
        Tk = float(params["Tk"])      # Tk
        Theta = float(params["Θ"])    # Θ
        f = float(params["f"])        # f (константа)
        t_max = float(params["t"])    # длительность

        count_of_dots = int(graph_params.get("count_of_points", 2000))

        t, mu_series, dmu_series = cls._solve_mu_series(mu0, mudot0, Tr, Ta, Tk, Theta, f, t_max, count_of_dots)
        dphi_series, phi_series = cls._solve_phi_from_mu(phi0, Ta, Theta, f, t, mu_series)

        # ε(t) = -(1/Ta) * φ(t) - μ(t)
        epsilon = -(1.0 / Ta) * phi_series - mu_series

        return {
            "μ(t)": {"x": t.tolist(), "y": mu_series.tolist(), "desc": f"μ(t): μ0={mu0}, μ̇0={mudot0}, Tr={Tr}, Ta={Ta}, Tk={Tk}, Θ={Theta}, f={f}"},
            "φ(t)": {"x": t.tolist(), "y": phi_series.tolist(), "desc": f"φ(t): φ0={phi0}, Tr={Tr}, Ta={Ta}, Tk={Tk}, Θ={Theta}, f={f}"},
            "ε(t)": {"x": t.tolist(), "y": epsilon.tolist(), "desc": "ε(t) = -(1/Ta)·φ(t) - μ(t)"},
            "ФП μ": {"x": mu_series.tolist(), "y": dmu_series.tolist(), "desc": "Фазовый портрет dμ/dt(μ)"},
            "ФП φ": {"x": phi_series.tolist(), "y": dphi_series.tolist(), "desc": "Фазовый портрет dφ/dt(φ)"},
        }