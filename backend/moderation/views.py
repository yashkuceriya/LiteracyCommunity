from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User
from messaging.models import Message, Conversation
from messaging.serializers import ConversationDetailSerializer
from .models import FlaggedMessage, ModerationAction
from .serializers import FlaggedMessageSerializer, ModerationActionSerializer


def is_moderator(user):
    return user.role in ('moderator', 'admin')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def flag_message(request):
    message_id = request.data.get('message_id')
    reason = request.data.get('reason', '').strip()
    if not message_id or not reason:
        return Response({'error': 'message_id and reason are required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        msg = Message.objects.select_related('conversation').get(pk=message_id)
    except Message.DoesNotExist:
        return Response({'error': 'Message not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Only participants in the conversation can flag its messages
    if not msg.conversation.participants.filter(pk=request.user.pk).exists():
        return Response({'error': 'You can only flag messages in your own conversations.'}, status=status.HTTP_403_FORBIDDEN)

    flag = FlaggedMessage.objects.create(message=msg, flagged_by=request.user, reason=reason)
    return Response(FlaggedMessageSerializer(flag).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def flagged_list(request):
    if not is_moderator(request.user):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    qs = FlaggedMessage.objects.select_related('message__sender', 'flagged_by', 'reviewed_by')
    stat = request.query_params.get('status')
    if stat:
        qs = qs.filter(status=stat)
    return Response(FlaggedMessageSerializer(qs[:100], many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_flag(request, pk):
    if not is_moderator(request.user):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        flag = FlaggedMessage.objects.get(pk=pk)
    except FlaggedMessage.DoesNotExist:
        return Response({'error': 'Flag not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status not in ('reviewed', 'dismissed'):
        return Response({'error': 'status must be "reviewed" or "dismissed".'}, status=status.HTTP_400_BAD_REQUEST)

    flag.status = new_status
    flag.moderator_notes = request.data.get('moderator_notes', '')
    flag.reviewed_by = request.user
    flag.reviewed_at = timezone.now()
    flag.save()
    return Response(FlaggedMessageSerializer(flag).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def moderation_conversation(request, pk):
    """Allow moderators to view any conversation."""
    if not is_moderator(request.user):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        conv = Conversation.objects.prefetch_related('participants', 'messages').get(pk=pk)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(ConversationDetailSerializer(conv).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_action(request, pk):
    if not is_moderator(request.user):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        target = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if target == request.user:
        return Response({'error': 'Cannot take action on yourself.'}, status=status.HTTP_400_BAD_REQUEST)
    if target.role == 'admin':
        return Response({'error': 'Cannot take action on administrators.'}, status=status.HTTP_403_FORBIDDEN)
    if target.role == 'moderator' and request.user.role != 'admin':
        return Response({'error': 'Only admins can take action on moderators.'}, status=status.HTTP_403_FORBIDDEN)

    action = request.data.get('action')
    reason = request.data.get('reason', '').strip()
    if action not in ('warn', 'suspend', 'ban', 'unsuspend'):
        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)
    if not reason:
        return Response({'error': 'Reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

    mod_action = ModerationAction.objects.create(
        moderator=request.user, target_user=target, action=action, reason=reason,
    )
    if action in ('suspend', 'ban'):
        target.is_active = False
        target.save()
    elif action == 'unsuspend':
        target.is_active = True
        target.save()

    return Response(ModerationActionSerializer(mod_action).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def action_log(request):
    if not is_moderator(request.user):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    qs = ModerationAction.objects.select_related('moderator', 'target_user')[:100]
    return Response(ModerationActionSerializer(qs, many=True).data)
