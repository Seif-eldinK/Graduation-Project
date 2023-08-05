from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .utils import *

# create a dictionary of characters with their names
characters_root = "images/characters/"
characters = {
    f'{characters_root}character_1.png': 'Maui',
    f'{characters_root}character_2.png': 'Spider-Man',
    f'{characters_root}character_3.png': 'SpongeBob SquarePants',
    f'{characters_root}character_4.png': 'Spider Man',
    f'{characters_root}character_5.png': 'SpongeBob',
    f'{characters_root}character_6.png': 'Buttercup',
    f'{characters_root}character_7.png': 'Sherman',
}


@login_required
def video_generation(request):
    context = {"title": "Character Transformation", "characters": characters}
    return render(request, 'video_generation/index.html', context)


@api_view(['POST'])
def video_generation_api(request):
    uploaded_video = request.data.get('video', '')  # json-encoded data
    video_base64 = uploaded_video.split(',')[1]  # Extract the Base64-encoded data portion of the string

    chosen_character = request.data.get('character', '')

    chosen_character_name = get_voice_name(chosen_character)

    chosen_character = image_absolute_path(chosen_character + '.png')  # absolute path
    chosen_character = image_to_base64(chosen_character)  # base64
    video_base64 = generate_video(video_base64, chosen_character_name, chosen_character)

    video_base64 = 'data:video/mp4;base64,' + video_base64  # Add the data type header to the base64-encoded data
    return Response({'uploaded_video': uploaded_video, 'generated_video': video_base64, }, status=200)
