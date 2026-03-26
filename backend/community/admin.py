from django.contrib import admin
from .models import District, ProblemStatement, MemberProfile


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'state', 'district_type', 'size_category', 'enrollment', 'free_reduced_lunch_pct', 'esl_pct']
    list_filter = ['state', 'district_type', 'size_category']
    search_fields = ['name', 'state']


@admin.register(ProblemStatement)
class ProblemStatementAdmin(admin.ModelAdmin):
    list_display = ['title', 'category']
    list_filter = ['category']


@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'district', 'is_public', 'created_at']
    list_filter = ['is_public', 'district__state']
    search_fields = ['user__first_name', 'user__last_name', 'title']
    filter_horizontal = ['problem_statements']
