from django.urls import path
from . import views

urlpatterns = [
    path('', views.resource_list),
    path('<int:pk>/', views.resource_detail),
    path('<int:pk>/upvote/', views.toggle_upvote),
]
