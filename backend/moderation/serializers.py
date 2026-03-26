from rest_framework import serializers
from accounts.serializers import UserSerializer
from messaging.serializers import MessageSerializer
from .models import FlaggedMessage, ModerationAction


class FlaggedMessageSerializer(serializers.ModelSerializer):
    flagged_by_user = UserSerializer(source='flagged_by', read_only=True)
    message_detail = MessageSerializer(source='message', read_only=True)
    conversation_id = serializers.IntegerField(source='message.conversation_id', read_only=True)

    class Meta:
        model = FlaggedMessage
        fields = [
            'id', 'message', 'message_detail', 'conversation_id',
            'flagged_by', 'flagged_by_user', 'reason', 'status',
            'moderator_notes', 'reviewed_by', 'created_at', 'reviewed_at',
        ]
        read_only_fields = ['id', 'flagged_by', 'created_at']


class ModerationActionSerializer(serializers.ModelSerializer):
    moderator_user = UserSerializer(source='moderator', read_only=True)
    target = UserSerializer(source='target_user', read_only=True)

    class Meta:
        model = ModerationAction
        fields = ['id', 'moderator', 'moderator_user', 'target_user', 'target', 'action', 'reason', 'created_at']
        read_only_fields = ['id', 'moderator', 'created_at']
