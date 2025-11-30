from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datetime import datetime, timedelta, date
from django.utils import timezone
from django.db.models import Sum, Q
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from .models import Task
from .forms import TaskForm

def index(request):
    # Redirect to today's tasks
    return redirect('/tasks/?filter=today')

def task_list(request):
    filter_type = request.GET.get('filter', 'today')
    today = date.today()
    tomorrow = today + timedelta(days=1)
    week_end = today + timedelta(days=7)
    
    # Debug: Print all tasks
    print(f"=== TASK LIST VIEW - Filter: {filter_type} ===")
    print(f"Total tasks in database: {Task.objects.count()}")
    
    # Filter tasks based on selection
    if filter_type == 'today':
        tasks = Task.objects.filter(due_date=today).order_by('completed', 'due_time', 'id')
        page_title = "Today"
    elif filter_type == 'tomorrow':
        tasks = Task.objects.filter(due_date=tomorrow).order_by('completed', 'due_time', 'id')
        page_title = "Tomorrow"
    elif filter_type == 'week':
        tasks = Task.objects.filter(due_date__range=[today, week_end]).order_by('completed', 'due_date', 'due_time', 'id')
        page_title = "This Week"
    elif filter_type == 'planned':
        tasks = Task.objects.filter(due_date__gte=today).order_by('completed', 'due_date', 'due_time', 'id')
        page_title = "Planned"
    elif filter_type == 'completed':
        tasks = Task.objects.filter(completed=True).order_by('-due_date', '-due_time', '-id')
        page_title = "Completed"
    else:
        tasks = Task.objects.all().order_by('completed', 'due_date', 'due_time', 'id')
        page_title = "Tasks"
    
    print(f"Filtered tasks count: {tasks.count()}")
    for t in tasks:
        print(f"  - Task {t.id}: {t.title} (completed: {t.completed})")
    
    # Calculate statistics
    pending_tasks = tasks.filter(completed=False)
    completed_tasks = tasks.filter(completed=True)
    
    estimated_time = 30 * pending_tasks.count()  # Assume 30 min per task
    elapsed_time = 30 * completed_tasks.count()
    
    context = {
        'tasks': tasks,
        'page_title': page_title,
        'current_filter': filter_type,
        'estimated_time': estimated_time,
        'pending_count': pending_tasks.count(),
        'elapsed_time': elapsed_time,
        'completed_count': completed_tasks.count(),
        'has_completed': completed_tasks.exists(),
    }
    
    return render(request, 'task_list.html', context)

