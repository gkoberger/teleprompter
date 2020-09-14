var id = Math.floor(Math.random() * 10000);

var state = window.sessionStorage;

$.page('index', function () {
  var p = 0;

  if ('ontouchend' in document || state.getItem('tele') === 'true') {
    $('body').addClass('is-tele');
  }

  $('.switch').click(function () {
    state.setItem('tele', !$('body').hasClass('is-tele'));

    $('body').toggleClass('is-tele', !$('body').hasClass('is-tele'));
    update();
    return false;
  });

  $('#content > *').eq(p).addClass('current');

  $('#content > p').each(function() {
    var $p = $(this);
    $(this).find('.command').each(function() {
      $p.prepend($(this));
    });
  });

  $('#content > *').click(function() {
    p = $(this).index();
    update();
  });

  $(window).keydown(e => {
    if ($('input:focus, textarea:focus').length) return;

    if (e.keyCode === 83) {
      // S
      $('.switch').eq(0).trigger('click');
      update();
    }
    if (e.keyCode === 34 || e.keyCode === 39 || e.keyCode === 40 || e.keyCode == 66) {
      p++;
      update();
      return false;
    }
    if (e.keyCode === 33 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode == 65) {
      p--;
      update();
      return false;
    }
  });

  function update(fromSocket) {
    if (p < 0) p = 0;
    if (p >= $('#content > *').length - 1) p = $('#content > *').length - 1;


    $('#content > .current').removeClass('current');
    var $p = $('#content > *').eq(p);
    $p.addClass('current');

    if (!fromSocket) {
      socket.emit('paragraph', { p, id });

      var commands = $('.command', $p);

      commands.each(function () {
        var command = $(this).text().split(':');

        console.log('command', { command: command[0], value: command[1] });
        socket.emit('command', { command: command[0], value: command[1] });
      });
    }

    //var offset = ($p.position().top) - (($('#tele').height() - $p.outerHeight()) / 2);
    var offset =
      $p.position().top -
      $('#content-parent').height() +
      $p.outerHeight() +
      120;
    $('#content').css('top', offset * -1);
    $('#content').css('top', offset * -1);

    scrollIntoViewIfNeeded($p[0]);

    function scrollIntoViewIfNeeded(target) {
      if ($('body').is('.is-tele')) return;

      if (target.getBoundingClientRect().bottom > window.innerHeight) {
        target.scrollIntoView(false);
      }

      if (target.getBoundingClientRect().top < 0) {
        target.scrollIntoView();
      }
    }
  }

  var socket = io('/');

  socket.on('paragraph', function (data) {
    if (!data || !data.id) return;
    if (data.id == id) return;
    p = data.p;
    console.log(p);
    update(true);
  });

  socket.on('restart', function (data) {
    window.location.reload();
  });
  //socket.emit('my other event', { my: 'data' });
});
