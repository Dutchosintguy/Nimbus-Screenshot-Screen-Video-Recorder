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
    window.thisScrollCrop = true;
    var jcrop;
    var firstMove = 0;
    var isDown;
    var hideFixedElements = false;
    var fixedElements = [];

    function autoScroll(event) {
        var clientY = event.clientY,
            clientX = event.clientX,
            restY = window.innerHeight - clientY,
            restX = window.innerWidth - clientX,
            scrollTop = window.pageYOffset,
            scrollLeft = window.pageXOffset;
        if (clientY < 50) scrollTop -= 50;
        if (clientX < 50) scrollLeft -= 50;
        if (restY < 50) scrollTop += 50 - restY;
        if (restX < 50) scrollLeft += 50 - restX;

        window.scrollTo(scrollLeft, scrollTop);
    }

    scrollCrop();

    function enableFixedPosition(enableFlag) {
        if (!hideFixedElements) return;

        if (enableFlag) {
            for (var i = 0, l = fixedElements.length; i < l; ++i) {
                //  transition-property: none !important; transform: none !important; animation: none !important;
                fixedElements[i].style.cssText = fixedElements[i].style.cssText.replace('opacity: 0 !important;', '');
            }
            fixedElements = [];
        } else {
            var $vk_layer_wrap = document.querySelectorAll('#wk_layer_wrap');

            if (location.host == 'vk.com' && $vk_layer_wrap.length && $vk_layer_wrap[0].style.display == 'block') {
                fixedElements = document.querySelectorAll('#chat_onl_wrap, #wk_right_nav, #wk_left_arrow_bg, #wk_right_arrow_bg');
            } else {
                var nodeIterator = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT, null, false);
                var currentNode;
                while (currentNode = nodeIterator.nextNode()) {
                    var nodeComputedStyle = document.defaultView.getComputedStyle(currentNode, "");
                    if (!nodeComputedStyle) return;
                    if (nodeComputedStyle.getPropertyValue("position") == "fixed" || nodeComputedStyle.getPropertyValue("position") == "sticky") {
                        fixedElements.push(currentNode);
                    }
                }
            }

            for (var k = 0, len = fixedElements.length; k < len; ++k) {
                // transition-property: none !important; transform: none !important; animation: none !important;
                fixedElements[k].style.cssText += 'opacity: 0 !important;';
            }
        }
    }

    function getSize() {
        var body = document.body,
            html = document.documentElement,
            page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        return {w: page_w, h: page_h};
    }

    function scrollCrop() {
        var size = getSize();
        var pole = $('<div id="areafon">').appendTo('body');
        pole.append('<div class="cropNotification">' + chrome.i18n.getMessage("notificationCrop") + '</div>');

        pole.css({
            width: size.w,
            height: size.h,
            position: 'absolute',
            left: '0',
            top: '0',
            zIndex: 999999999,
            backgroundColor: 'rgba(0,0,0,0.2)'
        });

        var crop = $('<div>').appendTo(pole);

        crop.css({
            opacity: '0.1',
            width: size.w,
            height: size.h,
            position: 'absolute',
            left: '0px',
            top: '0px'
        });

        jcrop = $.Jcrop(crop, {
            onSelect: createCoords,
            onChange: showCoords,
            onRelease: function () {
                pole.css({backgroundColor: 'rgba(0,0,0,0.2)'});
            }
        });

        chrome.extension.sendMessage({msg: 'getCropScrollPosition'}, function (response) {
            if (response.x2 && response.y && response.x2 <= size.w && response.y2 <= size.h) {
                jcrop.setSelect([response.x, response.y, response.x2, response.y2]);
                $("html, body").animate({scrollTop: response.y}, "slow");
                pole.css({backgroundColor: 'transparent'});
            }
            hideFixedElements = response.hideFixedElements;
        });

        $('.jcrop-holder').css({
            background: '',
            overflow: 'hidden'
        });

        $('.jcrop-tracker').bind("mousedown", function () {
            pole.css({backgroundColor: 'transparent'});
        });

        pole.bind({
            'mousemove': function (e) {
                if (e.which == 3) {
                    destroyCrop();
                    return false;
                }
                autoScroll(e)
            },
            'contextmenu': function (e) {
                destroyCrop();
                return false;
            }
        });


        afterClearCapture(true);
    }

    function createCoords(c) {
        isDown = true;
        saveCropPosition(c);

        if ($("div").is("#screenshotbutton") && $("div").is("#screenshotsize")) {
            showCoords(c);
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
            chrome.extension.sendRequest({'operation': 'cropScroll'});
            destroyCrop();
        }).appendTo(ns_crop_buttons);

        $('<button/>', {
            html: '<i></i><span>' + chrome.i18n.getMessage("cropBtnSave") + '</span>',
            'class': 'ns-btn save'
        }).on('click', function () {
            chrome.extension.sendRequest({operation: 'saveScroll', 'scrollToCrop': false});
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
            chrome.extension.sendRequest({operation: 'send_to_nimbus_scroll'});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Slack</span>',
            'class': 'ns-btn slack'
        }).on('click', function () {
            chrome.extension.sendRequest({operation: 'send_to_slack_scroll'});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Google Drive</span>',
            'class': 'ns-btn google'
        }).on('click', function () {
            chrome.extension.sendRequest({operation: 'send_to_google_scroll'});
            destroyCrop();
        }).appendTo(ns_more_container);

        $('<button/>', {
            html: '<span>Print</span>',
            'class': 'ns-btn print'
        }).on('click', function () {
            chrome.extension.sendRequest({operation: 'send_to_print_scroll'});
            destroyCrop();
        }).appendTo(ns_more_container);

        ns_crop_more.append(ns_more_container);

        var drag = $('.jcrop-dragbar').first();
        drag.before('<div id="screenshotsize" class="ns-crop-size"></div>');
        drag.before(ns_crop_buttons);
        drag.before(ns_crop_more);

        showCoords(c);
    }

    function saveCropPosition(c) {
        chrome.extension.sendMessage({msg: 'saveCropScrollPosition', position: c});
    }

    function destroyCrop() {
        window.thisScrollCrop = false;
        enableFixedPosition(true);
        beforeClearCapture(true);
        $('#areafon').remove();
    }

    function showCoords(c) {
        var z = 1;//window.devicePixelRatio || 1;
        $('#screenshotsize').html('<span>' + (c.w * z) + ' x ' + (c.h * z) + '</span>');

        if ((c.h + c.y + 60) > $(window).height() + $(window).scrollTop()) {
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

        cropImage(c);
    }

    function cropImage(c) {
        chrome.extension.sendRequest({
            'operation': 'cap',
            'xs': c.x,
            'ys': c.y,
            'ws': c.w,
            'hs': c.h
        });
    }

    window.addEventListener('keydown', function (evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27) {
            destroyCrop();
        }
    }, false);

}(jQuery));