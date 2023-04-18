from django.shortcuts import render


# Create your views here.
def hand_controlled_presentation(request):
    context = {"title": "Hand Controlled Presentation"}
    return render(request, 'hand_controlled_presentation/index.html', context)


def hand_controlled_presentation_api(request):
    return None
