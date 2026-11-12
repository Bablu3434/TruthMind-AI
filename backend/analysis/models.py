from django.db import models
from django.contrib.auth.models import User


class AnalysisRecord(models.Model):

    STATUS_CHOICES = [
        ('unverified', 'Unverified'),
        ('verified', 'Verified'),
        ('contradicted', 'Contradicted'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='analyses'
    )

    statement = models.TextField()

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='unverified'
    )

    result = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Analysis {self.id}"