from django.urls import path

from apps.hand_controlled_presentation import views

urlpatterns = [
    path('hand_controlled_presentation', views.hand_controlled_presentation, name='hand_controlled_presentation'),
    path('hand_controlled_presentation_api', views.hand_controlled_presentation_api, name='hand_controlled_presentation_api'),
]
