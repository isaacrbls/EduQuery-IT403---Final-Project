from django import template
import json

register = template.Library()

@register.filter(name='jsonify')
def jsonify(value):
    """Convert Python object to JSON string"""
    if value is None:
        return '[]'
    return json.dumps(value)
