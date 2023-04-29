import datetime
import json

from django.shortcuts import render, redirect
from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.hashers import make_password, check_password
from django.conf import settings as django_settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.
print(f"LOCAL_IP: http://{django_settings.LOCAL_IP}:8000/")
DEFAULT_DESIGN_MODE = "Red_Dragon"
AVAILABLE_DESIGN_MODES = ["Red_Dragon", "Blue_Diamond", "Lavender_Love"]


def home(request):
    context = {"title": "Home"}
    return render(request, 'core/home.html', context)


def signup(request):
    context = {"title": "Sign Up"}
    return render(request, 'core/signup.html', context)


def login(request):
    context = {"title": "Login"}
    return render(request, 'core/login.html', context)


@login_required
def logout(request):
    auth.logout(request)
    return redirect('home')


@login_required
def profile(request):
    context = {"title": "Profile"}
    return render(request, 'core/profile.html', context)


@login_required
def settings(request, template="personal_information"):
    context = {"title": "Settings"}
    root = "core/settings/"
    if template == "personal_information":
        context['template'] = root + "personal_information.html"
    elif template == "login_management":
        context['template'] = root + "login_management.html"
    elif template == "account_management":
        context['template'] = root + "account_management.html"
    elif template == "design_and_mode":
        context['template'] = root + "design_mode.html"
    elif template == "privacy_policy":
        context['template'] = root + "privacy_policy.html"
    elif template == "language":
        context['template'] = root + "language.html"
    else:
        context['template'] = root + "personal_information.html"
    return render(request, 'core/settings/settings.html', context)


@api_view(['POST'])
def get_design_mode(request):
    """
    This function retrieves the current design mode from a cookie in the request,
    or sets a default value if it is not present or invalid.
    It returns a JSON response with the current design mode and a flag
    indicating whether it is the first time the user has accessed the page.
    If it is the first time, it sets a cookie with the design mode value that will expire in one year.
    """
    if 'design_mode' not in request.COOKIES or request.COOKIES['design_mode'] not in AVAILABLE_DESIGN_MODES:
        design_mode = DEFAULT_DESIGN_MODE
        first_time = 'Y'
    else:
        design_mode = request.COOKIES.get('design_mode', DEFAULT_DESIGN_MODE)
        first_time = 'N'
    response = Response({'design_mode': design_mode, 'first_time': first_time, }, status=200)
    if first_time == "Y":
        response.set_cookie(
            key='design_mode',
            value=design_mode,
            max_age=datetime.timedelta(days=365)
        )
    return response


@api_view(['POST'])
def set_design_mode(request):
    """
    This function set the design mode of the website.
    It retrieves the design mode value from the request body,
    sets it to the default value if not provided, and ensures that it has a proper title case format.
    It then sets a cookie with the design mode value
    and returns a response object with a success message and the design mode value.
    """
    design_mode = request.data.get('design_mode', DEFAULT_DESIGN_MODE).strip().title()
    design_mode = design_mode if design_mode in AVAILABLE_DESIGN_MODES else DEFAULT_DESIGN_MODE
    response = Response({
        'message': 'Success',
        'design_mode': design_mode,
    }, status=200)
    response.set_cookie(
        key='design_mode',
        value=design_mode,
        max_age=datetime.timedelta(days=365)
    )
    return response
