# labs/management/commands/scan_labs.py

import importlib
from django.core.management.base import BaseCommand
from labs.models import Direction, LabWork, LabParameter, GraphType
from labs.directions import DIRECTIONS_CONFIG  # импортируем агрегированный список направлений


class Command(BaseCommand):
    help = "Импортирует конфигурацию направлений и лабораторных работ с использованием Pydantic-схем и создает записи в БД."

    def handle(self, *args, **options):
        for direction_config in DIRECTIONS_CONFIG:
            # Создаем или обновляем направление
            direction_obj, _ = Direction.objects.get_or_create(
                name=direction_config.name,
                defaults={"description": direction_config.description}
            )
            for lab_config in direction_config.labs:
                lab_obj, _ = LabWork.objects.get_or_create(
                    direction=direction_obj,
                    short=lab_config.short,
                    defaults={
                        "full": lab_config.full,
                        "note": lab_config.note,
                        "active_graph": "ПХ",  # можно брать из lab_config, если нужно
                        # calc_module: сюда можно записать, например, путь к модулю,
                        # если он сохраняется в конфигурации лабораторной работы.
                    }
                )
                # Параметры
                for pname, pvalue in lab_config.default_params.items():
                    LabParameter.objects.update_or_create(
                        lab=lab_obj,
                        name=pname,
                        defaults={"value": pvalue}
                    )
                # Графики
                for gname, gconfig in lab_config.default_graphs.items():
                    x_label, y_label, log_x = gconfig
                    GraphType.objects.update_or_create(
                        lab=lab_obj,
                        name=gname,
                        defaults={
                            "x_label": x_label,
                            "y_label": y_label,
                            "log_x": log_x,
                        }
                    )
                self.stdout.write(self.style.SUCCESS(
                    f"Обновлена лабораторная работа '{lab_config.short}' в направлении '{direction_config.name}'"
                ))
        self.stdout.write(self.style.SUCCESS("Сканирование и синхронизация завершены!"))
