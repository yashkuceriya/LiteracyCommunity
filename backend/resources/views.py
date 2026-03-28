from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from .models import Resource
from .serializers import ResourceSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def resource_list(request):
    if request.method == 'GET':
        qs = Resource.objects.annotate(_upvote_count=Count('upvotes')).select_related('author').prefetch_related('problem_statements', 'upvotes')

        rtype = request.query_params.get('type')
        problem = request.query_params.get('problem')
        search = request.query_params.get('search', '').strip()
        ordering = request.query_params.get('ordering', '-created_at')

        if rtype:
            qs = qs.filter(resource_type=rtype)
        if problem:
            qs = qs.filter(problem_statements__id=problem).distinct()
        if search:
            qs = qs.filter(title__icontains=search)
        if ordering == 'popular':
            qs = qs.order_by('-_upvote_count', '-created_at')
        else:
            qs = qs.order_by('-created_at')

        return Response(ResourceSerializer(qs[:50], many=True, context={'request': request}).data)

    ser = ResourceSerializer(data=request.data, context={'request': request})
    ser.is_valid(raise_exception=True)
    ser.save(author=request.user)
    return Response(ser.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def resource_detail(request, pk):
    try:
        resource = Resource.objects.select_related('author').prefetch_related('problem_statements', 'upvotes').get(pk=pk)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        if resource.author != request.user and request.user.role not in ('moderator', 'admin'):
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(ResourceSerializer(resource, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_upvote(request, pk):
    try:
        resource = Resource.objects.get(pk=pk)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found.'}, status=status.HTTP_404_NOT_FOUND)

    if resource.upvotes.filter(pk=request.user.pk).exists():
        resource.upvotes.remove(request.user)
        upvoted = False
    else:
        resource.upvotes.add(request.user)
        upvoted = True

    return Response({'upvoted': upvoted, 'upvote_count': resource.upvotes.count()})
