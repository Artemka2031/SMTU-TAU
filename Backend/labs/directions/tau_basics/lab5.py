import numpy as np
from labs.base_lab import BaseLab


class Lab5_TAU_Basics(BaseLab):
    short = "5"
    full = "5 ЛР: Основы автоматизации"
    note = "5 лабораторная работа"
    active_graph = "μ(t)"

    default_params = {
        "μ0": "0.0",
        "μ̇0": "0.0",
        "φ0": "0.0",
        "Tr": "1.0",
        "Tk": "1.0",
        "Ta": "1.0",
        "Θ": "1.0",
        "γ": "1.0",
        "f": "0.0",
        "t": "10.0",
    }

    default_graphs = {
        "μ(t)": ("Время", "μ", False),
        "φ(t)": ("Время", "φ", False),
        "ε(t)": ("Время", "ε", False),
        "ФП μ": ("μ", "μ̇", False),
        "ФП φ": ("φ", "φ̇", False),
    }

    expected_params = ["μ0", "μ̇0", "φ0", "Tr", "Tk", "Ta", "Θ", "γ", "f", "t"]

    @staticmethod
    def _integrate_system(mu0: float, mudot0: float, phi0: float,
                          Tr: float, Tk: float, Ta: float, Theta: float, gamma: float,
                          f: float, t_max: float, count_of_dots: int):
        # Состояния: x1 = μ, x2 = μ˙, x3 = φ
        t = np.linspace(0.0, t_max, count_of_dots)
        dt = t[1] - t[0] if count_of_dots > 1 else t_max

        mu = np.zeros(count_of_dots)
        mudot = np.zeros(count_of_dots)
        phi = np.zeros(count_of_dots)
        phidot = np.zeros(count_of_dots)

        mu[0] = mu0
        mudot[0] = mudot0
        phi[0] = phi0
        phidot[0] = (-mu0 - f - Theta * phi0) / Ta

        def dynamics(x_mu, x_mudot, x_phi):
            # μ¨ = (φ - Tk μ˙ - γ μ) / Tr^2
            mu_ddot = (x_phi - Tk * x_mudot - gamma * x_mu) / (Tr ** 2)
            # φ̇ = ( - μ - f - Θ φ ) / Ta
            phi_dot = (-x_mu - f - Theta * x_phi) / Ta
            return mu_ddot, phi_dot

        # Простая схема РК4
        for i in range(1, count_of_dots):
            x_mu = mu[i - 1]
            x_mudot = mudot[i - 1]
            x_phi = phi[i - 1]

            def f_state(mu_val, mudot_val, phi_val):
                mu_ddot, phi_dot = dynamics(mu_val, mudot_val, phi_val)
                return mudot_val, mu_ddot, phi_dot

            k1_mu, k1_mudot, k1_phidot = f_state(x_mu, x_mudot, x_phi)
            k2_mu, k2_mudot, k2_phidot = f_state(
                x_mu + 0.5 * dt * k1_mu,
                x_mudot + 0.5 * dt * k1_mudot,
                x_phi + 0.5 * dt * k1_phidot,
            )
            k3_mu, k3_mudot, k3_phidot = f_state(
                x_mu + 0.5 * dt * k2_mu,
                x_mudot + 0.5 * dt * k2_mudot,
                x_phi + 0.5 * dt * k2_phidot,
            )
            k4_mu, k4_mudot, k4_phidot = f_state(
                x_mu + dt * k3_mu,
                x_mudot + dt * k3_mudot,
                x_phi + dt * k3_phidot,
            )

            mu[i] = x_mu + (dt / 6.0) * (k1_mu + 2 * k2_mu + 2 * k3_mu + k4_mu)
            mudot[i] = x_mudot + (dt / 6.0) * (k1_mudot + 2 * k2_mudot + 2 * k3_mudot + k4_mudot)
            phi[i] = x_phi + (dt / 6.0) * (k1_phidot + 2 * k2_phidot + 2 * k3_phidot + k4_phidot)
            phidot[i] = (-mu[i] - f - Theta * phi[i]) / Ta

        return t, mu, mudot, phi, phidot

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")

        mu0 = float(params["μ0"])     # μ(0)
        mudot0 = float(params["μ̇0"])  # μ̇(0)
        phi0 = float(params["φ0"])    # φ(0)
        Tr = float(params["Tr"])      # Tr
        Tk = float(params["Tk"])      # Tk
        Ta = float(params["Ta"])      # Ta
        Theta = float(params["Θ"])    # Θ
        gamma = float(params["γ"])    # γ
        f = float(params["f"])        # f
        t_max = float(params["t"])    # длительность

        count_of_dots = int(graph_params.get("count_of_points", 2000))

        t, mu, mudot, phi, phidot = cls._integrate_system(
            mu0, mudot0, phi0, Tr, Tk, Ta, Theta, gamma, f, t_max, count_of_dots
        )

        epsilon = -(1.0 / Ta) * phi - mu

        return {
            "μ(t)": {"x": t.tolist(), "y": mu.tolist(), "desc": f"μ(t): Tr={Tr}, Tk={Tk}, Ta={Ta}, Θ={Theta}, γ={gamma}, f={f}"},
            "φ(t)": {"x": t.tolist(), "y": phi.tolist(), "desc": f"φ(t): Tr={Tr}, Tk={Tk}, Ta={Ta}, Θ={Theta}, γ={gamma}, f={f}"},
            "ε(t)": {"x": t.tolist(), "y": epsilon.tolist(), "desc": "ε(t) = -(1/Ta)·φ(t) - μ(t)"},
            "ФП μ": {"x": mu.tolist(), "y": mudot.tolist(), "desc": "Фазовый портрет μ̇(μ)"},
            "ФП φ": {"x": phi.tolist(), "y": phidot.tolist(), "desc": "Фазовый портрет φ̇(φ)"},
        }


