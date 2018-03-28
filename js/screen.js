/*
 * "This work is created by NimbusWeb and is copyrighted by NimbusWeb. (c) 2017 NimbusWeb.
 * You may not replicate, copy, distribute, or otherwise create derivative works of the copyrighted
 * material without prior written permission from NimbusWeb.
 *
 * Certain parts of this work contain code licensed under the MIT License.
 * https://www.webrtc-experiment.com/licence/ THE SOFTWARE IS PROVIDED "AS IS",
 * WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * */

'use strict';

window.___gcfg = {
    parsetags: 'explicit'
};
function renderClassRoomButton(url) {
    gapi.sharetoclassroom.render("nsc_share_classroom", {
        "size": "24",
        "url": url
    });
}

var videoBlob;
var LS = {};
var nimbus_screen = {
    canvasManager: null,
    dom: {},
    info: {
        win_zoom: window.devicePixelRatio || 1,
        file: {
            size: 0
        },
        first_canvas_width: null,
        first_canvas_height: null
    },
    locationParam: function () {
        var p = window.location.href.match(/\?(\w+)$/);
        return (p && p[1]) || '';
    },
    kbToMb: function (size, n) {
        return ((size) / 1024 / 1024).toFixed(n || 0) + ' MB';
    },
    copyTextToClipboard: function (text) {
        var element = document.createElement("iframe");
        element.src = chrome.extension.getURL("blank.html");
        element.style.opacity = "0";
        element.style.width = "1px";
        element.style.height = "1px";
        element.addEventListener("load", function () {
            try {
                var doc = element.contentDocument;
                var el = doc.createElement("textarea");
                doc.body.appendChild(el);
                el.value = text;
                el.select();
                var copied = doc.execCommand("copy");
                element.remove();
                if (copied) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationUrlCopied")});
                }
            } finally {
                element.remove();
            }
        });
        document.body.appendChild(element);
    },
    setOptions: function () {

    },
    getEditCanvasSize: function () {
        var width = nimbus_screen.dom.$edit_canvas.width();
        var height = nimbus_screen.dom.$edit_canvas.height();
        if (nimbus_screen.info.first_canvas_width == null) {
            nimbus_screen.info.first_canvas_width = width;
        }
        if (nimbus_screen.info.first_canvas_height == null) {
            nimbus_screen.info.first_canvas_height = height;
        }

        return {
            w: width,
            h: height,
            fW: nimbus_screen.info.first_canvas_width,
            fH: nimbus_screen.info.first_canvas_height
        };
    },
    initScreenPage: function (data) {
        // nimbus_screen.dom.$edit_canvas.width(nimbus_screen.dom.$edit_image.width() / nimbus_screen.info.win_zoom).height(nimbus_screen.dom.$edit_image.height() / nimbus_screen.info.win_zoom);
        nimbus_screen.dom.$edit_image.hide();

        nimbus_screen.canvasManager = nimbus_screen.dom.$edit_canvas.canvasPaint();
        nimbus_screen.canvasManager.loadBackgroundImage(data, function () {
            nimbus_screen.canvasManager.autoZoom();

            $(window).trigger('resize');
            $(document).trigger('ready_redactor');

            if (nimbus_screen.locationParam() === 'done' ||
                nimbus_screen.locationParam() === 'nimbus' ||
                nimbus_screen.locationParam() === 'slack' ||
                nimbus_screen.locationParam() === 'google' ||
                nimbus_screen.locationParam() === 'print') {
                nimbus_screen.dom.$button_done.click();

                window.setTimeout(function () {
                    if (nimbus_screen.locationParam() === 'nimbus') {
                        $('#nsc_button_nimbus').click();
                    } else if (nimbus_screen.locationParam() === 'slack') {
                        // $('#nsc_button_slack').click();
                    } else if (nimbus_screen.locationParam() === 'google') {
                        $('#nsc_button_google_drive').click();
                    } else if (nimbus_screen.locationParam() === 'print') {
                        $('#nsc_button_print').click();
                    }
                }, 300);
            }
        });
        nimbus_screen.canvasManager.zoom(true);
        nimbus_screen.canvasManager.changeStrokeSize(LS.setting.width);
        nimbus_screen.canvasManager.changeStrokeColor(LS.setting.color);
        nimbus_screen.canvasManager.changeFillColor(LS.fillColor);
        nimbus_screen.canvasManager.changeShadow(LS.shadow);
        nimbus_screen.canvasManager.setEnableNumbers(LS.enablenumbers);
        nimbus_screen.canvasManager.setFontFamily(LS.font.family);
        nimbus_screen.canvasManager.setFontSize(LS.font.size);
    },
    togglePanel: function (panel) {
        $('#nsc_send').data('type', panel).trigger('change-type');
        $('#nsc_done_slack').css('display', panel === 'slack' ? 'flex' : 'none');
        $('#nsc_done_nimbus').css('display', panel === 'nimbus' ? 'flex' : 'none');
        $('#nsc_done_youtube').css('display', panel === 'youtube' ? 'flex' : 'none');
        chrome.extension.sendMessage({msg: 'set_setting', key: 'nimbusPanel', value: panel === 'nimbus'});
        chrome.extension.sendMessage({msg: 'set_setting', key: 'slackPanel', value: panel === 'slack'});
        chrome.extension.sendMessage({msg: 'set_setting', key: 'youtubePanel', value: panel === 'youtube'});
    }
};

