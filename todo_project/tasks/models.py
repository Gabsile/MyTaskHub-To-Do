from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    due_time = models.TimeField(null=True, blank=True)  # Time for the task
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='Medium')
    completed = models.BooleanField(default=False)
    notified_10min = models.BooleanField(default=False)  # Track if 10-min notification sent

    def __str__(self):
        return self.title