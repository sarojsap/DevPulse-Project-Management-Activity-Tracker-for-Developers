from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, filters
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer, UserSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Only return projects owned by the logged-in user
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically attach the logged-in user as the owner
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Only return tasks for projects owned by the logged-in user
        return Task.objects.filter(project__owner=self.request.user)

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # This makes it public