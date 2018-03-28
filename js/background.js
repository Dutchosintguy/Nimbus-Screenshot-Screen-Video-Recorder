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

"use strict";

function scaleCanvas(imgdata, scale, cb) {
    // localStorage.keepOriginalResolution
    var HERMITE = new Hermite_class();
    var img = new Image();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    img.crossOrigin = 'anonymous';
    img.onload = resize;
    img.src = imgdata;

    function resize() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        HERMITE.resample_single(canvas, img.width / scale, img.height / scale, true);
        return cb && cb(canvas);
    }


//default resize

//more options
//     HERMITE.resample(canvas, width, height, true, finish_handler); //true=resize canvas
//single core
//     HERMITE.resample_single(canvas, width, height);

// //resize image to 300x100
//     HERMITE.resize_image('image_id', 300, 100);
// //resize image to 50%
//     HERMITE.resize_image('image_id', null, null, 50);


    // var canvas = document.createElement('canvas'),
    //     ctx = canvas.getContext("2d"),
    //     img = new Image();
    //
    // img.crossOrigin = 'anonymous';
    // img.onload = resize;
    // img.src = imgdata;
    //
    // function resize() {
    //     var oc = document.createElement('canvas'),
    //         octx = oc.getContext('2d');
    //     canvas.width = img.width * scale;
    //     canvas.height = canvas.width * (img.height / img.width);
    //     oc.width = img.width * scale;
    //     oc.height = img.height * scale;
    //
    //     octx.drawImage(img, 0, 0, oc.width, oc.height);
    //     octx.drawImage(oc, 0, 0, oc.width * scale, oc.height * scale);
    //     ctx.drawImage(oc, 0, 0, oc.width * scale, oc.height * scale, 0, 0, canvas.width, canvas.height);
    //     return cb && cb(canvas);
    // }


    // var thumbWidth = 1400;
    //
    // var image = new Image();
    // image.src = imgdata;
    //
    // var canvas = document.createElement('canvas');
    // var ctx = canvas.getContext("2d");
    //
    // image.onload = function () {
    //     var newHeight = Math.floor(image.height * 0.9);
    //     var newWidth = Math.floor(image.width * 0.9);
    //     console.log(image.width, image.height, newHeight, newWidth);
    //
    //     if (newWidth >= thumbWidth) {
    //         canvas.width = newWidth;
    //         canvas.height = newHeight;
    //
    //         ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    //
    //         image.src = canvas.toDataURL();
    //         image.height = newHeight;
    //     } else {
    //         return cb && cb(canvas);
    //     }
    // }
}

