from django import template
from django.urls import reverse

register = template.Library()


@register.simple_tag
def active(current_link, active_link):
    if current_link == reverse(active_link):
        return "active"
    else:
        return ""


@register.simple_tag
def active_in(current_link, active_link):
    if active_link in current_link:
        return "active"
    else:
        return ""


# Get value of dictionary by key
@register.filter
def get_item(dictionary, key):
    return dictionary[key]
