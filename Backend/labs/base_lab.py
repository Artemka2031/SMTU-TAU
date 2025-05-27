from abc import ABC, abstractmethod
from typing import Dict, Optional


class BaseLab(ABC):
    short: str = ""
    full: str = ""
    note: str = ""
    default_params: Dict[str, str] = {}
    default_graphs: Dict[str, tuple] = {}
    active_graph: str = ""
    expected_params: list = []
    nonlinearities: Dict[str, callable] = {}  # Only for nonlinear labs

    @classmethod
    @abstractmethod
    def calculate_all_functions(cls, params: Dict[str, str], graph_params: Dict[str, float],
                                nonlinearity: Optional[str] = None) -> Dict:
        """
        Returns a dictionary with data for each graph.
        For nonlinear labs, 'nonlinearity' specifies the nonlinearity to apply.
        graph_params includes 'w_end' and 'count_of_points' for frequency-based graphs.
        """
        pass
