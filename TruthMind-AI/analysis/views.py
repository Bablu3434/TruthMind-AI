from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AnalysisRecord
from .serializers import AnalysisSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_statement(request):

    serializer = AnalysisSerializer(data=request.data)

    if serializer.is_valid():
        analysis = serializer.save(
            user=request.user,
            status='unverified',
            result=(
                "Statement received successfully. "
                "Its factual accuracy has not yet been independently verified. "
                "More supporting evidence is required."
            )
        )

        return Response({
            "success": True,
            "message": "Statement submitted successfully",
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
