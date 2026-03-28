from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'is_read', 'created_at']

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username


class ConversationListSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'last_message', 'unread_count', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        # Use prefetched messages to avoid extra query
        messages = obj.messages.all()
        if messages:
            msg = max(messages, key=lambda m: m.created_at)
            return MessageSerializer(msg).data
        return None

    def get_unread_count(self, obj):
        # Use annotated value from view when available
        if hasattr(obj, '_unread_count'):
            return obj._unread_count
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'participants', 'messages', 'created_at', 'updated_at']
