from django.urls import path

from apps.core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name="logout"),
    path('profile', views.profile, name='profile'),
    path('settings', views.settings, name='settings'),
    path('get_theme', views.get_theme, name='get_theme'),
    path('set_theme', views.set_theme, name='set_theme'),
]
