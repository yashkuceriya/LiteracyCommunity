from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from .models import District, ProblemStatement, MemberProfile
from .serializers import (
    DistrictSerializer, ProblemStatementSerializer,
    MemberProfileSerializer, MatchResultSerializer,
)
from .matching import find_matches


@api_view(['GET'])
@permission_classes([AllowAny])
def problem_statement_list(request):
    qs = ProblemStatement.objects.all()
    category = request.query_params.get('category')
    if category:
        qs = qs.filter(category=category)
    return Response(ProblemStatementSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([AllowAny])
def district_list(request):
    qs = District.objects.all()
    search = request.query_params.get('search', '').strip()
    state = request.query_params.get('state')
    district_type = request.query_params.get('type')
    if search:
        qs = qs.filter(name__icontains=search)
    if state:
        qs = qs.filter(state=state.upper())
    if district_type:
        qs = qs.filter(district_type=district_type)
    return Response(DistrictSerializer(qs[:50], many=True).data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    profile, created = MemberProfile.objects.get_or_create(user=request.user)
    if request.method == 'GET':
        return Response(MemberProfileSerializer(profile).data)
    ser = MemberProfileSerializer(profile, data=request.data, partial=True)
    ser.is_valid(raise_exception=True)
    ser.save()
    return Response(MemberProfileSerializer(profile).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def directory(request):
    qs = MemberProfile.objects.filter(is_public=True).select_related('district', 'user').prefetch_related('problem_statements')

    search = request.query_params.get('search', '').strip()
    state = request.query_params.get('state')
    district_type = request.query_params.get('district_type')
    size = request.query_params.get('size')
    problem = request.query_params.get('problem')

    if search:
        qs = qs.filter(
            Q(user__first_name__icontains=search) |
            Q(user__last_name__icontains=search) |
            Q(title__icontains=search) |
            Q(district__name__icontains=search)
        )
    if state:
        qs = qs.filter(district__state=state.upper())
    if district_type:
        qs = qs.filter(district__district_type=district_type)
    if size:
        qs = qs.filter(district__size_category=size)
    if problem:
        qs = qs.filter(problem_statements__id=problem).distinct()

    page_size = 20
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    total = qs.count()
    profiles = qs[start:start + page_size]

    return Response({
        'count': total,
        'results': MemberProfileSerializer(profiles, many=True).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matches(request):
    try:
        profile = request.user.profile
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Please complete your profile first.'}, status=status.HTTP_400_BAD_REQUEST)

    min_score = int(request.query_params.get('min_score', 10))
    results = find_matches(profile, min_score=min_score)

    data = [
        {'profile': MemberProfileSerializer(p).data, 'score': s, 'breakdown': b}
        for p, s, b in results[:50]
    ]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def member_detail(request, pk):
    try:
        profile = MemberProfile.objects.select_related('district', 'user').prefetch_related('problem_statements').get(pk=pk, is_public=True)
    except MemberProfile.DoesNotExist:
        return Response({'error': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(MemberProfileSerializer(profile).data)
