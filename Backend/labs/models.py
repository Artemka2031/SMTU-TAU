from django.db import models
import importlib


class Direction(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class LabWork(models.Model):
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, related_name='labs')
    short = models.CharField(max_length=100)
    full = models.CharField(max_length=255)
    note = models.TextField(blank=True, null=True)
    active_graph = models.CharField(max_length=100, default="ПХ")
    calc_module = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Имя Python-модуля для расчётов, например 'labs.directions.tau_nolin.lab1.Lab1_TAU_NoLin'."
    )

    def __str__(self):
        return f"{self.direction.name} - {self.short}"

    def get_nonlinearities(self):
        """
        Returns the list of available nonlinearities for the lab.
        Only applies to labs in the 'ТАУ Нелин' direction.
        """
        if self.direction.name != "ТАУ Нелин" or not self.calc_module:
            return []
        try:
            module_path, class_name = self.calc_module.rsplit(".", 1)
            module = importlib.import_module(module_path)
            lab_class = getattr(module, class_name)
            return list(getattr(lab_class, "nonlinearities", {}).keys())
        except (ImportError, AttributeError) as e:
            print(f"Ошибка получения нелинейностей для {self.calc_module}: {e}")
            return []


class LabParameter(models.Model):
    lab = models.ForeignKey(LabWork, on_delete=models.CASCADE, related_name='parameters')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name}={self.value} (Lab: {self.lab.short})"


class GraphType(models.Model):
    lab = models.ForeignKey(LabWork, on_delete=models.CASCADE, related_name='graphs')
    name = models.CharField(max_length=100)
    x_label = models.CharField(max_length=100, default="X")
    y_label = models.CharField(max_length=100, default="Y")
    log_x = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} (Lab: {self.lab.short})"
