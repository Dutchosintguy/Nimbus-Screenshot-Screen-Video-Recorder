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
 * Created by hasesanches on 13.12.2016.
 */
chrome.extension.onRequest.addListener(function (req) {
    if ($('.nsc-timer').length) return;

    if (req.msg == 'start_timer') {
        var nsc_progress_bar;
        var $nsc_timer = $('<div>').addClass('nsc-timer').append(
            $('<div>').addClass('nsc-timer-content').append(
                $('<div>').addClass('nsc-timer-progress')
            ),
            $('<div>').addClass('nsc-timer-sep'),
            $('<div>').addClass('nsc-timer-cancel').append(
                $('<button type="button" name="">')
                    .addClass('nsc-timer-button')
                    // .css('pointer-events', 'none')
                    .text(chrome.i18n.getMessage('panelCancel'))
                    .on('click', function () {
                        nsc_progress_bar.destroy();
                        $nsc_timer.remove();
                        chrome.extension.sendMessage({msg: 'stop_timer'});
                    })
            )
        );

        $('body').append($nsc_timer);

        if (req.type == 'capture_delayed') {
            $nsc_timer.addClass('capture-delayed');
        } else {
            $nsc_timer.removeClass('capture-delayed');
        }

        nsc_progress_bar = new ProgressBar.Circle('.nsc-timer-progress', {
            color: '#fff',
            trailColor: '#3b3b3b',
            easing: 'linear',
            strokeWidth: 7,
            trailWidth: 7,
            text: {
                autoStyleContainer: false
            },
            from: {color: '#1694ab', width: 7},
            to: {color: '#1694ab', width: 7},
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
            }
        });

        nsc_progress_bar.set(0);
        nsc_progress_bar.animate(1, {
                duration: 1000 * req.countdown,
                step: function (state, circle) {
                    circle.setText(req.countdown - Math.floor(req.countdown * circle.value()));
                }
            },
            function () {
                chrome.extension.sendMessage({msg: 'end_timer', type: req.type});
                nsc_progress_bar.destroy();
                $nsc_timer.remove();
            });

        nsc_progress_bar.text.style.fontFamily = '"OpenSansSemibold", Helvetica, sans-serif';
        nsc_progress_bar.text.style.fontSize = '46px';
    }
});