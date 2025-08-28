# labs/directions/__init__.py

from .tau_lin import DIRECTION_CONFIG as TAU_LIN_CONFIG
from .tau_nolin import DIRECTION_CONFIG as TAU_NELIN_CONFIG
from .TDZ import DIRECTION_CONFIG as TDZ_CONFIG
from .tau_basics import DIRECTION_CONFIG as TAU_BASICS_CONFIG

DIRECTIONS_CONFIG = [
    TAU_BASICS_CONFIG,
    TAU_LIN_CONFIG,
    TAU_NELIN_CONFIG,
    TDZ_CONFIG,
]
