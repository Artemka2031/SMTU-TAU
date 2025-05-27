import importlib
from django.core.management.base import BaseCommand
from django.db import connection
from labs.models import Direction, LabWork, LabParameter, GraphType
from labs.directions import DIRECTIONS_CONFIG


class Command(BaseCommand):
    help = "Удаляет старые данные, сбрасывает автоинкремент id и импортирует конфигурацию направлений и лабораторных работ."

    def handle(self, *args, **options):
        self.stdout.write("Удаляем старые данные...")
        Direction.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Старые данные удалены."))

        table_names = [
            "labs_direction",
            "labs_labwork",
            "labs_labparameter",
            "labs_graphtype",
        ]
        with connection.cursor() as cursor:
            for table in table_names:
                cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table}'")
        self.stdout.write(self.style.SUCCESS("Автоинкремент id сброшен."))

        for direction_config in DIRECTIONS_CONFIG:
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
                        "active_graph": lab_config.active_graph or "ПХ",
                        "calc_module": lab_config.calc_module,  # Use calc_module
                    }
                )
                for pname, pvalue in lab_config.default_params.items():
                    LabParameter.objects.update_or_create(
                        lab=lab_obj,
                        name=pname,
                        defaults={"value": pvalue}
                    )
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
