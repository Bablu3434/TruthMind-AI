from django.contrib import admin
from .models import AnalysisRecord


@admin.register(AnalysisRecord)
class AnalysisRecordAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'user',
        'status',
        'created_at'
    )

    list_filter = ('status', 'created_at')

    search_fields = (
        'user__username',
        'statement'
    )