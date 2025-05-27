from labs.config_models import LabConfig, DirectionConfig
from .lab1 import Lab1_TAU_Lin
from .lab2 import Lab2_TAU_Lin
from .lab3 import Lab3_TAU_Lin
from .lab4 import Lab4_TAU_Lin
from .lab5_1 import Lab5_1_TAU_Lin
from .lab5_2 import Lab5_2_TAU_Lin
from .lab6_1 import Lab6_1_TAU_Lin
from .lab6_2 import Lab6_2_TAU_Lin
from .lab6_3 import Lab6_3_TAU_Lin
from .lab6_4 import Lab6_4_TAU_Lin
# Собираем список лабораторных работ (классов) данного направления
LABS = [Lab1_TAU_Lin, Lab2_TAU_Lin, Lab3_TAU_Lin, Lab4_TAU_Lin, Lab5_1_TAU_Lin, Lab5_2_TAU_Lin, Lab6_1_TAU_Lin, Lab6_2_TAU_Lin, Lab6_3_TAU_Lin, Lab6_4_TAU_Lin]

labs_config = []
for lab_cls in LABS:
    try:
        config = LabConfig(
            short=lab_cls.short,
            full=lab_cls.full,
            note=lab_cls.note,
            default_params=lab_cls.default_params,
            default_graphs=lab_cls.default_graphs,
            calc_module=f"{lab_cls.__module__}.{lab_cls.__name__}",  # e.g., labs.directions.tau_lin.lab1.Lab1_TAU_Lin
            active_graph=lab_cls.active_graph,
        )
        labs_config.append(config)
    except Exception as e:
        raise Exception(f"Ошибка конфигурации для лабораторной работы {lab_cls.short}: {e}")

DIRECTION_CONFIG = DirectionConfig(
    name="ТАУ Лин",
    description="Теория автоматического управления – Линейное",
    labs=labs_config,
)