# Django Blog Post Comment Project

To Create a Full Comment System for Django Website

> - <a href="#model">1. Create Comment Model & Forms </a>

> - <a href="#system">2. Comment System with jquery & Json </a>


## 1. Create Comment Model & Forms <a href="" name="model"> - </a>


* blog > models.py 

```python
from django.db import models
from django.contrib.auth.models import User


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reply = models.ForeignKey('self', on_delete=models.CASCADE, null=True, related_name='replies')
    content = models.TextField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return self.post.title

    def children(self):
        return Comment.objects.filter(reply=self)


```

* blog > admin.py 

```python
from django.contrib import admin
from .models import *


class CommentAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'user', 'content']

    class Meta:
        model = Comment


admin.site.register(Comment, CommentAdmin)

```
1. Run - `python manage.py makemigrations` & `python manage.py migrate`
2. Create some dummy comment - `127.0.0.1:8000/admin`

* blog > forms.py 

```py
from django import forms
from .models import Comment
from django.forms import Textarea


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

```


## 2. Comment System with jquery & Json <a href="" name="system"> - </a>

1. Create new file > templates > blog - `comments.html`
2. Add javascript file - static > js - `comment.js`
3. Link JS - templates > base > scripts - 

    `<script type="text/javascript" src="{% static 'js/comment.js' %}"></script>`

* blog > views.py 

```py
import json
from django.shortcuts import render
from django.http import JsonResponse
from .forms import CommentForm
from .models import Post, Comment
from django.template.loader import render_to_string


def blogDetails(request, id, slug):
    post = get_object_or_404(Post, id=id, slug=slug)
    comments = Comment.objects.filter(post=post, reply=None).order_by('-id')
    if request.method == 'POST':
        comment_form = CommentForm(request.POST or None)
        if comment_form.is_valid():
            content = request.POST.get('content')
            reply_id = request.POST.get('comment_id')
            comment_qs = None
            if reply_id:
                comment_qs = Comment.objects.get(id=reply_id)
            comment = Comment.objects.create(
                post=post, user=request.user, content=content, reply=comment_qs)
            comment.save()
    else:
        comment_form = CommentForm()

    context = {
        'post': post,
        'comments': comments,
        'comment_form': comment_form,
    }
    if request.is_ajax():
        html = render_to_string('blog/comments.html', context, request=request)
        return JsonResponse({'form': html})
    return render(request, 'blog/blog_details.html', context)
```

* templates > blog > comments.html

