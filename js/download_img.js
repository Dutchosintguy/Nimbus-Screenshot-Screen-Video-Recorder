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


if (typeof nimbusDownloadImage == 'undefined') {
    function nimbusDownloadImage(data, name) {
        var div = document.createElement('div');
        div.id = 'flash-save-nimbus';
        document.body.appendChild(div);

        var g = "10", h = null, i = {
            data: data.split(",")[1].replace(/\+/g, "%2b"),
            dataType: "base64",
            filename: name,
            downloadImage: chrome.extension.getURL('images/pattern.png'),
            width: 100,
            height: 35
        }, j = {allowScriptAccess: "always"}, k = {
            id: "CreateSaveWindow",
            name: "CreateSaveWindow",
            align: "middle"
        };
        swfobject.embedSWF(chrome.extension.getURL('swf/CreateSaveWindow.swf'), "flash-save-nimbus", "100", "35", g, h, i, j, k);

        setTimeout(function () {
            div.click();
        }, 500);
    }

    chrome.extension.onMessage.addListener(function (req) {
        if (req.operation == 'download_data') {
            nimbusDownloadImage(req.data, req.name);
        }
    });
}
