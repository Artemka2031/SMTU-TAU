# labs/directions/__init__.py

from .tau_lin import DIRECTION_CONFIG as TAU_LIN_CONFIG
from .tau_nolin import DIRECTION_CONFIG as TAU_NELIN_CONFIG
from .TDZ import DIRECTION_CONFIG as TDZ_CONFIG

DIRECTIONS_CONFIG = [
    # OA_CONFIG,
    TAU_LIN_CONFIG,
    TAU_NELIN_CONFIG,
    TDZ_CONFIG,
]