def add_task(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('task_list')
    else:
        form = TaskForm()
    return render(request, 'task_form.html', {'form': form})

def edit_task(request, pk):
    task = get_object_or_404(Task, pk=pk)
    if request.method == 'POST':
        # Get the old values before update
        old_due_date = task.due_date
        old_due_time = task.due_time
        
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            updated_task = form.save(commit=False)
            
            # Check if due_date or due_time changed by comparing old vs new values
            if (updated_task.due_date != old_due_date or 
                updated_task.due_time != old_due_time):
                updated_task.notified_10min = False
            
            updated_task.save()
            
            # Determine which filter to redirect to based on the updated due_date
            today = date.today()
            tomorrow = today + timedelta(days=1)
            
            if updated_task.due_date == today:
                redirect_filter = 'today'
            elif updated_task.due_date == tomorrow:
                redirect_filter = 'tomorrow'
            elif updated_task.due_date and updated_task.due_date >= today:
                redirect_filter = 'planned'
            else:
                redirect_filter = request.GET.get('filter', 'today')
            
            return redirect(f'/tasks/?filter={redirect_filter}')
        else:
            # If form is invalid, print errors for debugging
            print("Form errors:", form.errors)
    else:
        form = TaskForm(instance=task)
    return render(request, 'task_form.html', {'form': form, 'task': task})

def delete_task(request, pk):
    task = get_object_or_404(Task, pk=pk)
    filter_param = request.GET.get('filter', 'today')
    
    try:
        # Print for debugging
        print(f"=== DELETE REQUEST for task {pk}: {task.title} ===")
        print(f"Task exists: {Task.objects.filter(pk=pk).exists()}")
        
        # Delete the task
        task.delete()
        
        # Verify deletion
        print(f"Task deleted. Still exists: {Task.objects.filter(pk=pk).exists()}")
        print(f"Total remaining tasks: {Task.objects.count()}")
        
    except Exception as e:
        print(f"ERROR deleting task: {e}")
    
    # Force redirect to clear any cache
    from django.http import HttpResponseRedirect
    return HttpResponseRedirect(f'/tasks/?filter={filter_param}')

def quick_add_task(request):
    """Quick add task from inline input"""
    if request.method == 'POST':
        title = request.POST.get('title', '').strip()
        filter_type = request.POST.get('filter', 'today')
        
        if title:
            # Determine due_date based on filter
            today = date.today()
            if filter_type == 'tomorrow':
                due_date = today + timedelta(days=1)
            elif filter_type == 'week':
                due_date = today + timedelta(days=7)
            else:
                due_date = today
            
            Task.objects.create(
                title=title,
                due_date=due_date,
                priority='Medium',
                completed=False
            )
        
        # Redirect back to the same filter view
        if filter_type:
            return redirect(f'/tasks/?filter={filter_type}')
        return redirect('task_list')
    
    return redirect('task_list')

@require_http_methods(["GET"])
def check_notifications(request):
    """Check for tasks due in 10 minutes that haven't been notified yet."""
    # Use timezone-aware datetimes
    now = timezone.localtime(timezone.now())
    ten_min_later = now + timedelta(minutes=10)
    
    # Find tasks due today
    tasks_to_check = Task.objects.filter(
        due_date=now.date(),
        completed=False,
        notified_10min=False
    )
    
    notifications = []
    for task in tasks_to_check:
        # If task has a time, check if it's within 10 minutes
        if task.due_time:
            task_dt_naive = datetime.combine(task.due_date, task.due_time)
            # make aware in current timezone
            task_datetime = timezone.make_aware(task_dt_naive, timezone.get_current_timezone())
            if now <= task_datetime <= ten_min_later:
                task.notified_10min = True
                task.save()
                notifications.append({
                    'id': task.id,
                    'title': task.title,
                    'description': task.description,
                    'priority': task.priority,
                    'due_time': task.due_time.strftime('%H:%M'),
                })
        else:
            # If no specific time, notify at beginning of day
            task.notified_10min = True
            task.save()
            notifications.append({
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'priority': task.priority,
                'due_time': 'All day',
            })
    
    return JsonResponse({'notifications': notifications})


@require_http_methods(["GET"])
def notifications_count(request):
    """Return count of all incomplete tasks."""
    from django.utils import timezone
    now = timezone.localtime(timezone.now())
    
    # Get all incomplete tasks (including those without a user assigned)
    qs = Task.objects.filter(completed=False).order_by('due_date', 'due_time')
    count = qs.count()
    
    tasks = []
    for t in qs:
        tasks.append({
            'id': t.id,
            'title': t.title,
            'due_date': t.due_date.strftime('%Y-%m-%d') if t.due_date else None,
            'due_time': t.due_time.strftime('%H:%M') if t.due_time else None,
            'priority': t.priority,
        })
    return JsonResponse({'count': count, 'tasks': tasks})

@require_http_methods(["POST"])
def toggle_task(request, pk):
    """Toggle task completion status"""
    import json
    task = get_object_or_404(Task, pk=pk)
    data = json.loads(request.body)
    task.completed = data.get('completed', False)
    task.save()
    return JsonResponse({'success': True, 'completed': task.completed})

@require_http_methods(["GET"])
def get_statistics(request):
    """Return statistics for the modal"""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Count all completed tasks
    total_completed = Task.objects.filter(completed=True).count()
    
    # Count completed tasks with due dates this week
    tasks_completed_this_week = Task.objects.filter(
        completed=True,
        due_date__gte=week_start,
        due_date__lte=week_end
    ).count()
    
    # Count completed tasks with due date today
    tasks_completed_today = Task.objects.filter(
        completed=True,
        due_date=today
    ).count()
    
    return JsonResponse({
        'total_completed': total_completed,
        'tasks_completed_this_week': tasks_completed_this_week,
        'tasks_completed_today': tasks_completed_today,
    })

def login_view(request):
    """Handle user login"""
    if request.user.is_authenticated:
        return redirect('task_list')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            auth_login(request, user)
            return redirect('/tasks/?filter=today')
        else:
            return render(request, 'login.html', {'error': 'Invalid username or password'})
    
    return render(request, 'login.html')

def signup_view(request):
    """Handle user registration"""
    if request.user.is_authenticated:
        return redirect('task_list')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        
        errors = []
        
        # Validate input
        if not username or not email or not password1 or not password2:
            errors.append('All fields are required')
        
        if password1 != password2:
            errors.append('Passwords do not match')
        
        if len(password1) < 8:
            errors.append('Password must be at least 8 characters long')
        
        if User.objects.filter(username=username).exists():
            errors.append('Username already exists')
        
        if User.objects.filter(email=email).exists():
            errors.append('Email already registered')
        
        if errors:
            return render(request, 'signup.html', {
                'errors': errors,
                'username': username,
                'email': email
            })
        
        # Create user
        user = User.objects.create_user(username=username, email=email, password=password1)
        auth_login(request, user)
        return redirect('/tasks/?filter=today')
    
    return render(request, 'signup.html')

def logout_view(request):
    """Handle user logout"""
    auth_logout(request)
    return redirect('login')