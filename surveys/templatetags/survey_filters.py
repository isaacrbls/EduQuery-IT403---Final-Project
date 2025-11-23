from django import template
import json

register = template.Library()

@register.filter(name='jsonify')
def jsonify(value):
    """Convert Python object to JSON string"""
    if value is None:
        return '[]'
    return json.dumps(value)

@register.filter(name='range_filter')
def range_filter(min_val, max_val):
    """Create a range from min to max (inclusive)"""
    try:
        return range(int(min_val), int(max_val) + 1)
    except (ValueError, TypeError):
        return range(1, 6)

@register.filter(name='index')
def index(indexable, i):
    """Access list item by index"""
    try:
        return indexable[int(i)]
    except (IndexError, TypeError, ValueError):
        return ''
