from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Task(models.Model):
    PRIORITY_CHOICES = [('L', 'Low'), ('M', 'Medium'), ('H', 'High')]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='M')
    is_done = models.BooleanField(default=False)

    def __str__(self):
        return self.title