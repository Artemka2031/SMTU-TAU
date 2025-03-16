# labs/base_lab.py

from abc import ABC, abstractmethod


class BaseLab(ABC):
    short: str = ""
    full: str = ""
    note: str = ""
    default_params: dict = {}
    default_graphs: dict = {}
    active_graph: str = ""
    # Список параметров, обязательных для расчёта.
    expected_params: list = []

    @classmethod
    @abstractmethod
    def calculate_all_functions(cls, params: dict, graph_params: dict) -> dict:
        """
        Метод должен вернуть словарь с данными для каждого графика.
        """
        pass
