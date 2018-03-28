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

$(function () {
    $('input[name=image-format]').on('change', function () {
        localStorage.format = this.value;
        $('.nsc-setting-quality').toggleClass('nsc-setting-quality-hidden', this.value == 'png');
    });

    $('input[name=main-menu-item]').on('change', function () {
        var obj = {
            "entire": true,
            "window": true,
            "selected": true,
            "fragment": true,
            "visible": true,
            "blank": true,
            "delayed": true,
            "scroll": true,
            "video": true,
            "android": true
        };
        var main_menu_item = JSON.parse(localStorage.mainMenuItem || JSON.stringify(obj));
        if (this.value == 'visible' || this.value == 'android') {
            $(this).prop('checked', true);
        }
        main_menu_item[this.value] = $(this).prop('checked');
        localStorage.mainMenuItem = JSON.stringify(main_menu_item);
    });

    $('button[name=filename-template]').on('click', function () {
        $('#filename_template').val($('#filename_template').val() + '{' + this.value + '}').trigger('input');
    });

    $('#filename_template').on('input', function () {
        localStorage.fileNamePattern = this.value;
    });
    $('#delayed_screenshot_time').on('input', function () {
        this.value = parseInt(this.value) || 0;
        if (this.value < 0) this.value = 0;
        if (this.value > 99999) this.value = 99999;
        localStorage.delayedScreenshotTime = this.value;
    });
    $('#enable_save_as').on('change', function () {
        localStorage.enableSaveAs = $(this).prop('checked');
    });
    $('#save_crop_position').on('change', function () {
        localStorage.saveCropPosition = $(this).prop('checked');
    });
    $('#hide_fixed_elements').on('change', function () {
        localStorage.hideFixedElements = $(this).prop('checked');
    });
    $('#show_content_menu').on('change', function () {
        localStorage.showContentMenu = $(this).prop('checked');
        chrome.extension.sendMessage({msg: 'update_menu'});
    });
    $('#keep_original_resolution').on('change', function () {
        localStorage.keepOriginalResolution = $(this).prop('checked');
    });
    $('#show_info_print').on('change', function () {
        localStorage.showInfoPrint = $(this).prop('checked');
    });

    $('#image-quality').on('change', function () {
        localStorage.imageQuality = this.value;
        $('#image-quality-value').text(this.value);
    });

    var $capture_type = $('#capture_type');
    var $capture_enable_edit = $('#capture_enable_edit');
    var $quick_capture_choose = $('#quick_capture_choose');
    var $quick_capture_enable = $('#quick_capture_enable');

    $quick_capture_enable
        .prop('checked', (localStorage.quickCapture !== 'false'))
        .on('change', function () {
            $quick_capture_choose.toggleClass('nsc-settings-choose-enabled', $(this).prop("checked"));
            $capture_type.trigger('change');
            if (!$(this).prop("checked")) {
                localStorage.quickCapture = 'false';
            }
        });

    $quick_capture_choose.toggleClass('nsc-settings-choose-enabled', localStorage.quickCapture !== 'false');

    function setCaptureType(type) {
        localStorage.quickCapture = type || (localStorage.quickCapture || 'visible');
        $capture_type.find('option[value=' + localStorage.quickCapture + ']').attr('selected', 'selected');
    }

    setCaptureType();

    $capture_type.on('change', function () {
        setCaptureType(this.value);
    });

    function setCaptureEnableEdit(type) {
        localStorage.enableEdit = type || (localStorage.enableEdit || 'edit');
        $capture_enable_edit.find('option[value=' + localStorage.enableEdit + ']').attr('selected', 'selected');
    }

    setCaptureEnableEdit();

    $capture_enable_edit.on('change', function () {
        setCaptureEnableEdit(this.value);
    });

    var initOption = function () {
        $("#image-quality").val(localStorage.imageQuality);
        $('#image-quality-value').text(localStorage.imageQuality);

        if (localStorage.format) {
            $('input[name=image-format][value=' + localStorage.format + ']').prop('checked', true).trigger('change');
        }

        $('#delayed_screenshot_time').val(localStorage.delayedScreenshotTime || 3);
        $('#filename_template').val(localStorage.fileNamePattern);

        $("#enable_save_as").prop('checked', (localStorage.enableSaveAs !== 'false'));
        $("#save_crop_position").prop('checked', (localStorage.saveCropPosition !== 'false'));
        $("#hide_fixed_elements").prop('checked', (localStorage.hideFixedElements !== 'false'));
        $("#show_content_menu").prop('checked', (localStorage.showContentMenu !== 'false'));
        $("#keep_original_resolution").prop('checked', (localStorage.keepOriginalResolution !== 'false'));
        $("#show_info_print").prop('checked', (localStorage.showInfoPrint !== 'false'));

        if (localStorage.hotkeys) {
            var hotkeys = JSON.parse(localStorage.hotkeys);
            $('#shortcut_visible').val(hotkeys.visible);
            $('#shortcut_fragment').val(hotkeys.fragment);
            $('#shortcut_selected').val(hotkeys.selected);
            $('#shortcut_scroll').val(hotkeys.scroll);
            $('#shortcut_entire').val(hotkeys.entire);
            $('#shortcut_window').val(hotkeys.window);
            // $('#shortcut_tab_video').val(hotkeys.tab_video);
            // $('#shortcut_desktop_video').val(hotkeys.desktop_video);
            // $('#shortcut_stop_video').val(hotkeys.stop_video);
        }

        if (localStorage.hotkeysSendNS) {
            var hotkeysSendNS = JSON.parse(localStorage.hotkeysSendNS);
            $('#shortcut_load_to_ns').val(hotkeysSendNS.key);
        }

        if (localStorage.mainMenuItem) {
            var main_menu_item = JSON.parse(localStorage.mainMenuItem);

            for (var key in main_menu_item) {
                $('input[name=main-menu-item][value=' + key + ']').prop('checked', main_menu_item[key]);
            }
        }

    };

    var checkDifferent = function (arr) {
        var l = arr.length;
        for (var i = 0; i < l - 1; i++) {
            for (var j = i + 1; j < l; j++) {
                if (arr[i] === arr[j] && arr[i] != 0) {
                    return false;
                }
            }
        }
        return true;
    };

    $('#shortcut_visible, #shortcut_fragment, #shortcut_selected, #shortcut_scroll, #shortcut_entire, ' +
        '#shortcut_window, #shortcut_tab_video, #shortcut_desktop_video, #shortcut_stop_video').change(function () {
        var e = $('#shortcut_entire').val();
        var f = $('#shortcut_fragment').val();
        var s = $('#shortcut_selected').val();
        var sc = $('#shortcut_scroll').val();
        var v = $('#shortcut_visible').val();
        var w = $('#shortcut_window').val();
        // var tv = $('#shortcut_tab_video').val();
        // var dv = $('#shortcut_desktop_video').val();
        // var sv = $('#shortcut_stop_video').val();

        if (checkDifferent([e, f, s, sc, v, w, /*tv, dv, sv*/])) {
            localStorage.hotkeys = JSON.stringify({
                // tab_video: tv,
                // desktop_video: dv,
                // stop_video: sv,
                entire: e,
                fragment: f,
                selected: s,
                scroll: sc,
                visible: v,
                window: w
            });
        } else {
            initOption();
        }
    });

    $('#shortcut_load_to_ns').change(function () {
        var hotkeysSendNS = {
            key: this.value,
            title: $(this).find('option:selected').text()
        };
        localStorage.hotkeysSendNS = JSON.stringify(hotkeysSendNS);
        chrome.extension.sendRequest({'operation': 'shortcut_load_to_ns_change'});
    });

    $('.open-page').on('click', function (e) {
        chrome.extension.sendMessage({'operation': 'open_page', 'url': $(this).data('url')});
        return false;
    });

    initOption();

    //TODO bug in Chrome 35 on Ubuntu
    if (/Linux/.test(window.navigator.platform) && /Chrome\/35/.test(window.navigator.userAgent)) {
        $('#enable_save_as_option').hide();
    }

    $('#nimbus_help_link').attr('href', 'https://everhelper.desk.com/customer/en/portal/articles/' + (window.navigator.language === 'ru' ? '2155978' : '1180411'));
});