// https://stackoverflow.com/questions/18922880/html5-canvas-resize-downscale-image-high-quality
function downScaleCanvas(cv, scale) {
    if (!(scale < 1) || !(scale > 0)) return cv;
    var sqScale = scale * scale; // square scale = area of source pixel within target
    var sw = cv.width; // source image width
    var sh = cv.height; // source image height
    var tw = Math.floor(sw * scale); // target image width
    var th = Math.floor(sh * scale); // target image height
    var sx = 0, sy = 0, sIndex = 0; // source x,y, index within source array
    var tx = 0, ty = 0, yIndex = 0, tIndex = 0; // target x,y, x,y index within target array
    var tX = 0, tY = 0; // rounded tx, ty
    var w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0; // weight / next weight x / y
    // weight is weight of current source point within target.
    // next weight is weight of current source point within next target's point.
    var crossX = false; // does scaled px cross its current px right border ?
    var crossY = false; // does scaled px cross its current px bottom border ?
    var sBuffer = cv.getContext('2d').getImageData(0, 0, sw, sh).data; // source buffer 8 bit rgba
    var tBuffer = new Float32Array(3 * tw * th); // target buffer Float32 rgb
    var sR = 0, sG = 0, sB = 0; // source's current point r,g,b

    for (sy = 0; sy < sh; sy++) {
        ty = sy * scale; // y src position within target
        tY = 0 | ty;     // rounded : target pixel's y
        yIndex = 3 * tY * tw;  // line index within target array
        crossY = (tY !== (0 | (ty + scale)));
        if (crossY) { // if pixel is crossing botton target pixel
            wy = (tY + 1 - ty); // weight of point within target pixel
            nwy = (ty + scale - tY - 1); // ... within y+1 target pixel
        }
        for (sx = 0; sx < sw; sx++, sIndex += 4) {
            tx = sx * scale; // x src position within target
            tX = 0 | tx;    // rounded : target pixel's x
            tIndex = yIndex + tX * 3; // target pixel index within target array
            crossX = (tX !== (0 | (tx + scale)));
            if (crossX) { // if pixel is crossing target pixel's right
                wx = (tX + 1 - tx); // weight of point within target pixel
                nwx = (tx + scale - tX - 1); // ... within x+1 target pixel
            }
            sR = sBuffer[sIndex];   // retrieving r,g,b for curr src px.
            sG = sBuffer[sIndex + 1];
            sB = sBuffer[sIndex + 2];
            if (!crossX && !crossY) { // pixel does not cross
                // just add components weighted by squared scale.
                tBuffer[tIndex] += sR * sqScale;
                tBuffer[tIndex + 1] += sG * sqScale;
                tBuffer[tIndex + 2] += sB * sqScale;
            } else if (crossX && !crossY) { // cross on X only
                w = wx * scale;
                // add weighted component for current px
                tBuffer[tIndex] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tX+1) px
                nw = nwx * scale
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
            } else if (!crossX && crossY) { // cross on Y only
                w = wy * scale;
                // add weighted component for current px
                tBuffer[tIndex] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // add weighted component for next (tY+1) px
                nw = nwy * scale
                tBuffer[tIndex + 3 * tw] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
            } else { // crosses both x and y : four target points involved
                // add weighted component for current px
                w = wx * wy;
                tBuffer[tIndex] += sR * w;
                tBuffer[tIndex + 1] += sG * w;
                tBuffer[tIndex + 2] += sB * w;
                // for tX + 1; tY px
                nw = nwx * wy;
                tBuffer[tIndex + 3] += sR * nw;
                tBuffer[tIndex + 4] += sG * nw;
                tBuffer[tIndex + 5] += sB * nw;
                // for tX ; tY + 1 px
                nw = wx * nwy;
                tBuffer[tIndex + 3 * tw] += sR * nw;
                tBuffer[tIndex + 3 * tw + 1] += sG * nw;
                tBuffer[tIndex + 3 * tw + 2] += sB * nw;
                // for tX + 1 ; tY +1 px
                nw = nwx * nwy;
                tBuffer[tIndex + 3 * tw + 3] += sR * nw;
                tBuffer[tIndex + 3 * tw + 4] += sG * nw;
                tBuffer[tIndex + 3 * tw + 5] += sB * nw;
            }
        } // end for sx
    } // end for sy

    // create result canvas
    var resCV = document.createElement('canvas');
    resCV.width = tw;
    resCV.height = th;
    var resCtx = resCV.getContext('2d');
    var imgRes = resCtx.getImageData(0, 0, tw, th);
    var tByteBuffer = imgRes.data;
    // convert float32 array into a UInt8Clamped Array
    var pxIndex = 0; //
    for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
        tByteBuffer[tIndex] = 0 | (tBuffer[sIndex]);
        tByteBuffer[tIndex + 1] = 0 | (tBuffer[sIndex + 1]);
        tByteBuffer[tIndex + 2] = 0 | (tBuffer[sIndex + 2]);
        tByteBuffer[tIndex + 3] = 255;
    }
    // writing result to canvas.
    resCtx.putImageData(imgRes, 0, 0);
    return resCV;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status == "loading" && /nimbusweb\.me\/slack\/\?code/.test(tab.url)) {
        console.log(tab);
        var code = tab.url.match(/code=(.+)&/)[1];
        var client_id = '17258488439.50405596566';
        var client_secret = '55775ecb78fe5cfc10250bd0119e0fc5';
        chrome.tabs.remove(tabId);

        screenshot.slack.requestToApi('oauth.access', 'client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + code, function (err, oauth) {
            screenshot.slack.oauth = oauth;
            localStorage.slackToken = screenshot.slack.oauth.access_token;
            screenshot.slack.sendData();
        })
    }
    if (changeInfo.status == "complete" && /everhelper\.me\/auth\/openidconnect/.test(tab.url) && /###EVERFAUTH:/.test(tab.title)) {
        var json = JSON.parse(tab.title.match(/###EVERFAUTH:(.+)/)[1]);
        json.action = 'nimbus_auth';

        chrome.tabs.remove(tabId);
        chrome.tabs.query({/*active: true, lastFocusedWindow: true*/}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                chrome.tabs.sendRequest(tabs[i].id, json);
            }
        });
    }
    if (changeInfo.status == "complete" && /accounts\.google\.com\/o\/oauth2\/approval/.test(tab.url)
        && /code=/.test(tab.title) && google_oauth.is_tab_google) {
        var code = tab.title.match(/.+?code=([\w\/\-]+)/)[1];
        var xhr = new XMLHttpRequest();
        var body = 'code=' + code +
            '&client_id=' + google_oauth.client_id +
            '&client_secret=' + google_oauth.client_secret +
            '&grant_type=authorization_code' +
            '&redirect_uri=urn:ietf:wg:oauth:2.0:oob:auto';
        xhr.open("POST", 'https://www.googleapis.com/oauth2/v4/token', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            if (xhr.readyState != 4 && xhr.status != 200) return;
            google_oauth.is_tab_google = false;
            console.log(xhr.responseText);
            var response = JSON.parse(xhr.responseText);
            console.log(response);
            if (response.access_token != undefined && response.refresh_token != undefined) {
                localStorage.access_token = response.access_token;
                localStorage.refresh_token = response.refresh_token;
                localStorage.expires_in = Date.now() + +response.expires_in;

                chrome.tabs.remove(tabId);
                chrome.tabs.query({/*active: true, lastFocusedWindow: true*/}, function (tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        chrome.tabs.sendRequest(tabs[i].id, {operation: 'access_google'});
                    }
                });
            }
        };
        xhr.onerror = function (err) {
            console.error(err);
        };
        xhr.send(body);
    }
});

var google_oauth = {
    client_id: "330587763390.apps.googleusercontent.com",
    client_secret: "Wh5_rPxGej6B7qmsVxvGolg8",
    scopes: "https://www.googleapis.com/auth/drive.readonly.metadata https://www.googleapis.com/auth/drive.file",
    is_tab_google: false,
    getToken: function () {
        return localStorage.access_token;
    },
    login: function () {
        var url = 'https://accounts.google.com/o/oauth2/v2/auth?' +
            '&client_id=' + google_oauth.client_id +
            '&redirect_uri=urn:ietf:wg:oauth:2.0:oob:auto' +
            '&scope=' + google_oauth.scopes +
            '&access_type=offline' +
            '&response_type=code';
        google_oauth.is_tab_google = true;
        chrome.tabs.create({url: url});
    },
    refreshToken: function (cb) {
        localStorage.access_token = response.access_token;
        localStorage.refresh_token = response.refresh_token;
        localStorage.expires_in = Date.now() + +response.expires_in;

        console.log(localStorage.access_token, localStorage.refresh_token, localStorage.expires_in)

        if (localStorage.refresh_token == undefined) {
            this.login();
        } else {
            if (Date.now() < +localStorage.expires_in) {
                chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                    for (var i = 0; i < tabs.length; i++) {
                        cb && cb();
                    }
                });
            } else {
                var xhr = new XMLHttpRequest();
                var body = 'refresh_token=' + localStorage.refresh_token +
                    '&client_id=' + google_oauth.client_id +
                    '&client_secret=' + google_oauth.client_secret +
                    '&grant_type=refresh_token';

                xhr.open("POST", 'https://www.googleapis.com/oauth2/v4/token', true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.onload = function () {
                    if (xhr.readyState != 4 && xhr.status != 200) return;

                    var response = JSON.parse(xhr.responseText);
                    console.log(response);
                    if (localStorage.access_token != undefined) {
                        localStorage.access_token = response.access_token;

                        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                            for (var i = 0; i < tabs.length; i++) {
                                cb && cb();
                            }
                        });
                    }
                };
                xhr.onerror = function (err) {
                    console.error(err);
                };
                xhr.send(body);
            }
        }
    }
};

