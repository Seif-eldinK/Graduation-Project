from django.urls import path

from apps.hand_controlled_presentation import views

urlpatterns = [
    path('get_inspired', views.get_inspired, name='get_inspired'),
    path('upload_presentation', views.upload_presentation, name='upload_presentation'),
    path('view_presentation/<int:presentation_id>', views.view_presentation, name='view_presentation'),
    path('view_presentation', views.view_presentation, name='view_presentation'),
]
