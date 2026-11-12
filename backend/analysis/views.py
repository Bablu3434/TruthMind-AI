
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AnalysisRecord
from .serializers import AnalysisSerializer
from .ai_engine import analyze_statement


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_statement_view(request):

    serializer = AnalysisSerializer(data=request.data)

    if serializer.is_valid():

        statement = serializer.validated_data['statement']

        # Run local analysis engine
        analysis_result = analyze_statement(statement)

        signals_text = "\n".join(
            f"- {signal}"
            for signal in analysis_result['signals']
        )

        final_result = (
            analysis_result['result']
            + "\n\nObservations:\n"
            + signals_text
        )

        analysis = serializer.save(
            user=request.user,
            status='unverified',
            result=final_result
        )

        return Response({
            "success": True,
            "message": "Statement analysis completed",
            "analysis": AnalysisSerializer(analysis).data
        }, status=201)

    return Response({
        "success": False,
        "errors": serializer.errors
    }, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analysis_history(request):

    records = AnalysisRecord.objects.filter(
        user=request.user
    ).order_by('-created_at')

    serializer = AnalysisSerializer(records, many=True)

    return Response({
        "success": True,
        "total": records.count(),
        "history": serializer.data
    })
