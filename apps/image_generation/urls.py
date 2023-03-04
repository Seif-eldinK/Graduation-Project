from django.urls import path

from apps.image_generation import views

urlpatterns = [
    path('image_generation', views.image_generation, name='image_generation'),
    path('image_generation_api', views.image_generation_api, name='image_generation_api'),
]