var plugin = {};
var screenshot = {
    path: 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/temporary/',
    generated: false,
    newwholepage: true,
    enableNpapi: false,
    imgData: null,
    button_video: null,
    videoRecorder: videoRecorder,
    selectedOptionFunction: function (callback) {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            if (!/^chrome/.test(tabs[0].url)) {
                chrome.tabs.executeScript(tabs[0].id, {file: "js/consentNimbus.js"}, function () {
                    callback(tabs[0]);
                });
            } else {
                callback(false);
            }
        });
    },

    detectOS: function () {
//        return /Win||Linux/.test(window.navigator.platform) && !/CrOS/.test(window.navigator.userAgent);
        return screenshot.enableNpapi;
    },

    createMenu: function () {
        if (localStorage.showContentMenu == 'false') {
            chrome.contextMenus.removeAll(function () {
                console.log('remove menu', arguments)
            })
        } else {
            var button_root = chrome.contextMenus.create({
                "title": chrome.i18n.getMessage("appNameMini"),
                "contexts": ["all"]
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnVisiblePage"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    screenshot.captureVisible()
                }
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnCaptureFragment"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    screenshot.captureFragment()
                }
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnSelectedArea"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    screenshot.captureSelected()
                }
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnSelectedScroll"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    screenshot.scrollSelected()
                }
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnEntirePage"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    screenshot.captureEntire()
                }
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnBrowserWindow"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    screenshot.captureWindow()
                }
            });

            screenshot.button_video = chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnCaptureVideo"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    videoRecorder.capture({
                        type: 'tab',
                        countdown: localStorage.videoCountdown
                    });
                }
            });

            chrome.contextMenus.create({
                title: "separator",
                type: "separator",
                contexts: ["all"],
                parentId: button_root
            });

            chrome.contextMenus.create({
                title: chrome.i18n.getMessage("btnOptions"),
                contexts: ["all"],
                parentId: button_root,
                onclick: function () {
                    chrome.tabs.create({url: 'options.html'});
                }
            });
        }
    },
    changeVideoButton: function () {
        if (localStorage.showContentMenu == 'true') {
            if (screenshot.videoRecorder.getStatus()) {
                chrome.contextMenus.update(screenshot.button_video, {
                    title: chrome.i18n.getMessage("optionsLabelStopVideo"),
                    onclick: function () {
                        videoRecorder.stopRecord()
                    }
                })
            } else {
                chrome.contextMenus.update(screenshot.button_video, {
                    title: chrome.i18n.getMessage("btnCaptureVideo"),
                    onclick: function () {
                        videoRecorder.capture({
                            type: 'tab',
                            countdown: localStorage.videoCountdown
                        });
                    }
                })
            }
        }
    },
    openPage: function (url) {
        chrome.tabs.create({url: url}, function (tab) {
        });
    },
    captureEntire: function () {
        var screencanvas = {};
        var tab;

        function sendScrollMessage(tab) {
            screenshot.newwholepage = true;
            screencanvas = {};

            if (scrollToCrop == true) {
                chrome.tabs.sendRequest(tab.id, {
                    msg: 'scrollPage',
                    'scrollToCrop': true,
                    'hideFixedElements': (localStorage.hideFixedElements === 'true'),
                    'xs': xs,
                    'ys': ys,
                    'ws': ws,
                    'hs': hs
                });
            } else {
                chrome.tabs.sendRequest(tab.id, {
                    msg: 'scrollPage',
                    'scrollToCrop': false,
                    'hideFixedElements': (localStorage.hideFixedElements === 'true')
                });
            }
        }

        if (!screenshot.generated) {
            screenshot.generated = true;
            chrome.extension.onRequest.addListener(function (request, sender, callback) {
                var fn = {'capturePage': capturePage, 'openPage': openPage}[request.msg];
                if (fn) {
                    fn(request, sender, callback);
                }
            });
        }

        function capturePage(data, sender, callback) {
            var canvas;
            if (screenshot.newwholepage) {
                screenshot.newwholepage = false;
                canvas = document.createElement('canvas');
                var maxSize = 32767;
                var maxArea = 268435456;
                var width = Math.round(Math.min(data.totalWidth, maxSize)) * data.ratio;
                var height = Math.round(Math.min(data.totalHeight, maxSize)) * data.ratio;
                if (!data.scrollToCrop) {
                    width -= data.hasVScroll ? data.scrollWidth : 0;
                    height -= data.hasHScroll ? data.scrollWidth : 0;
                }
                if (width * height < maxArea) {
                    canvas.width = width;
                    canvas.height = height;
                } else {
                    canvas.width = width;
                    canvas.height = Math.floor(maxArea / width);
                }
                screencanvas.canvas = canvas;
                screencanvas.ctx = canvas.getContext('2d');
            }

            chrome.tabs.captureVisibleTab(null, {format: localStorage.format, quality: 100}, function (dataURI) {
                console.log('captureVisibleTab', data);
                var image = new Image();
                var x = 0;
                var y = Math.round(data.elem ? (data.h < data.elem.h ? (data.elem.y + (data.elem.h - data.h)) : data.elem.y) : 0) * data.ratio;
                var w = Math.round(data.w) * data.ratio - (data.hasVScroll ? data.scrollWidth : 0);
                var h = Math.round(data.h) * data.ratio - (data.hasHScroll ? data.scrollWidth : 0);
                var x2 = Math.round(data.scrollLeft % data.x > 0 ? data.scrollLeft : data.x) * data.ratio;
                var y2 = Math.round(data.elem ? (data.y + data.elem.y) : data.y) * data.ratio;
                var w2 = w;
                var h2 = h;
                image.onload = function (cb) {
                    if (data.scrollToCrop) {
                        x = Math.round(data.x) * data.ratio;
                        y = Math.round(data.y_shift) * data.ratio;
                        w = Math.round(data.w) * data.ratio;
                        h = Math.round(data.h) * data.ratio;
                        x2 = 0;
                        y2 = Math.round(data.y_crop) * data.ratio;
                        w2 = Math.round(data.w) * data.ratio;
                        h2 = Math.round(data.h) * data.ratio;
                    }

                    w = image.naturalWidth < w ? image.naturalWidth : w;
                    h = image.naturalHeight < h ? image.naturalHeight : h;

                    screencanvas.ctx.drawImage(image, x, y, w, h, x2, y2, w2, h2);
                    callback(true);
                };
                image.src = dataURI;
            });
        }

        function openPage(data) {
            if (scrollToCrop == true) {
                scrollToCrop = false;
            }

            var name = Date.now() + 'screencapture.' + localStorage.format;
            if (localStorage.keepOriginalResolution == 'true') {
                screencanvas.canvas = downScaleCanvas(screencanvas.canvas, data.zoom);
            }
            var imgdata = screencanvas.canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality / 100);

            // scaleCanvas(imgdata, data.ratio, function (canvas) {
            // imgdata = canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality / 100);
            screenshot.createBlob(imgdata, name, function () {
                localStorage.imgdata = screenshot.path + name;

                if (saveScroll) {
                    saveScroll = false;
                    pathImg = localStorage.imgdata;
                    screenshot.setScreenName(function (pageinfo) {
                        screenshot.download({
                            url: pathImg,
                            pageinfo: pageinfo
                        });
                    });
                } else if (nimbus_open) {
                    nimbus_open = false;
                    screenshot.createEditPage('nimbus');
                } else if (slack_open) {
                    slack_open = false;
                    screenshot.createEditPage('slack');
                } else if (google_open) {
                    google_open = false;
                    screenshot.createEditPage('google');
                } else if (print_open) {
                    print_open = false;
                    screenshot.createEditPage('print');
                } else {
                    screenshot.createEditPage();
                }
            });
            // });
        }

        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            tab = tabs[0];
            chrome.tabs.executeScript(tab.id, {file: "js/clearCapture.js"}, function () {
                chrome.tabs.executeScript(tab.id, {file: "js/page.js"}, function () {
                    sendScrollMessage(tab);
                });
            });
        });
    },
    setScreenName: function (cb) {
        localStorage.screenname = 'screenshot-by-nimbus';

        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            var tab = tabs[0];
            var info = {'url': tab.url, 'title': tab.title, 'time': getTimeStamp()};
            localStorage.pageinfo = JSON.stringify(info);
            localStorage.screenname = screenshot.getFileName(info);

            if (typeof cb == 'function') cb(info);
        });

    },

    captureSelected: function () {
        chrome.tabs.insertCSS(null, {file: "css/jquery.Jcrop.css"});
        chrome.tabs.insertCSS(null, {file: "css/stylecrop.css"});

        chrome.tabs.executeScript(null, {file: "js/jquery.js"}, function () {
            chrome.tabs.executeScript(null, {file: "js/jquery.Jcrop.js"}, function () {
                chrome.tabs.executeScript(null, {file: "js/crop.js"}, function () {
                    chrome.tabs.captureVisibleTab(null, {format: localStorage.format, quality: 100}, function (img) {
                        localStorage.imgdata = img;

                        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                            var tab = tabs[0];

                            chrome.tabs.sendRequest(tab.id, {msg: 'crop', image: img});
                        });
                    });
                });
            });
        });
    },

    captureDelayed: function () {
        timerContent.set(localStorage.delayedScreenshotTime || 3, 'capture_delayed');
    },

    scrollSelected: function () {
        chrome.tabs.insertCSS(null, {file: "css/jquery.Jcrop.css"});
        chrome.tabs.insertCSS(null, {file: "css/stylecrop.css"});

        chrome.tabs.executeScript(null, {file: "js/jquery.js"}, function () {
            chrome.tabs.executeScript(null, {file: "js/jquery.Jcrop.js"}, function () {
                chrome.tabs.executeScript(null, {file: "js/clearCapture.js"}, function () {
                    chrome.tabs.executeScript(null, {file: "js/scrollCrop.js"}, function () {
                    })
                })
            })
        })
    },

    fragmentsData: [],

    loadFragments: function (cb, tab_id) {
        var self = this;
        var load = function (i) {
            var image = new Image();
            image.onload = function () {
                self.fragmentsData[i].image = image;
                check(++i);
            };
            image.src = self.fragmentsData[i].src;
        };

        var check = function (i) {
            if (self.fragmentsData[i] == undefined) {
                cb();
            } else {
                load(i);
            }
        };
        check(0);
    },
    createFullFragment: function (position, zoom, cb, tab_id) {
        var self = this;

        this.loadFragments(function () {
            var canvas = document.createElement('canvas');
            var content = canvas.getContext("2d");
            canvas.width = Math.round(position.w * zoom);
            canvas.height = Math.round(position.h * zoom);
            content.scale(zoom, zoom);

            for (var i = 0, len = self.fragmentsData.length; i < len; i++) {
                content.drawImage(
                    self.fragmentsData[i].image,
                    Math.round(position.x * zoom),
                    0,
                    Math.round(position.w * zoom),
                    Math.round(self.fragmentsData[i].window_size.h * zoom),
                    0,
                    Math.round(self.fragmentsData[i].window_size.y - position.y),
                    Math.round(position.w),
                    Math.round(self.fragmentsData[i].window_size.h)
                );
            }

            cb(canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality / 100));
        }, tab_id);
    },
    cropFragment: function (position, window_size, zoom) {
        var self = this;
        chrome.tabs.captureVisibleTab(null, {format: localStorage.format, quality: 100}, function (fragment_data) {
            chrome.tabs.query({active: true/*, lastFocusedWindow: true*/}, function (tabs) {
                var tab = tabs[0];

                if (window_size.y === position.y ||
                    self.fragmentsData.length ||
                    (position.y >= window_size.y && position.y + position.h <= window_size.y + window_size.h)) {

                    self.fragmentsData.push({window_size: window_size, src: fragment_data});
                }

                if (!self.fragmentsData.length &&
                    (position.y < window_size.y || position.y + position.h > window_size.y + window_size.h)) {
                    chrome.tabs.sendMessage(tab.id, {
                        msg: 'capture_fragment_scroll',
                        position: position,
                        window_size: window_size,
                        scroll: {
                            x: 0,
                            y: position.y
                        }
                    });
                } else if (self.fragmentsData.length &&
                    position.y + position.h > window_size.y + window_size.h) {
                    chrome.tabs.sendMessage(tab.id, {
                        msg: 'capture_fragment_scroll',
                        position: position,
                        window_size: window_size,
                        scroll: {
                            x: 0,
                            y: window_size.y + window_size.h
                        }
                    });
                } else {
                    self.createFullFragment(position, zoom, function (img) {
                        var image = new Image();
                        image.onload = function () {
                            var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
                            var name = Date.now() + 'screencapture.' + localStorage.format;
                            canvas.width = image.naturalWidth;
                            canvas.height = image.naturalHeight;
                            ctx.drawImage(image, 0, 0);
                            if (localStorage.keepOriginalResolution == 'true') {
                                canvas = downScaleCanvas(canvas, 1 / (window.devicePixelRatio || 1));
                            }
                            img = canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality / 100);
                            screenshot.createBlob(img, name, function () {
                                localStorage.imgdata = screenshot.path + name;
                                chrome.tabs.sendMessage(tab.id, {
                                    msg: 'capture_fragment_set_image',
                                    image: img,
                                    position: position,
                                    window_size: window_size
                                });
                            });
                        };
                        image.src = img;

                    }, tab.id);
                }
            })
        })
    },
    captureFragment: function () {
        this.fragmentsData = [];

        chrome.tabs.insertCSS(null, {file: "css/fragment.css"});
        chrome.tabs.insertCSS(null, {file: "css/stylecrop.css"});

        chrome.tabs.executeScript(null, {file: "js/jquery.js"}, function () {
            chrome.tabs.executeScript(null, {file: "js/jquery.Jcrop.js"}, function () {
                chrome.tabs.executeScript(null, {file: "js/fragment.js"}, function () {

                    chrome.tabs.query({active: true/*, lastFocusedWindow: true*/}, function (tabs) {
                        var tab = tabs[0];
                        chrome.tabs.sendMessage(tab.id, {msg: 'capture_fragment_init'});
                    });

                });
            });
        });
    },
    captureVisible: function () {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.executeScript(tab.id, {file: "js/visible.js"}, function () {
                window.setTimeout(function () {

                    chrome.tabs.captureVisibleTab(null, {format: localStorage.format, quality: 100}, function (img) {
                        chrome.tabs.sendMessage(tab.id, {msg: 'restore_overflow'});

                        var image = new Image();
                        image.onload = function () {
                            var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
                            var name = Date.now() + 'screencapture.' + localStorage.format;
                            canvas.width = image.naturalWidth;
                            canvas.height = image.naturalHeight;
                            ctx.drawImage(image, 0, 0);
                            if (localStorage.keepOriginalResolution == 'true') {
                                canvas = downScaleCanvas(canvas, 1 / (window.devicePixelRatio || 1));
                            }
                            img = canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality / 100);
                            screenshot.createBlob(img, name, function () {
                                localStorage.imgdata = screenshot.path + name;
                                screenshot.createEditPage();
                            });
                        };
                        image.src = img;
                    });

                }, 100);
            });
        });
    },
    captureWindow: function () {
        screenshot.captureDesctop(function (img) {
            localStorage.imgdata = img;
            screenshot.createEditPage();
        });
    },
    captureDesctop: function (cb) {
        chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], function (streamId) {
            function success_handler(stream) {
                var v = document.createElement('video');
                v.addEventListener('canplay', function () {
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');

                    canvas.width = v.videoWidth;
                    canvas.height = v.videoHeight;

                    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
                    v.pause();
                    v.src = '';
                    stream.getTracks()[0].stop();
                    v.remove();
                    canvas.remove();

                    setTimeout(function () {
                        cb && cb(canvas.toDataURL());
                    }, 500);

                }, false);
                v.src = window.URL.createObjectURL(stream);
            }

            function failure_handler(error) {
                console.log(error);
            }

            if (streamId) {
                var obj = {
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: "desktop",
                            chromeMediaSourceId: streamId,
                            maxWidth: 2560,
                            maxHeight: 1440
                        }
                    }
                };
                window.navigator.webkitGetUserMedia(obj, success_handler, failure_handler);
            }
        });
    },
