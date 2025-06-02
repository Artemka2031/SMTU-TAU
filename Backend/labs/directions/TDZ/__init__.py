from labs.config_models import LabConfig, DirectionConfig

from .lab1 import Lab1_TDZ
from .lab2 import Lab2_TDZ
from .lab3 import Lab3_TDZ
from .lab4 import Lab4_TDZ
from .lab5 import Lab5_TDZ
from .lab6 import Lab6_TDZ

LABS = [
    Lab1_TDZ, Lab2_TDZ, Lab3_TDZ,
    Lab4_TDZ, Lab5_TDZ, Lab6_TDZ
]

labs_config = []
for lab_cls in LABS:
    try:
        labs_config.append(
            LabConfig(
                short=lab_cls.short,
                full=lab_cls.full,
                note=lab_cls.note,
                default_params=lab_cls.default_params,
                default_graphs=lab_cls.default_graphs,
                calc_module=f"{lab_cls.__module__}.{lab_cls.__name__}",
                active_graph=lab_cls.active_graph,
            )
        )
    except Exception as e:
        raise Exception(f"Ошибка конфигурации для лабораторной работы {lab_cls.short}: {e}")

DIRECTION_CONFIG = DirectionConfig(
    name="ТДЗ",
    description="Теория динамических систем – раздел линейных и замкнутых",
    labs=labs_config,
)
