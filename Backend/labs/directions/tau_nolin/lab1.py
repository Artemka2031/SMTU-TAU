from labs.base_lab import BaseLab


class Lab1_TAU_NoLin(BaseLab):
    short = "1"
    full = "1 ЛР: Нелинейные системы"
    note = "Лабораторная работа по нелинейным системам"
    active_graph = "Тест"
    default_params = {
        "K": "3.0",
        "Xm": "4.0",
        "T": "2.0",
        "t": "25",
    }
    default_graphs = {
        f"Тест_НЛ{i}": ("Время", "Амплитуда", False) for i in range(1, 9)
    }
    expected_params = ["K", "Xm", "T", "t"]
    nonlinearities = {
        "НЛ1": lambda x: x,
        "НЛ2": lambda x: 2.0,
        "НЛ3": lambda x: x ** 2,
        "НЛ4": lambda x: -x,
        "НЛ5": lambda x: x ** 3,
        "НЛ6": lambda x: 1.0 if x > 0 else -1.0,
        "НЛ7": lambda x: x if x > 0 else 0,
        "НЛ8": lambda x: abs(x),
    }

    @classmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict, nonlinearity: str = None) -> dict:
        missing = [key for key in cls.expected_params if key not in params]
        if missing:
            raise ValueError(f"Отсутствуют параметры: {missing}")
        try:
            K = float(params["K"])
            Xm = float(params["Xm"])
            T = float(params["T"])
            t_max = float(params["t"])
        except ValueError as e:
            raise ValueError(f"Некорректные параметры: {e}")

        count_of_dots = int(graph_params.get("count_of_points", 500))
        t = [i * t_max / count_of_dots for i in range(count_of_dots)]

        result = {}
        for nl_name, nl_func in cls.nonlinearities.items():
            y = [nl_func(Xm * K * (1 - (i / T))) for i in t]
            result[f"Тест_{nl_name}"] = {
                "x": t,
                "y": y,
                "desc": f"График для нелинейности {nl_name}",
            }

        return result
