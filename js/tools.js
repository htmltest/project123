$(document).ready(function() {

    $.validator.addMethod('phoneRU',
        function(phone_number, element) {
            return this.optional(element) || phone_number.match(/^\+7 \(\d{3}\) \d{3}\-\d{2}\-\d{2}$/);
        },
        'Ошибка заполнения'
    );

    $('form').each(function() {
        initForm($(this));
    });

    $('body').on('click', '.window-link', function(e) {
        var curLink = $(this);
        windowOpen(curLink.attr('href'));
        e.preventDefault();
    });

    $('body').on('keyup', function(e) {
        if (e.keyCode == 27) {
            windowClose();
        }
    });

    $(document).on('click touchstart', function(e) {
        if ($(e.target).hasClass('window')) {
            windowClose();
        }
    });

    $(window).resize(function() {
        windowPosition();
    });

    $('.registration-type input:checked').each(function() {
        var curIndex = $('.registration-type input').index($(this));
        $('.registration-type-descr-item.active').removeClass('active');
        $('.registration-type-descr-item').eq(curIndex).addClass('active');
    });

    $('.registration-type input').on('change', function() {
        if ($(this).prop('checked')) {
            var curIndex = $('.registration-type input').index($(this));
            $('.registration-type-descr-item.active').removeClass('active');
            $('.registration-type-descr-item').eq(curIndex).addClass('active');
        }
    });

    $('body').on('keyup', '#password', function() {
        checkPassword($(this).val());
    });

    $('body').on('click', '.route-supply-content .main-content tbody td.main-view a', function(e) {
        var curLink = $(this);
        if (curLink.hasClass('open')) {
            $('.main-view-detail').remove();
            $('td.main-view a.open').removeClass('open');
        } else {
            var curRow = curLink.parents().filter('tr');
            $('.main-view-detail').remove();
            $('td.main-view a.open').removeClass('open');
            curLink.addClass('open');
            curRow.after('<tr><td colspan="6" class="main-view-detail"><div class="main-view-detail-loading"></div></td></tr>');
            $.ajax({
                type: 'POST',
                url: curLink.attr('href'),
                dataType: 'html',
                cache: false
            }).done(function(html) {
                $('.main-view-detail').html(html);
            });
        }
        e.preventDefault();
    });

    $('body').on('click', 'tbody tr[data-href]', function() {
        window.location = $(this).attr('data-href');
    });

    $('body').on('mouseover', 'tbody tr[data-href] a', function() {
        $('body').off('click', 'tbody tr[data-href]');
    });

    $('body').on('mouseout', 'tbody tr[data-href] a', function() {
        $('body').on('click', 'tbody tr[data-href]', function() {
            window.location = $(this).attr('data-href');
        });
    });

    $('body').on('click', '.main-content thead a, .main-content tfoot a', function(e) {
        var curTable = $(this).parents().filter('table');
        $.ajax({
            type: 'POST',
            url: $(this).attr('href'),
            dataType: 'html',
            cache: false
        }).done(function(html) {
            curTable.replaceWith(html);
        });
        e.preventDefault();
    });

    $('.route-catalogue-type-item input:checked').each(function() {
        var curIndex = $('.route-catalogue-type-item input').index($(this));
        $('.route-catalogue-type-descr.active').removeClass('active');
        $('.route-catalogue-type-descr').eq(curIndex).addClass('active');
    });

    $('.route-catalogue-type-item input').on('change', function() {
        if ($(this).prop('checked')) {
            var curIndex = $('.route-catalogue-type-item input').index($(this));
            $('.route-catalogue-type-descr.active').removeClass('active');
            $('.route-catalogue-type-descr').eq(curIndex).addClass('active');
        }
    });

    $('.route-catalogue-places-filter-all-title').click(function() {
        $('.route-catalogue-places-filter-all').toggleClass('open');
    });

    $(document).click(function(e) {
        if ($(e.target).parents().filter('.route-catalogue-places-filter-all').length == 0) {
            $('.route-catalogue-places-filter-all').removeClass('open');
        }
    });

    var dateFormat = 'dd.mm.yy';
    $('.route-supply-header-input-date input').datepicker({
        dateFormat: dateFormat
    });

});

