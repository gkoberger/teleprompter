$.page('index', function() {
  var p = 0;

  if('ontouchend' in document) {
    $('body').addClass('is-tele');
  }

  $('.switch').click(function() {
    $('body').toggleClass('is-tele', !$('body').hasClass('is-tele'));
    update();
    return false;
  });

  $('#content > *').eq(p).addClass('current');

  $(window).keydown((e) => {
    if ($('input:focus, textarea:focus').length) return;

    if (e.keyCode === 83) { // S
      $('.switch').eq(0).trigger('click');
      update();
    }
    if (e.keyCode === 34 || e.keyCode === 39 || e.keyCode === 40) {
      p++;
      update();
      return false;
    }
    if (e.keyCode === 33 || e.keyCode === 37 || e.keyCode === 38) {
      p--;
      update();
      return false;
    }
  });

  function update() {
    if(p < 0) p = 0;
    if(p >= $('#content > *').length - 1) p = $('#content > *').length - 1;

    $('#content > .current').removeClass('current');
    var $p = $('#content > *').eq(p);
    $p.addClass('current');

    //var offset = ($p.position().top) - (($('#tele').height() - $p.outerHeight()) / 2);
    var offset = $p.position().top - $('#content-parent').height() + $p.outerHeight() + 120;
    $('#content').css('top', offset * -1);
    $('#content').css('top', offset * -1);
  }
});
