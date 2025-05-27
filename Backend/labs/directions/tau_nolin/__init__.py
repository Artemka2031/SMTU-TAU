from labs.config_models import LabConfig, DirectionConfig
from .lab1 import Lab1_TAU_NoLin
from .lab2 import Lab2_TAU_NoLin

LABS = [Lab1_TAU_NoLin, Lab2_TAU_NoLin]

labs_config = []
for lab_cls in LABS:
    try:
        config = LabConfig(
            short=lab_cls.short,
            full=lab_cls.full,
            note=lab_cls.note,
            default_params=lab_cls.default_params,
            default_graphs=lab_cls.default_graphs,
            calc_module=f"{lab_cls.__module__}.{lab_cls.__name__}",  # e.g., labs.directions.tau_nolin.lab1.Lab1_TAU_NoLin
            active_graph=lab_cls.active_graph,
        )
        labs_config.append(config)
    except Exception as e:
        raise Exception(f"Ошибка конфигурации для лабораторной работы {lab_cls.short}: {e}")

DIRECTION_CONFIG = DirectionConfig(
    name="ТАУ Нелин",
    description="Теория автоматического управления – Нелинейное",
    labs=labs_config,
)