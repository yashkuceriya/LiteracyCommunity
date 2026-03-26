from django.db import models
from django.conf import settings


class FlaggedMessage(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewed', 'Reviewed — Action Taken'),
        ('dismissed', 'Dismissed'),
    ]

    message = models.ForeignKey('messaging.Message', on_delete=models.CASCADE, related_name='flags')
    flagged_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='flags_created')
    reason = models.TextField(max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    moderator_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='flags_reviewed',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Flag on message #{self.message_id} — {self.status}"


class ModerationAction(models.Model):
    ACTION_CHOICES = [
        ('warn', 'Warning'),
        ('suspend', 'Suspend'),
        ('ban', 'Ban'),
        ('unsuspend', 'Unsuspend'),
    ]

    moderator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mod_actions')
    target_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mod_actions_received')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    reason = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} on {self.target_user} by {self.moderator}"
