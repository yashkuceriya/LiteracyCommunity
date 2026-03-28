from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.conversation_list),
    path('conversations/<int:pk>/', views.conversation_detail),
    path('conversations/<int:pk>/messages/', views.send_message),
    path('conversations/<int:pk>/join/', views.moderator_join),
    path('conversations/<int:pk>/mod-message/', views.moderator_send_message),
    path('unread-count/', views.unread_count),
]
