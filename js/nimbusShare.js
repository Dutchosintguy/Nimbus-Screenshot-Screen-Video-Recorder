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

var nimbus = {
    client_software: 'screens_chrome',
//    user_session_id:           '',
    user_email: '',
//    user_auth:                 '',
    user_upload_folder: {id: 'default', title: 'My Notes'},
    user_temp_pass: '',
    can_upload: true,
    // img_size: 0,
    info: {
        usage: {
            current: 0,
            max: 0
        },
        limits: {
            NOTES_MAX_SIZE: 0,
            NOTES_MONTH_USAGE_QUOTA: 0,
            NOTES_MAX_ATTACHMENT_SIZE: 0
        },
        premium: false
    },
    send: function (data, success, error) {
        $.ajax({
            type: 'POST',
            url: 'https://sync.everhelper.me',
            data: JSON.stringify(data),
            dataType: 'json',
            async: true,
            success: success,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.readyState == 4) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5}); // server
                } else if (XMLHttpRequest.readyState == 0) {
                    $.ambiance({message: chrome.i18n.getMessage("notificationNetworkError"), timeout: 5}); // network connect
                } else {
                    error && error();
                }
            }
        });
    },
    shortUrl: function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://nimb.ws/dantist_api.php', true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.onload = function () {
            var obj = jQuery.parseJSON(this.responseText);
            cb && cb(obj.short_url)
        };
        xhr.send('url=' + encodeURIComponent(url));
    },
    uploadReadFolder: function () {
        var obj = {};
        try {
            obj = JSON.parse(localStorage['screens_upload_folder_' + nimbus.user_email]);
        } catch (e) {
            obj = {id: 'default', title: 'My Notes'};
        }
        nimbus.user_upload_folder = obj;
        return obj;
    },
    uploadSetFolder: function (f) {
        nimbus.user_upload_folder = f;
        localStorage['screens_upload_folder_' + nimbus.user_email] = JSON.stringify(f);
    },
    startUploadVideo: function (pageinfo, blob, channel) {
        nimbus.server.user.info(function (info) {
            if (info.errorCode !== 0) return;

            nimbus.info.premium = !!info.body.premium.active;
            nimbus.info.usage.current = +info.body.usage.notes.current;
            nimbus.info.usage.max = +info.body.usage.notes.max;
            nimbus.info.limits.NOTES_MAX_SIZE = +info.body.limits.NOTES_MAX_SIZE;
            nimbus.info.limits.NOTES_MONTH_USAGE_QUOTA = +info.body.limits.NOTES_MONTH_USAGE_QUOTA;
            nimbus.info.limits.NOTES_MAX_ATTACHMENT_SIZE = +info.body.limits.NOTES_MAX_ATTACHMENT_SIZE;

            if (nimbus_screen.info.file.size > nimbus.info.limits.NOTES_MAX_ATTACHMENT_SIZE) {
                $('#nsc_popup_limit').show();
                return;
            }

            if (nimbus.info.usage.current + nimbus_screen.info.file.size > nimbus.info.usage.max) {
                $('#nsc_popup_pro').show();
                return;
            }


            $('#nsc_message_view_uploads, #nsc_linked').removeClass('visible');
            $('#nsc_loading_upload_file').addClass('visible');

            var fd = new FormData();
            fd.append("video", blob, ('video.webm'));

            $.ajax({
                url: "https://sync.everhelper.me/files:preupload",
                type: "POST",
                data: fd,
                processData: false,
                contentType: false
            }).done(function (res) {
                if (res.errorCode == 0) {
                    nimbus.notesUpdate(pageinfo, res.body.files["video"], 'video', channel);
                    $.ambiance({message: chrome.i18n.getMessage("notificationUploaded"), timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }
                $('#nsc_loading_upload_file').removeClass('visible');
            });
        });
    },
    startUploadScreen: function (pageinfo, data, channel) {
        nimbus.server.user.info(function (info) {
            if (info.errorCode !== 0) return;

            nimbus.info.premium = !!info.body.premium.active;
            nimbus.info.usage.current = +info.body.usage.notes.current;
            nimbus.info.usage.max = +info.body.usage.notes.max;
            nimbus.info.limits.NOTES_MAX_SIZE = +info.body.limits.NOTES_MAX_SIZE;
            nimbus.info.limits.NOTES_MONTH_USAGE_QUOTA = +info.body.limits.NOTES_MONTH_USAGE_QUOTA;
            nimbus.info.limits.NOTES_MAX_ATTACHMENT_SIZE = +info.body.limits.NOTES_MAX_ATTACHMENT_SIZE;

            if (nimbus_screen.info.file.size > nimbus.info.limits.NOTES_MAX_ATTACHMENT_SIZE) {
                $('#nsc_popup_limit').show();
                return;
            }

            if (nimbus.info.usage.current + nimbus_screen.info.file.size > nimbus.info.usage.max) {
                $('#nsc_popup_pro').show();
                return;
            }

            $('#nsc_message_view_uploads, #nsc_linked').removeClass('visible');
            $('#nsc_loading_upload_file').addClass('visible');

            var format = LS.format || 'png';

            function dataURLtoBlob(dataURL) {
                var binary = atob(dataURL.split(',')[1]);
                var array = [];
                for (var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {type: 'image/' + format});
            }

            var file = dataURLtoBlob(data);
            var fd = new FormData();
            fd.append("screens", file, ('screen.' + format));

            $.ajax({
                url: "https://sync.everhelper.me/files:preupload",
                type: "POST",
                data: fd,
                processData: false,
                contentType: false
            }).done(function (res) {
                if (res.errorCode === 0) {
                    nimbus.screenSave(pageinfo, res.body.files["screens"], channel);
                    $.ambiance({message: chrome.i18n.getMessage("notificationUploaded"), timeout: 5});
                } else {
                    $('#nsc_loading_upload_file').removeClass('visible');
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }

            });
        });
    },
    screenSave: function (pageinfo, tempname, channel) {
        var share = nimbus.notesIsShared();
        var comment = nimbus.notesGetComment();
        if (channel) {
            comment = comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/) ? comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/)[2] : '';
        }
        nimbus.send({
            "action": "screenshots:save",
            "body": {
                "screen": {
                    "commentText": comment,
                    "title": nimbus.notesGetFileName(),
                    "tempname": tempname,
                    "parent_id": nimbus.user_upload_folder.id,
                    "url": pageinfo.url || ''
                },
                "share": share
            },
            "_client_software": nimbus.client_software

        }, function (msg) {
            $('#nsc_loading_upload_file').removeClass('visible');
            $('#nsc_nimbus_folder .nsc-aside-list-selected a').trigger('click');
            if (msg.errorCode == '0') {
                if (share) {
                    nimbus.shortUrl(msg.body.location, function (url) {
                        $('#nsc_linked').addClass('visible').find('input').val(url);
                        renderClassRoomButton(url);
                        nimbus_screen.copyTextToClipboard(url);
                    });
                } else {
                    $('#nsc_message_view_uploads').addClass('visible');
                }
            } else {
                if (msg.errorCode == '-20') {
                    $.ambiance({message: chrome.i18n.getMessage("notificationReachedLimit"), type: "error", timeout: 5});
                } else {
                    $.ambiance({message: chrome.i18n.getMessage("notificationWrong"), type: "error", timeout: 5});
                }
            }
        });
    },
    notesGenerateId: function () {
        var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var string = '';
        var min = 0;
        var max = chars.length;

        for (var i = 0; i < 3; i++) {
            var n = Math.floor(Math.random() * (max - min)) + min;
            string += chars[n];
        }

        return string + (new Date()).getTime();
    },
    notesUpdate: function (pageinfo, tempname, type, channel) {
        var notesId = nimbus.notesGenerateId();
        var comment = nimbus.notesGetComment();
        if (channel) {
            comment = comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/) ? comment.match(/([\s|\S]+)?\n\n-----------------([\s|\S]+)/)[2] : '';
        }
        nimbus.send({
            "action": "notes:update",
            "body": {
                "store": {
                    "notes": [
                        {
                            "global_id": notesId,
                            "parent_id": nimbus.user_upload_folder.id,
                            "index": 1,
                            "type": "note",
                            "role": "video",
                            "title": nimbus.notesGetFileName(),
                            "text": comment,
                            "url": pageinfo.url || '',
                            "tags": ["screens", "chrome"],
                            "attachements": [
                                {
                                    "global_id": nimbus.notesGenerateId(),
                                    "type": type || "image",
                                    "tempname": tempname
                                }
                            ]
                        }
                    ]
                }
            }
        }, function (res) {
            if (res.errorCode == '-20') {
                $.ambiance({message: chrome.i18n.getMessage("notificationReachedLimit"), type: "error", timeout: 5});
            } else {
                $('#nsc_nimbus_folder .nsc-aside-list-selected a').trigger('click');
                if (nimbus.notesIsShared()) {
                    nimbus.notesShare([notesId]);
                } else {
                    $('#nsc_message_view_uploads').addClass('visible');
                }
            }
        });
    },
    notesIsShared: function () {
        return LS.nimbus_share;
    },
    notesShare: function (id) {
        this.send({
            "action": "notes:share",
            "body": {
                "global_id": id
            }
        }, function (msg) {
            nimbus.shortUrl(msg.body[id[0]], function (url) {
                $('#nsc_linked').addClass('visible').find('input').val(url);
                renderClassRoomButton(url);
                nimbus_screen.copyTextToClipboard(url);
            });
        }, function (error) {
            console.log(error);
        });
    },
    notesGet: function () {
        this.send({
            "action": "notes:get",
            "body": {
                "last_update_time": 1366090275 // время в формате UNIX timestamp в секундах
            }
        }, function (msg) {
            console.log(msg);
        }, function (error) {
            console.log(error);
        });
    },
    notesRemove: function () {
        this.send({
            "action": "notes:update",
            "body": {
                "remove": {
                    "notes": ["0d21377269151318"]
                }
            }
        }, function (msg) {
            console.log(msg);
            nimbus.notesGet();
        }, function (error) {
            console.log(error);
        });
    },
    notesGetComment: function () {
        return $('#nsc_comment').val();
    },
    notesGetFileName: function () {
        return $('#nsc_screen_name').val();
    },
    notesGetFolders: function (cb) {
        nimbus.send({
            "action": "notes:getFolders",
            "body": {}
        }, cb, cb);
    },
    kbToMb: function (size, n, text) {
        return +((size) / 1024 / 1024).toFixed(n || 0) + (!text ? ' MB' : 0);
    },
    server: {
        user: {
            auth: function (email, password, cb) {
                (email && password) && nimbus.send({
                    "action": "user:auth",
                    "body": {
                        "email": email,
                        "password": password
                    },
                    "_client_software": nimbus.client_software
                }, cb, cb);

            },
            logout: function (cb) {
                nimbus.send({
                    "action": "user:logout",
                    "_client_software": nimbus.client_software
                }, cb, cb);
            },
            register: function (email, password, cb) {
                (email && password) && nimbus.send({
                    "action": "user:register",
                    "body": {
                        "service": "nimbus",
                        "email": email,
                        "password": password,
                        "languages": [navigator.language || navigator.userLanguage]
                    },
                    "_client_software": nimbus.client_software
                }, cb, cb);
            },
            info: function (cb) {
                nimbus.send({
                    "action": "user:info",
                    "_client_software": nimbus.client_software
                }, cb, cb);
            },
            authState: function (cb) {
                nimbus.send({
                    "action": "user:authstate",
                    "_client_software": nimbus.client_software
                }, cb, cb);
            },
            remindPassword: function (email, cb) {
                email && nimbus.send({
                    "action": "remind_password",
                    "email": email,
                    "_client_software": nimbus.client_software
                }, cb, cb);
            }
        }
    },
    show: {
        folders: function () {
            nimbus.notesGetFolders(function (res) {
                if (res.errorCode === 0) {
                    $('#nsc_nimbus_folder_loader').hide();
                    $('#nsc_nimbus_folder_group').show();

                    var $nimbus_folders = $('#nsc_nimbus_folder');
                    $nimbus_folders.find('li').remove();
                    for (var i = 0, l = res.body.notes.length, folder; i < l; i++) {
                        folder = res.body.notes[i];
                        $nimbus_folders.append(
                            $('<li>', {
                                'class': localStorage.nimbus_select_folder == folder.global_id ? 'nsc-aside-list-selected' : ''
                            }).append(
                                $('<a>', {
                                    'href': '#',
                                    // 'title': folder.title,
                                    'text': folder.title,
                                    'data-id': folder.global_id
                                }).on('click', function () {
                                    $(this).closest('ul').find('li').removeClass('nsc-aside-list-selected');
                                    $(this).closest('li').addClass('nsc-aside-list-selected');
                                    nimbus.uploadSetFolder({id: $(this).data('id'), title: $(this).text()});
                                    localStorage.nimbus_select_folder = $(this).data('id');
                                    return false;
                                })
                            ).append(
                                $('<span>').attr({
                                    'class': 'nsc-icon nsc-fast-send',
                                    'title': chrome.i18n.getMessage("tooltipUploadTo") + ' ' + folder.title,
                                    // 'data-text': folder.title,
                                    'data-id': folder.global_id
                                }).on('click', function (e) {
                                    $('#nsc_send').data('channel', $(this).data('id')).trigger('click');
                                    nimbus.uploadSetFolder({id: $(this).data('id'), title: $(this).data('text')});
                                })
                            )
                        );
                    }
                    if (!$nimbus_folders.find('li.nsc-aside-list-selected').length) {
                        $nimbus_folders.find('a[data-id=default]').closest('li').addClass('nsc-aside-list-selected');
                    }
                } else {
                    console.log('error', res);
                }
            });
        },
        limitUsage: function () {
            $('#nsc_nimbus_usage_group').show();
            $('#nsc_nimbus_usage_text').text(chrome.i18n.getMessage("nimbusLimitUsage") + ' ' + nimbus.kbToMb(nimbus.info.usage.current, 1) + ' ' + chrome.i18n.getMessage("nimbusLimitOf") + ' ' + nimbus.kbToMb(nimbus.info.usage.max));
            $('#nsc_nimbus_usage_progress').width(nimbus.info.usage.current / nimbus.info.usage.max * 100);

            nimbus.can_upload = (nimbus.info.usage.current + nimbus_screen.info.file.size) < nimbus.info.usage.max;

            if (nimbus.can_upload) {
                if (nimbus.info.premium) {
                    $('#nsc_nimbus_upgrade_pro').hide();
                } else {
                    $('#nsc_nimbus_upgrade_pro').show();
                }
                $('#nsc_popup_pro').hide();
            } else {
                $('#nsc_popup_pro').show();
            }
        },
        privateShare: function () {
            $('#nsc_nimbus_private_share').prop('checked', !LS.nimbus_share);
        },
        email: function () {
            $('#nsc_nimbus_email').text(decodeURIComponent(nimbus.user_email));
        },
        init: function () {
            nimbus.server.user.authState(function (res) {
                if (info.errorCode !== 0 && !res.body && !res.body.authorized) return;

                nimbus.show.limitUsage();
                nimbus.show.folders();
                nimbus.show.privateShare();
                nimbus.show.email();
            });
        }
    },
    init: function (cb) {
        nimbus.server.user.authState(function (res) {
            if (res.errorCode === 0 && res.body && res.body.authorized) {
                nimbus.server.user.info(function (info) {
                    console.log(info)
                    if (info.errorCode !== 0) return;

                    nimbus.info.premium = !!info.body.premium.active;
                    nimbus.info.usage.current = +info.body.usage.notes.current;
                    nimbus.info.usage.max = +info.body.usage.notes.max;
                    nimbus.info.limits.NOTES_MAX_SIZE = +info.body.limits.NOTES_MAX_SIZE;
                    nimbus.info.limits.NOTES_MONTH_USAGE_QUOTA = +info.body.limits.NOTES_MONTH_USAGE_QUOTA;
                    nimbus.info.limits.NOTES_MAX_ATTACHMENT_SIZE = +info.body.limits.NOTES_MAX_ATTACHMENT_SIZE;
                    nimbus.user_email = info.body.login;

                    nimbus.uploadReadFolder();

                    nimbus.show.limitUsage();
                    nimbus.show.folders();
                    nimbus.show.privateShare();
                    nimbus.show.email();

                    cb && cb(true);
                });
            } else {
                cb && cb(false);
            }
        });
    }
};