from rest_framework import serializers
from accounts.serializers import UserSerializer
from community.models import ProblemStatement
from community.serializers import ProblemStatementSerializer
from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    author_detail = UserSerializer(source='author', read_only=True)
    problem_statements_detail = ProblemStatementSerializer(source='problem_statements', many=True, read_only=True)
    problem_statement_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProblemStatement.objects.all(),
        source='problem_statements', many=True, write_only=True, required=False,
    )
    upvote_count = serializers.SerializerMethodField()
    is_upvoted = serializers.SerializerMethodField()
    display_type = serializers.CharField(source='get_resource_type_display', read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'description', 'url', 'resource_type', 'display_type',
            'problem_statements_detail', 'problem_statement_ids',
            'author', 'author_detail', 'upvote_count', 'is_upvoted',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def get_upvote_count(self, obj):
        if hasattr(obj, '_upvote_count'):
            return obj._upvote_count
        return obj.upvotes.count()

    def get_is_upvoted(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return obj.upvotes.filter(pk=request.user.pk).exists()
        return False
