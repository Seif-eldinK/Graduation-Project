import base64
import json

import requests
from django.conf import settings as django_settings

# url = input("Please enter Video Conversion server link: ")
url = ""
character_voice_name = {
    "character_1": "rock",
    "character_2": "Tom",
    "character_3": "SpongeBob",
}


# function to get voice name from character name
def get_voice_name(character_name):
    return character_voice_name.get(character_name, "")


# function to get base64 from image name
def image_to_base64(image):
    with open(image, "rb") as image_file:
        image = image_file.read()
        image_base64 = base64.b64encode(image).decode('utf-8')
    return image_base64


# function to get absolute path from image name
def image_absolute_path(image):
    return django_settings.STATICFILES_DIRS[0] / 'images' / 'characters' / image


def generate_video(video, character_name, character):
    data = {
        "video": video,
        "character_name": character_name,
        "character": character,
    }
    response = requests.post(url, json=data)
    try:
        video_base64 = json.loads(response.content.decode('utf-8'))['generated_video']
    except Exception as error:
        raise Exception("Video Generation Server Error, Check the Server Link")
    return video_base64
