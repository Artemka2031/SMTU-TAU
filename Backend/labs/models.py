from django.db import models


class Direction(models.Model):
    """
    Направление: "ОА", "ТАУ Лин", "ТАУ Нелин", "ТДЗ"
    """
    name = models.CharField(max_length=100, unique=True)  # "ТАУ Нелин"
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class LabWork(models.Model):
    """
    Лабораторная работа:
    - Краткое название (short), например "1 ЛР"
    - Полное название (full)
    - Примечание (note)
    - Активный график (active_graph)
    - Ссылка на направление (direction)
    - calc_module: имя Python-модуля (или класса), который умеет рассчитывать графики
    """
    direction = models.ForeignKey(Direction, on_delete=models.CASCADE, related_name='labs')
    short = models.CharField(max_length=100)
    full = models.CharField(max_length=255)
    note = models.TextField(blank=True, null=True)
    active_graph = models.CharField(max_length=100, default="ПХ")

    # Доп. поле — имя модуля/класса для расчетов
    calc_module = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Имя Python-модуля для расчётов, например 'labs.calculations.lab1'."
    )

    def __str__(self):
        return f"{self.direction.name} - {self.short}"


class LabParameter(models.Model):
    """
    Параметр лабораторной: name="K", value="3.0" и т.д.
    """
    lab = models.ForeignKey(LabWork, on_delete=models.CASCADE, related_name='parameters')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name}={self.value} (Lab: {self.lab.short})"


class GraphType(models.Model):
    """
    Тип (вид) графика + настройки осей:
      - name: "ПХ", "АЧХ", "ФЧХ", ...
      - x_label, y_label: подписи осей
      - log_x: включён ли логарифм
    """
    lab = models.ForeignKey(LabWork, on_delete=models.CASCADE, related_name='graphs')
    name = models.CharField(max_length=100)  # "ПХ", "АЧХ" и т.д.
    x_label = models.CharField(max_length=100, default="X")
    y_label = models.CharField(max_length=100, default="Y")
    log_x = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} (Lab: {self.lab.short})"
