from labs.config_models import LabConfig, DirectionConfig
from .lab1 import Lab1_TAU_Lin
from .lab2 import Lab2_TAU_Lin
from .lab3 import Lab3_TAU_Lin
from .lab4 import Lab4_TAU_Lin
from .lab5 import Lab5_TAU_Lin
from .lab6 import Lab6_TAU_Lin

# Собираем список лабораторных работ (классов) данного направления
LABS = [Lab1_TAU_Lin, Lab2_TAU_Lin, Lab3_TAU_Lin, Lab4_TAU_Lin, Lab5_TAU_Lin, Lab6_TAU_Lin]

labs_config = []
for lab_cls in LABS:
    try:
        config = LabConfig(
            short=lab_cls.short,
            full=lab_cls.full,
            note=lab_cls.note,
            default_params=lab_cls.default_params,
            default_graphs=lab_cls.default_graphs,
            calc_function=f"{lab_cls.__module__}.{lab_cls.__name__}.calculate_all_functions"
        )
        labs_config.append(config)
    except Exception as e:
        raise Exception(f"Ошибка конфигурации для лабораторной работы {lab_cls.short}: {e}")

DIRECTION_CONFIG = DirectionConfig(
    name="ТАУ Лин",
    description="Теория автоматического управления – Линейное",
    labs=labs_config,
)
