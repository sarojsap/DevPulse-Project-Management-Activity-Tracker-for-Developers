from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import index
from projects.views import RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('projects.urls')),

    # Auth endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='auth_register'),

    # Catch all route for our frontend
    path('', index, name='index'),
]
