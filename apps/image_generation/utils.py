import requests
import json

url = ""
# url = input("Please enter image generation server link: ")


def generate_image(text_prompt: str, steps: int):
    data = {
        "text_prompt": text_prompt,
        "steps": steps,
    }

    response = requests.post(url, json=data)

    image_base64 = json.loads(response.content.decode('utf-8'))['image_base64']
    return image_base64
