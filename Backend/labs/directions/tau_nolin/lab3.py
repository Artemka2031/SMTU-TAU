import numpy as np

from labs.base_lab import BaseLab
from labs.directions.tau_nolin.nonlinearities import two_pose_rele, three_pose_rele, amplifier_with_saturation, amplifier_with_insensitivity, amplifier_with_saturation_and_insensitivity, rele_with_histeresis, luft, rele_with_insensetivity_and_hysteresis


class Lab3_TAU_NoLin(BaseLab):
    short = "3"
    full = "3 ЛР: Нелинейные системы"
    note = "Лабораторная работа по нелинейным системам 3. Параметр φ0 менять в пределах от 0 до 9"
    active_graph = "x(t)"

    default_params = {
        "δ": "0.2",
        "Ts": "0.1",
        "Ta": "0.5",
        "θ": "0.1",
        "φ0": "0.0",
        "μ0": "0.0",
        "z": "1",
        "a": "1",
        "b": "1.5",
        "c": "0",
        "K": "0",
        "t": "25"
    }

    default_graphs = {
        "x(t)": ("Время", "Амплитуда", False),
        "Fx(t)": ("Время", "Амплитуда", False),
        "x'(x)": ("x", "x'", False),
        "φ(t)": ("Время", "Амплитуда", False),
        "φ'(φ)": ("φ", "φ'", False),
        "μ(t)": ("Время", "Амплитуда", False),
        "nonlinearity": ("x", "F(x)", False),
    }
    expected_params = ["δ", "Ts", "Ta", "θ", "φ0", "μ0", "z", "a", "b", "c", "K", "t"]

    nonlinearities = {
        "Реле с гистерезисом": lambda x, dx_dt, a, b, c, K: rele_with_histeresis(x, dx_dt, a, b),
    }

    @classmethod
    def _calculate_euler(cls, params, count_of_dots, nl_func, nl_name):
        t_max = float(params["t"])
        Ta = float(params["Ta"])
        Ts = float(params["Ts"])
        theta = float(params["θ"])
        delta = float(params["δ"])
        a = float(params["a"])
        b = float(params["b"])
        c = float(params["c"])
        K = float(params["K"])
        z = float(params["z"])
        phi0 = float(params["φ0"])
        mu0 = float(params["μ0"])

        dt = t_max / count_of_dots
        t = [i * dt for i in range(count_of_dots)]

        phi = phi0
        mu = mu0

        phi_values = np.zeros(count_of_dots)
        mu_values = np.zeros(count_of_dots)
        x_values = np.zeros(count_of_dots)
        Fx_values = np.zeros(count_of_dots)
        dx_dt_values = np.zeros(count_of_dots)
        d_phi_dt_values = np.zeros(count_of_dots)
        z_values = np.zeros(count_of_dots)

        for i in range(count_of_dots):
            z_values[i] = z
            phi_values[i] = phi
            mu_values[i] = mu
            x = phi - delta * mu
            x_values[i] = x

            d_phi_dt = (1 / Ta) * (z - theta * phi - mu)
            d_phi_dt_values[i] = d_phi_dt
            d_mu_dt = (Fx_values[i - 1] / Ts if i > 0 else 0.0)
            dx_dt = d_phi_dt - delta * d_mu_dt
            Fx_values[i] = nl_func(x, dx_dt, a, b, c, K)
            d_mu_dt = Fx_values[i] / Ts
            dx_dt_values[i] = d_phi_dt - delta * d_mu_dt

            phi = phi + dt * d_phi_dt
            mu = mu + dt * d_mu_dt

            if np.isnan(phi) or np.isinf(phi):
                phi = 0.0
            if np.isnan(mu) or np.isinf(mu):
                mu = 0.0

        x_range = np.linspace(min(x_values) - 1, max(x_values) + 1, 1000)
        Fx_range = [nl_func(x, 0.0, a, b, c, K) for x in x_range]

        return {
            "t": t,
            "z_values": z_values,
            "phi_values": phi_values,
            "x_values": x_values,
            "Fx_values": Fx_values,
            "dx_dt_values": dx_dt_values,
            "d_phi_dt_values": d_phi_dt_values,
            "mu_values": mu_values,
            "x_range": x_range,
            "Fx_range": Fx_range,
        }

    @classmethod
    def plot_phi_t(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)
        return {"x": data["t"], "y": data["phi_values"], "desc": f"Выходной сигнал φ(t) для {nl_name}"}

    @classmethod
    def plot_mu_t(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)
        return {"x": data["t"], "y": data["mu_values"], "desc": f"Выходной сигнал регулятора μ(t) для {nl_name}"}

    @classmethod
    def plot_x_t(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)
        return {"x": data["t"], "y": data["x_values"], "desc": f"Входное воздействие x(t) для {nl_name}"}

    @classmethod
    def plot_Fx_t(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)
        return {"x": data["t"], "y": data["Fx_values"], "desc": f"Выходное воздействие F(x)(t) для {nl_name}"}

    @classmethod
    def plot_phase(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)
        return {"x": data["x_values"], "y": data["dx_dt_values"], "desc": f"Фазовый портрет x'(x) для {nl_name}"}

    @classmethod
    def plot_phase_phi(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)
        return {"x": data["phi_values"], "y": data["d_phi_dt_values"], "desc": f"Фазовый портрет φ'(φ) для {nl_name}"}

    @classmethod
    def plot_nonlinearity(cls, params, graph_params, nl_name):
        count_of_dots = int(graph_params.get("count_of_points", 10000))
        nl_func = cls.nonlinearities[nl_name]
        data = cls._calculate_euler(params, count_of_dots, nl_func, nl_name)

        a = float(params["a"])
        b = float(params["b"])
        c = float(params["c"])
        K = float(params["K"])

        x_range = np.linspace(min(data["x_values"]) - 1, max(data["x_values"]) + 1, 1000)

        if nl_name in ["Реле с гистерезисом", "Люфт", "Реле с зоной нечувствительности и гистерезисом"]:
            x_range_full = []
            y_range_full = []

            x_range_pos = np.linspace(min(x_range), max(x_range), 500)
            y_range_pos = [nl_func(x, 1.0, a, b, c, K) for x in x_range_pos]

            x_range_neg = np.linspace(max(x_range), min(x_range), 500)
            y_range_neg = [nl_func(x, -1.0, a, b, c, K) for x in x_range_neg]

            x_range_full.extend(x_range_pos)
            x_range_full.extend(x_range_neg)
            y_range_full.extend(y_range_pos)
            y_range_full.extend(y_range_neg)

            return {
                "x": x_range_full,
                "y": y_range_full,
                "desc": f"Характеристика нелинейности F(x) для {nl_name} (гистерезис)"
            }
        else:
            y_range = [nl_func(x, 0.0, a, b, c, K) for x in x_range]
            return {
                "x": x_range,
                "y": y_range,
                "desc": f"Характеристика нелинейности F(x) для {nl_name}"
            }

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        try:
            t_max = float(params["t"])
            Ta = float(params["Ta"])
            Ts = float(params["Ts"])
            theta = float(params["θ"])
            delta = float(params["δ"])
            a = float(params["a"])
            b = float(params["b"])
            c = float(params["c"])
            K = float(params["K"])
            z = float(params["z"])
            phi0 = float(params["φ0"])
            mu0 = float(params["μ0"])
        except ValueError as e:
            raise ValueError(f"Некорректные параметры: {e}")

        result = {}
        if nonlinearity:
            nl_names = [nonlinearity]
        else:
            nl_names = cls.nonlinearities.keys()

        for nl_name in nl_names:
            phi_t_data = cls.plot_phi_t(params, graph_params, nl_name)
            result[f"φ(t)_{nl_name}"] = {
                "x": phi_t_data["x"],
                "y": phi_t_data["y"],
                "desc": phi_t_data["desc"],
            }

            mu_t_data = cls.plot_mu_t(params, graph_params, nl_name)
            result[f"μ(t)_{nl_name}"] = {
                "x": mu_t_data["x"],
                "y": mu_t_data["y"],
                "desc": mu_t_data["desc"],
            }

            x_t_data = cls.plot_x_t(params, graph_params, nl_name)
            result[f"x(t)_{nl_name}"] = {
                "x": x_t_data["x"],
                "y": x_t_data["y"],
                "desc": x_t_data["desc"],
            }

            Fx_t_data = cls.plot_Fx_t(params, graph_params, nl_name)
            result[f"Fx(t)_{nl_name}"] = {
                "x": Fx_t_data["x"],
                "y": Fx_t_data["y"],
                "desc": Fx_t_data["desc"],
            }

            phase_data = cls.plot_phase(params, graph_params, nl_name)
            result[f"x'(x)_{nl_name}"] = {
                "x": phase_data["x"],
                "y": phase_data["y"],
                "desc": phase_data["desc"],
            }

            phase_phi_data = cls.plot_phase_phi(params, graph_params, nl_name)
            result[f"φ'(φ)_{nl_name}"] = {
                "x": phase_phi_data["x"],
                "y": phase_phi_data["y"],
                "desc": phase_phi_data["desc"],
            }

            nonlinearity_data = cls.plot_nonlinearity(params, graph_params, nl_name)
            result[f"nonlinearity_{nl_name}"] = {
                "x": nonlinearity_data["x"],
                "y": nonlinearity_data["y"],
                "desc": nonlinearity_data["desc"],
            }

        return result