from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Project, Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'priority', 'is_done']

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    tasks = TaskSerializer(many=True, read_only=True)
    is_completed = serializers.SerializerMethodField()
    class Meta:
        model = Project
        fields = ['id', 'title', 'description', 'owner', 'created_at', 'is_completed', 'tasks']

    def get_is_completed(self, obj):
        tasks = obj.tasks.all()
        if not tasks:
            return False
        return all(task.is_done for task in tasks)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Use create_user to handle password hashing
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user