//    captureScreenCallback: function (data) {
//        screenshot.createBlob("data:image/bmp;base64," + data, 'screencapture.' + localStorage.format, function () {
//            localStorage.imgdata = screenshot.path + 'screencapture.' + localStorage.format;
//            screenshot.createEditPage();
//        });
//    },
    createBlob: function (dataURI, name, callback) {
        // screenshot.imgData = dataURI;
        var byteString = atob(dataURI.split(',')[1]);
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        var blob = new Blob([ab], {type: mimeString});

        function onwriteend() {
            // window.open(screenshot.path + name);
            if (callback) callback(blob.size);
        }

        function errorHandler() {
            console.log('uh-oh', arguments);
        }

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        window.requestFileSystem(
            window.TEMPORARY, 200 * 1024 * 1024, function (fs) {
                fs.root.getFile(name, {create: true}, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onerror = errorHandler;
                        fileWriter.onwriteend = onwriteend;
                        fileWriter.write(blob);
                    }, errorHandler);
                }, errorHandler);
            }, errorHandler);
    },
    createBlank: function () {
        var canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 500;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, 1000, 500);
        localStorage.imgdata = canvas.toDataURL();
        screenshot.createEditPage('blank');
    },
    createEditPage: function (params) {
        console.log(arguments);
        var option = params || localStorage.enableEdit;
        switch (option) {
            case 'copy':
                screenshot.copyToClipboard(localStorage.imgdata);
                break;
            case 'save':
                screenshot.setScreenName(function (pageinfo) {
                    screenshot.download({
                        url: localStorage.imgdata,
                        pageinfo: pageinfo
                    });
                });
                break;
            case 'edit':
            case 'done':
            default:
                screenshot.setScreenName();
                chrome.tabs.create({url: 'edit.html' + ((option == 'edit' || !option) ? '' : ('?' + option))});
                break;
        }
    },
    slack: {
        oauth: {
            access_token: null
        },
        requestToApi: function (action, param, cb) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                if (xhr.readyState != 4) return;

//                    console.log('req.status', xhr.status);
                if (xhr.status == 200) {
                    var res = JSON.parse(xhr.responseText);
//                        console.log('response', res);
                    cb && cb(null, res)
                } else {
                    cb && cb(true, null)
                }
            };
            xhr.onerror = function (err) {
                console.error(err, null);
            };
            xhr.open('GET', 'https://slack.com/api/' + action + '?' + param, true);
            xhr.send();
        },
        sendData: function () {
//                console.log(screenshot.slack.oauth.access_token);
            if (screenshot.slack.oauth.access_token) {
                screenshot.slack.requestToApi('channels.list', 'token=' + screenshot.slack.oauth.access_token, function (err, channels) {
                    screenshot.slack.requestToApi('users.list', 'token=' + screenshot.slack.oauth.access_token, function (err, users) {
                        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                            var tab = tabs[0];
//                                console.log(tab);
                            chrome.tabs.sendRequest(tab.id, {
                                action: 'slack_auth',
                                oauth: screenshot.slack.oauth,
                                channels: channels.channels,
                                users: users.members,
                                settings: {
                                    panel: ((localStorage.slackPanel == undefined || localStorage.slackPanel === 'true') ? true : false),
                                    channel: localStorage.slackChannel || null
                                }
                            });
                        });
                    })
                })
            }
        },
        oauthAccess: function () {
            // chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            //
            // });
        },
        init: function () {
//                screenshot.slack.oauth.access_token = "xoxp-36528459077-36538995330-36528650757-30b9c11c65";

            if (localStorage.slackToken) {
                screenshot.slack.oauth.access_token = localStorage.slackToken;
            }

//                chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//                    if (changeInfo.status == "complete") {
////                        console.log(tab);
//                        screenshot.slack.sendData();
//                    }
//                });

            // screenshot.slack.oauthAccess();
        }
    },
    init: function () {
        screenshot.createMenu();
        screenshot.slack.init();
    },
    copyToClipboard: function (img) {
        // var text = chrome.i18n.getMessage("notificationCopy");
        // if (!screenshot.enableNpapi || !plugin.saveToClipboard(img)) {
        //     text = chrome.i18n.getMessage("notificationWrong");
        // }
        //
        // var notification = webkitNotifications.createNotification('favicon.png', chrome.i18n.getMessage("appName"), text);
        // notification.show();
        // window.setTimeout(function() {
        //     notification.cancel();
        // }, 5000);
    },
