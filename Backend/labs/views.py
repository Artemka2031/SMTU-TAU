# labs/views.py
from rest_framework import viewsets
from .models import Direction, LabWork
from .serializers import DirectionSerializer, LabWorkSerializer
from rest_framework.decorators import action
from rest_framework.response import Response


class DirectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Для получения списка направлений или конкретного направления (с вложенными LabWork).
    GET /api/directions/    -> список всех направлений
    GET /api/directions/1/  -> одно направление, со всеми лабами
    """
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer


class LabWorkViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Выдаёт подробную инфу по каждой ЛР.
    GET /api/labs/
    GET /api/labs/<id>/
    + кастомный эндпоинт /api/labs/<id>/calculate/
    """
    queryset = LabWork.objects.all()
    serializer_class = LabWorkSerializer

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        """
        POST /api/labs/<id>/calculate/
        - body может содержать изменённые параметры (пользователь ввёл с фронта).
        - Возвращаем словарь с массивами точек для каждого типа расчёта.
        """
        lab = self.get_object()

        # 1) Собираем параметры:
        #   - либо берём их из базы
        #   - либо (приоритетно) из тела запроса (request.data),
        #     если пользователь поменял "K" и т. д.
        # В простом случае считаем, что пользователь не меняет названий, только значения:
        new_params = {}
        for param in lab.parameters.all():
            name = param.name
            new_value = request.data.get(name, param.value)
            new_params[name] = new_value

        # 2) GraphParams (кол-во точек, w_end и т.д.)
        #    Допустим, фронт присылает: {"w_end": 100, "count_of_points": 500}
        #    (или сделаем дефолт)
        graph_params = {
            "w_end": float(request.data.get("w_end", 100.0)),
            "count_of_points": int(request.data.get("count_of_points", 500)),
        }

        # 3) Импортируем модуль calc_module, вызываем calculate_all_functions
        import importlib

        if lab.calc_module:
            calc_mod = importlib.import_module(lab.calc_module)
        else:
            return Response({"error": "No calc_module specified"}, status=400)

        if not hasattr(calc_mod, 'calculate_all_functions'):
            return Response({"error": "calc_module missing 'calculate_all_functions'"}, status=500)

        # 4) Вызываем вычисления
        result = calc_mod.calculate_all_functions(new_params, graph_params)

        # 5) Возвращаем JSON
        return Response(result)
