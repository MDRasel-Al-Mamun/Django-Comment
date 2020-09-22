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
