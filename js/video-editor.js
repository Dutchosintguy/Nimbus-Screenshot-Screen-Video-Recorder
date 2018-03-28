/**
 * Created by hasesanches on 14.07.2017.
 */
var editor = {
    canvas: {
        common: {},
        background: {},
        animate: {},
        current: {}
    },
    isDraw: false,
    colorTools: {
        pen: '#00FF00',
        arrow: '#FF0000',
        square: '#0000FF'
    },
    currentTools: 'cursorDefault',
    initialize: function (container) {
        editor.canvas.common.width = $(container).width();
        editor.canvas.common.height = $(container).height();
        editor.canvas.common.container = $(container);
        editor.canvas.common.container = $(editor.canvas.common.container);

        editor.canvas.background.canvas = $(document.createElement('canvas'))
            .attr('width', editor.canvas.common.width)
            .attr('height', editor.canvas.common.height)
            .css({width: editor.canvas.common.width, height: editor.canvas.common.height, position: 'absolute', top: '0', left: '0', zIndex: '0'});

        editor.canvas.animate.canvas = $(document.createElement('canvas'))
            .attr('width', editor.canvas.common.width)
            .attr('height', editor.canvas.common.height)
            .css({width: editor.canvas.common.width, height: editor.canvas.common.height, position: 'absolute', top: '0', left: '0', zIndex: '1'});

        editor.canvas.current.canvas = $(document.createElement('canvas'))
            .attr('width', editor.canvas.common.width)
            .attr('height', editor.canvas.common.height)
            .css({width: editor.canvas.common.width, height: editor.canvas.common.height, position: 'absolute', top: '0', left: '0', zIndex: '2'});

        editor.canvas.background.ctx = editor.canvas.background.canvas[0].getContext('2d');
        editor.canvas.animate.ctx = editor.canvas.animate.canvas[0].getContext('2d');
        editor.canvas.current.ctx = editor.canvas.current.canvas[0].getContext('2d');

        editor.canvas.common.container.append(editor.canvas.background.canvas);
        editor.canvas.common.container.append(editor.canvas.animate.canvas);
        editor.canvas.common.container.append(editor.canvas.current.canvas);
        editor.canvas.common.container.addClass('events');

        $('html body')
        // .css({/*cursor: 'url( ' + chrome.extension.getURL('images/video/ic-cursor.svg') + ') 0 0, pointer', */'user-select': 'none'})
            .on('mousedown', function (e) {
                if (!$(e.target).closest('.nsc-panel.nsc-panel-compact').length) editor.draw.start(e);
            })
            .on('mousemove', function (e) {
                if (!$(e.target).closest('.nsc-panel.nsc-panel-compact').length) editor.draw.move(e);
            })
            .on('mouseup', function (e) {
                if (!$(e.target).closest('.nsc-panel.nsc-panel-compact').length) editor.draw.end(e);
            });

        editor.canvas.common.container.on('nimbus-editor-active-tools', function (e, tool) {
            if (editor.draw[tool] != undefined && tool != 'clearAll') {
                if (tool == 'cursorDefault' || tool == 'cursorShadow' || tool == 'cursorRing') {
                    $('html body').css({'user-select': 'auto'});
                    editor.canvas.common.container.addClass('events')
                } else {
                    $('html body').css({'user-select': 'none'});
                    editor.canvas.common.container.removeClass('events')
                }
                if (tool == 'cursorShadow') {
                    $('html body').css({cursor: 'none'});
                    editor.draw.cursorShadow(editor.draw.startPoint, editor.getPosition(e));
                } else {
                    $('html body').css({cursor: 'auto'});
                }

                editor.currentTools = tool;
                container.trigger('nimbus-editor-change', [editor.currentTools, editor.colorTools[editor.currentTools]]);
                editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                // $('html body').css({cursor: 'url( ' + chrome.extension.getURL('images/video/ic-cursor.svg') + ') 0 0, pointer'});
            } else if (tool == 'clearAll') {
                editor.draw.clearAll();
            } else {
                console.error('Tool not found!')
            }
        });

        editor.canvas.common.container.on('nimbus-editor-active-color', function (e, color) {
            if (editor.colorTools[editor.currentTools]) {
                editor.colorTools[editor.currentTools] = color;
                container.trigger('nimbus-editor-change', [editor.currentTools, editor.colorTools[editor.currentTools]]);
            } else {
                console.error('Can not set color!')
            }
        });

        return container;
    },
    getPosition: function (e) {
        var a = editor.canvas.current.canvas[0].getBoundingClientRect();
        return {
            x: e.clientX - a.left,
            y: e.clientY - a.top
        };
    },
    draw: {
        startPoint: {},
        start: function (e) {
            editor.isDraw = true;
            editor.draw.startPoint = editor.getPosition(e);

            switch (editor.currentTools) {
                case 'cursorRing':
                case 'notifGreen':
                case 'notifRed':
                case 'notifBlue':
                    editor.draw[editor.currentTools](editor.draw.startPoint, editor.getPosition(e));
                    break;
                case 'cursorDefault':
                case 'cursorShadow':
                case 'pen':
                case 'square':
                    break;
            }
        },
        move: function (e) {
            if (editor.isDraw) {
                editor.draw[editor.currentTools](editor.draw.startPoint, editor.getPosition(e));
            }

            switch (editor.currentTools) {
                case 'cursorDefault':
                case 'cursorRing':
                case 'pen':
                case 'square':
                    break;
                case 'cursorShadow':
                    editor.draw[editor.currentTools](editor.draw.startPoint, editor.getPosition(e));
                    break;
            }
        },
        end: function () {
            editor.isDraw = false;
            editor.draw.startPoint = {};
            switch (editor.currentTools) {
                case 'cursorDefault':
                case 'cursorRing':
                    break;
                case 'pen':
                case 'square':
                case 'arrow':
                case 'notifGreen':
                case 'notifRed':
                case 'notifBlue':
                    editor.canvas.background.ctx.drawImage(editor.canvas.current.canvas[0], 0, 0);
                    editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                    break;
            }
        },
        cursorDefault: function (start, end) {
            // var image = new Image();
            // image.src = "./images/video/ic-cursor.svg";
            // image.onload = function () {
            //     editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            //     editor.canvas.current.ctx.drawImage(image, end.x, end.y);
            // };
        },
        cursorRing: function (start, end) {
            var ringCounter = 0, ringRadius;

            function easeInCubic(now, startValue, deltaValue, duration) {
                return deltaValue * (now /= duration) * now * now + startValue;
            }

            function easeOutCubic(now, startValue, deltaValue, duration) {
                return deltaValue * ((now = now / duration - 1) * now * now + 1) + startValue;
            }

            function animate() {
                if (ringCounter > 200) {
                    return;
                }

                window.requestAnimationFrame(animate);

                if (ringCounter < 100) {
                    ringRadius = easeInCubic(ringCounter, 0, 20, 100);
                } else {
                    ringRadius = easeOutCubic(ringCounter - 100, 20, -20, 100);
                }

                editor.canvas.animate.ctx.lineWidth = 1;
                editor.canvas.animate.ctx.strokeStyle = 'red';
                editor.canvas.animate.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                editor.canvas.animate.ctx.beginPath();
                editor.canvas.animate.ctx.arc(end.x, end.y, ringRadius, 0, Math.PI * 2);
                editor.canvas.animate.ctx.stroke();
                ringCounter += 5;
            }

            window.requestAnimationFrame(animate);
        },
        cursorShadow: function (start, end) {
            editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.globalAlpha = 0.6;
            editor.canvas.current.ctx.fillStyle = '#000';
            editor.canvas.current.ctx.fillRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.globalAlpha = 1;
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.globalCompositeOperation = 'destination-out';
            editor.canvas.current.ctx.filter = "blur(10px)";
            editor.canvas.current.ctx.arc(end.x, end.y, 75, 0, 2 * Math.PI, true);
            editor.canvas.current.ctx.fill();
            editor.canvas.current.ctx.globalCompositeOperation = 'source-over';
            editor.canvas.current.ctx.filter = "none";
        },
        clear: function (start, end) {
            editor.canvas.background.ctx.beginPath();
            editor.canvas.background.ctx.globalCompositeOperation = 'destination-out';
            editor.canvas.background.ctx.arc(end.x, end.y, 20, 0, Math.PI * 2, true);
            editor.canvas.background.ctx.fill();
            editor.canvas.background.ctx.globalCompositeOperation = 'source-over';
        },
        clearAll: function (start, end) {
            editor.canvas.background.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
        },
        notif: function (start, end, name) {
            var image = new Image();
            var ratio = 2;
            image.src = chrome.extension.getURL('images/video/notif_' + name + '.svg');
            image.onload = function () {
                editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
                editor.canvas.current.ctx.drawImage(
                    image, 0, 0, image.width, image.height,
                    Math.round(end.x - image.width / ratio),
                    Math.round(end.y - image.height / ratio),
                    Math.round(image.width / ratio),
                    Math.round(image.height / ratio)
                );
            };
        },
        notifGreen: function (start, end) {
            editor.draw.notif(start, end, 'green');
        },
        notifRed: function (start, end) {
            editor.draw.notif(start, end, 'red');
        },
        notifBlue: function (start, end) {
            editor.draw.notif(start, end, 'blue');
        },
        pen: function (start, end) {
            editor.canvas.current.ctx.lineWidth = 3;
            editor.canvas.current.ctx.strokeStyle = editor.colorTools.pen;
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.moveTo(start.x, start.y);
            editor.canvas.current.ctx.lineTo(end.x, end.y);
            editor.canvas.current.ctx.stroke();
            editor.draw.startPoint = {x: end.x, y: end.y};
        },
        arrow: function (start, end) {
            var dx = start.x - end.x;
            var dy = start.y - end.y;
            var angle = Math.atan2(dy, dx) + Math.PI;
            var head_length = 15;
            editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.lineWidth = 3;
            editor.canvas.current.ctx.strokeStyle = editor.colorTools.arrow;
            editor.canvas.current.ctx.fillStyle = editor.colorTools.arrow;
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.moveTo(start.x, start.y);
            editor.canvas.current.ctx.lineTo(end.x, end.y);
            editor.canvas.current.ctx.stroke();
            editor.canvas.current.ctx.moveTo(end.x, end.y);
            editor.canvas.current.ctx.lineTo(end.x - head_length * Math.cos(angle - Math.PI / 7), end.y - head_length * Math.sin(angle - Math.PI / 7));
            editor.canvas.current.ctx.lineTo(end.x - head_length * Math.cos(angle + Math.PI / 7), end.y - head_length * Math.sin(angle + Math.PI / 7));
            editor.canvas.current.ctx.lineTo(end.x, end.y);
            editor.canvas.current.ctx.lineTo(end.x - head_length * Math.cos(angle - Math.PI / 7), end.y - head_length * Math.sin(angle - Math.PI / 7));
            editor.canvas.current.ctx.fill();
        },
        square: function (start, end) {
            editor.canvas.current.ctx.clearRect(0, 0, editor.canvas.common.width, editor.canvas.common.height);
            editor.canvas.current.ctx.beginPath();
            editor.canvas.current.ctx.lineWidth = 3;
            editor.canvas.current.ctx.strokeStyle = editor.colorTools.square;
            editor.canvas.current.ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
    }
};

$.fn.videoEditor = function (method) {
    return editor.initialize(this);
};