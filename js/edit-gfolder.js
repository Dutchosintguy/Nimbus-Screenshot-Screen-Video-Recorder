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
 * Created by hasesanches on 16.12.2016.
 */

var gFolders = {
    fList: {},
    fParents: {},
    fCurrent: 'root',
    getUploadFolder: function () {
        return LS.google_upload_folder;
    },
    setUploadFolder: function (folder) {
        LS.google_upload_folder = folder;
        localStorage.setItem('google_upload_folder', JSON.stringify(folder));
    },
    setAccessToken: function (t) {
        localStorage.access_token = t;
    },
    getAccessToken: function () {
        return localStorage.access_token;
    },
    removeAccessToken: function () {
        localStorage.removeItem('access_token');
    },
    addFolder: function (folder) {
        var f = $('<li>', {
            'html': '<img src="images/icon_folder.png "> ' + folder.title,
            'data-id': folder.id
        }).appendTo('.nsc-file-manager-folders-list');
        f.bind('click', function () {
            var cur = $(this).data('id');
            gFolders.fParents[cur] = gFolders.fCurrent;
            gFolders.getFolders(cur);
        });
    },
    setParent: function (folder) {
        $('.nsc-file-manager-folders .parent').html('');
        var p = $('<div>', {
            'html': '<img src="images/icon_folder.png "> ' + folder.title,
            'data-id': folder.id
        }).appendTo('.nsc-file-manager-folders .parent');
        p.bind('click', function () {
            gFolders.getFolders($(this).data('id'));
        });
    },
    setCurrent: function (folder) {
        $('.nsc-file-manager-folders .current').html('');
        $('<div>', {
            'html': '<img src="images/icon_folder.png "><span> ' + folder.title + '</span>',
            'data-id': folder.id
        }).appendTo('.nsc-file-manager-folders .current');
        var t = folder.title;
        $('.nsc-file-manager-future').html(chrome.i18n.getMessage("gDriveLabelFolders") + ' <b>' + t + '</b>');

    },
    setRootFolder: function () {
        $('.nsc-file-manager-folders .parent').html('');
        var p = $('<div>', {
            'html': chrome.i18n.getMessage("gDriveMainFolder"),
            'data-id': 'root'
        }).appendTo('.nsc-file-manager-folders .parent');
        p.bind('click', function () {
            gFolders.getFolders($(this).data('id'));
        });
    },
    getGoogleApi: function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
            if (xhr.readyState != 4) return;
            var res = JSON.parse(xhr.response);
            switch (xhr.status) {
                case 200:	// success
                    cb && cb(null, res);
                    break;

                case 401: // login fail
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationLoginFail"),
                        type: "error",
                        timeout: 2
                    });
                    gFolders.clearGdriveData();
                    cb && cb(new Error('Login Fail'), null);
                    break;

                default: 	// network error
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationWrong"),
                        type: "error",
                        timeout: 2
                    });
                    gFolders.clearGdriveData();
                    cb && cb(new Error('Network Error'), null);
            }
        };
        xhr.send(null);
    },
    getFolderInfo: function (folderID, callback) {
        if (gFolders.fList[folderID] === undefined) {
            gFolders.getGoogleApi("https://www.googleapis.com/drive/v2/files/" + folderID, function (err, res) {
                if (err) return;
                gFolders.fList[folderID] = res;
                callback(res);
            });
        } else {
            callback(gFolders.fList[folderID]);
        }
    },
    getParentFolder: function (folder, callback) {
        if (gFolders.fParents[folder] === undefined) {
            gFolders.getGoogleApi("https://www.googleapis.com/drive/v2/files/" + folder + "/parents", function (err, res) {
                if (err) return;
                if (res.items.length > 0) {
                    gFolders.fParents[folder] = res.items[0].id;
                    callback(res.items[0].id);
                } else {
                    gFolders.setRootFolder();
                }
                $('#nsc_file_manager').show();
                $('#nsc_loading_upload_file').removeClass('visible');
            });
        } else {
            callback(gFolders.fParents[folder]);
        }
    },
    getFolders: function (folder) {
        folder = folder || 'root';

        $('#nsc_file_manager').fadeIn("fast");
        $('.nsc-file-manager-folders-list').html('').addClass('loading');

        gFolders.fCurrent = folder;
        gFolders.getParentFolder(folder, function (id) {
            gFolders.getFolderInfo(id, function (info) {
                gFolders.setParent(info);
            });
        });

        gFolders.getFolderInfo(folder, function (info) {
            gFolders.setCurrent(info);
        });

        gFolders.getGoogleApi("https://www.googleapis.com/drive/v2/files/" + folder + "/children?q=mimeType = 'application/vnd.google-apps.folder'", function (err, res) {
            $('.nsc-file-manager-folders-list').removeClass('loading');
            if (err) {
                $('#nsc_file_manager').fadeOut("fast");
            } else {
                var l = res.items.length;
                if (l > 0) {
                    for (var i = l - 1; i >= 0; i--) {
                        gFolders.getFolderInfo(res.items[i].id, function (info) {
                            gFolders.addFolder(info);
                        })
                    }
                } else {
                    $('.nsc-file-manager-folders-list').append('<span>' + chrome.i18n.getMessage("gDriveNoItems") + '</span>');
                }
            }
        });
        gFolders.getGoogleApi("https://www.googleapis.com/drive/v2/teamdrives", function (err, res) {
            console.log(arguments)
        });


    },
    setPublicGdrive: function (fileId) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/drive/v2/files/' + fileId + '/permissions');
        xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'application/json');
        var permission = {
            "role": "reader",
            "type": "anyone"
        };
        var body = JSON.stringify(permission);
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
        };
        xhr.send(body);
    },
    clearGdriveData: function () {
        if (gFolders.getAccessToken()) {
            chrome.identity.removeCachedAuthToken({token: gFolders.getAccessToken()}, function () {
                gFolders.getGoogleApi('https://accounts.google.com/o/oauth2/revoke?token=' + gFolders.getAccessToken());
                gFolders.removeAccessToken();
                gFolders.setUploadFolderTooltip();
            });
        }
    },
    // refreshToken: function (cb) {
    //     // cb && cb();
    //     chrome.extension.sendMessage({msg: 'oauth2_google_refresh'}, cb);
    // },
    saveToGdrive: function () {
        $('#nsc_message_view_uploads, #nsc_linked').removeClass('visible');
        $('#nsc_loading_upload_file').addClass('visible');

        var format = LS.format || 'png';
        var data = imgnewdata.replace(/^data:image\/(png|jpeg|bmp);base64,/, "");
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'multipart/mixed; boundary="--287032381131322"');

        xhr.onload = function () {
            if (xhr.readyState != 4) return;
            $('#nsc_loading_upload_file').removeClass('visible');

            switch (xhr.status) {
                case 200:	// success
                    var res = JSON.parse(xhr.response);
                    if (res.alternateLink && res.ownerNames) {
                        if (!LS.shareOnGoogle) {
                            gFolders.setPublicGdrive(res.id);
                        }

                        nimbus.shortUrl(res.alternateLink, function (url) {
                            $('#nsc_linked').addClass('visible').find('input').val(url);
                            renderClassRoomButton(url);
                            nimbus_screen.copyTextToClipboard(url);
                        });
                    }
                    break;

                case 401: // login fail
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationLoginFail"),
                        type: "error",
                        timeout: 2
                    });
                    gFolders.clearGdriveData();
                    break;

                default: 	// network error
                    $.ambiance({
                        message: chrome.i18n.getMessage("notificationWrong"),
                        type: "error",
                        timeout: 2
                    });
                    gFolders.clearGdriveData();
            }
        };


        var boundary = '--287032381131322';
        var delimiter = "\r\n--" + boundary + "\r\n";
        var close_delim = "\r\n--" + boundary + "--";
        var metadata = {
            "title": LS.screenname + "." + format,
            "mimeType": "image/" + format,
            "description": "Uploaded by Nimbus Screen Capture",
            "parents": [
                {
                    "kind": "drive#fileLink",
                    "id": gFolders.getUploadFolder().id
                }
            ]
        };
        var multipartRequestBody = delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) + delimiter + 'Content-Type: ' + 'image/' + format + '\r\n' + 'Content-Transfer-Encoding: base64\r\n' + '\r\n' + data + close_delim;
        xhr.send(multipartRequestBody);
    },
    setUploadFolderTooltip: function (title) {
        chrome.identity.getAuthToken({'interactive': false}, function (token) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
            if (typeof token !== 'undefined') {
                gFolders.setAccessToken(token);
                $('#nsc_google_drive').addClass('auth').find('.nsc-choose-trigger-panel').removeClass('show');
            } else {
                $('#nsc_google_drive').removeClass('auth').find('.nsc-choose-trigger-panel').removeClass('show');
            }
            $('#nsc_button_google_drive').attr('original-title', chrome.i18n.getMessage("gDriveSendTo") + ': ' + (title || gFolders.getUploadFolder().title));
        });
    }
};

