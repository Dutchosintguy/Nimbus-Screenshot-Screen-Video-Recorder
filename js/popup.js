var bg = chrome.extension.getBackgroundPage();
var bgScreencapture = bg.screenshot;
var videoRecorder = bg.videoRecorder;

bgScreencapture.selectedOptionFunction(function (tab) {
    var $nsc_button_main = $(".nsc-button-main");

    if (!tab) {
        $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-visible], [name=capture-window], [name=capture-blank], [name=capture-android]').css({
            opacity: 0.7
        })
    }

    if (chrome.extension.getBackgroundPage().thisFragment) {
        $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-fragment]').css({
            opacity: 0.7
        })
    }
    if (chrome.extension.getBackgroundPage().thisCrop) {
        $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-area]').css({
            opacity: 0.7
        })
    }
    if (chrome.extension.getBackgroundPage().thisScrollCrop) {
        $nsc_button_main.attr('disabled', 'disabled').not('[name=capture-scroll]').css({
            opacity: 0.7
        })
    }

    if (localStorage.quickCapture !== 'false') {
        $('button[name=\'capture-' + localStorage.quickCapture + '\']').click();
    }
});

var t = null;

function checkRecord() {
    var status = videoRecorder.getStatus();
    if (status) {
        showTime(videoRecorder.getTimeRecord());
        showRecordStatus();
    } else {
        showCaptureOptions();
        clearTimeout(t)
    }
    t = setTimeout(checkRecord, 500);
}

function showCaptureOptions() {
    $('#capture_options').show();
    $('#record_options').hide();
    $('#record_status').hide();
    $('#record_setting').hide();

    $('body').removeClass('resize');
}

function showRecordOptions() {
    $('#capture_options').hide();
    $('#record_options').show();
    $('#record_status').hide();
    $('#record_setting').hide();

    $('body').removeClass('resize');
}

function showRecordSetting() {
    $('#capture_options').hide();
    $('#record_options').hide();
    $('#record_status').hide();
    $('#record_setting').show();

    $('body').removeClass('resize');
}

function showRecordStatus() {
    $('#capture_options').hide();
    $('#record_options').hide();
    $('#record_status').show();
    $('#record_setting').hide();

    $('body').addClass('resize');
}

function hideAllOptions() {
    $('#capture_options').hide();
    $('#record_options').hide();
    $('#record_status').hide();
    $('#record_setting').hide();

    $('body').removeClass('resize');
}

function showTime(date) {
    var time = new Date(date),
        // y = time.getUTCFullYear(),
        m = time.getUTCMonth(),
        d = time.getUTCDate() - 1,
        h = time.getUTCHours(),
        M = time.getUTCMinutes(),
        s = time.getUTCSeconds(),
        time_str = '';
    // console.log(date, d, h, M, s);
    // if (y > 0) time_str += y + ':';
    if (m > 0) time_str += ('0' + y).slice(-2) + ':';
    if (d > 0) time_str += ('0' + d).slice(-2) + ':';
    if (h > 0) time_str += ('0' + h).slice(-2) + ':';
    time_str += ('0' + M).slice(-2) + ':';
    time_str += ('0' + s).slice(-2);

    $('#record_time').text(time_str);
}

