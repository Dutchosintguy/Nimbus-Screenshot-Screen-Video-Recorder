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
    if (!EXT_HOTKEY_JS_INSERTED) {
        var EXT_HOTKEY_JS_INSERTED = true;
        var hotkeys = {};

        chrome.extension.sendRequest({operation: 'hotkeys'}, function (response) {
            if (response)
                if (response.hotkeys) {
                    hotkeys = JSON.parse(response.hotkeys);
                }
        });

        var sendToChrome = function (type) {
            chrome.extension.sendRequest({'operation': 'hotkey', 'name': type});
        };

        window.addEventListener('keydown', function (e) {
            var k = e.keyCode;
            if (e.shiftKey && e.ctrlKey) {
                if (k == hotkeys.entire) {
                    sendToChrome('entire');
                    e.preventDefault();
                    return false;
                }

                if (k == hotkeys.fragment) {
                    sendToChrome('fragment');
                    e.preventDefault();
                    return false;
                }

                if (k == hotkeys.selected) {
                    sendToChrome('selected');
                    e.preventDefault();
                    return false;
                }
                if (k == hotkeys.scroll) {
                    sendToChrome('scroll');
                    e.preventDefault();
                    return false;
                }
                if (k == hotkeys.visible) {
                    sendToChrome('visible');
                    e.preventDefault();
                    return false;
                }
                if (k == hotkeys.window) {
                    sendToChrome('window');
                    e.preventDefault();
                    return false;
                }
                // if (k == hotkeys.tab_video) {
                //     sendToChrome('tab_video');
                //     e.preventDefault();
                //     return false;
                // }
                // if (k == hotkeys.desktop_video) {
                //     sendToChrome('desktop_video');
                //     e.preventDefault();
                //     return false;
                // }
                // if (k == hotkeys.stop_video) {
                //     sendToChrome('stop_video');
                //     e.preventDefault();
                //     return false;
                // }
            }

            return true;
        }, false);
    }
})();