$(document).ready(function () {
    var $drive_select_folder = $('#nsc_google_drive_select_folder');

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.nsc-box-save-google-drive').length && $drive_select_folder.is(':visible')) {
            $drive_select_folder.hide();
        }

        if ($(e.target).hasClass('nsc-choose-trigger-panel')) {
            if (!$drive_select_folder.is(':visible')) {
                // gFolders.refreshToken(function () {
                $('.nsc-choose-trigger-panel').addClass('show');
                $drive_select_folder.find('.nsc-trigger-panel-title').html('<img src="images/icon_folder.png"> ' + gFolders.getUploadFolder().title);
                $drive_select_folder.find('input[name=share]').prop('checked', LS.shareOnGoogle);
                $drive_select_folder.show();
                // });
            } else {
                $('.nsc-choose-trigger-panel').removeClass('show');
                $drive_select_folder.hide();
            }
        }
    });

    $drive_select_folder.find('input[name=share]').on('change', function () {
        LS.shareOnGoogle = $(this).prop('checked');
        localStorage.setItem('shareOnGoogle', LS.shareOnGoogle);
    });

    $('#nsc_google_drive_logout').click(function () {
        if ($drive_select_folder.is(':visible')) {
            $drive_select_folder.hide();
        }
        gFolders.setUploadFolder({"id": "root", "title": "Main folder"});
        gFolders.clearGdriveData();
    });

    $drive_select_folder.find('.nsc-trigger-panel-title').click(function () {
        chrome.identity.getAuthToken({'interactive': true}, function (token) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
            console.log(token);
            if (typeof token !== 'undefined') {
                gFolders.setAccessToken(token);
                gFolders.getFolders(gFolders.getUploadFolder().id);
            }
        });
    });

    $('#nsc_file_manager_done').bind('click', function () {
        var info = {id: $('.current').find('div').data('id'), title: $('.current').find('span').text()};
        gFolders.setUploadFolder(info);
        gFolders.setUploadFolderTooltip(info.title);
        $('#nsc_file_manager').fadeOut("fast");
    });

    $('#nsc_button_google_drive').on('click', function () {
        chrome.identity.getAuthToken({'interactive': true}, function (token) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
            gFolders.setUploadFolderTooltip();
            if (typeof token !== 'undefined') {

                gFolders.setAccessToken(token);
                gFolders.saveToGdrive();
            }
        });
    });

    // $('#nsc_button_youtube1111').on('click', function () {
    //     chrome.identity.getAuthToken({'interactive': true}, function (token) {
    //         if (chrome.runtime.lastError) {
    //             console.error(chrome.runtime.lastError);
    //         }
    //         console.log(token);
    //         if (typeof token !== 'undefined') {
    //             gFolders.setAccessToken(token);
    //
    //             var xhr = new XMLHttpRequest();
    //             xhr.open('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails');
    //             xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
    //             xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    //             // xhr.setRequestHeader('Content-Length', 278);
    //             xhr.setRequestHeader('x-upload-content-length', nacl_module.videoBlob.size);
    //             xhr.setRequestHeader('X-Upload-Content-Type', 'video/*');
    //
    //             xhr.onload = function () {
    //                 if (xhr.readyState !== 4) return;
    //                 switch (xhr.status) {
    //                     case 200:	// success
    //                         var location = xhr.getResponseHeader('Location');
    //                         xhr.open('PUT', location);
    //                         xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
    //                         xhr.setRequestHeader('Content-Type', 'video/*');
    //                         xhr.setRequestHeader('Content-Length', '' + nacl_module.videoBlob.size);
    //                         xhr.onload = function () {
    //                             if (xhr.readyState !== 4) return;
    //                             var response = JSON.parse(xhr.response);
    //                             switch (xhr.status) {
    //                                 case 200:	// success
    //
    //                                     xhr.open('POST', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet');
    //                                     xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
    //                                     xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    //                                     xhr.onload = function () {
    //                                         if (xhr.readyState !== 4) return;
    //                                         var res = JSON.parse(xhr.response);
    //                                         switch (xhr.status) {
    //                                             case 200:	// success
    //                                                 console.log(res);
    //                                                 break;
    //
    //                                             case 401: // login fail
    //                                                 console.error(xhr.status);
    //                                                 break;
    //                                             default: 	// network error
    //                                                 console.error(xhr.status);
    //                                         }
    //                                     };
    //                                     xhr.send(JSON.stringify({
    //                                         "snippet": {
    //                                             "playlistId": "PL9XuHPBT4d7bvs19WV0rU4yvaP4CGqviI",
    //                                             "resourceId": {
    //                                                 "kind": "youtube#video",
    //                                                 "videoId": response.id
    //                                             }
    //                                         }
    //                                     }));
    //
    //
    //                                     break;
    //                                 case 401: // login fail
    //                                     console.error(xhr.status);
    //                                     break;
    //                                 default: 	// network error
    //                                     console.error(xhr.status);
    //                             }
    //                         };
    //                         xhr.send(nacl_module.videoBlob);
    //
    //
    //                         break;
    //                     case 401: // login fail
    //                         console.error(xhr.status);
    //                         break;
    //                     default: 	// network error
    //                         console.error(xhr.status);
    //                 }
    //             };
    //
    //             xhr.send(JSON.stringify({
    //                 "snippet": {
    //                     "title": "My video title",
    //                     "description": "Video uploaded using Nimbus Screenshot & Screen Video Recorder",
    //                     "tags": ["cool", "video", "more keywords"],
    //                     "categoryId": '22'
    //                 },
    //                 "status": {
    //                     "privacyStatus": "public",
    //                     "embeddable": 'True',
    //                     "license": "youtube"
    //                 }
    //             }));
    //         }
    //     });
    // });

    if (param !== 'video') {
        gFolders.setUploadFolderTooltip();
    }

});

// chrome.identity.onSignInChanged.addListener(function () {
//     console.log(arguments)
// });

chrome.extension.onRequest.addListener(function (req) {
    if (req.operation === 'access_google') {
        gFolders.setUploadFolderTooltip();
    }
});
