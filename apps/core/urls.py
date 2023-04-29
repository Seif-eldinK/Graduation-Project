from django.urls import path

from apps.core import views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup', views.signup, name='signup'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name="logout"),
    path('profile', views.profile, name='profile'),
    path('settings/<str:template>', views.settings, name='settings'),
    path('settings/', views.settings, name='settings'),
    path('get_design_mode', views.get_design_mode, name='get_design_mode'),
    path('set_design_mode', views.set_design_mode, name='set_design_mode'),
]
