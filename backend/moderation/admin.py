from django.contrib import admin
from .models import FlaggedMessage, ModerationAction


@admin.register(FlaggedMessage)
class FlaggedMessageAdmin(admin.ModelAdmin):
    list_display = ['message', 'flagged_by', 'status', 'created_at', 'reviewed_at']
    list_filter = ['status']


@admin.register(ModerationAction)
class ModerationActionAdmin(admin.ModelAdmin):
    list_display = ['moderator', 'target_user', 'action', 'created_at']
    list_filter = ['action']