$(document).tooltip({
    position: {my: "center top+10", at: "center bottom"}
}).ready(function () {

    $('*[data-i18n]').each(function () {
        $(this).on('restart-i18n', function () {
            var text = chrome.i18n.getMessage($(this).data('i18n'));
            var attr = $(this).data('i18nAttr');
            if (attr && text) {
                $(this).attr(attr, text);
            } else if (text) {
                $(this).html(text);
            }
        }).trigger('restart-i18n');
    });

    $("button").on('click', function () {
        switch (this.name) {
            case 'capture-visible':
                bgScreencapture.captureVisible();
                break;
            case 'capture-fragment':
                bgScreencapture.captureFragment();
                break;
            case 'capture-area':
                bgScreencapture.captureSelected();
                break;
            case 'capture-delayed':
                bgScreencapture.captureDelayed();
                break;
            case 'capture-scroll':
                bgScreencapture.scrollSelected();
                break;
            case 'capture-entire':
                bgScreencapture.captureEntire();
                break;
            case 'capture-window':
                bgScreencapture.captureWindow();
                break;
            case 'capture-blank':
                bgScreencapture.createBlank();
                break;
            case 'capture-android':
                bgScreencapture.openPage('https://chrome.google.com/webstore/detail/web-clipper-nimbus/kiokdhlcmjagacmcgoikapbjmmhfchbi');
                break;
            case 'open-plugin-option':
                chrome.tabs.create({url: 'options.html'});
                break;
            case 'capture-video':
                window.navigator.webkitGetUserMedia({audio: true}, function (s) {
                    showRecordOptions();
                    // $('input[name=record-mic]').prop("checked", true);
                    // localStorage.micSound = 'true';
                }, function (e) {
                    $('input[name=record-mic]').prop("checked", false);
                    localStorage.micSound = 'false';
                    if (localStorage.micPopup != 'false') {
                        showRecordOptions();
                    } else {
                        hideAllOptions();
                        $('body').addClass('active-popup');
                    }
                });
                break;
            case 'back-to-capture':
                showCaptureOptions();
                break;
            case 'back-to-capture-setting':
                showRecordOptions();
                break;
            case 'record-start':
                var type = $('input[name=record-type]:checked').val();
                var countdown = $('#video_countdown').val();
                videoRecorder.capture({
                    type: type,
                    countdown: countdown
                });
                break;
            case 'record-stop':
                videoRecorder.stopRecord();
                break;
            case 'record-pause':
                videoRecorder.pauseRecord();
                $(this).find('.nsc-button-layout')
                    .text(videoRecorder.getState() === 'recording' ? chrome.i18n.getMessage("popupBtnStopPause") : chrome.i18n.getMessage("popupBtnStopResume"));
                break;
            case 'open-mic':
                localStorage.micPopup = 'true';
                chrome.tabs.create({url: 'mic.html'});
                break;
            case 'open-video-record':
                localStorage.micPopup = 'true';
                $('body').removeClass('active-popup');
                showRecordOptions();
                break;
            case 'video-setting':
                showRecordSetting();
                break;
            case 'open-help':
                if (window.navigator.language === 'ru') {
                    bgScreencapture.openPage('https://everhelper.desk.com/customer/en/portal/articles/2376166-%D0%9A%D0%B0%D0%BA-%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D1%8B%D0%B2%D0%B0%D1%82%D1%8C-%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE-%D0%B2-google-chrome-');
                    chrome.tabs.create({url: ''});
                } else {
                    bgScreencapture.openPage('https://everhelper.desk.com/customer/en/portal/articles/2137491-how-to-record-video-from-screen-screencasts---quick-guide');
                }
                break;
            case 'open-nimbus-client':
                bgScreencapture.openPage('https://nimbus.everhelper.me/client/');
                break;
            case 'reset-video-setting':
                localStorage.videoSize = 'auto';
                localStorage.videoBitrate = '4500000';
                localStorage.audioBitrate = '96000';
                localStorage.videoFps = '24';
                localStorage.deleteDrawing = '6';

                $("input[name=video-size]").prop('checked', false).filter('[value=' + localStorage.videoSize + ']').prop('checked', true);
                $("select[name=audio-bitrate]").val(localStorage.audioBitrate);
                $("select[name=video-bitrate]").val(localStorage.videoBitrate);
                $("select[name=video-fps]").val(localStorage.videoFps);
                $("select[name=delete-drawing]").val(localStorage.deleteDrawing);
                return;
                break;
        }

        if ($(this).data('closeWindow')) {
            window.close();
        }
    });

    $('button[name=record-pause] .nsc-button-layout')
        .text(videoRecorder.getState() === 'recording' ? chrome.i18n.getMessage("popupBtnStopPause") : chrome.i18n.getMessage("popupBtnStopResume"));

    $("input").on('change', function () {
        switch (this.name) {
            case 'record-type':
                if ($(this).val() == 'desktop') {
                    $('input[name=record-tab-sound]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopTabSound"));
                    $('input[name=record-cursor-animate]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation"));
                    localStorage.tabSound = false;
                    localStorage.cursorAnimate = false;
                } else {
                    $('input[name=record-tab-sound]').prop("checked", false).prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '');
                    $('input[name=record-cursor-animate]').prop("checked", false).prop("disabled", false).closest('.nsc-capture-switcher').attr('title', '');

                }
                localStorage.recordType = $(this).val();
                break;
            case 'record-mic':
                window.navigator.webkitGetUserMedia({audio: true}, function () {
                    localStorage.micSound = $(this).prop("checked");
                }.bind(this), function (e) {
                    chrome.tabs.create({url: 'mic.html'});
                });
                break;
            case 'record-tab-sound':
                localStorage.tabSound = $(this).prop("checked");
                break;
            case 'record-cursor-animate':
                localStorage.cursorAnimate = $(this).prop("checked");
                break;
            case 'show-drawing-tools':
                localStorage.deawingTools = $(this).prop("checked");
                break;
            case 'video-size':
                localStorage.videoSize = $(this).val();
                break;
            case 'video-re-encoding':
                localStorage.videoReEncoding = $(this).prop("checked");
                break;
        }
    }).filter('[name=record-mic]').prop('checked', localStorage.micSound !== 'false').end()
        .filter('[name=record-tab-sound]').prop('checked', localStorage.tabSound !== 'false').end()
        .filter('[name=record-cursor-animate]').prop('checked', localStorage.cursorAnimate !== 'false').end()
        .filter('[name=show-drawing-tools]').prop('checked', localStorage.deawingTools !== 'false').end()
        .filter('[name=video-re-encoding]').prop('checked', localStorage.videoReEncoding !== 'false').end()
        .filter('[name=record-type][value=' + localStorage.recordType + ']').prop('checked', true).end()
        .filter('[name=video-size][value=' + localStorage.videoSize + ']').prop('checked', true);

    if (localStorage.recordType == 'desktop') {
        $('input[name=record-tab-sound]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopTabSound"));
        $('input[name=record-cursor-animate]').prop("checked", false).prop("disabled", true).closest('.nsc-capture-switcher').attr('title', chrome.i18n.getMessage("notificationDesktopCursorAnimation"));
        localStorage.tabSound = false;
        localStorage.cursorAnimate = false;
    }

    $("select[name=audio-bitrate]").val(localStorage.audioBitrate).on("change", function (e) {
        localStorage.audioBitrate = e.target.value;
    });

    $("select[name=video-bitrate]").val(localStorage.videoBitrate).on("change", function (e) {
        localStorage.videoBitrate = e.target.value;
    });

    $("select[name=video-fps]").val(localStorage.videoFps).on("change", function (e) {
        localStorage.videoFps = e.target.value;
    });

    $("select[name=edit-before]").val(localStorage.enableEdit).on("change", function (e) {
        localStorage.enableEdit = e.target.value;
    });

    $("select[name=delete-drawing]").val(localStorage.deleteDrawing).on("change", function (e) {
        localStorage.deleteDrawing = e.target.value;
    });

    $('#video_countdown').val(localStorage.videoCountdown).on('input', function () {
        if (this.value < 0) this.value = 0;
        if (this.value > 9999) this.value = 9999;
        localStorage.videoCountdown = this.value;
    });

    var obj = {
        "entire": true,
        "window": true,
        "selected": true,
        "fragment": true,
        "visible": true,
        "blank": true,
        "delayed": true,
        "scroll": true,
        "video": true,
        "android": true
    };

    var main_menu_item = JSON.parse(localStorage.mainMenuItem || JSON.stringify(obj));

    for (var key in main_menu_item) {
        if (!main_menu_item[key]) {
            $('button[name=\'capture-' + key + '\']').css('display', 'none');
        }
    }

    if (videoRecorder.getStatus()) {
        checkRecord();
    } else {
        showCaptureOptions();
    }

});