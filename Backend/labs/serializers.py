from rest_framework import serializers
from .models import Direction, LabWork, LabParameter, GraphType


class LabParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabParameter
        fields = ('name', 'value')


class GraphTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GraphType
        fields = ('name', 'x_label', 'y_label', 'log_x')


class LabWorkSerializer(serializers.ModelSerializer):
    parameters = LabParameterSerializer(many=True, read_only=True)
    graphs = GraphTypeSerializer(many=True, read_only=True)
    nonlinearities = serializers.SerializerMethodField()

    class Meta:
        model = LabWork
        fields = ('id', 'short', 'full', 'note', 'active_graph', 'parameters', 'graphs', 'nonlinearities')

    def get_nonlinearities(self, obj):
        return obj.get_nonlinearities()


class DirectionSerializer(serializers.ModelSerializer):
    labs = LabWorkSerializer(many=True, read_only=True)

    class Meta:
        model = Direction
        fields = ('id', 'name', 'description', 'labs')