(function (data) {
    LS.imgdata = data.imgdata;
    LS.screenname = data.screenname;
    LS.pageinfo = JSON.parse(data.pageinfo || '{}');
    LS.format = data.format || 'png';
    LS.imageQuality = data.imageQuality || '92';
    LS.fillColor = data.fillColor || 'rgba(0,0,0,0)';
    LS.setting = JSON.parse(data.setting || '{"width": 5, "color": "#f00"}');
    LS.shadow = JSON.parse(data.shadow || '{"enable":true,"blur":"10","color":"rgb(0, 0, 0)"}');
    LS.google_upload_folder = JSON.parse(data.google_upload_folder || '{"id": "root", "title": "Main folder"}');
    LS.nimbus_share = data.nimbus_share !== 'false';
    LS.disableHelper = data.disableHelper === 'true';
    LS.font = JSON.parse(data.font || '{"family": "Arial", "size": 35}');
    LS.shareOnGoogle = data.shareOnGoogle !== 'false';
    LS.showInfoPrint = data.showInfoPrint || 'true';
})(localStorage);

var imgdata = LS.imgdata;
var screenname = LS.screenname;
var pageinfo = LS.pageinfo;
var imgnewdata = null;

// var canvasManager;
var jcrop;
var tools = '#shape-styler';

// var google_auth_token = null;
var param = (function () {
    var p = window.location.href.match(/\?(\w+)$/);
    return (p && p[1]) || '';
})();
// var videoBlob;
// var manifest = chrome.runtime.getManifest();

$(function () {

    // if (localStorage.version == manifest.version) {
    //     $('#new_release_popup').show(function () {
    //         localStorage.version = manifest.version;
    //     });
    // }

    $(window).resize(function () {
        if (nimbus_screen.canvasManager) {
            nimbus_screen.canvasManager.zoom(true);
        }
    });

    var hotkeysSendNS = JSON.parse(localStorage.hotkeysSendNS);
    $('#hotkeys_send_ns').text('(Ctrl+' + hotkeysSendNS.title + ')');

    $(document).on('keydown', function (e) {
        if (e.ctrlKey && e.keyCode == hotkeysSendNS.key) {
            e.preventDefault();

            if (!nimbus_screen.dom.$nsc_done_page.is(':visible')) {
                nimbus_screen.dom.$button_done.click();
            }
            window.setTimeout(function () {
                $('#nsc_send').trigger('click');
            }, 100);
        }
    });

    chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
        if (request.operation == 'shortcut_load_to_ns_change') {
            hotkeysSendNS = JSON.parse(localStorage.hotkeysSendNS);
            $('#hotkeys_send_ns').text('(Ctrl+' + hotkeysSendNS.title + ')');
        }
    });

    if (param === 'video') {
        $('#nsc_main_title span span').text(chrome.i18n.getMessage("nimbusSaveScreencast"));
    } else {
        $('#nsc_main_title span span').text(chrome.i18n.getMessage("nimbusSaveScreenshot"));
    }

});


