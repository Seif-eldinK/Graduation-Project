import openai

# openai.api_key = ""


def simplify_text(text):
    response = openai.Completion.create(
      model="text-davinci-003",
      prompt=f"simplify this for a first-grade student in simple english:\n\n {text}",
      temperature=0.7,
      max_tokens=64,
      top_p=1.0,
      frequency_penalty=0.0,
      presence_penalty=0.0
    )
    return response['choices'][0]["text"].strip()
