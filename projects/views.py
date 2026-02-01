from django.contrib.auth.models import User
from rest_framework import viewsets, permissions
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer, UserSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically attach the logged-in user as the owner
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # This makes it public