from django.urls import path
from . import views

urlpatterns = [
    path('flag/', views.flag_message),
    path('flagged/', views.flagged_list),
    path('flagged/<int:pk>/review/', views.review_flag),
    path('conversations/<int:pk>/', views.moderation_conversation),
    path('users/<int:pk>/action/', views.user_action),
    path('actions/', views.action_log),
]