function initForm(curForm) {
    curForm.find('input.phoneRU').mask('+7 (000) 000-00-00');

    curForm.validate({
        ignore: '',
        submitHandler: function(form) {
            if ($(form).hasClass('ajax-form')) {
                $.ajax({
                    type: 'POST',
                    url: $(form).attr('action'),
                    dataType: 'html',
                    data: $(form).serialize(),
                    cache: false
                }).done(function(html) {
                    $(form).find('.form-result').remove();
                    $(form).append('<div class="form-result">' + html + '</div>');
                });
            } else {
                form.submit();
            }
        }
    });
}

function windowOpen(linkWindow, dataWindow) {
    var curPadding = $('.wrapper').width();
    $('html').addClass('window-open');
    if ($('.window').length == 0) {
        curPadding = $('.wrapper').width() - curPadding;
        $('body').css({'margin-right': curPadding + 'px'});
        $('body').append('<div class="window"><div class="window-loading"></div></div>')
    }

    $.ajax({
        type: 'POST',
        url: linkWindow,
        dataType: 'html',
        data: dataWindow,
        cache: false
    }).done(function(html) {
        if ($('.window').length > 0) {
            $('.window').remove();
        }
        $('body').append('<div class="window"><div class="window-container"><div class="window-content">' + html + '</div></div></div>')

        windowPosition();

        $('.window form').each(function() {
            initForm($(this));
        });
    });
}

function windowPosition() {
    if ($('.window').length > 0) {
        $('.window-container').css({'left': '50%', 'margin-left': -$('.window-container').width() / 2});

        $('.window-container').css({'top': '50%', 'margin-top': -$('.window-container').height() / 2});
        if ($('.window-container').height() > $('.window').height()) {
            $('.window-container').css({'top': '0', 'margin-top': 0});
        }
        $('.window-content').addClass('active');
        $('.window').addClass('active');
    }
}

function windowClose() {
    if ($('.window').length > 0) {
        $('.window').remove();
        $('html').removeClass('window-open');
        $('body').css({'margin-right': 0});
    }
}

function checkPassword(password) {
    var s_letters = 'qwertyuiopasdfghjklzxcvbnm';
    var b_letters = 'QWERTYUIOPLKJHGFDSAZXCVBNM';
    var digits = '0123456789';
    var specials = '!@#$%^&*()_-+=\|/.,:;[]{}';
    var is_s = false;
    var is_b = false;
    var is_d = false;
    var is_sp = false;
    for (var i = 0; i < password.length; i++) {
        if (!is_s && s_letters.indexOf(password[i]) != -1) {
            is_s = true;
        } else if (!is_b && b_letters.indexOf(password[i]) != -1) {
            is_b = true;
        } else if (!is_d && digits.indexOf(password[i]) != -1) {
            is_d = true;
        } else if (!is_sp && specials.indexOf(password[i]) != -1) {
            is_sp = true;
        }
    }
    var rating = 0;
    var text = '';
    if (is_s) rating++;
    if (is_b) rating++;
    if (is_d) rating++;
    if (is_sp) rating++;
    if (password.length < 6 && rating < 3) text = 'низкая';
    else if (password.length >= 6 && rating == 1) text = 'низкая';
    else if (password.length < 6 && rating >= 3) text = 'средняя';
    else if (password.length >= 8 && rating < 3) text = 'средняя';
    else if (password.length >= 6 && rating > 1 && rating < 4) text = 'средняя';
    else if (password.length >= 8 && rating >= 3) text = 'высокая';
    $('.registration-hint-complexity').removeClass('low hi');
    if (text == 'низкая') {
        $('.registration-hint-complexity').addClass('low');
    }
    if (text == 'высокая') {
        $('.registration-hint-complexity').addClass('hi');
    }
    $('.registration-hint-complexity').html(text);
}