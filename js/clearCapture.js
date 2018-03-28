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

var overflow_clear_capture = document.defaultView.getComputedStyle(document.documentElement, "").getPropertyValue("overflow-x");

function afterClearCapture(hidden) {
    // !hidden && (document.documentElement.style.overflow = "hidden");

    // document.body.style.overflow = "visible";

    if (location.host == 'www.surveymonkey.com') {
        document.body.style.height = 'auto';
    }

    if (location.host == '4pda.ru' && document.querySelectorAll('.fixed-menu').length) {
        document.querySelectorAll('.h-frame')[0].classList.remove('fixed-menu');
    }

    var $vk_layer_wrap = document.querySelectorAll('#wk_layer_wrap');
    var $trello_window = document.querySelectorAll('.window');
    var $trello_board = document.querySelectorAll('#board');

    if (location.host == 'vk.com' && $vk_layer_wrap.length && $vk_layer_wrap[0].style.display == 'block') {
        var scroll_fix = document.querySelectorAll('.scroll_fix');
        scroll_fix.length && (scroll_fix[0].style.cssText += 'display: none !important;');
    }

    if (location.host == 'trello.com') {
        if ($trello_board.length && ($trello_window[0].style.display == 'none' || $trello_window[0].style.display == '')) {
            $trello_board[0].style.cssText += 'position: relative; overflow: visible !important;';
            document.querySelectorAll('.board-wrapper')[0].style.cssText += 'position: static !important;';
            document.querySelectorAll('.board-menu')[0].style.cssText += 'display: none !important;';
            document.getElementById('content').style.cssText += 'overflow: visible !important;';
            document.getElementById('surface').style.cssText += 'height: auto !important;';
            document.body.style.cssText += 'height: auto !important; overflow: visible !important; background: rgb(176, 64, 69) !important;';
        } else if ($trello_board.length && $trello_window[0].style.display == 'block') {
            document.getElementById('surface').style.cssText += 'display: none !important;';
            document.querySelectorAll('.window-overlay')[0].style.cssText += 'position: relative !important;';
            document.body.style.cssText += 'height: auto !important; overflow: auto !important;';
        }
    }

    if (location.host == "twitter.com" && document.querySelectorAll('.permalink-container').length) {
        document.body.style.cssText += 'margin-right: 0 !important; overflow: visible !important; background: rgba(0,0,0,0.55) !important;';
        document.getElementById('doc').style.cssText += 'display: none !important;';
        document.getElementById('permalink-overlay').style.cssText += 'overflow: visible !important; background: none !important; position: absolute !important;';
    }

    if (location.host == "mail.google.com" && document.body.getElementsByClassName('nH if').length && !document.querySelectorAll('#nimbus_copy_body').length) {
        var body = document.body.cloneNode(true);
        var mail = document.body.getElementsByClassName('nH if')[0].cloneNode(true);
        var mail_bottom = mail.getElementsByClassName('nH')[12] || mail.getElementsByClassName('nH')[11];
        var mail_comment = mail.getElementsByClassName('gA gt acV')[0];
        if(mail_bottom) mail_bottom.parentNode.removeChild(mail_bottom);
        if(mail_comment) mail_comment.parentNode.removeChild(mail_comment);
        var container = document.createElement('div');
        container.id = 'nimbus_copy_body';
        container.style.display = 'none';
        container.appendChild(body);
        document.body.innerHTML = '';
        document.body.appendChild(container);
        document.body.appendChild(mail);
        var height = mail.offsetHeight;
        document.body.style.cssText += 'height: ' + height + 'px !important;';
    }
}

function beforeClearCapture(hidden) {
    // !hidden && (document.documentElement.style.overflow = overflow_clear_capture);

    var $vk_layer_wrap = document.querySelectorAll('#wk_layer_wrap');
    var $trello_window = document.querySelectorAll('.window');
    var $trello_board = document.querySelectorAll('#board');

    if (location.host == 'vk.com' && $vk_layer_wrap.length && $vk_layer_wrap[0].style.display == 'block') {
        var scroll_fix = document.querySelectorAll('.scroll_fix');
        scroll_fix.length && (scroll_fix[0].style.cssText = scroll_fix[0].style.cssText.replace(/display.+?;/, ''));
    }

    if (location.host == 'trello.com') {
        if ($trello_board.length && ($trello_window[0].style.display == 'none' || $trello_window[0].style.display == '')) {
            $trello_board[0].style.cssText = $trello_board[0].style.cssText.replace(/position.+?; overflow.+?;/, '');
            document.querySelectorAll('.board-wrapper')[0].style.cssText = document.querySelectorAll('.board-wrapper')[0].style.cssText.replace(/position.+?;/, '');
            document.querySelectorAll('.board-menu')[0].style.cssText = document.querySelectorAll('.board-menu')[0].style.cssText.replace(/display.+?;/, '');
            document.getElementById('content').style.cssText = document.getElementById('content').style.cssText.replace(/overflow.+?;/, '');
            document.getElementById('surface').style.cssText = document.getElementById('surface').style.cssText.replace(/height.+?;/, '');
            document.body.style.cssText = document.body.style.cssText.replace(/height.+?; overflow.+?; background.+?;/, '');
            document.body.style.cssText += 'background-image: url(https://d2k1ftgv7pobq7.cloudfront.net/images/backgrounds/orange-blur.png);';
        } else if ($trello_board.length && $trello_window[0].style.display == 'block') {
            document.getElementById('surface').style.cssText = document.getElementById('surface').style.cssText.replace(/display.+?;/, '');
            document.querySelectorAll('.window-overlay')[0].style.cssText = document.querySelectorAll('.window-overlay')[0].style.cssText.replace(/position.+?;/, '');
            document.body.style.cssText = document.body.style.cssText.replace(/height.+?; overflow.+?;/, '');
        }
    }

    if (location.host == "twitter.com" && document.querySelectorAll('.permalink-container').length) {
        document.body.style.cssText = document.body.style.cssText.replace(/margin-right.+?; overflow.+?; background.+?;/, '');
        document.getElementById('doc').style.cssText = document.getElementById('doc').style.cssText.replace(/display.+?;/, '');
        document.getElementById('permalink-overlay').style.cssText = document.getElementById('permalink-overlay').style.cssText.replace(/overflow.+?; background.+?; position.+?;/, '');
    }

    if (location.host == "mail.google.com" && document.querySelectorAll('#nimbus_copy_body').length) {
        location.reload();
        // var body = document.querySelectorAll('#nimbus_copy_body body')[0].cloneNode(true);
        // document.body.style.cssText = document.body.style.cssText.replace(/height.+?;/, '');
        // document.body.innerHTML = body.innerHTML;
    }
}