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
 - author: hasesanches
 - date: 04.07.16
 - http://hase.su
 **/

var youtubeShare = {
    is_playlist: false,
    event: function () {
        $('#nsc_youtube_logout').off('click').on('click', function () {

            gFolders.clearGdriveData();
            $('#nsc_done_youtube').css('display', 'none');
        });

        var $nsc_youtube_playlist_show_add = $('#nsc_youtube_playlist_show_add');
        var $nsc_youtube_playlist_add = $('#nsc_youtube_playlist_add');

        $nsc_youtube_playlist_add.find('button[name=cleared]').on('click', function () {
            $nsc_youtube_playlist_add.hide();
        });

        $nsc_youtube_playlist_add.find('button[name=add]').off('click').on('click', function () {
            var name = $nsc_youtube_playlist_add.find('input[name=name]').val();
            if (name === '') return;

            chrome.identity.getAuthToken({'interactive': true}, function (token) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                }
                if (typeof token !== 'undefined') {
                    gFolders.setAccessToken(token);
                    youtubeShare.httpRequest('POST', 'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', JSON.stringify({
                        "snippet": {
                            "title": name
                        }
                    }), function () {
                        $nsc_youtube_playlist_add.hide();
                        window.setTimeout(function () {
                            youtubeShare.viewPlaylist();
                        }, 500);
                    });
                }
            });
        });

        $nsc_youtube_playlist_show_add.on('click', function () {
            $nsc_youtube_playlist_add.show();
        });
    },
    httpRequest: function (method, url, data, cb) {
        // if (method !== 'GET' || method !== 'POST' || method !== 'PUT') {
        //     if (typeof url === 'function') {
        //         cb = url;
        //     }
        //     url = method;
        //     method = "GET";
        //     data = null;
        // }
        // if (typeof data === 'function') {
        //     cb = data;
        //     data = null;
        // }
        // if (data) {
        //     data = JSON.stringify(data);
        // } else {
        //     data = null;
        // }
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        xhr.onload = function () {
            if (xhr.readyState !== 4) return;
            var response = JSON.parse(xhr.response);
            console.log(response);
            switch (xhr.status) {
                case 200:	// success
                    cb && cb(response, xhr);
                    break;
                case 401: // login fail
                    console.error(xhr.status);
                    break;
                default: 	// network error
                    console.error(xhr.status);
            }
        };
        xhr.send(data);
    },
    viewPlaylist: function () {
        var $playlist = $('#nsc_youtube_playlist');
        $playlist.find('li').remove();

        youtubeShare.httpRequest('GET', 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50', null, function (response) {

            for (var len = response.items.length; len--;) {
                $playlist.append(
                    $('<li>').append(
                        $('<a>').attr({
                            'href': '#',
                            'data-id': response.items[len].id
                        }).on('click', function (e) {
                            var channelId = $(this).data('id');
                            localStorage.youtubePlaylist = channelId;
                            chrome.extension.sendMessage({msg: 'set_setting', key: 'youtubePlaylist', value: channelId});
                            $playlist.find('li').removeClass('nsc-aside-list-selected');
                            $(this).closest('li').addClass('nsc-aside-list-selected');
                            return false;
                        }).text(response.items[len].snippet.title)
                    ).append(
                        $('<span>').attr({
                            'class': 'nsc-icon nsc-fast-send',
                            'title': chrome.i18n.getMessage("tooltipUploadTo") + ' ' + response.items[len].snippet.title,
                            'data-id': response.items[len].id
                        }).on('click', function (e) {
                            $('#nsc_send').data('channel', $(this).data('id')).trigger('click');
                        })
                    )
                );
            }

            if (localStorage.youtubePlaylist === undefined) {
                localStorage.youtubePlaylist = response.items[0].id;
            } else {
                var search = false;
                for (var len2 = response.items.length; len2--;) {
                    if (localStorage.youtubePlaylist === response.items[len2].id) search = true;
                }
                if (!search && response.items.length > 0) localStorage.youtubePlaylist = response.items[0].id;
            }
            if (response.items.length > 0) {
                youtubeShare.is_playlist = true;
            } else {
                localStorage.youtubePlaylist = undefined;
            }

            if (localStorage.youtubePlaylist) {
                $('#nsc_youtube_playlist').find('[data-id=' + localStorage.youtubePlaylist + ']').closest('li').addClass('nsc-aside-list-selected');
            }
        });

    },
    sendVideo: function (playlist) {
        $('#nsc_message_view_uploads, #nsc_linked').removeClass('visible');
        $('#nsc_loading_upload_file').addClass('visible');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,contentDetails');
        xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        // xhr.setRequestHeader('Content-Length', 278);
        xhr.setRequestHeader('x-upload-content-length', nacl_module.videoBlob.size);
        xhr.setRequestHeader('X-Upload-Content-Type', 'video/*');

        xhr.onload = function () {
            if (xhr.readyState !== 4) return;
            switch (xhr.status) {
                case 200:	// success
                    var location = xhr.getResponseHeader('Location');
                    xhr.open('PUT', location);
                    xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
                    xhr.setRequestHeader('Content-Type', 'video/*');
                    xhr.setRequestHeader('Content-Length', nacl_module.videoBlob.size);
                    xhr.onload = function () {
                        if (xhr.readyState !== 4) return;
                        var response = JSON.parse(xhr.response);
                        switch (xhr.status) {
                            case 200:	// success

                                if (youtubeShare.is_playlist) {
                                    xhr.open('POST', 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet');
                                    xhr.setRequestHeader('Authorization', 'Bearer ' + gFolders.getAccessToken());
                                    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
                                    xhr.onload = function () {
                                        if (xhr.readyState !== 4) return;
                                        $('#nsc_loading_upload_file').removeClass('visible');
                                        var response = JSON.parse(xhr.response);
                                        switch (xhr.status) {
                                            case 200:	// success
                                                console.error(xhr.status, response);
                                                var url = 'https://youtu.be/' + response.snippet.resourceId.videoId;
                                                $('#nsc_linked').addClass('visible').find('input').val(url);
                                                renderClassRoomButton(url);
                                                $.ambiance({message: 'Upload has completed', timeout: 5});
                                                break;

                                            default: 	// network error
                                                $.ambiance({message: 'error upload to youtube', type: 'error', timeout: 5});
                                                console.error(xhr.status, response);
                                        }
                                    };
                                    xhr.send(JSON.stringify({
                                        "snippet": {
                                            "playlistId": playlist || localStorage.youtubePlaylist,
                                            "resourceId": {
                                                "kind": "youtube#video",
                                                "videoId": response.id
                                            }
                                        }
                                    }));
                                } else {
                                    $.ambiance({message: 'Upload has completed', timeout: 5});
                                    $('#nsc_loading_upload_file').removeClass('visible');
                                }

                                break;
                            default: 	// network error
                                $.ambiance({message: 'error upload to youtube', type: 'error', timeout: 5});
                                console.error(xhr.status, response);
                        }
                    };
                    xhr.send(nacl_module.videoBlob);

                    break;
                default: 	// network error
                    $.ambiance({message: 'error upload to youtube', type: 'error', timeout: 5});
                    console.error(xhr.status);
            }
        };

        xhr.send(JSON.stringify({
            "snippet": { //
                "title": $('#nsc_done_youtube_name').val(),
                "description": "Video uploaded using Nimbus Screenshot & Screen Video Recorder",
                // "tags": ["cool", "video", "more keywords"],
                "categoryId": '22'
            },
            "status": {
                "privacyStatus": $('input[name=youtubePrivacy]:checked').val() || 'public'//,
                // "embeddable": 'True',
                // "license": "youtube"
            }
        }));
    },
    init: function () {
        chrome.identity.getAuthToken({'interactive': true}, function (token) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            }
            if (typeof token !== 'undefined') {
                gFolders.setAccessToken(token);
                nimbus_screen.togglePanel('youtube');
                youtubeShare.viewPlaylist();
                youtubeShare.event();
            }
        });
    }
};