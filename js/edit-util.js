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
/**
 * Created by hasesanches on 16.12.2016.
 */

var nimbusRate = {
    urls: {
        'opera': {
            'feedback': 'https://fvdmedia.userecho.com/list/21580-nimbus-products/?category=7165',
            'review': 'https://addons.opera.com/extensions/details/nimbus-screen-capture/'
        }
    },
    ratePopup: $('#nsc_nimbus_rate'),
    getRateInfo: function () {
        var obj = {};
        var time = (new Date()).getTime();
        try {
            obj = JSON.parse(LS['nimbus_rate_info']);
        } catch (e) {
            obj = {install: time, show: true, lastshow: -Infinity};
            LS['nimbus_rate_info'] = JSON.stringify(obj);
        }
        return obj;
    },

    saveRateInfo: function (obj) {
        LS['nimbus_rate_info'] = JSON.stringify(obj);
    },

    disableRate: function () {
        var obj = this.getRateInfo();
        obj.show = false;
        this.saveRateInfo(obj);
    },

    detectBrowser: function () {
        var browser = $.browser;
        for (var i in this.urls) {
            if (browser[i]) {
                this.ratePopup.find('button[name=feedback]').attr('href', this.urls[i].feedback);
                this.ratePopup.find('button[name=reviews]').attr('href', this.urls[i].review);
                break;
            }
        }
    },

    showMessage: function () {
        var obj = this.getRateInfo();
        var day = 24 * 60 * 60 * 1000;
        var now = Date.now();
        this.detectBrowser();

        if (obj.show) {
            if (now > (+obj.install + 3 * day)) {
                if (now > (+obj.lastshow + +day)) {
                    setTimeout(function () {
                        nimbusRate.ratePopup.fadeIn();

                        nimbusRate.ratePopup.find('button').on('click', function () {
                            nimbusRate.ratePopup.fadeOut();
                        })
                    }, 500);
                    this.saveRateInfo({install: obj.install, show: true, lastshow: now});
                }
            }
        }
    }
};

nimbusRate.getRateInfo();

var nimbusAccountPopup = (function () {
    var bind = function () {
        var popup = $('#nsc_account_popup');
        popup.unbind();
        popup.find('button.create').on('click', function () {
            popup.hide();
            $('#nsc_popup_register_nimbus').show();
        });
    };
    var init = function () {
        if (!localStorage.getItem("showAccountPopup")) {
            bind();
            nimbus.server.user.authState(function (res) {
                if (res.errorCode !== 0 || !res.body || !res.body.authorized) {
                    $('#nsc_account_popup').show();
                }
            });
            localStorage.setItem('showAccountPopup', 'false');
        }
    };
    return {
        init: init
    };
})();

var enviroment_info_change = function () {
    var checked = $('#nsc_environment_info').prop('checked');
    var comment_text = $('#nsc_comment').val();
    var userAgent = navigator.userAgent;
    var browserName = navigator.appName;
    var platform = navigator.platform;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var verOffset;
    if ((verOffset = userAgent.indexOf("Opera")) != -1) {
        browserName = "Opera";
        fullVersion = userAgent.substring(verOffset + 6);
        if ((verOffset = userAgent.indexOf("Version")) != -1)
            fullVersion = userAgent.substring(verOffset + 8);
    } else if ((verOffset = userAgent.indexOf("Chrome")) != -1) {
        browserName = "Chrome";
        fullVersion = userAgent.substring(verOffset + 7);
    }
    var info = '\n\n-----------------\n' +
        chrome.i18n.getMessage("nimbusInfoPage") + ': ' + pageinfo.url + '\n' +
        chrome.i18n.getMessage("nimbusInfoScreen") + ': ' + screen.width + 'x' + screen.height + '\n' +
        chrome.i18n.getMessage("nimbusInfoBrowser") + ': ' + browserName + ' ' + fullVersion + '\n' +
        chrome.i18n.getMessage("nimbusInfoAgent") + ': ' + userAgent + '\n' +
        chrome.i18n.getMessage("nimbusInfoPlatform") + ': ' + platform;

    chrome.extension.sendMessage({msg: 'set_setting', key: 'environment_info', value: checked});
    if (checked) {
        $('#nsc_comment').val(comment_text + info).outerHeight(220);
    } else {
        $('#nsc_comment').val(comment_text.match(/([\s|\S]+)?\n\n-----------------[\s|\S]+/)[1]).height(22);
    }

    var max_width = 200;
    if (param === 'video') {
        var $nsc_stream_video = $('#nsc_stream_video');
        if ($nsc_stream_video.width() > 200) {
            max_width = $nsc_stream_video.width();
        }
    } else {
        var $nsc_preview_img = $('#nsc_preview_img');
        if ($nsc_preview_img.width() > 200) {
            max_width = $nsc_preview_img.width();
        }
    }
    $('#nsc_indicator').css({'max-width': max_width});
};

function showFileSize(size) {
    var k = (size / 1024).toFixed(2);
    if (k < 1024) {
        k = k.toString().replace(",", ".").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,") + " KB";
    } else {
        k = (k / 1024).toFixed(2);
        k = k.toString().replace(",", ".").replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, "$&,") + " MB";
    }
    $('#nsc_indicator_weight').text(k);
}

