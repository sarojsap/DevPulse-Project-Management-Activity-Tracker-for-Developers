from rest_framework import serializers
from .models import Project, Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'priority', 'is_done']

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    tasks = TaskSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'owner', 'created_at', 'is_completed', 'tasks']