from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.


class User(AbstractUser):
    email = models.EmailField(unique=True)
    MALE, FEMALE = 'M', 'F'
    TEMP_CHOICES = ((MALE, 'Male'), (FEMALE, 'Female'))
    gender = models.CharField(max_length=1, choices=TEMP_CHOICES, default=MALE)
    birthdate = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=15, default="")
    picture = models.ImageField(default="", null=True)
    facial_login = models.BooleanField(default=False)

    def __str__(self):
        return self.get_full_name() or self.username.strip()