```html
<div class="comment_count py-4">
  <h4 class="text-dark">{{ comments.count }} Comment{{ comments|pluralize }}</h4>
</div>
{% for comment in comments %}
<div class="row my-3 ">
  <div class="col-md-1">
    <img class="mr-3 rounded-circle mt-2" src="{{ comment.user.userprofile.image.url }}" height="40px" width="40px" alt="">
  </div>
  <div class="col-md-11 comment-section rounded">
    <blockquote class="blockquote pt-1">
      <p class="mb-0">
        {{ comment.content }}
      </p>
      <footer class="blockquote-footer">{{ comment.user.userprofile.full_name }} |
        <cite title="Source Title">{{ comment.timestamp|timesince }} ago | </cite>
        <a class="comments-show text" >{% if comment.children.count %}{{ comment.children.count }}
          Comment{{ comment.children.count|pluralize  }} | {% endif %}
        </a>
        <cite title="Source Title">
          <button class="reply-btn badge badge-info px-2 py-1 border-0" type="submit" name="button">Reply</button>
        </cite>
      </footer>
    </blockquote>
  </div>
</div>

<div class="replied-comments container pl-5" style="display: none;">
  {% for reply in comment.replies.all %}

  <div class="row my-2">
    <div class="col-md-1">
      <img class="mr-3 rounded-circle mt-2" src="{{ reply.user.userprofile.image.url }}" height="35px" width="35px" alt="">
    </div>
    <div class="col-md-11 reply-section rounded">
      <blockquote class="blockquote pt-1">
        <p class="mb-0">
          {{ reply.content }}
        </p>
        <footer class="blockquote-footer">{{ reply.user.userprofile.full_name }} |
          <cite title="Source Title">{{ comment.timestamp|timesince }} ago </cite>
        </footer>
      </blockquote>
    </div>
  </div>

  {% endfor %}

  <form method="POST" class="reply-form pl-5 pt-3" action="{% url 'blog_details' post.id post.slug %}">
    {% csrf_token %}
    <input type="hidden" name="comment_id" value="{{ comment.id }}">
    <div class="form-group">
      {{ comment_form.content }}
    </div>
    {% if request.user.is_authenticated %}
    <button type="submit" class="btn btn-sm btn-info ml-4">Submit</button>
    {% else %}
    <button type="button" class="btn btn-sm btn-info ml-4" data-toggle="modal" data-target="#signup_message">
      Submit
    </button>
    {% endif %}
  </form>

</div>
{% endfor %}

<!-- Comments Form -->
<div class="card my-4">
  <h5 class="card-header">Leave a Comment:</h5>
  <div class="card-body">
    <form method="POST" class="comment-form" action="{% url 'blog_details' post.id post.slug %}">
      {% csrf_token %}
      <div class="form-group">
        {{ comment_form.content }}
      </div>
      {% if request.user.is_authenticated %}
      <button type="submit" class="btn btn-primary ml-4">Submit</button>
      {% else %}
      <button type="button" class="btn btn-primary ml-4" data-toggle="modal" data-target="#signup_message">
        Submit
      </button>
      <div class="modal fade" id="signup_message">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-body">
              Only Authenticated User are Comment this Post. <br>
              Sing In on your account. <br>
              or Haven't any account, Create New Account
            </div>
            <div class="modal-footer">
              <a href="{% url 'signin' %}" class="btn btn-outline-info btn-sm rounded-pill">Sign In</a>
              <a href="{% url 'signup' %}" class="btn btn-outline-success btn-sm rounded-pill">Create
                Account</a>
            </div>
          </div>
        </div>
      </div>
      {% endif %}

    </form>
  </div>
</div>
```

* templates > blog > blog_details.html

```html
 <!-- Comments -->
<section class="main-comment-section">
    {% include 'blog/comments.html' %}
</section>
```

* static > js > comment.js

```js
$(document).ready(function (event) {
  $('.reply-btn').click(function () {
    $(this)
      .parent()
      .parent()
      .parent()
      .parent()
      .parent()
      .next('.replied-comments')
      .fadeToggle();
  });
});

$(document).ready(function (event) {
  $('.comments-show').click(function () {
    $(this)
      .parent()
      .parent()
      .parent()
      .parent()
      .next('.replied-comments')
      .fadeToggle();
  });
});

$(document).on('submit', '.comment-form', function (event) {
  event.preventDefault();
  console.log($(this).serialize());
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function (response) {
      $('.main-comment-section').html(response['form']);
      $('textarea').val('');
      $('.reply-btn').click(function () {
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .next('.replied-comments')
          .fadeToggle();
        $('textarea').val('');
      });
      $('.comments-show').click(function () {
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .next('.replied-comments')
          .fadeToggle();
        $('textarea').val('');
      });
    },
    error: function (rs, e) {
      console.log(rs.responseText);
    },
  });
});

$(document).on('submit', '.reply-form', function (event) {
  event.preventDefault();
  console.log($(this).serialize());
  $.ajax({
    type: 'POST',
    url: $(this).attr('action'),
    data: $(this).serialize(),
    dataType: 'json',
    success: function (response) {
      $('.main-comment-section').html(response['form']);
      $('textarea').val('');
      $('.reply-btn').click(function () {
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .next('.replied-comments')
          .fadeToggle();
        $('textarea').val('');
      });
      $('.comments-show').click(function () {
        $(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .next('.replied-comments')
          .fadeToggle();
        $('textarea').val('');
      });
    },
    error: function (rs, e) {
      console.log(rs.responseText);
    },
  });
});

```



## Run This Demo -

Steps:

1. Clone/pull/download this repository
2. Create a virtualenv with `virtualenv venv` and install dependencies with `pip install -r requirements.txt`
3. Configure your .env variables
4. Migrate all `python manage.py makemigrations` & `python manage.py migrate`
5. Create super user `python manage.py createsuperuser`
6. Collect all static files `python manage.py collectstatic`