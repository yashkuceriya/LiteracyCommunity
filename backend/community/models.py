from django.db import models
from django.conf import settings


class District(models.Model):
    DISTRICT_TYPES = [
        ('urban', 'Urban'),
        ('suburban', 'Suburban'),
        ('rural', 'Rural'),
        ('town', 'Town'),
    ]
    SIZE_CATEGORIES = [
        ('small', 'Small (Under 1,000)'),
        ('medium', 'Medium (1,000–5,000)'),
        ('large', 'Large (5,000–25,000)'),
        ('very_large', 'Very Large (25,000+)'),
    ]

    name = models.CharField(max_length=255)
    state = models.CharField(max_length=2)
    nces_id = models.CharField(max_length=20, blank=True, unique=True, null=True)
    district_type = models.CharField(max_length=20, choices=DISTRICT_TYPES)
    size_category = models.CharField(max_length=20, choices=SIZE_CATEGORIES)
    enrollment = models.IntegerField(default=0)
    free_reduced_lunch_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    esl_pct = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    class Meta:
        ordering = ['state', 'name']

    def __str__(self):
        return f"{self.name}, {self.state}"


class ProblemStatement(models.Model):
    CATEGORIES = [
        ('curriculum', 'Curriculum & Instruction'),
        ('assessment', 'Assessment & Data'),
        ('professional_dev', 'Professional Development'),
        ('equity', 'Equity & Access'),
        ('leadership', 'Leadership & Culture'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=30, choices=CATEGORIES)

    class Meta:
        ordering = ['category', 'title']

    def __str__(self):
        return self.title


class MemberProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    title = models.CharField(max_length=100, blank=True, help_text='e.g. Curriculum Director')
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    years_experience = models.IntegerField(default=0)
    bio = models.TextField(blank=True, max_length=500)
    problem_statements = models.ManyToManyField(ProblemStatement, blank=True, related_name='members')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} — {self.district or 'No District'}"


class Announcement(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(max_length=2000)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='announcements')
    pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-pinned', '-created_at']

    def __str__(self):
        return self.title
