from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings as django_settings

from .utils import generate_image


@login_required
def image_generation(request):
    context = {"title": "Image Generation"}
    return render(request, 'image_generation/index.html', context)


@api_view(['POST'])
def image_generation_api(request):
    # text_prompt = request.POST.get('text_prompt', '')  # form-encoded data
    text_prompt = request.data.get('text_prompt', '')  # json-encoded data
    image_base64 = generate_image(text_prompt, django_settings.IMAGE_GENERATION_STEPS)
    print(f"{text_prompt = }")  # log to console
    return Response({'text_prompt': text_prompt, 'image_base64': image_base64}, status=200)
