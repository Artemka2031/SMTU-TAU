from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
import importlib

from .models import Direction, LabWork
from .serializers import DirectionSerializer, LabWorkSerializer


class DirectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Direction.objects.all()
    serializer_class = DirectionSerializer


class LabWorkViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LabWork.objects.all()
    serializer_class = LabWorkSerializer

    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None, **kwargs):
        lab = self.get_object()

        new_params = {}
        for param in lab.parameters.all():
            name = param.name
            new_params[name] = request.data.get(name, param.value)

        graph_params = {
            "w_end": float(request.data.get("w_end", 100.0)),
            "count_of_points": int(request.data.get("count_of_points", 500)),
        }

        nonlinearity = request.data.get("nonlinearity") if lab.direction.name == "ТАУ Нелин" else None
        print(f"Parameters: {new_params}, Nonlinearity: {nonlinearity}, Graph Params: {graph_params}")

        if not lab.calc_module:
            return Response({"error": "calc_module не указан"}, status=400)
        try:
            module_path = lab.calc_module
            print(f"Importing calc_module: {module_path}")
            parts = module_path.split(".")
            class_name = parts[-1]
            mod = importlib.import_module(module_path.rsplit(".", 1)[0])
            cls = getattr(mod, class_name)
            calc_func = getattr(cls, "calculate_all_functions")
        except Exception as e:
            print(f"Import error: {e}")
            return Response({"error": f"Ошибка импорта calc_module: {e}"}, status=500)

        try:
            result = calc_func(new_params, graph_params, nonlinearity=nonlinearity)
        except Exception as e:
            print(f"Calculation error: {e}")
            expected = {param.name: param.value for param in lab.parameters.all()}
            return Response({"error": str(e), "expected_params": expected}, status=400)

        return Response(result)
