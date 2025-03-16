# labs/directions/__init__.py

from labs.directions.oa import DIRECTION_CONFIG as OA_CONFIG
from labs.directions.tau_lin import DIRECTION_CONFIG as TAU_LIN_CONFIG
from labs.directions.tau_nelin import DIRECTION_CONFIG as TAU_NELIN_CONFIG
from labs.directions.tdz import DIRECTION_CONFIG as TDZ_CONFIG

DIRECTIONS_CONFIG = [
    OA_CONFIG,
    TAU_LIN_CONFIG,
    TAU_NELIN_CONFIG,
    TDZ_CONFIG,
]
