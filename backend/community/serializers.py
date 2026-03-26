from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import District, ProblemStatement, MemberProfile


class DistrictSerializer(serializers.ModelSerializer):
    display_type = serializers.CharField(source='get_district_type_display', read_only=True)
    display_size = serializers.CharField(source='get_size_category_display', read_only=True)

    class Meta:
        model = District
        fields = [
            'id', 'name', 'state', 'nces_id', 'district_type', 'display_type',
            'size_category', 'display_size', 'enrollment',
            'free_reduced_lunch_pct', 'esl_pct',
        ]


class ProblemStatementSerializer(serializers.ModelSerializer):
    display_category = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ProblemStatement
        fields = ['id', 'title', 'description', 'category', 'display_category']


class MemberProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    district_id = serializers.PrimaryKeyRelatedField(
        queryset=District.objects.all(), source='district', write_only=True, required=False, allow_null=True,
    )
    problem_statements = ProblemStatementSerializer(many=True, read_only=True)
    problem_statement_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProblemStatement.objects.all(), source='problem_statements',
        many=True, write_only=True, required=False,
    )

    class Meta:
        model = MemberProfile
        fields = [
            'id', 'user', 'title', 'district', 'district_id',
            'years_experience', 'bio', 'problem_statements', 'problem_statement_ids',
            'is_public', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MatchResultSerializer(serializers.Serializer):
    profile = MemberProfileSerializer()
    score = serializers.IntegerField()
    breakdown = serializers.DictField()
