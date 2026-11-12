from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_statement, name='analyze_statement'),
    path('history/', views.analysis_history, name='analysis_history'),
]
