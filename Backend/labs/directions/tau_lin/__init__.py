# labs/directions/tau_lin/__init__.py

from labs.config_models import LabConfig, DirectionConfig
from .lab1 import Lab1_TAU_Lin
from .lab2 import Lab2_TAU_Lin  # если есть второй модуль

# Собираем список лабораторных работ из импортированных классов
LABS = [Lab1_TAU_Lin, Lab2_TAU_Lin]

labs_config = []
for lab_cls in LABS:
    try:
        config = LabConfig(
            short=lab_cls.short,
            full=lab_cls.full,
            note=lab_cls.note,
            default_params=lab_cls.default_params,
            default_graphs=lab_cls.default_graphs,
        )
        labs_config.append(config)
    except Exception as e:
        raise Exception(f"Ошибка конфигурации для лабораторной работы {lab_cls.short}: {e}")

DIRECTION_CONFIG = DirectionConfig(
    name="ТАУ Лин",
    description="Теория автоматического управления – Линейное",
    labs=labs_config,
)
