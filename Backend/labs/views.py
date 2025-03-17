from rest_framework import viewsets
from rest_framework.decorators import action  # Импортируем декоратор action
from rest_framework.response import Response
import importlib

from .models import Direction, LabWork
from .serializers import DirectionSerializer, LabWorkSerializer

class DirectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/directions/       -> список направлений с вложенными лабораторными работами
    GET /api/directions/1/     -> данные направления с id=1 (включая labs)
    """
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer

class LabWorkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/directions/1/labs/       -> список лабораторных работ для направления с id=1
    GET /api/directions/1/labs/1/     -> данные лабораторной работы с id=1 в направлении с id=1
    POST /api/directions/1/labs/1/calculate/ -> расчет точек графиков по параметрам
    """
    queryset = LabWork.objects.all()
    serializer_class = LabWorkSerializer

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None, **kwargs):
        """
        POST /api/directions/<direction_pk>/labs/<lab_pk>/calculate/
        Тело запроса может содержать изменённые параметры (например, "K", "Xm", "T", "t"),
        а также графические параметры ("w_end", "count_of_points").
        Если при расчёте возникает ошибка, возвращаются ожидаемые параметры.
        """
        lab = self.get_object()

        # 1. Собираем параметры из БД, позволяя переопределить их через request.data.
        new_params = {}
        for param in lab.parameters.all():
            name = param.name
            new_params[name] = request.data.get(name, param.value)

        # 2. Графические параметры с дефолтными значениями.
        graph_params = {
            "w_end": float(request.data.get("w_end", 100.0)),
            "count_of_points": int(request.data.get("count_of_points", 500)),
        }

        # 3. Импортируем метод расчёта по пути, указанному в lab.calc_module.
        if not lab.calc_module:
            return Response({"error": "calc_module не указан"}, status=400)
        try:
            # Ожидается, что lab.calc_module имеет формат:
            # "labs.directions.tau_lin.lab1.Lab1_TAU_Lin.calculate_all_functions"
            full_path = lab.calc_module
            parts = full_path.split(".")
            module_path = ".".join(parts[:-2])
            class_name = parts[-2]
            method_name = parts[-1]
            mod = importlib.import_module(module_path)
            cls = getattr(mod, class_name)
            calc_func = getattr(cls, method_name)
        except Exception as e:
            return Response({"error": f"Ошибка импорта calc_module: {e}"}, status=500)

        # 4. Вызываем функцию расчёта.
        try:
            result = calc_func(new_params, graph_params)
        except Exception as e:
            expected = {param.name: param.value for param in lab.parameters.all()}
            return Response({"error": str(e), "expected_params": expected}, status=400)

        # 5. Возвращаем результат расчёта.
        return Response(result)