//    convertBase64To: function (data, cb) {
//        if (localStorage.format == 'png') {
//            cb(data);
//        } else {
//            var img = new Image();
//            img.onload = function () {
//                var canvas = document.createElement('canvas');
//                canvas.width = img.width;
//                canvas.height = img.height;
//                var ctx = canvas.getContext('2d');
//                ctx.drawImage(img, 0, 0, img.width, img.height);
////                    var fonData = ctx.getImageData(0, 0, img.width, img.height);
//                var dataurl = canvas.toDataURL('image/' + localStorage.format, localStorage.imageQuality / 100);
//                cb && cb(dataurl);
//            };
//            img.src = data;
//        }
//    },
    download: function (data) {
        //TODO bug in Chrome 35 on Ubuntu
        if (/Linux/.test(window.navigator.platform) && /Chrome\/35/.test(window.navigator.userAgent)) {
            localStorage.enableSaveAs = 'false';
        }
        chrome.downloads.download({
            url: data.url,
            filename: screenshot.getFileName(data.pageinfo, true),
            saveAs: (localStorage.enableSaveAs !== 'false')
        }, function (downloadId) {
            function errorHandler() {
                console.log(arguments);
            }

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            window.requestFileSystem(window.TEMPORARY, 200 * 1024 * 1024, function (fs) {
                fs.root.getFile('screencapture.' + localStorage.format, {create: true}, function (fileEntry) {
                    fileEntry.remove(function () {
                        console.log('File removed.');
                    }, errorHandler);
                }, errorHandler);
            }, errorHandler);
        });
    },
    getFileName: function (pageinfo, format) {
        var s = localStorage.fileNamePattern;
        var f = localStorage.format;
        if (typeof pageinfo == 'object') {
            var url = document.createElement('a');
            url.href = pageinfo.url || '';
            s = s.replace(/\{url}/, pageinfo.url || '')
                .replace(/\{title}/, pageinfo.title || '')
                .replace(/\{domain}/, url.host || '')
                .replace(/\{date}/, pageinfo.time.split(' ')[0] || '')
                .replace(/\{time}/, pageinfo.time.split(' ')[1] || '')
                .replace(/\{ms}/, pageinfo.time.split(' ')[2] || '')
                .replace(/\{timestamp}/, pageinfo.time.split(' ')[3] || '');

        }
        return s.replace(/[\*\|\\\:\"\<\>\?\/#]+/ig, '-') + (format ? ('.' + f) : '');
    }
};

function getTimeStamp() {
    var y, m, d, h, M, s, mm, timestamp;
    var time = new Date();
    y = time.getFullYear();
    m = time.getMonth() + 1;
    d = time.getDate();
    h = time.getHours();
    M = time.getMinutes();
    s = time.getSeconds();
    mm = time.getMilliseconds();
    timestamp = Date.now();
    if (m < 10) m = '0' + m;
    if (d < 10) d = '0' + d;
    if (h < 10) h = '0' + h;
    if (M < 10) M = '0' + M;
    if (s < 10) s = '0' + s;
    if (mm < 10) mm = '00' + mm;
    else if (mm < 100) mm = '0' + mm;
    return y + '.' + m + '.' + d + ' ' + h + ':' + M + ':' + s + ' ' + mm + ' ' + timestamp;
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg == 'stop_timer') {
        chrome.browserAction.setPopup({popup: 'popup.html'});
        // screenshot.videoRecorder.stopRecord();
    }
    if (request.msg == 'end_timer') {
        chrome.browserAction.setPopup({popup: 'popup.html'});
        if (request.type === 'capture_delayed') {
            screenshot.captureVisible();
        } else if (request.type != undefined) {
            screenshot.videoRecorder.capture({
                type: request.type,
                countdown: localStorage.videoCountdown,
                not_timer: true
            });
        }
    }
    if (request.msg == 'cut') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage();
    } else if (request.msg == 'crop_fragment') {
        console.log(request);
        screenshot.cropFragment(request.position, request.window_size, request.zoom)
    } else if (request.msg == 'save_fragment') {
        pathImg = localStorage.imgdata;
        screenshot.setScreenName(function (pageinfo) {
            screenshot.download({
                url: pathImg,
                pageinfo: pageinfo
            });
        });
    } else if (request.msg == 'save_image') {
        screenshot.setScreenName(function (pageinfo) {
            screenshot.download({
                url: request.data,
                pageinfo: pageinfo
            });
        });
    } else if (request.msg === 'openeditpagepage') {
        screenshot.createEditPage();
    } else if (request.msg === 'copytoclipboard') {
        screenshot.copyToClipboard(request.img)
    } else if (request.msg === 'send_to_nimbus') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage('nimbus');
    } else if (request.msg === 'send_to_slack') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage('slack');
    } else if (request.msg === 'send_to_google') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage('google');
    } else if (request.msg === 'send_to_print') {
        localStorage.imgdata = request.img;
        screenshot.createEditPage('print');
    } else if (request.msg === 'openpage') {
        screenshot.openPage(request.url);
    } else if (request.msg === 'getformat') {
        sendResponse({
            format: localStorage.format,
            quality: localStorage.imageQuality
        });
    } else if (request.msg === 'saveCropPosition') {
        localStorage.cropPosition = JSON.stringify(request.position);
    } else if (request.msg === 'getCropPosition') {
        if (localStorage.saveCropPosition === 'true') {
            sendResponse(JSON.parse(localStorage.cropPosition));
        }
    } else if (request.msg === 'saveCropScrollPosition') {
        localStorage.cropScrollPosition = JSON.stringify(request.position);
    } else if (request.msg === 'getCropScrollPosition') {
        var res = {};
        if (localStorage.saveCropPosition === 'true') {
            res = JSON.parse(localStorage.cropScrollPosition);
        }
        res.hideFixedElements = (localStorage.hideFixedElements === 'true');
        sendResponse(res);
    } else if (request.msg === 'get_file_name') {
        request.pageinfo.time = getTimeStamp();
        sendResponse(screenshot.getFileName(request.pageinfo));
    } else if (request.msg === 'set_setting') {
        localStorage[request.key] = request.value;
    } else if (request.msg === 'get_setting') {
        sendResponse(localStorage[request.key]);
    } else if (request.msg === 'slack_logout') {
        screenshot.slack.oauth.access_token = null;
        localStorage.slackToken = null;
    } else if (request.msg === 'enable_save_as') {
        sendResponse(localStorage.enableSaveAs);
    } else if (request.msg === 'get_slack_data') {
        if (screenshot.slack.oauth.access_token) {
            screenshot.slack.requestToApi('channels.list', 'token=' + screenshot.slack.oauth.access_token, function (err, channels) {
                screenshot.slack.requestToApi('users.list', 'token=' + screenshot.slack.oauth.access_token, function (err, users) {
                    sendResponse({
                        action: 'slack_auth',
                        oauth: screenshot.slack.oauth,
                        channels: channels.channels,
                        users: users.members,
                        settings: {
                            panel: ((localStorage.slackPanel == undefined || localStorage.slackPanel === 'true') ? true : false),
                            channel: localStorage.slackChannel || null
                        }
                    });
                });
            });
            return true;
        }
    } else if (request.msg === 'oauth2_google') {
        google_oauth.login()
    } else if (request.msg === 'oauth2_google_refresh') {
        google_oauth.refreshToken(
            sendResponse()
        );
    } else if (request.msg === 'update_menu') {
        screenshot.createMenu();
    }
    if (request.operation == 'status_video_change') {
        switch (request.status) {
            case 'play' :
                if (screenshot.videoRecorder.getState() !== 'recording') {
                    screenshot.videoRecorder.pauseRecord();
                }
                break;
            case 'pause' :
                if (screenshot.videoRecorder.getState() === 'recording') {
                    screenshot.videoRecorder.pauseRecord();
                }
                break;
            case 'stop' :
                screenshot.videoRecorder.stopRecord();
                break;
        }
    }
    if (request.operation == 'video_deawing_tools') {
        localStorage.deawingTools = request.value;
    }
    if (request.operation === 'open_page') {
        console.log(request.url);
        screenshot.openPage(request.url);
    }

});

