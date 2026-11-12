from rest_framework import serializers
from .models import AnalysisRecord


class AnalysisSerializer(serializers.ModelSerializer):

    class Meta:
        model = AnalysisRecord
        fields = [
            'id',
            'statement',
            'status',
            'result',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'status',
            'result',
            'created_at'
        ]