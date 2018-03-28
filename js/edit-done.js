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

$(document).ready(function () {

    nimbus_screen.dom.$button_done.click(function () {
        // $('html, body').css('height', '100%');
        var done_height = $(window).innerHeight() - 215 - 120 - 65;
        $('.nsc-done-content').height((done_height > 500 ? 500 : done_height));

        nimbus_screen.dom.$nsc_done_page.show();
        nimbus_screen.dom.$nsc_redactor_page.hide();

        window.setTimeout(function () {
            slackShare.init();
            nimbus.init();
            nimbusRate.showMessage();
            nimbusAccountPopup.init();
        }, 200);

        nimbus_screen.canvasManager.done();

        var canvaFon = document.getElementById("canvasfon");
        var canvaBg = document.getElementById("canvasbg");
        var oCanvas = document.createElement('canvas');
        // var z = window.devicePixelRatio || 1;
        var w = canvaFon.width;// * z;
        var h = canvaFon.height;// * z;

        $('#nsc_indicator_size').text(w + ' ✖ ' + h);

        oCanvas.width = w;
        oCanvas.height = h;

        var ctx = oCanvas.getContext('2d');
        ctx.drawImage(canvaFon, 0, 0, w, h, 0, 0, w, h);
        ctx.drawImage(canvaBg, 0, 0, w, h, 0, 0, w, h);

        var $nsc_preview_img = $('#nsc_preview_img');
        var $nsc_indicator = $('#nsc_indicator');
        var $nsc_main_title = $('#nsc_main_title');
        var $nsc_done_slack = $('#nsc_done_slack');
        var $nsc_done_nimbus = $('#nsc_done_nimbus');
        var $nsc_nimbus_comment = $('.nsc-nimbus-comment');
        var $nsc_preview_loading = $('#nsc_preview_loading');
        var format = LS.format || 'png';
        var name = (new Date()).getTime() + 'screensave.' + format;
        var bgScreen = chrome.extension.getBackgroundPage().screenshot;
        var path = bgScreen.path + name;

        imgnewdata = oCanvas.toDataURL('image/' + format, LS.imageQuality / 100);
        $nsc_preview_img.hide();
        $nsc_indicator.hide();
        $nsc_done_slack.data('display', $nsc_done_slack.css('display')).hide();
        $nsc_done_nimbus.data('display', $nsc_done_nimbus.css('display')).hide();
        $nsc_nimbus_comment.hide();
        $nsc_preview_loading.show();

        $nsc_preview_img.load(function () {
            var max_width = 200;
            if ($nsc_preview_img.width() > 200) {
                max_width = $nsc_preview_img.width();
            }
            $nsc_indicator.css({'max-width': max_width});

            $nsc_preview_img.show();
            $nsc_indicator.show();
            $nsc_done_slack.css('display', $nsc_done_slack.data('display'));
            $nsc_done_nimbus.css('display', $nsc_done_nimbus.data('display'));
            $nsc_nimbus_comment.show();
            $nsc_preview_loading.hide();
        });

        $nsc_main_title.attr('href', imgnewdata);
        $nsc_preview_img.attr('src', imgnewdata);

        bgScreen.createBlob(imgnewdata, name, function (size) {
            showFileSize(size);
            nimbus_screen.info.file.size = size;

            chrome.extension.sendMessage({msg: 'enable_save_as'}, function (enable_save_as) {
                if (enable_save_as === 'true') {
                    var bgScreen = chrome.extension.getBackgroundPage().screenshot;
                    screenname = bgScreen.getFileName(pageinfo);

                    $("#nsc_button_save_image").append('<div id="flash-save"></div>');
                    var g = "10", h = null, i = {
                        data: imgnewdata.split(",")[1].replace(/\+/g, "%2b"),
                        dataType: "base64",
                        filename: screenname + '.' + (format == 'jpeg' ? 'jpg' : 'png'),
                        downloadImage: "images/pattern.png",
                        width: 100,
                        height: 35
                    }, j = {allowScriptAccess: "always"}, k = {
                        id: "CreateSaveWindow",
                        name: "CreateSaveWindow",
                        align: "middle"
                    };
                    swfobject.embedSWF("swf/CreateSaveWindow.swf", "flash-save", "100", "35", g, h, i, j, k);

                    $nsc_main_title.append('<div id="flash-save-title"></div>');
                    i.width = 276;
                    i.height = 36;
                    swfobject.embedSWF("swf/CreateSaveWindow.swf", "flash-save-title", "276", "36", g, h, i, j, k);
                }
            });
        });
    });

    $('#nsc_nimbus_folder').click(function (e) {
        nimbus.foldersShowManager();
        e.preventDefault();
    });

    $('#nsc_button_back').click(function () {
        imgnewdata = null;
        nimbus_screen.dom.$nsc_redactor_page.show();
        nimbus_screen.dom.$nsc_done_page.hide();
        $('html, body').css('height', 'auto');
    });

    $('#nsc_button_save_image, #nsc_main_title').on('click', function () {
        var bgScreen = chrome.extension.getBackgroundPage().screenshot;
        bgScreen.download({
            url: $('#nsc_preview_img').attr('src'),
            pageinfo: LS.pageinfo
        });
    });

    $('#nsc_button_save_video').on('click', function () {
        chrome.downloads.download({
            url: localStorage.videoUrl,
            filename: 'nimbus-record-video-' + getTimeStamp() + '.webm',
            saveAs: true
        });
    });

    $('#nsc_button_copy_to_clipboard').click(function () {

    });

    $('#nsc_button_print').click(function () {
        var f = $("iframe#print")[0],
            c = f.contentDocument,
            d = f.contentWindow,
            i = c.getElementById("image"),
            t = c.getElementById("link");
        i.onload = function () {
            this.style.width = 718 < this.width ? "100%" : "auto";

            var date = new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate();
            var month = new Date().getMonth() < 9 ? '0' + (new Date().getMonth() + 1) : (new Date().getMonth() + 1);
            var year = new Date().getFullYear();

            if (LS.showInfoPrint === 'true') {
                t.innerHTML = LS.pageinfo.name + '<br>' + pageinfo.url + '<br>' + date + '.' + month + '.' + year;
            }

            d.focus();
            d.print();
            i.setAttribute("src", '');
        };
        i.setAttribute("src", imgnewdata);
    });

    $('.nsc-popup-close button').on('click', function () {
        $(this).closest('.nsc-popup').hide();
    });

    $('#nsc_nimbus_private_share').change(function () {
        LS.nimbus_share = !this.checked;
        localStorage.setItem('nimbus_share', LS.nimbus_share);
    });

    $('#nsc_form_login_nimbus').on("submit", function () {
        var wrong = false;
        var $form = $(this);
        var email = this.elements['email'];
        var password = this.elements['password'];

        if (password.value.length < 8) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }
        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbus.server.user.auth(email.value, password.value, function (res) {
                if (res.errorCode === 0) {
                    $form.find('input').val('');
                    $('.nsc-popup').hide();
                    nimbus.init();
                    nimbus_screen.togglePanel('nimbus');
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationLoginFail"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    }).find('input').on('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 8 ||
            ($(this).attr('name') == 'email' && !/\S+@\S+\.\S+/.test($(this).val()))) {
            $(this).addClass('wrong');
        }
    });

    $('#nsc_form_register_nimbus').bind("submit", function () {
        var wrong = false;
        var email = this.elements['email'];
        var password = this.elements['password'];
        var password_repeat = this.elements['pass-repeat'];

        if (password.value.length < 8) {
            $(password).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassInfo"), type: "error", timeout: 5});
            wrong = true;
        }

        if (password.value !== password_repeat.value) {
            $(password).addClass('wrong');
            $(password_repeat).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipPassMatch"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbus.server.user.register(email.value, password.value, function (res) {
                if (res.errorCode === 0) {
                    nimbus.server.user.auth(email.value, password.value, function () {
                        $('.nsc-popup').hide();
                        nimbus.init();
                        nimbus_screen.togglePanel('nimbus');
                    });
                } else if (res.errorCode === -4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationEmailFail"), type: "error", timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationRegisterFail"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    }).find('input').on('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 8 ||
            ($(this).attr('name') == 'pass-repeat' && $(this).val() !== $(this).closest('form').find("[name='pass']").val()) ||
            $(this).attr('name') == 'email' && !/\S+@\S+\.\S+/.test($(this).val())) {
            $(this).addClass('wrong');

        }
    });

    $('#nsc_form_remind_password_nimbus').on("submit", function () {
        var wrong = false;
        var email = this.elements['email'];

        if (!/\S+@\S+\.\S+/.test(email.value)) {
            $(email).addClass('wrong').focus();
            $.ambiance({message: chrome.i18n.getMessage("tooltipWrongEmail"), type: "error", timeout: 5});
            wrong = true;
        }

        if (!wrong) {
            nimbus.server.user.remindPassword(email.value, function (res) {
                if (res.errorCode === 0) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationRestoreSent"), timeout: 5});
                    $('.nsc-popup').hide();
                    $('#nsc_popup_login_nimbus').show()
                        .find('input[name="email"]').val(email.value).end()
                        .find('input[name="password"]').val('').focus();
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationEmailIncorrect"), type: "error", timeout: 5});
                }
            });
        }
        return false;
    }).find('input').bind('keyup', function () {
        $(this).removeClass('wrong');

        if ($(this).val().length < 1 || !/\S+@\S+\.\S+/.test($(this).val())) {
            $(this).addClass('wrong');
        }
    });

    $('#nsc_button_nimbus').click(function () {
        nimbus.init(function (auth) {
            if (!auth) {
                $('#nsc_popup_connect_nimbus').show();
            } else {
                if ($('#nsc_done_nimbus').css('display') == 'flex') {
                    $('#nsc_send').trigger('click');
                } else {
                    nimbus_screen.togglePanel('nimbus');
                }
            }
        });
    });

    $('#nsc_nimbus_logout').on('click', function (e) {
        nimbus.server.user.logout(function (req) {
            $('#nsc_done_nimbus').css('display', 'none');
            if (slackShare.data) {
                $('#nsc_send').data('type', 'slack').trigger('change-type');
            } else {
                $('#nsc_send').data('type', '').trigger('change-type');
            }
        });
    });

    $('#nsc_button_youtube').click(youtubeShare.init);

    $('.nsc-open-popup-login-nimbus').on('click', function () {
        $('.nsc-popup').hide();
        $('#nsc_popup_connect_nimbus').show();
        return false;
    });

    $('.nsc-open-popup-register-nimbus').on('click', function () {
        $('.nsc-popup').hide();
        $('#nsc_popup_register_nimbus').show();
        return false;
    });

    $('.nsc-open-popup-remind-pass-nimbus').on('click', function () {
        $('.nsc-popup').hide();
        $('#nsc_popup_remind_password_nimbus').show();
        return false;
    });

    $('#nsc_connect_to_google').on('click', function (e) {
        $('#nsc_popup_connect_nimbus').hide();
        window.open('https://nimbus.everhelper.me/auth/openidconnect.php?env=app&provider=google', '_blank');
        return false;
    });

    $('#nsc_connect_to_facebook').on('click', function (e) {
        $('#nsc_popup_connect_nimbus').hide();
        window.open('https://nimbus.everhelper.me/auth/openidconnect.php?env=app&provider=facebook', '_blank');
        return false;
    });

    $("#nsc_copy_url").click(function () {
        nimbus_screen.copyTextToClipboard($('#nsc_linked input').val());
    });

    $("#nsc_short_url").click(function () {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://nimb.ws/dantist_api.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            //alert(this.responseText);
            var obj = jQuery.parseJSON(this.responseText);
            $('#nsc_linked input').val(obj.short_url);
            nimbus_screen.copyTextToClipboard(obj.short_url);
        };
        xhr.send('url=' + encodeURIComponent($('#nsc_linked input').val()));
    });

    /* slack */

    $('#nsc_button_slack').click(function () {
        if (!slackShare.data) {
            var $nsc_slack_connect = $('#nsc_slack_connect');
            var $nsc_preview_img = $('#nsc_preview_img');
            $nsc_slack_connect.show();
            var top = ($nsc_preview_img.outerHeight() - $nsc_slack_connect.find('.nsc-popup-box').outerHeight()) / 2 + $nsc_preview_img.offset().top;
            $nsc_slack_connect.find('.nsc-popup-box').css({transform: 'translate(-50%,0)', top: top + 'px'});
        } else {
            slackShare.init();
            nimbus_screen.togglePanel('slack');
        }
    });
    $('#nsc_button_connect_slack').click(function () {
        $('#nsc_slack_connect').hide();
        slackShare.login();
    });
    $('.nsc-slack-connect-close').click(function () {
        $('#nsc_slack_connect').hide();
    });
    $('#nsc_slack_logout').click(slackShare.logout);

    $('#nsc_slack_toggle').click(function (e) {
        chrome.extension.sendMessage({msg: 'set_setting', key: 'slackPanel', value: false});
        $('#nsc_done_slack').css('display', 'none');
        return false;
    });

    $('#nsc_slack_channel_search').on('keyup', function (e) {
        var $nsc_slack_list_group = $('#nsc_slack_list_group');
        var $list = $nsc_slack_list_group.find('li:visible');
        var index = $list.index($('.nsc-slack-list-selected'));
        $list.eq(index).removeClass('nsc-slack-list-selected');

        if (index == $list.length - 1) {
            index = -1
        }

        if (e.keyCode == 40 /*ArrowDown*/) {
            $list.eq(index + 1).addClass('nsc-slack-list-selected');
        } else if (e.keyCode == 38 /*ArrowUp*/) {
            $list.eq(index - 1).addClass('nsc-slack-list-selected');
        } else {
            var search_text = $(this).val();
            var is_first_item = false;
            $('#nsc_slack_channel, #nsc_slack_user').find('li').each(function () {
                var text = $(this).find('a').text();
                $(this).removeClass('nsc-slack-list-selected');
                if (search_text != '' && !new RegExp(search_text, 'gi').test(text)) {
                    $(this).hide();
                } else {
                    $(this).show();
                    if (!is_first_item) {
                        is_first_item = !is_first_item;
                        $(this).addClass('nsc-slack-list-selected');
                    }
                }
            });
        }
        var $item_active = $('#nsc_slack_list_group .nsc-slack-list-selected');
        if ($item_active.length) {
            var top_active_elem = $item_active.position().top;
            $nsc_slack_list_group.scrollTop(top_active_elem + $nsc_slack_list_group.scrollTop());
        }
    });

    /* /slack */

    $('#nsc_environment_info').on('click', function () {
        enviroment_info_change();
        window.scrollTo(0, 10000);
    });

    $('#nsc_send').on('change-type', function () {
        var type = $(this).data('type');
        if (type === 'youtube') {
            $('#nsc_send span').text(chrome.i18n.getMessage("nimbusYoutubeSend"));
        } else if (type === 'slack') {
            $('#nsc_send span').text(chrome.i18n.getMessage("nimbusSlackSend"));
        } else if (type === 'nimbus') {
            $('#nsc_send span').text(chrome.i18n.getMessage("nimbusSend"));
        } else {
            $('#nsc_send span').text(chrome.i18n.getMessage("nimbusSend"));
        }
    })
        .trigger('change-type')
        .on('click', function () {
            var channel = false;
            if ($(this).data('channel')) {
                channel = $(this).data('channel');
                $(this).data('channel', false);
            }
            if ($('#nsc_send').data('type') === 'youtube') {
                chrome.identity.getAuthToken({'interactive': true}, function (token) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    }
                    if (typeof token !== 'undefined') {
                        gFolders.setAccessToken(token);
                        youtubeShare.sendVideo(channel);
                    }
                });
            } else if (slackShare.data && $('#nsc_send').data('type') === 'slack') {
                slackShare.sendScreenshot(imgnewdata, screenname, channel);
            } else {
                nimbus.server.user.authState(function (res) {
                    if (res.errorCode === 0 && res.body && res.body.authorized) {
                        if (param === 'video') {
                            pageinfo.title = 'Screencast-' + LS.pageinfo.time;
                            nimbus.startUploadVideo(pageinfo, nacl_module.videoBlob, channel);
                        } else {
                            nimbus.startUploadScreen(pageinfo, imgnewdata, channel);
                        }
                    } else {
                        $('#nsc_popup_connect_nimbus').show();
                    }
                });
            }
        });


    $('#nsc_screen_name').on('change', function () {
        LS.pageinfo.name = this.value;
    });

    chrome.extension.onRequest.addListener(function (req) {
        // console.log('onRequest', req);
        if (req.action == 'slack_auth' && req.oauth.access_token != 'null') {
            slackShare.data = req;
            slackShare.init();
            nimbus_screen.togglePanel('slack');
        }
        if (req.action == 'nimbus_auth') {
            nimbus.init();
            nimbus_screen.togglePanel('nimbus');
        }
    });

    chrome.extension.sendMessage({msg: 'get_setting', key: 'environment_info'}, function (val) {
        if (val === 'true') {
            $('#nsc_environment_info').attr('checked', true).prop('checked', true);
            enviroment_info_change();
        }
    });

    chrome.extension.sendMessage({msg: 'get_setting', key: 'slackPanel'}, function (panel) {
        // console.log('slackPanel', panel);
        chrome.extension.sendMessage({msg: 'get_slack_data'}, function (data) {
            if (data && param != 'video') {
                slackShare.data = data;
                slackShare.init();
                if (panel == 'true') {
                    nimbus_screen.togglePanel('slack');
                }
            }
        });
    });

    chrome.extension.sendMessage({msg: 'get_setting', key: 'nimbusPanel'}, function (panel) {
        nimbus.server.user.authState(function (res) {
            if (res.errorCode == 0 && res.body && res.body.authorized && panel == 'true') {
                nimbus_screen.togglePanel('nimbus');
            }
        });
    });

    chrome.extension.sendMessage({msg: 'get_file_name', pageinfo: LS.pageinfo}, function (response) {
        if (param != 'video') {
            LS.pageinfo.name = response;
            $('#nsc_screen_name').val(response)
        }
    });


});
