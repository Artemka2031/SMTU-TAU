from pydantic import BaseModel, Field, field_validator
from typing import Dict, Tuple, List


class LabConfig(BaseModel):
    short: str = Field(..., description="Краткое название лабораторной работы")
    full: str = Field(..., description="Полное название")
    note: str = Field(..., description="Примечание")
    default_params: Dict[str, str] = Field(..., description="Словарь параметров, например {'K': '3.0', ...}")
    default_graphs: Dict[str, Tuple[str, str, bool]] = Field(
        ..., description="Словарь графиков. Ключ — название графика, значение — кортеж (x_label, y_label, log_x)"
    )
    calc_function: str = Field(..., description="Полностью квалифицированное имя функции calculate_all_functions")

    @field_validator('short', 'full', 'note')
    def non_empty(cls, v):
        if not v.strip():
            raise ValueError("Поле не должно быть пустым")
        return v


class DirectionConfig(BaseModel):
    name: str = Field(..., description="Название направления (например, 'ТАУ Лин')")
    description: str = Field("", description="Описание направления")
    labs: List[LabConfig] = Field(..., description="Список лабораторных работ для данного направления")

    @field_validator('labs')
    def check_unique_short(cls, labs):
        shorts = [lab.short for lab in labs]
        if len(shorts) != len(set(shorts)):
            raise ValueError("Значения 'short' должны быть уникальными для лабораторных работ в одном направлении")
        return labs
