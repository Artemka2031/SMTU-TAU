from labs.config_models import LabConfig, DirectionConfig
from .lab1 import Lab1_TAU_Basics
from .lab2 import Lab2_TAU_Basics
from .lab3 import Lab3_TAU_Basics
from .lab4 import Lab4_TAU_Basics
from .lab5 import Lab5_TAU_Basics


LABS = [Lab1_TAU_Basics, Lab2_TAU_Basics, Lab3_TAU_Basics, Lab4_TAU_Basics, Lab5_TAU_Basics]

labs_config = []
for lab_cls in LABS:
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


DIRECTION_CONFIG = DirectionConfig(
    name="ОА",
    description="Основы автоматизации",
    labs=labs_config,
)


