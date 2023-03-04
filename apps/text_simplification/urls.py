from django.urls import path

from apps.text_simplification import views

urlpatterns = [
    path('text_simplification', views.text_simplification, name='text_simplification'),
    path('text_simplification_api', views.text_simplification_api, name='text_simplification_api'),
]
