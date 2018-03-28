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

var iconService = (function () {
    function getPath(a) {
        return {
            path: {
                16: "images/icons/16x16" + a + ".png",
                48: "images/icons/48x48" + a + ".png",
                128: "images/icons/128x128" + a + ".png"
            }
        }
    }

    function setPopup(popup) {
        chrome.browserAction.setPopup({popup: popup});
    }

    function setIcon(type) {
        chrome.browserAction.setIcon(getPath(type));
    }
    
    function setUpdate() {
        setPopup('');
        setIcon('new');
    }

    function setDefault() {
        setPopup('popup.html');
        showBadge('');
        setIcon('');
    }

    function setRec() {
        setIcon('rec');
    }

    function setPause() {
        setIcon('paused');
    }

    function showBadge(t) {
        chrome.browserAction.setBadgeText({text: t.toString()});
        chrome.browserAction.setBadgeBackgroundColor({color: '#000'});
    }

    return {
        setUpdate: setUpdate,
        setDefault: setDefault,
        setRec: setRec,
        setPause: setPause,
        showBadge: showBadge
    }
})();