from django.db import models

from apps.core.models import User


# Create a model for the presentation
class Presentation(models.Model):
    path = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    #  when a User object is deleted, any objects that have a foreign key to that User will also be deleted.
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