//these variables are responsible for the operation of each function in separate tabs
var thisCrop, thisFragment, thisScrollCrop;
//These variables are parameters which are responsible for a function to scroll
var xs, ys, ws, hs, scrollToCrop = false, saveScroll = false, pathImg, nimbus_open = false, slack_open = false, google_open = false, print_open = false;

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {

    if (request.operation == 'cap') {
        xs = request.xs;
        ys = request.ys;
        ws = request.ws;
        hs = request.hs;
    }

    if (request.operation == 'cropScroll') {
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'send_to_nimbus_scroll') {
        nimbus_open = true;
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'send_to_slack_scroll') {
        slack_open = true;
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'send_to_google_scroll') {
        google_open = true;
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'send_to_print_scroll') {
        print_open = true;
        scrollToCrop = true;
        screenshot.captureEntire()
    }

    if (request.operation == 'saveScroll') {
        saveScroll = true;
        scrollToCrop = true;
        screenshot.captureEntire();
    }

    if (request.operation == 'Fragment') {
        thisFragment = request.parameter;
    }

    if (request.operation == 'Crop') {
        thisCrop = request.parameter;
    }

    if (request.operation == 'Scroll') {
        thisScrollCrop = request.parameter;
    }
    if (request.operation == 'hotkeys') {
        sendResponse({hotkeys: localStorage.hotkeys});
    } else if (request.operation == 'hotkey') {
        console.log(request.name);
        if (request.name == 'visible') {
            screenshot.captureVisible();
        }
        if (request.name == 'fragment') {
            screenshot.captureFragment();
        }
        if (request.name == 'selected') {
            screenshot.captureSelected();
        }
        if (request.name == 'scroll') {
            screenshot.scrollSelected();
        }
        if (request.name == 'entire') {
            screenshot.captureEntire();
        }
        if (request.name == 'window') {
            screenshot.captureWindow();
        }
        if (request.name == 'tab_video') {
            screenshot.videoRecorder.capture({
                type: 'tab',
                countdown: localStorage.videoCountdown
            });
        }
        if (request.name == 'desktop_video') {
            screenshot.videoRecorder.capture({
                type: 'desktop',
                countdown: localStorage.videoCountdown
            });
        }
        if (request.name == 'stop_video') {
            screenshot.videoRecorder.stopRecord()
        }

    }
});