$(document).ready(function () {

    nimbus_screen.dom.$nsc_redactor_page = $('#nsc_redactor_page');
    nimbus_screen.dom.$nsc_done_page = $('#nsc_done_page');
    nimbus_screen.dom.$nsc_linked = $('#nsc_linked');
    nimbus_screen.dom.$edit_canvas = $("#nsc_canvas");
    nimbus_screen.dom.$edit_image = $('#nsc_canvas_image');
    nimbus_screen.dom.$button_done = $("#nsc_done");

    nimbus_screen.dom.$nsc_linked.find('input').on('focus', function () {
        $(this).select();
    });

    nimbus_screen.dom.$nsc_redactor_page.hide();
    nimbus_screen.dom.$nsc_done_page.hide();
    if (param === 'video') {
        $('html').removeClass('pre-loader');

        nimbus.init();
        nimbus_screen.dom.$nsc_done_page.show();
        $('#nsc_button_back').hide();
        $('#nsc_button_save_image').hide();
        $('#nsc_button_slack').hide();
        $('#nsc_button_google_drive').hide();
        $('#nsc_button_print').hide();
        $('#nsc_preview_img').hide();
        $('#nsc_button_save_video').show();
        // $('#nsc_preview_loading').hide();
        $('#nsc_stream_video').hide();

        $('#nsc_preview_loading [data-i18n]').text(chrome.i18n.getMessage('labelPreviewLoadingVideo'));
        $('#nsc_screen_name').val('Screencast-' + LS.pageinfo.time);
        $('#nsc_done_youtube_name').val('Screencast-' + LS.pageinfo.time);

        LS.pageinfo.name = 'Screencast-' + LS.pageinfo.time;
        localStorage.videoUrl = 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/persistent/video.webm';
        nacl_module.init(function (videoUrl, videoBlob) {
            localStorage.videoUrl = videoUrl;
            nacl_module.videoBlob = videoBlob;
            $('#nsc_preview_loading').hide();
            $('#nsc_indicator_size').text(localStorage.currentVideoWidth + ' ✖ ' + localStorage.currentVideoHeight);
            showFileSize(nacl_module.videoBlob.size);
            nimbus_screen.info.file.size = Math.floor(nacl_module.videoBlob.size);
            viewVideoPlayer();
        })
    } else {
        $('#nsc_button_youtube').hide();
        $('#nsc_stream_video').hide();

        $('#nsc_preview_loading [data-i18n]').text(chrome.i18n.getMessage('labelPreviewLoading'));

        nimbus_screen.dom.$edit_image.load(function () {
            $('html').removeClass('pre-loader');
            nimbus_screen.dom.$nsc_redactor_page.show();

            nimbus_screen.initScreenPage(imgdata);
            addEvents();
            addFileAddEvents();
        });
        nimbus_screen.dom.$edit_image.attr('src', imgdata);
    }

    $('#nsc_capture_helper button').click(function () {
        $('#nsc_capture_helper').fadeOut(100);
        localStorage.setItem('disableHelper', true);
        LS.disableHelper = true;
    });

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

    $('[data-i18n-attr="title"]').tooltip({
        position: {my: "center top+10", at: "center bottom"}
    });

    $(window).on('resize', function () {
        if (nimbus_screen.canvasManager) {
            nimbus_screen.canvasManager.zoom(true);
        }

        if ($(window).width() < 1248) {
            $('#nsc_redactor_panel .nsc-panel-group-title').hide();
        } else {
            $('#nsc_redactor_panel .nsc-panel-group-title').show();
        }

        var height = $('#nsc_redactor_panel').height();
        $('#nsc_canvas_wrap').css('marginTop', height + 10);
    });

    $(document).on('ready_redactor', function () {
        $(window).trigger('resize');
    });

    $('#nimbus_help_link').attr('href', 'https://everhelper.desk.com/customer/en/portal/articles/' + (window.navigator.language === 'ru' ? '2155978' : '1180411'));
});
