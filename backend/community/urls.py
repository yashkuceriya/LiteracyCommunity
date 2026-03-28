from django.urls import path
from . import views

urlpatterns = [
    path('problem-statements/', views.problem_statement_list),
    path('districts/', views.district_list),
    path('profile/', views.my_profile),
    path('directory/', views.directory),
    path('matches/', views.matches),
    path('matches/export/', views.export_matches),
    path('members/<int:pk>/', views.member_detail),
    path('analytics/', views.analytics),
    path('announcements/', views.announcement_list),
    path('compare-districts/', views.compare_districts),
]