// alert('Command:');
chrome.commands.onCommand.addListener(function (command) {
    if (command === 'start_tab_video') {
        screenshot.videoRecorder.capture({
            type: 'tab',
            countdown: localStorage.videoCountdown
        });
    }
    if (command === 'start_desktop_video') {
        screenshot.videoRecorder.capture({
            type: 'desktop',
            countdown: localStorage.videoCountdown
        });
    }
    if (command === 'stop_video') {
        screenshot.videoRecorder.stopRecord()
    }
    if (command === 'pause_video') {
        if (screenshot.videoRecorder.getState() === 'recording') {
            screenshot.videoRecorder.pauseRecord();
        }
    }
});

if (localStorage.hotkeys) {
    var hotkeys = JSON.parse(localStorage.hotkeys);
    localStorage.hotkeys = JSON.stringify({
        tab_video: hotkeys.tab_video || 55,
        desktop_video: hotkeys.desktop_video || 56,
        stop_video: hotkeys.stop_video || 57,
        visible: hotkeys.visible || 49,
        fragment: hotkeys.fragment || 54,
        selected: hotkeys.selected || 50,
        scroll: hotkeys.scroll || 51,
        entire: hotkeys.entire || 52,
        window: hotkeys.window || 53
    });
} else {
    localStorage.hotkeys = JSON.stringify({
        tab_video: '55',
        desktop_video: '56',
        stop_video: '57',
        visible: '49',
        fragment: '54',
        selected: '50',
        scroll: '51',
        entire: '52',
        window: '53'
    });
}

