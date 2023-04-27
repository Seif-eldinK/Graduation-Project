from django.shortcuts import render, redirect
from django.contrib import messages
from .utils import *
from .models import *


# Create your views here.
def get_inspired(request):
    context = {"title": "Get Inspired"}
    return render(request, 'hand_controlled_presentation/get_inspired.html', context)


def upload_presentation(request):
    if request.method == "POST":
        presentation_file = request.FILES.get('presentation_file', '')
        field = request.POST.get('field', '')

        if presentation_file and field:
            # Save the file
            presentation_folder = handle_uploaded_file(presentation_file, presentation_file.name)

            # Check the file extension
            if presentation_file.name.endswith('.pptx'):
                # Convert the file to PDF
                presentation_file = powerpoint_to_pdf(presentation_folder / presentation_file.name)
                presentation_file = presentation_folder / presentation_file
            elif presentation_file.name.endswith('.pdf'):
                # Convert the relative path to an absolute path
                presentation_file = presentation_folder / presentation_file.name

            # Convert the file to images
            images_folder = pdf_to_png(presentation_file, presentation_folder / 'images')
            presentation = Presentation(path=presentation_folder.name, field=field, user=request.user,
                                        name="Presentation", public=True)
            presentation.save()
            messages.success(request, 'Presentation uploaded successfully.')
            return redirect('view_presentation', presentation_id=presentation.id)

    messages.error(request, 'Error: Please select a file and a field.')
    return redirect('get_inspired')


def view_presentation(request, presentation_id=None):
    context = {"title": "Hand Controlled Presentation"}
    if not presentation_id:
        messages.error(request, 'Error: Please select a presentation.')
        return redirect('get_inspired')
    try:
        presentation = Presentation.objects.get(id=presentation_id)
    except Presentation.DoesNotExist:
        messages.error(request, 'Error: Presentation does not exist.')
        return redirect('get_inspired')
    context['presentation'] = presentation
    context['number_pages'] = get_num_pages(presentation.path)
    context['pages_range'] = range(context['number_pages'])
    return render(request, 'hand_controlled_presentation/index.html', context)
