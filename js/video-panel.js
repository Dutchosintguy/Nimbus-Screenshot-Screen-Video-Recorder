/**
 * Created by hasesanches on 2017.
 */

$.get(chrome.extension.getURL('template/panel-video-compact.html'), function (data) {
    $('body').append(data).append($('<div>').addClass('nsc-video-editor'));

    var body = document.body,
        html = document.documentElement,
        page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
        page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
        intervalClear = null;

    var videoEditor = $('.nsc-video-editor').width(page_w).height(page_h).videoEditor();

    $('.nsc-video-editor').on('nimbus-editor-change', function (e, tools, color) {
        if (tools) {
            var $this = $('[data-event-param=' + tools + ']');
            var $button = $this.closest('.nsc-panel-button');
            var $dropdown = $button.find('.nsc-panel-dropdown');
            $('.nsc-panel-button').removeClass('active').filter($button).addClass('active');
            if ($dropdown.length) $button.find('.nsc-panel-text span').attr('class', $this.attr('class'));
        }
        if (color) {
            $('#nsc_panel_button_colors').css('background-color', color);
        }
    });

    $('*[data-event^=nimbus-editor]').on('click', function () {
        videoEditor.trigger($(this).data('event'), $(this).data('eventParam'));
        if ($(this).data('event') == 'nimbus-editor-active-tools') {
            localStorage.videoEditorTools = $(this).data('eventParam');
        }
    });

    $('*[data-i18n]')
        .on('mouseenter', function () {
            $('.nsc-panel-tooltip-layout').text(chrome.i18n.getMessage($(this).data('i18n')));
            $('.nsc-panel.nsc-panel-compact').addClass('nsc-tooltip');
        })
        .on('mouseleave', function () {
            $('.nsc-panel.nsc-panel-compact').removeClass('nsc-tooltip')
        });

    $('.nsc-panel-toggle-button').on('click', function () {
        $('.nsc-panel.nsc-panel-compact').hide();
    });

    $('.nsc-panel-button').on('click', function () {
        var $this = $(this);
        if ($this.hasClass('nsc-panel-button')) {
            $('.nsc-panel-button').not($this).removeClass('opened');
            if ($this.find('.nsc-panel-dropdown').length) $this.toggleClass('opened');
        } else {
            $('.nsc-panel-button').removeClass('opened');
        }
    });

    function panelKeyDown(e) {
        if (e.altKey) {
            switch (e.key) {
                case 'v':
                    if ($('.nsc-panel.nsc-panel-compact:visible').length) {
                        $('.nsc-panel.nsc-panel-compact').hide();
                        chrome.extension.sendMessage({operation: 'video_deawing_tools', value: 'false'});
                    } else {
                        $('.nsc-panel.nsc-panel-compact').show();
                        chrome.extension.sendMessage({operation: 'video_deawing_tools', value: 'true'});
                    }
                    break;
                case 's':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'cursorDefault');
                    localStorage.videoEditorTools = 'cursorDefault';
                    break;
                case 'g':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'cursorShadow');
                    localStorage.videoEditorTools = 'cursorShadow';
                    break;
                case 'l':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'cursorRing');
                    localStorage.videoEditorTools = 'cursorRing';
                    break;
                case 'p':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'pen');
                    localStorage.videoEditorTools = 'pen';
                    break;
                case 'a':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'arrow');
                    localStorage.videoEditorTools = 'arrow';
                    break;
                case 'r':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'square');
                    localStorage.videoEditorTools = 'square';
                    break;
                case 'm':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'notifRed');
                    localStorage.videoEditorTools = 'notifRed';
                    break;
                case 'q':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'notifBlue');
                    localStorage.videoEditorTools = 'notifBlue';
                    break;
                case 'c':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'notifGreen');
                    localStorage.videoEditorTools = 'notifGreen';
                    break;
                case 'n':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'clear');
                    localStorage.videoEditorTools = 'clear';
                    break;
                case 'u':
                    videoEditor && videoEditor.trigger('nimbus-editor-active-tools', 'clearAll');
                    localStorage.videoEditorTools = 'clearAll';
                    break;
            }
        }
    }

    $(window).on('keydown', panelKeyDown).resize(function () {
        $('.nsc-panel.nsc-panel-compact').css('top', window.innerHeight - 46);
    }).trigger('resize');

    var $button_play = $('#nsc_panel_button_play');
    var $button_pause = $('#nsc_panel_button_pause');
    var $button_stop = $('#nsc_panel_button_stop');
    $button_play.hide();
    chrome.extension.onMessage.addListener(function (req, sender, sendResponse) {
        if (req.operation == 'status_video') {
            if (!req.status) {
                $('.nsc-panel.nsc-panel-compact').remove();
                $('.nsc-video-editor').remove();
                $(window).off('keydown', panelKeyDown);
                chrome.runtime.onMessage.removeListener(arguments.callee);
                intervalClear && clearInterval(intervalClear)
            } else if (req.state == 'recording') {
                $button_play.hide();
                $button_pause.show();
            } else {
                $button_pause.hide();
                $button_play.show();
            }
        }
        if (req.operation == 'is_set_file') {
            sendResponse(true)
        }
    });

    $button_play.on('click', function () {
        chrome.extension.sendMessage({operation: 'status_video_change', status: 'play'});
    });
    $button_pause.on('click', function () {
        chrome.extension.sendMessage({operation: 'status_video_change', status: 'pause'});
    });
    $button_stop.on('click', function () {
        chrome.extension.sendMessage({operation: 'status_video_change', status: 'stop'});
    });

    if (deawingTools && localStorage.videoEditorTools != undefined) {
        videoEditor && videoEditor.trigger('nimbus-editor-active-tools', localStorage.videoEditorTools);
    }

    if (deawingTools) {
        $('.nsc-panel.nsc-panel-compact').show();
    } else {
        $('.nsc-panel.nsc-panel-compact').hide();
    }

    if (deleteDrawing) {
        intervalClear = setInterval(function () {
            videoEditor.trigger('nimbus-editor-active-tools', 'clearAll');
        }, deleteDrawing * 1000)
    }

});