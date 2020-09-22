from django import forms
from .models import Comment
from django.forms import Textarea


class SearchForm(forms.Form):
    query = forms.CharField(max_length=200)


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('content',)
        widgets = {
            'content': Textarea(attrs={
                'class': 'form-control border rounded-pill',
                'rows': '2',
                'placeholder': 'Add a public comment',
            }),
        }
