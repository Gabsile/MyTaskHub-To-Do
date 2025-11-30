from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Task
import json

@require_http_methods(["POST"])
def toggle_task_completion(request, pk):
    """Toggle task completion status"""
    task = get_object_or_404(Task, pk=pk)
    
    try:
        data = json.loads(request.body)
        task.completed = data.get('completed', False)
        task.save()
        
        return JsonResponse({
            'success': True,
            'task_id': task.id,
            'completed': task.completed
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
