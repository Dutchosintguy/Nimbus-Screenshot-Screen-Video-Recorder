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

(function ($) {

    var imgdata = null;
    var positionLoupe = {x: 0, y: 0};
    var parameters;
    var format = 'png';
    var quality = 90;

    function showLoupe(e) {
        var loupe = $("#theloupe");

        if (loupe.is(":hidden")) return;

        var img = document.getElementById('areaimage');
        var canvas = document.getElementById('theloupecanvas');
        var context = canvas.getContext('2d');
        var wi = document.documentElement.clientWidth;
        var hi = document.documentElement.clientHeight;
        var z = window.devicePixelRatio || 1;
        var x = (e.clientX - 15) * z;
        var y = (e.clientY - 15) * z;
        var h = 30;
        var w = 30;
        var x2 = 0;
        var y2 = 0;
        var lh = loupe.height() + 20;
        var lw = loupe.width() + 20;
        var s = loupe.find('span');

        if (e.clientX < lw + 5 && e.clientY < lh + 5) {
            positionLoupe = {x: wi - lw - 10, y: hi - lh - 10};
        }
        if (e.clientX > (wi - lw - 5) && e.clientY > (hi - lh - 5)) {
            positionLoupe = {x: 0, y: 0};
        }

        loupe.css({top: positionLoupe.y + 10, left: positionLoupe.x + 10});
        $(s[0]).html('X = ' + e.clientX);
        $(s[1]).html('Y = ' + e.clientY);

        context.canvas.width = 240;
        context.canvas.height = 240;

        if (x < 0) {
            x2 = (-8) * x;
            x = 0;
        }
        if (y < 0) {
            y2 = (-8) * y;
            y = 0;
        }
        if ((e.clientX + 15) > wi) {
            w = wi - e.clientX + 14;
        }
        if ((e.clientY + 15) > hi) {
            h = hi - e.clientY + 14;
        }

        var zoom = 8;
        var offctx = document.createElement('canvas').getContext('2d');
        offctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        var imgDt = offctx.getImageData(0, 0, w, h).data;

        for (var xx = 0; xx < w; ++xx) {
            for (var yy = 0; yy < h; ++yy) {
                var i = (yy * w + xx) * 4;
                var r = imgDt[i];
                var g = imgDt[i + 1];
                var b = imgDt[i + 2];
                var a = imgDt[i + 3];
                context.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (a / 255) + ")";
                context.fillRect(x2 + xx * zoom, y2 + yy * zoom, zoom, zoom);
            }
        }
        context.lineWidth = 1;
        context.strokeStyle = "#FF6600";
        context.beginPath();
        context.moveTo(120, 0);
        context.lineTo(120, 240);
        context.moveTo(0, 120);
        context.lineTo(240, 120);
        context.stroke();
    }

    function destroyCrop() {
        $('#areafon').remove();
        $('html').css("overflow", "auto");
        window.thisCrop = false;
    }

    function cropImage(save) {
        var c = parameters;
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var data = null;
        var z = window.devicePixelRatio || 1;

        canvas.width = c.w * z;
        canvas.height = c.h * z;

        var img = document.getElementById('areaimage');

        context.drawImage(img, c.x * z, c.y * z, c.w * z, c.h * z, 0, 0, c.w * z, c.h * z);
        if (save) {
            data = canvas.toDataURL('image/' + format, quality / 100);
            $('#imgdownload').attr('href', data);
            imgdata = data;
        } else {
            chrome.extension.sendMessage({msg: 'cut', img: canvas.toDataURL('image/png')});
        }

    }

    function createCoords(c) {
        parameters = c;
        chrome.extension.sendMessage({msg: 'saveCropPosition', position: c});

        if ($("div").is("#screenshotbutton") && $("div").is("#screenshotsize")) {
            showCoords(c);
            cropImage(true);
            return;
        }

        var ns_crop_buttons = $('<div/>', {
            'id': 'screenshotbutton',
            'class': 'ns-crop-buttons bottom'
        });

        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnEdit") + '</span>',
            'class': 'ns-btn edit'
        }).on('click', function () {
            cropImage();
            destroyCrop();
        }).appendTo(ns_crop_buttons);

        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnSave") + '</span>',
            'class': 'ns-btn save'
        }).on('click', function () {
            chrome.extension.sendMessage({msg: 'save_image', data: imgdata});
            destroyCrop();
        }).appendTo(ns_crop_buttons);

        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnCancel") + '</span>',
            'class': 'ns-btn cancel'
        }).on('click', function () {
            destroyCrop();
        }).appendTo(ns_crop_buttons);

        var ns_crop_more = $('<div/>', {
            html: '<button></button>',
            'id': 'ns_crop_more',
            'class': 'ns-crop-more'
        });

        var ns_more_container = $('<div/>', {
            'id': 'ns_more_container',
            'class': 'ns-crop-more-container'
        });

        $('<button/>', {
            html: '<span>Nimbus</span>',
            'class': 'ns-btn nimbus'
        }).on('click', function () {
            chrome.extension.sendMessage({msg: 'send_to_nimbus', img: imgdata});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Slack</span>',
            'class': 'ns-btn slack'
        }).on('click', function () {
            chrome.extension.sendMessage({msg: 'send_to_slack', img: imgdata});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Google Drive</span>',
            'class': 'ns-btn google'
        }).on('click', function () {
            chrome.extension.sendMessage({msg: 'send_to_google', img: imgdata});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Print</span>',
            'class': 'ns-btn print'
        }).on('click', function () {
            chrome.extension.sendMessage({msg: 'send_to_print', img: imgdata});
            destroyCrop();
        }).appendTo(ns_more_container);

        ns_crop_more.append(ns_more_container);

        var drag = $('.jcrop-dragbar').first();
        drag.before('<div id="screenshotsize" class="ns-crop-size"></div>');
        drag.before(ns_crop_buttons);
        drag.before(ns_crop_more);

        var loupe = $('#theloupe');
        var events = {
            'mouseenter': function (e) {
                loupe.show()
            },
            'mouseleave': function (e) {
                loupe.hide()
            }
        };
        $(".jcrop-handle").bind(events);
        $(".jcrop-dragbar").bind(events);
        $(".jcrop-tracker").last().bind(events);

        cropImage(true);
        showCoords(c);
    }

    function showCoords(c) {
        var z = window.devicePixelRatio || 1;
        $('#screenshotsize').text((c.w * z) + ' x ' + (c.h * z));

        if ((c.h + c.y + 60) > $(window).height()) {
            $('#screenshotbutton').css({'bottom': '0', 'top': 'auto'});
            $('#ns_crop_more').css({'bottom': '0', 'top': 'auto'});
        } else {
            $('#screenshotbutton').css({'bottom': 'auto', 'top': '100%'});
            $('#ns_crop_more').css({'bottom': 'auto', 'top': '100%'});
        }

        if (c.w < 325) {
            $('#ns_crop_more').css({'bottom': '0', 'top': 'auto'});
        }

        if (c.y < 25) {
            $('#screenshotsize').css({'bottom': 'auto', 'top': '0'});
        } else {
            $('#screenshotsize').css({'bottom': '100%', 'top': 'auto'});
        }
    }

    if (!window.screencaptureinit) {
        window.screencaptureinit = true;

        chrome.extension.onRequest.addListener(function (req) {
            if (req.msg == 'crop') {
                window.thisCrop = true;

                chrome.extension.sendMessage({msg: 'getformat'}, function (response) {
                    format = response.format;
                    quality = response.quality;
                });

                $('html').css("overflow", "hidden");
                imgdata = req.image;

                var areafon = jQuery('<div/>', {
                    id: 'areafon'
                }).appendTo('body');

                var areaimage = jQuery('<img>', {
                    id: 'areaimage',
                    src: imgdata
                }).appendTo(areafon);

                var jcrop = $.Jcrop($(areaimage), {
                    onSelect: createCoords,
                    onChange: showCoords
                });

                chrome.extension.sendMessage({msg: 'getCropPosition'}, function (response) {
                    if (response.x && response.y && response.x2 && response.y2) {
                        jcrop.setSelect([response.x, response.y, response.x2, response.y2]);
                    }
                });

                areafon.append('<div id="theloupe"><canvas id="theloupecanvas"></canvas><span>X = 0</span><span>Y = 0</span></div>');

                areafon.bind({
                    'mousemove': function (e) {
                        showLoupe(e);
                    },
                    'mouseenter': function (e) {
                        $('#theloupe').show();
                    },
                    'mouseleave': function (e) {
                        $('#theloupe').hide();
                    }
                });

//                areafon.bind("contextmenu", function(e) {
//                    destroyCrop();
//                    return false;
//                });

//                areafon.append('<div class="cropNotification">Drag and Capture Page (Press Esc to Exit)</div>');

                window.addEventListener('keydown', function (evt) {
                    evt = evt || window.event;
                    if (evt.keyCode == 27) {
                        destroyCrop();
                    }
                }, false);

            }

        });

    }
}(jQuery));

