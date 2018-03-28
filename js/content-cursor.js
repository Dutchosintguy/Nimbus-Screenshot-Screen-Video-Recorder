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

!function () {
    "use strict";
    !function (a, b) {
        function c() {
            !d && b.body && (d = b.createElement("div"), d.className = [f, s].join(" "), b.body.appendChild(d), b.addEventListener("mousemove", k, true), b.addEventListener("mousedown", l, true), b.addEventListener("mouseup", m, true), b.addEventListener("mouseleave", o, true))
        }

        function e() {
            d && d.parentNode && d.parentNode.removeChild(d), d = null, b.removeEventListener("mousemove", k, true), b.removeEventListener("mousedown", l, true), b.removeEventListener("mouseup", m, true), b.removeEventListener("mouseleave", o, true)
        }

        function h(b, c) {
            //a.postMessage({type: b, data: c})
        }

        function j(a, b) {
            d && (d.style.webkitTransform = "translate(" + a + "px," + b + "px) translateZ(0)")
        }

        function k(a) {
            j(a.clientX, a.clientY), h("mousePosition", {x: a.clientX, y: a.clientY})
        }

        function l(a) {
            k(a), d.className = [f, s, "down"].join(" ")
        }

        function m(a) {
            k(a), d.className = [f, s].join(" ")
        }

        function n() {
            j(-100, -100)
        }

        function o(a) {
            a.target == b && n()
        }

        if (!a.nimbusInjected) {
            a.nimbusInjected = true;
            var d, s, f = "nimbus-record-mouse";

            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                s = request.cursorAnimate ? 'animate' : 'off-animate';

                if (request.cursor) {
                    c();
                } else {
                    e();
                }
            });

        }

    }(window, document)
}();

