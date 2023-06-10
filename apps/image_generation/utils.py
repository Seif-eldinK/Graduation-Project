import requests
import json
from django.conf import settings as django_settings

url = django_settings.IMAGE_GENERATION_API_URL


def generate_image(text_prompt: str, steps: int):
    data = {
        "text_prompt": text_prompt,
        "steps": steps,
    }

    response = requests.post(url, json=data)
    try:
        image_base64 = json.loads(response.content.decode('utf-8'))['image_base64']
    except Exception as error:
        raise Exception("Image Generation Server Error, Check the Server Link")
    return image_base64
