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

var nacl_module = {
    listener: null,
    videoBlob: null,
    init: function (cb) {
        function errorHandler(e) {
            console.error(e);
        }

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            if (xhr.status == 200) {
                var videoBlob = new Blob([xhr.response], {type: 'video/webm'});
                window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
                window.requestFileSystem(window.PERSISTENT, videoBlob.size, function (fs) {
                    var truncated = false;
                    fs.root.getFile('video.webm', {create: true}, function (fileEntry) {
                        fileEntry.createWriter(function (writer) {
                            writer.onwriteend = function (e) {
                                if (!truncated) {
                                    truncated = true;
                                    this.truncate(this.position);
                                    return;
                                }
                                if(localStorage.videoReEncoding !== 'false') {
                                    nacl_module.set_nacl(cb);
                                } else {
                                    var file_path = 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/persistent/video.webm';
                                    cb && cb(file_path, videoBlob);
                                }
                            };

                            writer.onerror = errorHandler;
                            writer.write(videoBlob);
                        }, errorHandler);
                    }, errorHandler);
                }, errorHandler);
            }
        };
        xhr.open('GET', localStorage.audioVideoWebMURL, true);
        xhr.send(null);
    },
    set_nacl: function (cb) {
        this.listener = document.getElementById('nacl_module_listener');

        if (!this.listener) {
            this.listener = document.createElement('div');
            this.listener.setAttribute('id', 'nacl_module_listener');
            document.body.appendChild(this.listener);
        }

        var nacl_module = document.getElementById('nacl_module');
        if (nacl_module) {
            nacl_module.parentNode.removeChild(nacl_module);
        }

        var embed = document.createElement('embed');
        embed.setAttribute('name', 'nacl_module');
        embed.setAttribute('id', 'nacl_module');
        embed.setAttribute('width', 0);
        embed.setAttribute('height', 0);
        embed.setAttribute('path', 'glibc/Release');
        embed.setAttribute("ps_stdout", "dev/tty");
        embed.setAttribute("ps_stderr", "dev/tty");
        embed.setAttribute("ps_tty_prefix", "''");
        embed.setAttribute('src', 'bin/ffmpeg.nmf');
        var i = 0;
        embed.setAttribute("arg" + (i++).toString(), "ffmpeg");
        embed.setAttribute("arg" + (i++).toString(), "-y");
        embed.setAttribute("arg" + (i++).toString(), "-fflags");
        embed.setAttribute("arg" + (i++).toString(), "+genpts");
        embed.setAttribute("arg" + (i++).toString(), "-i");
        embed.setAttribute("arg" + (i++).toString(), "/html5_persistent/video.webm");
        embed.setAttribute("arg" + (i++).toString(), "-c:a");
        embed.setAttribute("arg" + (i++).toString(), "copy");
        embed.setAttribute("arg" + (i++).toString(), "-c:v");
        embed.setAttribute("arg" + (i++).toString(), "copy");
        embed.setAttribute("arg" + (i++).toString(), "/html5_persistent/output.webm");
        embed.setAttribute('type', 'application/x-nacl');
        this.listener.appendChild(embed);
        // embed.offsetTop;

        this.event(cb);
    },
    event: function (cb) {
        // this.listener.addEventListener('message', function (event) {
        //     console.log(event.data);
        // }, true);
        // this.listener.addEventListener('error', function (event) {
        //     console.error(event);
        // }, true);
        this.listener.addEventListener('crash', function () {
            var nacl_module = document.getElementById('nacl_module');
            if (nacl_module.exitStatus == -1) {
                console.log('nacl crashed');
            } else {
                console.log('nacl done', nacl_module.exitStatus);
                nacl_module.parentNode.removeChild(nacl_module);
                var file_path = 'filesystem:chrome-extension://' + chrome.i18n.getMessage("@@extension_id") + '/persistent/output.webm';

                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = function (e) {
                    if (xhr.status == 200) {
                        var videoBlob = xhr.response;
                        console.log(videoBlob);
                        cb && cb(file_path, videoBlob);
                    }
                };
                xhr.open('GET', file_path, true);
                xhr.send(null);
            }
        }, true);
    }
};



