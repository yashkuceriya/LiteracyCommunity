from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.models import User
from .models import Conversation, Message
from .serializers import ConversationListSerializer, ConversationDetailSerializer, MessageSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def conversation_list(request):
    if request.method == 'GET':
        convos = Conversation.objects.filter(participants=request.user).prefetch_related('participants', 'messages')
        ser = ConversationListSerializer(convos, many=True, context={'request': request})
        return Response(ser.data)

    # POST — start or resume a conversation with a user
    recipient_id = request.data.get('recipient_id')
    if not recipient_id:
        return Response({'error': 'recipient_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        recipient = User.objects.get(pk=recipient_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    if recipient == request.user:
        return Response({'error': 'Cannot message yourself.'}, status=status.HTTP_400_BAD_REQUEST)

    # Find existing conversation between these two users
    existing = Conversation.objects.filter(participants=request.user).filter(participants=recipient)
    for conv in existing:
        if conv.participants.count() == 2:
            return Response(ConversationDetailSerializer(conv).data)

    # Create new conversation
    conv = Conversation.objects.create()
    conv.participants.add(request.user, recipient)
    return Response(ConversationDetailSerializer(conv).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversation_detail(request, pk):
    # Moderators can view any conversation
    is_mod = request.user.role in ('moderator', 'admin')
    try:
        if is_mod:
            conv = Conversation.objects.prefetch_related('participants', 'messages').get(pk=pk)
        else:
            conv = Conversation.objects.prefetch_related('participants', 'messages').get(pk=pk, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Mark messages as read
    conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)

    data = ConversationDetailSerializer(conv).data
    data['is_participant'] = request.user in conv.participants.all()
    data['is_moderator_view'] = is_mod and not data['is_participant']
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, pk):
    try:
        conv = Conversation.objects.get(pk=pk, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)

    content = request.data.get('content', '').strip()
    if not content:
        return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(content) > 2000:
        return Response({'error': 'Message too long (2000 character limit).'}, status=status.HTTP_400_BAD_REQUEST)

    msg = Message.objects.create(conversation=conv, sender=request.user, content=content)
    conv.save()  # Update updated_at
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def moderator_join(request, pk):
    """Allow moderators to join any conversation and participate."""
    if request.user.role not in ('moderator', 'admin'):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        conv = Conversation.objects.get(pk=pk)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)
    if request.user not in conv.participants.all():
        conv.participants.add(request.user)
    # Also create system message announcing moderator entry
    Message.objects.create(
        conversation=conv, sender=request.user,
        content=f"[Moderator {request.user.get_full_name()} has joined this conversation]"
    )
    conv.save()
    return Response(ConversationDetailSerializer(conv).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def moderator_send_message(request, pk):
    """Allow moderators to send messages in any conversation (even without being a participant)."""
    if request.user.role not in ('moderator', 'admin'):
        return Response({'error': 'Moderator access required.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        conv = Conversation.objects.get(pk=pk)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found.'}, status=status.HTTP_404_NOT_FOUND)
    content = request.data.get('content', '').strip()
    if not content:
        return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(content) > 2000:
        return Response({'error': 'Message too long (2000 character limit).'}, status=status.HTTP_400_BAD_REQUEST)
    # Auto-join if not already a participant
    if request.user not in conv.participants.all():
        conv.participants.add(request.user)
    msg = Message.objects.create(conversation=conv, sender=request.user, content=content)
    conv.save()
    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Message.objects.filter(
        conversation__participants=request.user, is_read=False
    ).exclude(sender=request.user).count()
    return Response({'unread_count': count})
