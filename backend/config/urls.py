from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/community/', include('community.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/moderation/', include('moderation.urls')),
    path('api/resources/', include('resources.urls')),
]
