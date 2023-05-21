from rest_framework import serializers
from .models import Presentation


class PresentationSerializer(serializers.ModelSerializer):
    """
    PresentationSerializer class automatically converts a Presentation model to JSON format
    All fields in the Presentation model are included in this serializer.
    """

    class Meta:
        """
        Meta is a special class that tells Django what model and fields to use.

        Attributes
        ----------
        model : Model
            This is the model class that the serializer is designed to work with.
        fields : str
            This is a special value that indicates all fields in the model should be used.
        """
        model = Presentation
        fields = '__all__'