function createCoords(c) {
    $('#screenshotsize').remove();
    $('#screenshotbutton').remove();

    var ns_crop_buttons = $('<div/>', {
        'id': 'screenshotbutton',
        'class': 'ns-crop-buttons bottom'
    });

    $('<button/>', {
        html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnSave") + '</span>',
        'class': 'ns-btn save'
    }).on('click', function () {
        $('#pole_crop').remove();
        jcrop && jcrop.destroy();
        $(document).trigger('redactor_set_tools', nimbus_screen.canvasManager.getTools());
        nimbus_screen.canvasManager.cropImage(c);
    }).appendTo(ns_crop_buttons);

    $('<button/>', {
        html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnCancel") + '</span>',
        'class': 'ns-btn cancel'
    }).on('click', function () {
        $('#pole_crop').remove();
        jcrop && jcrop.destroy();
        $("#nsc_redactor_crop").trigger('click');
    }).appendTo(ns_crop_buttons);

    var drag = $('.jcrop-dragbar').first();
    drag.before('<div id="screenshotsize" class="ns-crop-size"></div>');
    drag.before(ns_crop_buttons);

    showCards(c);
}

function showCards(c) {
    var zoom = nimbus_screen.canvasManager.getZoom();
    var size = nimbus_screen.getEditCanvasSize();
    var z = window.devicePixelRatio || 1;
    $('#screenshotsize').html('<span>' + (Math.round(c.w / zoom) + z) + ' x ' + (Math.round(c.h / zoom) * z) + '</span>');

    if ((c.h + c.y + 55) > (size.h * zoom)) {
        $('#screenshotbutton').css({'bottom': '0', 'top': 'auto'});
    } else {
        $('#screenshotbutton').css({'bottom': 'auto', 'top': '100%'});
    }
}

function newImage(img, cb) {
    imgdata = img;
    nimbus_screen.canvasManager.undoAll();
    nimbus_screen.canvasManager.loadBackgroundImage(img, cb);
    $('#nsc_drop_file').hide();
    $('#nsc_canvas_wrap').removeClass('blank');
}


function addFileAddEvents() {
    window.addEventListener('paste', function (event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (var index in items) {
            var item = items[index];
            if (item.kind === 'file') {
                var blob = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function (event) {
                    if (param === 'blank') {
                        newImage(event.target.result);
                    } else {
                        nimbus_screen.canvasManager.loadImageObject(event.target.result);
                    }
                };
                reader.readAsDataURL(blob);
            }
        }
    });

    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        var files = evt.target.files || (evt.dataTransfer && evt.dataTransfer.files);

        for (var i = 0, f; f = files[i]; i++) {
            if (!f.type.match('image.*')) {
                $.ambiance({message: chrome.i18n.getMessage("notificationInsertInfo"), timeout: 1});
                continue;
            }

            screenname = f.name.replace(/\.[^.]+$/, "");
            var reader = new FileReader();

            reader.onload = (function (theFile) {
                return function (e) {
                    newImage(e.target.result);
                };
            })(f);

            reader.readAsDataURL(f);
        }
        return false;
    }

    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
//                evt.dataTransfer.dropEffect = 'copy';
        $(this).addClass('drop');
    }

    function handleDragEnd(evt) {
        $(this).removeClass('drop');
    }

    var dropZone = document.getElementById('nsc_canvas');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    dropZone.addEventListener('drop', handleDragEnd, false);
    dropZone.addEventListener('dragleave', handleDragEnd, false);

    $('#nsc_redactor_open_image').prev('input').on('change', handleFileSelect);
}

function viewVideoPlayer() {
    var $nsc_stream_video = $('#nsc_stream_video');
    var $nsc_indicator = $('#nsc_indicator');
    $nsc_stream_video.attr('src', localStorage.videoUrl).show();

    $nsc_stream_video[0].oncanplay = function () {
        var max_width = 200;
        if ($nsc_stream_video.width() > 200) {
            max_width = $nsc_stream_video.width();
        }
        $nsc_indicator.css({'max-width': max_width});
    };
}

function addEvents() {
    var mousemove_event;

    document.onmousemove = function (e) {
        mousemove_event = e;
    };

    document.onkeydown = function (e) {
        var k = e.keyCode;
        // console.log(e, k);
        if (k == 37 /*left*/ || k == 38 /*up*/ || k == 39 /*right*/ || k == 40 /*down*/) {
            nimbus_screen.canvasManager.move(k);
        }
        if (k == 46 || k == 8) {
            // console.log(e.code);
            nimbus_screen.canvasManager.delete(e);
        }
        if (e.ctrlKey) {
            if (k == 86) { // V
//                    console.log('paste');
                nimbus_screen.canvasManager.paste(mousemove_event);
                // e.preventDefault();
                // return false;
            }
            if (k == 67) { // C
//                    console.log('copy');
                nimbus_screen.canvasManager.copy(mousemove_event);
                // e.preventDefault();
                // return false;
            }
            if (k == 90) {
                nimbus_screen.canvasManager.undo();
                // e.preventDefault();
                // return false;
            }
            if (k == 89) {
                nimbus_screen.canvasManager.redo();
                // e.preventDefault();
                // return false;
            }
        }
        return true;
    };
}

function getSize() {
    var body = document.body,
        html = document.documentElement,
        page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
        page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    return {w: page_w, h: page_h};
}

function getTimeStamp() {
    var y, m, d, h, M, s;
    var time = new Date();
    y = time.getFullYear();
    m = time.getMonth() + 1;
    d = time.getDate();
    h = time.getHours();
    M = time.getMinutes();
    s = time.getSeconds();
    if (m < 10) m = '0' + m;
    if (d < 10) d = '0' + d;
    if (h < 10) h = '0' + h;
    if (M < 10) M = '0' + M;
    if (s < 10) s = '0' + s;
    return y + '-' + m + '-' + d + '-' + h + '-' + M + '-' + s;
}

