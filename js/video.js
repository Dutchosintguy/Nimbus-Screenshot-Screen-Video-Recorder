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

var isLog = true;
var MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

/*global MediaStream:true */
if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
    MediaStream.prototype.stop = function () {
        this.getAudioTracks().forEach(function (track) {
            track.stop();
        });

        this.getVideoTracks().forEach(function (track) {
            track.stop();
        });
    };
}

iconService.setDefault();

var videoRecorder = (function () {
    var streamVideo = null;
    var streamAudio = null;
    // var $streamElement,
    var $tabCursor;
    var typeCapture, tabSound, micSound, videoSize, audioBitrate, videoBitrate, videoFps, audioPlayer, context;
    var countdown = 0;
    var timer = null;
    var activeTab = null;
    var recorder = null;
    var isRecording = false;
    var isError = false;
    var timeStart = null;
    var timePause = null;

    function onMediaAccess(access) {
        if (access) {
            streamVideo.active && preRecord(streamVideo)
        } else {
            stopStream();
        }
    }

    function failure_handler(error) {
        console.log(error);
    }

    function startRecord(videoStream, audioStream) {
        if (isLog) console.log('startRecord', arguments);
        injectionCursor();
        injectionVideoPanel();

        var recorder_option = {
            autoWriteToDisk: true,
            type: 'video',
            disableLogs: false,
            mimeType: 'video/webm\;codecs=vp8',
            audioBitsPerSecond: audioBitrate,
            videoBitsPerSecond: videoBitrate
        };

        if (audioStream && audioStream.getAudioTracks && audioStream.getAudioTracks().length) {
            audioPlayer = new Audio();//document.createElement('audio');
            audioPlayer.muted = true;
            audioPlayer.volume = 0;
            audioPlayer.src = URL.createObjectURL(audioStream);
            audioPlayer.play();

            var singleAudioStream = getMixedAudioStream([audioStream]);
            if (typeof singleAudioStream == 'boolean') {
                isError = true;
                stopStream();
                alert('Something went Wrong. Important! Restart your Browser or Reload Nimbus Capture extension.');
                return;
            }
            singleAudioStream.addTrack(videoStream.getVideoTracks()[0]);
            videoStream = singleAudioStream;
        }

        recorder = RecordRTC(videoStream, recorder_option);
        recorder.startRecording();

        chrome.tabs.query({active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {operation: 'status_video', status: getStatus(), state: getState()});
        });

        iconService.setRec();
        screenshot.changeVideoButton();
        timeStart = Date.now();
    }

    function preRecord(stream) {
        if (isLog) console.log('preRecord', arguments, 'micSound', micSound);
        if (chrome.runtime.lastError) {
            if (/activeTab/.test(chrome.runtime.lastError.message)) {
                isRecording = false;
                alert(chrome.i18n.getMessage('notificationErrorActiveTab'));
            }
            console.error(chrome.runtime.lastError.message);
        } else {
            streamVideo = stream;

            streamVideo.onended = function () {
                streamVideo.onended = function () {
                };

                console.log('stream.onended');
                streamAudio && streamAudio.active && streamAudio.stop();
                stopRecord()
            };

            streamVideo.getVideoTracks()[0].onended = function () {
                if (streamVideo && streamVideo.onended) {
                    streamVideo.onended();
                }
            };

            if (micSound) {
                window.navigator.getUserMedia({audio: true}, function (stream_audio) {
                    streamAudio = stream_audio;
                    startRecord(streamVideo, streamAudio);
                }, function (e) {
                    isRecording = false;
                    chrome.tabs.create({url: 'mic.html'});
                })
            } else {
                startRecord(streamVideo);
            }

            if (tabSound) {
                var audio = new Audio();
                audio.src = URL.createObjectURL(stream);
                audio.volume = 1;
                audio.play();
            }
        }
    }

    function countdownRun(cb) {
        (function () {
            function time() {
                if (countdown > 0) {
                    iconService.showBadge(countdown);
                    countdown--;
                    timer = setTimeout(time, 1000);
                } else {
                    iconService.setDefault();
                    timer = null;
                    cb && cb();
                }
            }

            time();
        })()
    }

    function captureTab() {
        if (isLog) console.log('captureTab', arguments);
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
            if (!tabs.length || /^chrome/.test(tabs[0].url)) {
                isRecording = false;
                alert(chrome.i18n.getMessage('notificationErrorChromeTab'));
            } else {
                activeTab = tabs[0];
                var constraints = {
                    audio: !micSound && tabSound,
                    video: true,
                    videoConstraints: {
                        mandatory: {
                            chromeMediaSource: 'tab',
                            maxFrameRate: videoFps,
                            maxWidth: typeof videoSize !== 'object' ? activeTab.width : videoSize.width,
                            maxHeight: typeof videoSize !== 'object' ? activeTab.height : videoSize.height
                        }
                    }
                };
                localStorage.currentVideoWidth = constraints.videoConstraints.mandatory.maxWidth;
                localStorage.currentVideoHeight = constraints.videoConstraints.mandatory.maxHeight;

                chrome.tabCapture.capture(constraints, preRecord);
            }
        });
    }

    function captureDesktop() {
        if (isLog) console.log('captureDesktop', arguments);
        chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], function (streamId) {
            if (!streamId) {
                isRecording = false;
            } else {
                var constraints = {
                    video: {
                        mandatory: {
                            chromeMediaSource: "desktop",
                            chromeMediaSourceId: streamId,
                            maxFrameRate: videoFps,
                            maxWidth: typeof videoSize !== 'object' ? window.screen.width : videoSize.width,
                            maxHeight: typeof videoSize !== 'object' ? window.screen.height : videoSize.height
                        }
                    }
                };
                localStorage.currentVideoWidth = constraints.video.mandatory.maxWidth;
                localStorage.currentVideoHeight = constraints.video.mandatory.maxHeight;
                countdownRun(function () {
                    window.navigator.getUserMedia(constraints, preRecord, failure_handler);
                })
            }

        });

    }

    function capture(param) {
        if (isLog) console.log('capture', arguments);
        if (isRecording) return;
        isRecording = true;

        countdown = param.countdown;
        micSound = localStorage.micSound === 'true';
        tabSound = localStorage.tabSound === 'true';
        videoSize = localStorage.videoSize === 'auto';
        audioBitrate = +localStorage.audioBitrate;
        videoBitrate = +localStorage.videoBitrate;
        videoFps = +localStorage.videoFps;
        switch (localStorage.videoSize) {
            case '4k':
                videoSize = {
                    width: 3840,
                    height: 2160
                };
                break;
            case 'full-hd':
                videoSize = {
                    width: 1920,
                    height: 1080
                };
                break;
            case 'hd':
                videoSize = {
                    width: 1280,
                    height: 720
                };
                break;
        }

        if (param.type === 'tab') {
            if (param.countdown > 0 && !param.not_timer) {
                isRecording = false;
                chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
                    if (!tabs.length || /^chrome/.test(tabs[0].url)) {
                        alert(chrome.i18n.getMessage('notificationErrorChromeTab'));
                    } else {
                        timerContent.set(param.countdown, 'tab');
                    }
                });
            } else {
                typeCapture = 'tab';
                captureTab()
            }
        } else {
            typeCapture = 'desktop';
            captureDesktop();
        }
    }

    function stopStream() {
        if (isLog) console.log('stopStream', streamVideo, streamAudio, recorder);
        if (streamVideo.active && recorder.state !== 'recording') {
            timePause = null;
            recorder.resumeRecording();
            iconService.setRec();
        }
        window.setTimeout(function () {
            try {
                streamVideo.stop();
                streamAudio.stop();
                stopRecord();
            } catch (e) {
                stopRecord();
            }
        }, 1500);
    }

    function stopRecord() {
        if (isLog) console.log('stopRecord', arguments);
        if (timer) {
            clearInterval(timer);
            countdown = 0;
            timer = null;
        }

        recorder.stopRecording(function (audioVideoWebMURL) {
            timeStart = null;
            iconService.setDefault();
            $tabCursor && chrome.tabs.sendMessage($tabCursor.id, {cursor: false});
            $tabCursor = null;
            activeTab = null;
            isRecording = false;

            try {
                audioPlayer && (audioPlayer = undefined);
                context && (context.close());
                context = undefined;
            } catch (e) {
                console.log(e)
            }

            chrome.tabs.query({active: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {operation: 'status_video', status: getStatus(), state: getState()});
            });
            screenshot.changeVideoButton();
            if (!isError) {
                localStorage.audioVideoWebMURL = audioVideoWebMURL;
                screenshot.createEditPage('video');
            }
            console.log('isError', isError);
            isError = false;
        });
    }

    function pauseRecord() {
        if (isLog) console.log('pauseRecord', arguments);
        if (recorder.state === 'recording') {
            timePause = Date.now();
            recorder.pauseRecording();
            iconService.setPause();
        } else {
            timePause = null;
            recorder.resumeRecording();
            iconService.setRec();
        }
        chrome.tabs.query({active: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {operation: 'status_video', status: getStatus(), state: getState()});
        });
    }

    function getState() {
        return (recorder && recorder.state);
    }

    function getMixedAudioStream(arrayOfMediaStreams) {
        try {
            context = new AudioContext();
        } catch (e) {
            console.log(e);
            return false;
        }

        var audioSources = [];

        var gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.value = 0;

        var audioTracksLength = 0;
        arrayOfMediaStreams.forEach(function (stream) {
            if (!stream.getAudioTracks().length) {
                return;
            }
            audioTracksLength++;

            var audioSource = context.createMediaStreamSource(stream);
            audioSource.connect(gainNode);
            audioSources.push(audioSource);
        });

        if (!audioTracksLength) {
            return;
        }

        var mediaStreamDestination = context.createMediaStreamDestination();
        audioSources.forEach(function (audioSource) {
            audioSource.connect(mediaStreamDestination);
        });
        return mediaStreamDestination.stream;
    }

    function getStatus() {
        return timer || !!streamVideo.active;
    }

    function getTimeRecord() {
        var date = Date.now();
        timeStart = timeStart + (timePause ? date - timePause : 0);
        timePause = timePause ? date : null;
        return timeStart ? (date - timeStart) : 0;
    }

    function injectionCursor() {
        // if (localStorage.cursorAnimate !== 'true')
        return;
        chrome.tabs.insertCSS(activeTab.id, {file: "css/new-style.css"});
        chrome.tabs.executeScript(activeTab.id, {file: "js/content-cursor.js"}, function () {
            chrome.tabs.sendMessage(activeTab.id, {cursor: true, cursorAnimate: localStorage.cursorAnimate === 'true'}, function () {
                activeTab.injectionCursor = true;
            });
        });
    }

    function injectionVideoPanel() {
        if (!activeTab) return;
        chrome.tabs.sendMessage(activeTab.id, {operation: 'is_set_file'}, function (status) {
            if (!status) {
                chrome.tabs.insertCSS(activeTab.id, {file: "css/flex.css"});
                chrome.tabs.insertCSS(activeTab.id, {file: "css/icons.css"});
                chrome.tabs.insertCSS(activeTab.id, {file: "css/new-style.css"});
                chrome.tabs.executeScript(activeTab.id, {file: "js/jquery.js"}, function () {
                    chrome.tabs.executeScript(activeTab.id, {file: "js/video-editor.js"}, function () {
                        chrome.tabs.executeScript(activeTab.id, {code: "var deawingTools = " + (localStorage.deawingTools == 'true') + ", deleteDrawing = " + +localStorage.deleteDrawing + ";"}, function () {
                            chrome.tabs.executeScript(activeTab.id, {file: "js/video-panel.js"});
                        });
                    });
                });
            }
        });
    }

    chrome.tabs.onUpdated.addListener(function (tabId, info) {
        chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
            if (info.status == "loading" && tabs[0].id && tabs[0].url && activeTab &&
                tabs[0].id == tabId && activeTab.id == tabId && !/^chrome/.test(tabs[0].url)) {
                injectionCursor();
                injectionVideoPanel();
            }
        });
    });

    chrome.tabs.onRemoved.addListener(function (tabId, info) {
        if (activeTab && activeTab.id == tabId) {
            stopStream();
        }
    });

    return {
        capture: capture,
        captureTab: captureTab,
        captureDesktop: captureDesktop,
        stopRecord: stopStream,
        pauseRecord: pauseRecord,
        getStatus: getStatus,
        getState: getState,
        getTimeRecord: getTimeRecord,
        onMediaAccess: onMediaAccess
    }
})();