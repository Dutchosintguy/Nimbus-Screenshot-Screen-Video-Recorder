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

(function () {
    window.thisEr = true;
    var xsP;
    var ysP;
    var wsP;
    var hsP;
    var scrollToCrop = false;
    var hideFixedElements = false;
    var fixedElements = [];
    var tik = null;
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    var endCapture = function () {
        window.clearTimeout(tik);
        tik = null;
        window.thisEr = false;

        beforeClearCapture();
        enableFixedPosition(true);
        enableScroll();
        removeMackPage();
    };

    if (!window.hasScreenCapturePage) {
        window.hasScreenCapturePage = true;
        chrome.extension.onRequest.addListener(function (request, sender, callback) {
            if (request.msg == 'scrollPage') {
                // console.log(request);
                scrollToCrop = request.scrollToCrop;
                hideFixedElements = request.hideFixedElements;

                if (scrollToCrop === true) {
                    xsP = request.xs;
                    ysP = request.ys;
                    wsP = request.ws;
                    hsP = request.hs;
                }
                enableFixedPosition(true);
                getPositions(callback);
            }
        });

        window.addEventListener('keydown', function (evt) {
            evt = evt || window.event;
            if (evt.keyCode == 27) {
                endCapture();
            }
        }, false);
        window.addEventListener('contextmenu', function (e) {
            endCapture();
            return true;
        }, false);
    }

    function enableFixedPosition(enableFlag) {
        if (!hideFixedElements) return;

        if (enableFlag) {
            for (var i = 0, l = fixedElements.length; i < l; ++i) {
                //  transition-property: none !important; transform: none !important; animation: none !important;
                fixedElements[i].style.cssText = fixedElements[i].style.cssText.replace('opacity: 0 !important; animation: none !important', '');
            }
            fixedElements = [];
        } else {
            var $vk_layer_wrap = document.querySelectorAll('#wk_layer_wrap');

            if (location.host === 'vk.com' && $vk_layer_wrap.length && $vk_layer_wrap[0].style.display === 'block') {
                fixedElements = document.querySelectorAll('#chat_onl_wrap, #wk_right_nav, #wk_left_arrow_bg, #wk_right_arrow_bg');
            } else {
                var nodeIterator = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT, null, false);
                var currentNode;
                while (currentNode = nodeIterator.nextNode()) {
                    var nodeComputedStyle = document.defaultView.getComputedStyle(currentNode, "");
                    if (!nodeComputedStyle) return;
                    if (nodeComputedStyle.getPropertyValue("position") === "fixed" || nodeComputedStyle.getPropertyValue("position") === "sticky") {
                        fixedElements.push(currentNode);
                    }
                }
            }

            for (var k = 0, len = fixedElements.length; k < len; ++k) {
                // transition-property: none !important; transform: none !important; animation: none !important;
                fixedElements[k].style.cssText += 'opacity: 0 !important; animation: none !important';
            }
        }
    }

    function preventDefault(e) {
        e = e || window.event;
        if (e.preventDefault)
            e.preventDefault();
        e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function addedMackPage() {
        var body = document.body,
            html = document.documentElement,
            page_w = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            page_h = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
        var div = document.createElement('div');
        div.id = 'nimbus_screenshot_mack_page';
        div.style.width = page_w + 'px';
        div.style.height = page_h + 'px';
        div.style.position = 'absolute';
        div.style.top = '0';
        div.style.left = '0';
        div.style.zIndex = '99999999999999999999999999999';

        body.appendChild(div);
    }

    function removeMackPage() {
        var node = document.getElementById('nimbus_screenshot_mack_page');
        if (node) node.parentElement.removeChild(node);
    }

    function disableScroll() {
        if (window.addEventListener) // older FF
            window.addEventListener('DOMMouseScroll', preventDefault, false);
        window.onwheel = preventDefault; // modern standard
        window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
        window.ontouchmove = preventDefault; // mobile
        document.onkeydown = preventDefaultForScrollKeys;
    }

    function enableScroll() {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }

    function getScrollbarWidth() {
        var inner = document.createElement('p');
        inner.style.width = "100%";
        inner.style.height = "200px";

        var outer = document.createElement('div');
        outer.style.position = "absolute";
        outer.style.top = "0px";
        outer.style.left = "0px";
        outer.style.visibility = "hidden";
        outer.style.width = "200px";
        outer.style.height = "150px";
        outer.style.overflow = "hidden";
        outer.appendChild(inner);

        document.body.appendChild(outer);
        var w1 = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        var w2 = inner.offsetWidth;
        if (w1 === w2) w2 = outer.clientWidth;

        document.body.removeChild(outer);

        return (w1 - w2);
    }


    function getPositions(cb) {
        // document.body.scrollTop = 0;
        window.scrollTo(0, 1000);

        afterClearCapture();
        disableScroll();
        addedMackPage();

        var body = document.body,
            html = document.documentElement,
            totalWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
            totalHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight),
            windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            arrangements = [],
            yPos = totalHeight - windowHeight,
            xPos = 0;

        var scrollWidth = getScrollbarWidth();
        var hasHScroll = (totalWidth > windowWidth);
        var hasVScroll = (totalHeight > windowHeight);
        console.log(scrollWidth, hasHScroll, hasVScroll);
        if (hasVScroll) {
            totalWidth += scrollWidth;
        }
        if (hasHScroll) {
            totalHeight += scrollWidth;
            yPos = totalHeight - windowHeight;
        }
        var elems = document.body.getElementsByTagName("*");
        var elems_scroll = [];
        for (var i = 0, elems_length = elems.length, parent_scroll_size, parent_rect, parent_overflow_y, elem_rect; i < elems_length; i++) {
            parent_scroll_size = Math.ceil(Math.max(elems[i].parentNode.clientHeight, elems[i].parentNode.scrollHeight, elems[i].parentNode.offsetHeight));
            parent_rect = elems[i].parentNode.getBoundingClientRect();
            elem_rect = elems[i].getBoundingClientRect();
            parent_overflow_y = document.defaultView.getComputedStyle(elems[i].parentNode, "").getPropertyValue("overflow-y");

            if (Math.ceil(windowWidth) < Math.ceil(parent_rect.width) * 2
                && Math.ceil(parent_rect.height) + 5 < parent_scroll_size
                && Math.ceil(parent_rect.width) > 0
                && Math.ceil(parent_rect.height) > 0
                && (parent_overflow_y === 'scroll' || parent_overflow_y === 'auto')
                && elem_rect.left + elem_rect.width > 0 && elem_rect.top + elem_rect.height > 0
                && elem_rect.left < windowWidth && elem_rect.top < windowHeight
                && elems[i].parentNode.tagName !== 'BODY') {

                if (elems[i].parentNode.classList.contains('is_added_scroll_elem')) {
                    continue;
                }

                totalHeight += (parent_scroll_size - parent_rect.height);

                for (var b = 0; b < parent_scroll_size; b += parent_rect.height) {
                    elems[i].parentNode.classList.add('is_added_scroll_elem');

                    elems_scroll.push({
                        x: 0,
                        y: b,
                        w: windowWidth,
                        h: parent_scroll_size - b > parent_rect.height ? parent_rect.height : parent_scroll_size - b,
                        elem: {
                            x: parent_rect.left,
                            y: parent_rect.top,
                            w: parent_rect.width,
                            h: parent_rect.height,
                            dom: elems[i].parentNode
                        }
                    });

                }
            }
        }

        for (var c = 0, clear_elems = document.getElementsByClassName('is_added_scroll_elem'); c < clear_elems.length; c++) {
            clear_elems[c].classList.remove('is_added_scroll_elem');
        }

        if (scrollToCrop === true) {
            window.scrollTo(0, ysP);
            totalWidth = wsP;
            totalHeight = hsP;
            yPos = ysP + hsP;
            while (yPos >= ysP) {
                yPos -= windowHeight;
                xPos = xsP;
                while (xPos < xsP + wsP) {
                    arrangements.push({
                        x: xPos,
                        x_crop: xsP,
                        x_shift: 0,
                        y: yPos >= ysP ? yPos : ysP,
                        y_crop: yPos - ysP < 0 ? 0 : yPos - ysP,
                        y_shift: window.pageYOffset >= ysP ? 0 : ysP - window.pageYOffset,
                        w: wsP,
                        h: hsP >= windowHeight ? windowHeight : hsP,
                        elem: null
                    });
                    xPos += windowWidth;
                }
            }
        } else {
            var elem_scroll;
            while (yPos > -windowHeight) {
                xPos = 0;
                while (xPos < totalWidth) {
                    var added_elems_scroll = null;

                    if (elems_scroll.length) {
                        elem_scroll = elems_scroll[0].elem;
                        // console.log(elem_scroll.y, yPos, elem_scroll.y, elem_scroll.h, yPos, windowHeight);
                        if (elem_scroll.y >= yPos && elem_scroll.y + elem_scroll.h <= yPos + windowHeight) {
                            added_elems_scroll = elems_scroll;
                        }
                    }

                    if (added_elems_scroll) {
                        if (elem_scroll.y > yPos) {
                            arrangements.push({
                                x: xPos,
                                y: yPos > 0 ? yPos : 0,
                                w: windowWidth,
                                h: elem_scroll.y - yPos,
                                elem: null
                            });
                        }

                        arrangements = arrangements.concat(added_elems_scroll);

                        if (elem_scroll.y + elem_scroll.h < yPos + windowHeight) {
                            arrangements.push({
                                x: xPos,
                                y: elem_scroll.y + elem_scroll.h,
                                w: windowWidth,
                                h: (yPos + windowHeight) - (elem_scroll.y + elem_scroll.h),
                                elem: null
                            });
                        }
                    } else {
                        var shiftX = xPos > totalWidth - windowWidth ? xPos - (totalWidth - windowWidth) : 0;
                        arrangements.push({
                            x: xPos - shiftX,
                            y: yPos > 0 ? yPos : 0,
                            w: windowWidth,
                            h: elem_scroll ? (elem_scroll.y < (yPos > 0 ? yPos : 0) + windowHeight ? (yPos > 0 ? yPos : 0) - elem_scroll.y : windowHeight) : windowHeight,
                            elem: null
                        });
                    }
                    xPos += windowWidth;
                    xPos -= (hasHScroll ? scrollWidth : 0);
                }
                yPos -= windowHeight;
                yPos += (hasVScroll ? scrollWidth : 0);
            }
        }

        var last_elem, last_elem_overflow;

        (function scrollTo() {
            afterClearCapture();

            if (!arrangements.length) {
                endCapture();

                if (scrollToCrop !== true) {
                    window.scrollTo(0, 0);
                }
                chrome.extension.sendRequest({msg: 'openPage', ratio: window.devicePixelRatio || 1, zoom: window.outerWidth / window.innerWidth});
                return cb && cb();
            }

            var next = arrangements.shift();
            // console.log(arrangements, next);

            var data = {
                msg: 'capturePage',
                scrollToCrop: scrollToCrop,
                x: next.x,
                y: next.y,
                x_crop: next.x_crop || 0,
                y_crop: next.y_crop || 0,
                x_shift: next.x_shift || 0,
                y_shift: next.y_shift || 0,
                w: next.w,
                h: next.h,
                totalWidth: totalWidth,
                totalHeight: totalHeight,
                windowWidth: windowWidth,
                windowHeight: windowHeight,
                hasVScroll: hasVScroll,
                hasHScroll: hasHScroll,
                scrollWidth: scrollWidth,
                elem: null,
                ratio: window.devicePixelRatio || 1
            };

            if (next.elem) {
                if (location.host === 'www.charmeck.org') { // TODO: устранить эту бубуйню
                    next.elem.dom.style.position = 'absolute';
                    next.elem.dom.style.top = 0;
                    next.elem.dom.style.left = 0;
                    next.elem.dom.style.right = 0;
                    next.elem.dom.style.bottom = 0;
                }
                last_elem_overflow = document.defaultView.getComputedStyle(next.elem.dom).getPropertyValue("overflow");
                next.elem.dom.style.overflow = "hidden";
                last_elem = next.elem.dom;
                next.elem.dom.scrollTop = next.y;
                data.elem = {
                    x: next.elem.x,
                    y: next.elem.y,
                    w: next.elem.w,
                    h: next.elem.h
                }
            }

            var timer = (location.host === 'www.linkedin.com' && next.y === 0) ? 600 : 200;
            enableFixedPosition(data.y === 0);
            window.setTimeout(function () {
                window.scrollTo(data.x, data.y);
                window.setTimeout(function () {
                    enableFixedPosition(data.y === 0);
                    tik = window.setTimeout(function () {
                        chrome.extension.sendRequest(data, function (response) {
                            if (tik && typeof(response) !== 'undefined') {
                                if (last_elem) {
                                    last_elem.style.overflow = last_elem_overflow;
                                    last_elem = last_elem_overflow = null;
                                }
                                scrollTo();
                            }
                        });
                    }, timer);
                }, timer);
            }, timer);
        })();
    }

})();

