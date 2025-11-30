from django.urls import path
from . import views
from .toggle_view import toggle_task_completion

urlpatterns = [
    path('', views.index, name='home'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('tasks/', views.task_list, name='task_list'),
    path('add/', views.add_task, name='add_task'),
    path('quick_add/', views.quick_add_task, name='quick_add_task'),
    path('edit/<int:pk>/', views.edit_task, name='edit_task'),
    path('delete/<int:pk>/', views.delete_task, name='delete_task'),
    path('api/notifications/', views.check_notifications, name='check_notifications'),
    path('api/notifications/count/', views.notifications_count, name='notifications_count'),
    path('api/toggle-task/<int:pk>/', toggle_task_completion, name='toggle_task'),
    path('api/statistics/', views.get_statistics, name='get_statistics'),
]