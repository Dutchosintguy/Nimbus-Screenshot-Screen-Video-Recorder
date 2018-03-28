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
 * Created by hasesanches on 23.12.2016.
 */

var timerContent = (function () {

    var tab_id_list = [];

    function set(countdown, type, popup) {
        chrome.browserAction.setPopup({popup: popup || ''});

        chrome.tabs.query({active: true}, function (tabs) {
            if (tab_id_list.indexOf(tabs[0].id) == -1) {
                tab_id_list.push(tabs[0].id);
                insert(tabs[0].id, function (tab_id) {
                    chrome.tabs.sendRequest(tab_id, {msg: 'start_timer', countdown: countdown, type: type});
                });
            } else {
                chrome.tabs.sendRequest(tabs[0].id, {msg: 'start_timer', countdown: countdown, type: type});
            }
        });
    }

    function insert(tad_id, cb) {
        chrome.tabs.insertCSS(tad_id, {file: "css/timer.css"});

        chrome.tabs.executeScript(tad_id, {file: "js/jquery.js"}, function () {
            chrome.tabs.executeScript(tad_id, {file: "js/progressbar.min.js"}, function () {
                chrome.tabs.executeScript(tad_id, {file: "js/timer_content.js"}, function () {
                    cb && cb(tad_id);
                });
            });
        });
    }

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.status == 'complete' && tab_id_list.indexOf(tabId) != -1) {
            chrome.browserAction.setPopup({popup: 'popup.html'});
            tab_id_list.splice(tab_id_list.indexOf(tabId), 1);
        }
    });

    return {
        set: set
    }
})();
