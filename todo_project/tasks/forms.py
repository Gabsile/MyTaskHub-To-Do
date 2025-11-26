from django import forms
from .models import Task

class TaskForm(forms.ModelForm):
    completed = forms.BooleanField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'due_time', 'priority', 'completed']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-input', 'required': True}),
            'description': forms.Textarea(attrs={'class': 'form-textarea', 'rows': 4}),
            'due_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-input'}),
            'due_time': forms.TimeInput(attrs={'type': 'time', 'class': 'form-input'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
        }
