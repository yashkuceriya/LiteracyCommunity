from django.contrib import admin
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'resource_type', 'author', 'created_at']
    list_filter = ['resource_type']
    search_fields = ['title', 'description']
    filter_horizontal = ['problem_statements', 'upvotes']
