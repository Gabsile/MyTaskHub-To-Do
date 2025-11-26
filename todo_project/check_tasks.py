import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'todo_project.settings')
django.setup()

from tasks.models import Task

print("\n=== CHECKING DATABASE ===")
all_tasks = Task.objects.all()
print(f"Total tasks in database: {all_tasks.count()}")

if all_tasks.count() > 0:
    print("\nAll tasks:")
    for task in all_tasks:
        print(f"  ID: {task.id}, Title: {task.title}, Completed: {task.completed}, Due: {task.due_date}")
    
    print("\n=== Do you want to DELETE ALL tasks? ===")
    response = input("Type 'yes' to delete all tasks: ")
    if response.lower() == 'yes':
        count = all_tasks.count()
        all_tasks.delete()
        print(f"\n✓ Deleted {count} tasks!")
        print(f"Remaining tasks: {Task.objects.count()}")
    else:
        print("No tasks deleted.")
else:
    print("Database is empty - no tasks found!")
