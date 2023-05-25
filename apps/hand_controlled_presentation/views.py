from django.shortcuts import render, redirect
from django.contrib import messages
from .utils import *
from .models import *
from .serializers import PresentationSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger


PAGE_SIZE = 5


def get_inspired(request):
    # Get all the fields
    fields = Field.objects.all()

    # Get the user's presentations
    user_presentations = Presentation.objects.filter(user=request.user)

    # Get all the presentations that are public for each field and the number of presentations per field
    presentations = {}
    num_presentations_per_field = {}
    for field in fields:
        # .exclude(user=request.user) to exclude the presentations of the current user
        # Get all the presentations that are public for each field
        presentations[field.id] = Presentation.objects.filter(field=field, public=True)

        # Get the number of presentations per field
        num_presentations_per_field[field.id] = len(presentations[field.id])

        # Remove the field if it has no presentations
        if num_presentations_per_field[field.id] == 0:
            fields = fields.exclude(id=field.id)
            continue

        # Get the first PAGE_SIZE presentations
        presentations[field.id] = presentations[field.id][:PAGE_SIZE]

    # Send Warning message if there are no presentations
    if len(fields) == 0:
        messages.warning(request, 'Warning: There are no public presentations.')

    context = {"title": "Get Inspired", 'fields': fields, 'presentations': presentations,
               'num_presentations_per_field': num_presentations_per_field, 'user_presentations': user_presentations}
    return render(request, 'hand_controlled_presentation/get_inspired.html', context)


# API view to get the presentations of a field with pagination support (5 presentations per page)
# The request should contain the field_id and the page number
# The response contains the presentations of the field, the current page number and the total number of pages
@api_view(['POST'])
def field_presentations(request):
    field_id = request.data.get('field_id', '')
    # Get the page number from the request, if not provided set it to 1 (first page).
    page = request.data.get('page', 1)

    try:
        field = Field.objects.get(id=field_id)
    except Field.DoesNotExist:
        return Response({'error': 'Field does not exist.'})

    presentations = Presentation.objects.filter(field=field, public=True)
    paginator = Paginator(presentations, PAGE_SIZE)

    try:
        paginator.page(page)
    except PageNotAnInteger:
        # If page is not an integer, deliver first page.
        page = 1
    except EmptyPage:
        # If page is out of range (e.g., 9999), deliver last page of results.
        page = paginator.num_pages
    presentations = paginator.page(page)

    # serialize the presentations queryset and return in the response.
    presentation_data = PresentationSerializer(presentations, many=True).data
    return Response({
        'presentations': presentation_data,
        'current_page': int(page),
        'total_pages': paginator.num_pages,
    })


# API view to toggle the public status of a presentation
# The request should contain the presentation_id and the new public status (True or False)
# The response contains the new public status of the presentation (True or False) True for public and False for private
@api_view(['POST'])
def toggle_presentation_privacy(request):
    presentation_id = request.data.get('presentation_id', '')
    public = request.data.get('privacy', '')

    try:
        presentation = Presentation.objects.get(id=presentation_id)
    except Presentation.DoesNotExist:
        return Response({'error': 'Presentation does not exist.'})

    presentation.public = public
    presentation.save()
    return Response({'privacy': public})


def upload_presentation(request):
    if request.method == "POST":
        presentation_file = request.FILES.get('presentation_file', '')
        field = request.POST.get('field', '')

        if not presentation_file or not field:
            messages.error(request, 'Error: Please select a file and a field.')
            return redirect('get_inspired')

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

        # Check if the field exists else create it
        try:
            field = Field.objects.get(name=field)
        except Field.DoesNotExist:
            field = Field(name=field)
            field.save()

        # Convert the file to images
        pdf_to_png(presentation_file, presentation_folder / 'images')
        presentation = Presentation(path=presentation_folder.name, field=field, user=request.user,
                                    name="Presentation", public=True)
        presentation.save()
        messages.success(request, 'Presentation uploaded successfully.')
        return redirect('view_presentation', presentation_id=presentation.id)


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