if (!localStorage.hotkeysSendNS) {
    localStorage.hotkeysSendNS = JSON.stringify({
        key: '13',
        title: 'Enter'
    });
}

localStorage.micSound = localStorage.micSound || 'true';
localStorage.tabSound = localStorage.tabSound || 'false';
localStorage.videoReEncoding = localStorage.videoReEncoding || 'true';
localStorage.micPopup = localStorage.micPopup || 'false';
localStorage.cursorAnimate = localStorage.cursorAnimate || 'false';
localStorage.deawingTools = localStorage.deawingTools || 'false';
localStorage.recordType = localStorage.recordType || 'tab';
localStorage.videoSize = localStorage.videoSize || 'auto';
localStorage.videoBitrate = localStorage.videoBitrate || '4500000';
localStorage.audioBitrate = localStorage.audioBitrate || '96000';
localStorage.videoFps = localStorage.videoFps || '24';
localStorage.deleteDrawing = localStorage.deleteDrawing || '6';
localStorage.selectMic = localStorage.selectMic || 'default';
localStorage.videoCountdown = localStorage.videoCountdown || '3';
localStorage.format = localStorage.format || 'png';
localStorage.imageQuality = localStorage.imageQuality || '92';
localStorage.enableEdit = localStorage.enableEdit || 'edit';
localStorage.quickCapture = localStorage.quickCapture || 'false';
localStorage.enableSaveAs = localStorage.enableSaveAs || 'true';
localStorage.saveCropPosition = localStorage.saveCropPosition || 'false';
localStorage.showContentMenu = localStorage.showContentMenu || 'true';
localStorage.keepOriginalResolution = localStorage.keepOriginalResolution || 'true';
localStorage.hideFixedElements = localStorage.hideFixedElements || 'true';
localStorage.shareOnGoogle = localStorage.shareOnGoogle || 'false';
localStorage.cropPosition = localStorage.cropPosition || JSON.stringify({
    "x": 50,
    "y": 50,
    "x2": 450,
    "y2": 250,
    "w": 400,
    "h": 200
});
localStorage.cropScrollPosition = localStorage.cropScrollPosition || JSON.stringify({
    "x": 50,
    "y": 50,
    "x2": 450,
    "y2": 250,
    "w": 400,
    "h": 200
});
localStorage.fileNamePattern = localStorage.fileNamePattern || 'screenshot-{domain}-{date}-{time}';

window.onload = function () {
    screenshot.init();
};

chrome.storage.sync.get('nimbus_screenshot_first_install', function (data) {
    if (!data.nimbus_screenshot_first_install) {
        chrome.storage.sync.set({'nimbus_screenshot_first_install': true}, function () {
            screenshot.openPage('http://nimbus-screenshot.everhelper.me/install.php');
        });
    }
});

chrome.runtime.setUninstallURL('https://nimbus.everhelper.me/screenshot-uninstall/');

var manifest = chrome.runtime.getManifest();
if (localStorage.version != manifest.version) {
    iconService.setUpdate();

    chrome.browserAction.onClicked.addListener(function () {
        localStorage.version = manifest.version;
        iconService.setDefault();
        chrome.tabs.create({url: 'http://nimbus-screenshot.everhelper.me/releasecapture' + (navigator.language == 'ru' ? 'ru' : '') + '.php', active: true});
    });
}