
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import AnalysisRecord
from .serializers import AnalysisSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_statement(request):

    statement = request.data.get('statement', '').strip()

    if not statement:
        return Response({
            "success": False,
            "message": "Please enter a statement"
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(statement) > 5000:
        return Response({
            "success": False,
            "message": "Maximum 5000 characters allowed"
        }, status=status.HTTP_400_BAD_REQUEST)

    record = AnalysisRecord.objects.create(
        user=request.user,
        statement=statement,
        status='unverified',
        result='No evidence verification has been performed yet.'
    )

    return Response({
        "success": True,
        "message": "Statement saved successfully",
        "analysis": AnalysisSerializer(record).data
    }, status=status.HTTP_201_CREATED)


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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):

    records = AnalysisRecord.objects.filter(user=request.user)

    return Response({
        "success": True,
        "total_analyses": records.count(),
        "unverified": records.filter(
            status='unverified'
        ).count(),
        "verified": records.filter(
            status='verified'
        ).count(),
        "contradicted": records.filter(
            status='contradicted'
        ).count()
    })
