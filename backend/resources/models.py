from django.db import models
from django.conf import settings


class Resource(models.Model):
    RESOURCE_TYPES = [
        ('article', 'Article'),
        ('guide', 'Implementation Guide'),
        ('research', 'Research Paper'),
        ('tool', 'Tool / Template'),
        ('video', 'Video'),
        ('webinar', 'Webinar Recording'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(max_length=1000)
    url = models.URLField(blank=True, help_text='External link to the resource')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES, default='article')
    problem_statements = models.ManyToManyField(
        'community.ProblemStatement', blank=True, related_name='resources',
        help_text='Related literacy challenges',
    )
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resources')
    upvotes = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name='upvoted_resources')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    @property
    def upvote_count(self):
        return self.upvotes.count()
