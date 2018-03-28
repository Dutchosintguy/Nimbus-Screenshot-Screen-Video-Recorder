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

CanvasRenderingContext2D.prototype.clearArc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
    this.beginPath();
    this.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    this.clear();
};

CanvasRenderingContext2D.prototype.clear = function () {
    this.save();
    this.globalCompositeOperation = 'destination-out';
    this.fillStyle = 'black';
    this.fill();
    this.restore();
};

(function ($) {

    $.fn.canvasPaint = function (method) {

        var self = this;

        if (this.length > 1) {
            this.each(function () {
                $(this).myPlugin(options)
            });
            return this;
        }

        var TOOLS = {
            "PEN": 0,
            "ERASER": 1,
            "LINE": 2,
            "EMPTY_RECTANGLE": 3,
            "RECTANGLE": 4,
            "EMPTY_CIRCLE": 5,
            "CIRCLE": 6,
            "TEXT": 7,
            "SPRAY": 8,
            "ARROW": 9,
            "LINE_CURVE": 10,
            "ARROW_CURVE": 11,
            "BLUR": 12,
            "BLUR_OTHER": 13,
            "STICKER": 14,
            "EDIT": 15,
            "ELLIPSE": 16,
            "TEXT_ARROW": 17,
            "ROUNDED_RECTANGLE": 18,
            "HIGHLIGHT": 19,
            "ARROW_DOUBLE": 20,
            "LINE_DOTTED": 21,
            "NUMBER": 22
        };

        var canvas = {
            fon: {},
            background: {},
            current: {},
            common: {},
            cache: {}
        };

        var state = {
            startDrawX: 0,
            startDrawY: 0,
            drawing: false,
            move: false,
            moved: false,
            lasttools: TOOLS.ARROW,
            tool: TOOLS.ARROW,
            lineThickness: 10,
            strokeColor: "#FF0000",
            fillColor: "#FF0000",
            sprayDensity: 5,
            created: false,
            lock: false,
            shadow: {
                enable: true,
                color: '#333',
                blur: 5
            },
            fontFamily: 'Arial',
            fontSize: 35
        };

        var defaults = {};
        var settings = {};
        var _this = this;
        var textarea;
        var points = [];
        var blur = null;
        var kzoom = 1;
        var objects = [];
        var currentObject = {};
        var copyObject = {};
        var currentN = -1;
        var timer = {};
        var enablenumbers = false;
        var maxNumber = 0;

        var cloneObject = function (obj) {

            var copy_obj;

            switch (obj.type) {
                case 'line':
                    copy_obj = new ObLine();
                    copy_obj.x2 = obj.x2;
                    copy_obj.x2Last = obj.x2Last;
                    copy_obj.y2 = obj.y2;
                    copy_obj.y2Last = obj.y2Last;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;

                case 'arrow':
                    copy_obj = new ObArrow();
                    copy_obj.x2 = obj.x2;
                    copy_obj.x2Last = obj.x2Last;
                    copy_obj.y2 = obj.y2;
                    copy_obj.y2Last = obj.y2Last;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'arrow_double':
                    copy_obj = new ObArrowDouble();
                    copy_obj.x2 = obj.x2;
                    copy_obj.x2Last = obj.x2Last;
                    copy_obj.y2 = obj.y2;
                    copy_obj.y2Last = obj.y2Last;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'sticker':
                    copy_obj = new ObSticker();
                    copy_obj.h = obj.h;
                    copy_obj.hLast = obj.hLast;
                    copy_obj.w = obj.w;
                    copy_obj.wLast = obj.wLast;
                    copy_obj.arrow = obj.arrow;
                    copy_obj.arrowposition = obj.arrowposition;
                    copy_obj.family = obj.family;
                    copy_obj.size = obj.size;
                    copy_obj.text = obj.text;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'text':
                    copy_obj = new ObText();
                    copy_obj.h = obj.h;
                    copy_obj.hLast = obj.hLast;
                    copy_obj.w = obj.w;
                    copy_obj.wLast = obj.wLast;
                    copy_obj.family = obj.family;
                    copy_obj.size = obj.size;
                    copy_obj.text = obj.text;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    break;
                case 'textarrow':
                    copy_obj = new ObTextArrow();
                    copy_obj.x2Last = obj.x2Last;
                    copy_obj.y2 = obj.y2;
                    copy_obj.y2Last = obj.y2Last;
                    copy_obj.xb1 = obj.xb1;
                    copy_obj.xb1Last = obj.xb1Last;
                    copy_obj.yb1 = obj.yb1;
                    copy_obj.yb1Last = obj.yb1Last;
                    copy_obj.xb2 = obj.xb2;
                    copy_obj.xb2Last = obj.xb2Last;
                    copy_obj.yb2 = obj.yb2;
                    copy_obj.yb2Last = obj.yb2Last;
                    copy_obj.family = obj.family;
                    copy_obj.size = obj.size;
                    copy_obj.text = obj.text;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'number':
                    copy_obj = new ObNumber();
                    copy_obj.x2Last = obj.x2Last;
                    copy_obj.y2 = obj.y2;
                    copy_obj.y2Last = obj.y2Last;
                    copy_obj.xb1 = obj.xb1;
                    copy_obj.xb1Last = obj.xb1Last;
                    copy_obj.yb1 = obj.yb1;
                    copy_obj.yb1Last = obj.yb1Last;
                    copy_obj.xb2 = obj.xb2;
                    copy_obj.xb2Last = obj.xb2Last;
                    copy_obj.yb2 = obj.yb2;
                    copy_obj.yb2Last = obj.yb2Last;
                    copy_obj.family = obj.family;
                    copy_obj.size = obj.size;
                    copy_obj.text = obj.text;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'circle':
                    copy_obj = new ObCircle();
                    copy_obj.R = obj.R;
                    copy_obj.RLast = obj.RLast;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'rectangle':
                    copy_obj = new ObRectangle();
                    copy_obj.h = obj.h;
                    copy_obj.hLast = obj.hLast;
                    copy_obj.w = obj.w;
                    copy_obj.wLast = obj.wLast;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'rounded_rectangle':
                    copy_obj = new ObRoundedRectangle();
                    copy_obj.h = obj.h;
                    copy_obj.w = obj.w;
                    copy_obj.hLast = obj.hLast;
                    copy_obj.wLast = obj.wLast;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'ellipse':
                    copy_obj = new ObEllipse();
                    copy_obj.h = obj.h;
                    copy_obj.w = obj.w;
                    copy_obj.hLast = obj.hLast;
                    copy_obj.wLast = obj.wLast;
                    copy_obj.width = obj.width;
                    copy_obj.color = obj.color;
                    copy_obj.fillColor = obj.fillColor;
                    break;
                case 'arrow_curve':
                case 'line_curve':
                case 'line_dotted':
                    copy_obj = new ObNoEdit(obj.imgData);
                    copy_obj.x2 = obj.x2;
                    copy_obj.x2Last = obj.x2Last;
                    copy_obj.y2 = obj.y2;
                    copy_obj.y2Last = obj.y2Last;
                    copy_obj.type = obj.type;
            }
            copy_obj.x = obj.x;
            copy_obj.xLast = obj.xLast;
            copy_obj.y = obj.y;
            copy_obj.yLast = obj.yLast;
            copy_obj.current = true;
            copy_obj.marker = obj.marker;
            copy_obj.shadow = obj.shadow;

            return copy_obj;
        };

        // ************ Objects ***************//

        var History = {
            index: 0,
            max: 0,
            redo: function () {
                if (this.index >= this.max) return;

                if (this.index === 0 && canvas.cache.isset && canvas.cache.action !== 'redo') {
                    History.toggleCache();
                    canvas.cache.action = 'redo';
                }

                this.index++;
                var l, n = objects.length - 1;
                for (l = n; l >= 0; l--) {
                    objects[l].redo();
                }
                this.setButton();
                _this.done();
            },
            undo: function () {
                if (this.index < 1) return;

                if (this.index === 1 && canvas.cache.isset && canvas.cache.action !== 'undo') {
                    History.toggleCache();
                    canvas.cache.action = 'undo';
                }

                this.index--;
                var l, n = objects.length - 1;
                for (l = n; l >= 0; l--) {
                    objects[l].undo();
                }
                this.setButton();
                _this.done();
            },
            undoAll: function () {
                this.index = 0;
                this.max = 0;
                objects = [];
//                var l, n = objects.length - 1;
//                for (l = n; l >= 0; l--) {
//                    objects[l].index = -1;
//                    objects[l].undo();
//                }
                this.setButton();
                drawAll();
            },
            resetFromCache: function (data, w, h) {
                _this.resizeElements(w, h);
//                canvas.fon.context.putImageData(data, 0, 0);
                var pic = new Image();
                pic.onload = function () {
                    canvas.fon.context.drawImage(pic, 0, 0);
                };
                pic.src = data
            },
            saveToCache: function () {
                canvas.cache.width = canvas.common.width;
                canvas.cache.height = canvas.common.height;
                canvas.cache.data = canvas.fon.canvas.toDataURL("image/png");
//                canvas.cache.data = canvas.fon.context.getImageData(0, 0, canvas.common.width, canvas.common.height);
                canvas.cache.isset = true;
            },
            toggleCache: function () {
                var data = canvas.cache.data;
                var w = canvas.cache.width;
                var h = canvas.cache.height;
                History.saveToCache();
                History.resetFromCache(data, w, h);
            },
            setButton: function () {
                if (this.index > 0) {
                    $('#nsc_redactor_undo').removeClass('inert');
                    $('#nsc_redactor_undo_all').removeClass('inert');
                } else {
                    $('#nsc_redactor_undo').addClass('inert');
                }
                if (this.index < this.max) {
                    $('#nsc_redactor_redo').removeClass('inert');
                } else {
                    $('#nsc_redactor_redo').addClass('inert');
                }
            }
        };

        function setColorProperty(c) {
            $("#nsc_redactor_stroke_color").spectrum("set", c);
        }

        function setWidthProperty(w) {
            $('#nsc_redactor_line_width').find('option').attr('selected', false).filter('[value="' + w + '"]').attr('selected', 'selected').end().trigger('change');
        }

        function setFillColorProperty(c) {
            $("#nsc_redactor_fill_color").spectrum("set", c);
        }

        function setFontProperty(size, family) {
            if (size) {
                $('#nsc_redactor_font_size').val(size).trigger('js-change');
            }

            if (family) {
                $('#nsc_redactor_font_family').val(family).trigger('js-change');
            }
        }

        function showFontSettings(param, all) {
            var line = $('#nsc_redactor_panel_line_width');
            var font = $('#nsc_redactor_panel_font');
            if (all) {
                line.hide();
                font.hide();
                return;
            }
            if (typeof param === 'object') {
                param = (param.type == "sticker") || (param.type == "textarrow") || (param.type == "text");
            }
            if (typeof param === 'boolean') {
                if (param) {
                    line.hide();
                    font.show();
                } else {
                    line.show();
                    font.hide();
                }
            }
        }

        var ObTools = {
            x: 0,
            y: 0,
            xLast: 0,
            yLast: 0,
            width: 1,
            color: 'red',
            fillColor: 'rgba(255, 0, 0, 0)',
            context: null,
            current: false,
            lock: false,
            marker: -1,
            shadow: {
                enable: false,
                color: 'red',
                blur: 5
            },

            setValue: function (x, y, w, c) {
                this.x = x;
                this.y = y;
                this.width = w;
                this.color = c;

                this.xLast = x;
                this.yLast = y;
                this.setDefaultValue();
            },
            setDrawOptions: function () {

                if (this.shadow.enable) {
                    this.context.shadowColor = this.shadow.color;
                    this.context.shadowBlur = this.shadow.blur;
                    this.context.shadowOffsetX = 1;
                    this.context.shadowOffsetY = 1;
                } else {
                    this.context.shadowColor = 'transparent';
                }

                this.context.lineWidth = this.width;
                this.context.fillStyle = this.color;
                this.context.strokeStyle = this.color;
            },
            drawMark: function (x, y) {
                this.context.beginPath();
                this.context.arc(x, y, 6, 0, 2 * Math.PI, false);
                this.context.fillStyle = '#ccc';
                this.context.fill();
                this.context.lineWidth = 1.5;
                this.context.strokeStyle = '#666';
                this.context.closePath();
                this.context.stroke();
            },
            checkMarker: function (x, y, tx, ty) {
                var point = (tx - x) * (tx - x) + (ty - y) * (ty - y);
                return (point <= 36);
            },
            setElProperties: function () {
                setWidthProperty(this.width);
                setColorProperty(this.color);
                setFillColorProperty(this.fillColor);
                setFontProperty(this.size, this.family);
            },
            setCursor: function (x, y) {
                var canva = $('#nsc_canvas');
                canva.css("cursor", "default");

                if (this.includesPoint(x, y)) {
                    canva.css("cursor", "move");
                }

                this.checkMarkers(x, y);
                if (this.marker > -1) {
                    canva.css("cursor", "pointer");
                    if (this.type === 'sticker' && this.marker === 0) {
                        canva.css("cursor", "url(images/rotate.png) 18 18, auto");
                    }
                }

                if (this.checkNumber(x, y)) {
                    canva.css("cursor", "move");
                }
            },
            removeNumber: function () {
                if (enablenumbers && this.context && this.getNumberPosition()) {
                    var p = this.getNumberPosition();
                    this.context.clearRect(p.x - 20, p.y - 20, 40, 40);
                }
            },
            drawNumber: function () {
                if (enablenumbers && this.getNumberPosition()) {
                    var x = this.getNumberPosition().x;
                    var y = this.getNumberPosition().y;

                    var text = this.number.n.toString();
                    this.context.font = "38px Arial";
                    this.context.textAlign = 'center';
                    this.context.textBaseline = "middle";
                    this.context.strokeStyle = "#fff";
                    this.context.lineWidth = 2;
                    this.context.strokeText(text, x, y);
                    this.context.fillStyle = this.color || 'white';
                    this.context.fillText(text, x, y);
                }
            },
            checkNumber: function (x, y) {
                if (!enablenumbers && !this.getNumberPosition()) return false;
                var tx = this.getNumberPosition().x;
                var ty = this.getNumberPosition().y;
                var point = (tx - x) * (tx - x) + (ty - y) * (ty - y);
                this.number.active = (point <= 240);
                return this.number.active;
            },
            moveNumber: function (dx, dy) {
                this.number.x = this.number.xl + dx;
                this.number.y = this.number.yl + dy;
            },
            moveEndNumber: function () {
                this.number.xl = this.number.x;
                this.number.yl = this.number.y;
            },
            undo: function () {
                this.index--;
                if (this.index < 0) {
                    this.show = false;
                } else {
                    this.show = true;
                    this.readStore();
                }
            },
            redo: function () {
                this.index++;
                if (this.index > -1) {
                    this.show = true;
                    this.readStore();
                } else {
                    this.show = false;
                }
            }
        };

        var number = function () {
            return {
                active: false,
                n: 99,
                x: 0,
                y: 0,
                xl: 0,
                yl: 0
            }
        };

        function Line() {
            this.x2 = 1;
            this.y2 = 1;
            this.x2Last = 1;
            this.y2Last = 1;
            this.store = [];
            this.number = number();
            this.index = -1;
            this.show = true;
            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y, x2: this.x2, y2: this.y2});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.x2Last = this.x2 = s.x2;
                    this.y2Last = this.y2 = s.y2;
                }
            };
            this.setDefaultValue = function () {
                this.x2 = this.x + 5;
                this.y2 = this.y + 5;
                this.x2Last = this.x2;
                this.y2Last = this.y2;
            };
            this.drawMarks = function () {
                this.drawMark(this.x, this.y);
                this.drawMark(this.x2, this.y2);
            };
            this.includesPoint = function (x, y) {
                if (!this.show && !this.lock) return false;
                var w = this.width / 1.5;
                if (w < 5) w = 5;

                if ((x >= Math.min(this.x, this.x2) - 5 && x <= Math.max(this.x, this.x2) + 5 && y >= Math.min(this.y, this.y2) - 5 && y <= Math.max(this.y, this.y2) + 5)) {
                    var a = Math.pow(((this.x - this.x2) * (this.x - this.x2) + (this.y - this.y2) * (this.y - this.y2)), 0.5);
                    var b = Math.pow(((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y)), 0.5);
                    var c = Math.pow(((x - this.x2) * (x - this.x2) + (y - this.y2) * (y - this.y2)), 0.5);
                    var p = (a + b + c) / 2;
                    var S = Math.pow((p * (p - a) * (p - b) * (p - c)), 0.5);
                    var h = 2 * S / a;
                    if (h <= w) return true;
                }
                return false;
            };
            this.move = function (dx, dy, shiftKey) {
                if (this.marker == 1 || this.marker == -1) {
                    this.x2 = this.x2Last + dx;
                    this.y2 = this.y2Last + dy;
                    if (shiftKey && this.marker !== -1) {
                        if (Math.abs(this.x2 - this.x) < Math.abs(this.y2 - this.y)) {
                            this.x2 = this.x;
                        } else {
                            this.y2 = this.y;
                        }
                    }
                }
                if (this.marker == 0 || this.marker == -1) {
                    this.x = this.xLast + dx;
                    this.y = this.yLast + dy;
                    if (shiftKey && this.marker !== -1) {
                        if (Math.abs(this.x2 - this.x) < Math.abs(this.y2 - this.y)) {
                            this.x = this.x2;
                        } else {
                            this.y = this.y2;
                        }
                    }
                }

            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.x2Last = this.x2;
                this.y2Last = this.y2;
                this.moveEndNumber();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
                if (this.checkMarker(x, y, this.x, this.y)) this.marker = 0;
                if (this.checkMarker(x, y, this.x2, this.y2)) this.marker = 1;
            };
            this.getNumberPosition = function () {
                return {x: this.x + this.number.x, y: this.y + this.number.y - 25}
            };
            this.remove = function (context) {
                var x1 = Math.min(this.x, this.x2);
                var y1 = Math.min(this.y, this.y2);
                var x2 = Math.max(this.x, this.x2);
                var y2 = Math.max(this.y, this.y2);
                context.clearRect(x1 - 80, y1 - 80, x2 - x1 + 160, y2 - y1 + 160);
                this.removeNumber();
            }
        }

        Line.prototype = ObTools;

        function ObLine() {
            Line.apply(this);
            this.type = 'line';
            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                this.context.lineCap = "butt";
                this.context.moveTo(this.x, this.y);
                this.context.lineTo(this.x2, this.y2);
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
        }

        ObLine.prototype = new Line();

        function ObArrow() {
            Line.apply(this);
            this.type = 'arrow';
            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                this.context.lineCap = 'butt';
                this.context.moveTo(this.x, this.y);
                this.context.lineTo(this.x2, this.y2);
                drawArrow(this.x, this.y, this.x2, this.y2, context, this.width);
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
        }

        ObArrow.prototype = new Line();

        function ObArrowDouble() {
            Line.apply(this);
            this.type = 'arrow_double';
            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                this.context.lineCap = 'butt';
                this.context.moveTo(this.x, this.y);
                this.context.lineTo(this.x2, this.y2);
                drawArrow(this.x, this.y, this.x2, this.y2, context, this.width);
                drawArrow(this.x2, this.y2, this.x, this.y, context, this.width);
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
        }

        ObArrowDouble.prototype = new Line();

        function ObRecEll() {
            this.w = 1;
            this.h = 1;
            this.wLast = 1;
            this.hLast = 1;
            this.number = number();
            this.store = [];
            this.index = -1;
            this.show = true;

            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y, w: this.w, h: this.h});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.wLast = this.w = s.w;
                    this.hLast = this.h = s.h;
                }
            };
            this.drawMarks = function () {
                this.drawMark(this.x, this.y);
                this.drawMark(this.x, this.y + this.h);
                this.drawMark(this.x + this.w, this.y);
                this.drawMark(this.x + this.w, this.y + this.h);
            };
            this.setDefaultValue = function () {

            };
            this.move = function (dx, dy, shiftKey) {
                var d = 0;
                switch (this.marker) {
                    case 0:
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                        this.w = this.wLast - dx;
                        this.h = this.hLast - dy;
                        break;
                    case 1:
                        this.y = this.yLast + dy;
                        this.w = this.wLast + dx;
                        this.h = this.hLast - dy;
                        break;
                    case 2:
                        this.w = this.wLast + dx;
                        this.h = this.hLast + dy;
                        break;
                    case 3:
                        this.x = this.xLast + dx;
                        this.w = this.wLast - dx;
                        this.h = this.hLast + dy;
                        break;
                    default :
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                }
                if (shiftKey) {
                    d = Math.abs(Math.abs(this.h) - Math.abs(this.w));
                    if (Math.abs(this.w) < Math.abs(this.h)) {
                        if ([0, 3].indexOf(this.marker) >= 0) this.x -= d * (this.w < 0 ? -1 : 1);
                        this.w += d * (this.w < 0 ? -1 : 1);
                    } else {
                        if ([0, 1].indexOf(this.marker) >= 0) this.y -= d * (this.h < 0 ? -1 : 1);
                        this.h += d * (this.h < 0 ? -1 : 1);
                    }
                }
            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.wLast = this.w;
                this.hLast = this.h;
                this.moveEndNumber();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
                if (this.checkMarker(x, y, this.x, this.y)) this.marker = 0;
                if (this.checkMarker(x, y, this.x + this.w, this.y)) this.marker = 1;
                if (this.checkMarker(x, y, this.x + this.w, this.y + this.h)) this.marker = 2;
                if (this.checkMarker(x, y, this.x, this.y + this.h)) this.marker = 3;
            };
            this.remove = function (context) {
                var x1 = Math.min(this.x, this.x + this.w);
                var y1 = Math.min(this.y, this.y + this.h);
                var x2 = Math.max(this.x, this.x + this.w);
                var y2 = Math.max(this.y, this.y + this.h);
                context.clearRect(x1 - 20, y1 - 20, x2 - x1 + 40, y2 - y1 + 40);
                this.removeNumber();
            }
        }

        ObRecEll.prototype = ObTools;

        function ObRectangle() {
            ObRecEll.apply(this);
            this.type = 'rectangle';

            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                if (this.width == 1) {
                    this.context.rect(this.x + 0.5, this.y + 0.5, this.w, this.h);
                } else {
                    this.context.rect(this.x, this.y, this.w, this.h);
                }
                this.context.fillStyle = this.fillColor;
                this.context.fill();
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;
                var w = this.width / 1.5;
                if (w < 5) w = 5;
                var x1 = Math.min(this.x, this.x + this.w);
                var y1 = Math.min(this.y, this.y + this.h);
                var x2 = Math.max(this.x, this.x + this.w);
                var y2 = Math.max(this.y, this.y + this.h);

                return (x >= x1 - w && x <= x2 + w && y >= y1 - w && y <= y2 + w) && (x <= x1 + w || x >= x2 - w || y <= y1 + w || y >= y2 - w);
            };
            this.getNumberPosition = function () {
                return {
                    x: Math.min(this.x, this.x + this.w) + this.number.x - 15,
                    y: Math.min(this.y, this.y + this.h) + this.number.y - 20
                }
            }
        }

        ObRectangle.prototype = new ObRecEll();

        function ObRoundedRectangle() {
            ObRecEll.apply(this);
            this.type = 'rounded_rectangle';

            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();

                function roundedRect(ctx, x, y, width, height, radius) {
                    if (width < 0) {
                        x += width;
                        width *= -1;
                    }
                    if (height < 0) {
                        y += height;
                        height *= -1;
                    }
                    ctx.moveTo(x, y + radius);
                    ctx.lineTo(x, y + height - radius);
                    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
                    ctx.lineTo(x + width - radius, y + height);
                    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
                    ctx.lineTo(x + width, y + radius);
                    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
                    ctx.lineTo(x + radius, y);
                    ctx.quadraticCurveTo(x, y, x, y + radius);
                }

                var radius = Math.min(Math.abs(this.w), Math.abs(this.h)) * 0.25;
                roundedRect(this.context, this.x, this.y, this.w, this.h, radius);

                this.context.fillStyle = this.fillColor;
                this.context.fill();
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;
                var w = this.width / 1.5;
                if (w < 5) w = 5;
                var x1 = Math.min(this.x, this.x + this.w);
                var y1 = Math.min(this.y, this.y + this.h);
                var x2 = Math.max(this.x, this.x + this.w);
                var y2 = Math.max(this.y, this.y + this.h);

                return (x >= x1 - w && x <= x2 + w && y >= y1 - w && y <= y2 + w) && (x <= x1 + w || x >= x2 - w || y <= y1 + w || y >= y2 - w);
            };
            this.getNumberPosition = function () {
                return {
                    x: Math.min(this.x, this.x + this.w) + this.number.x - 15,
                    y: Math.min(this.y, this.y + this.h) + this.number.y - 20
                }
            }
        }

        ObRoundedRectangle.prototype = new ObRecEll();

        function ObEllipse() {
            ObRecEll.apply(this);
            this.type = 'ellipse';

            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                this.drawEllipse(this.context, this.x, this.y, this.w, this.h);
                this.context.closePath();
                this.context.fillStyle = this.fillColor;
                this.context.fill();
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
            this.drawEllipse = function (ctx, x, y, w, h) {
                var kappa = .5522848, ox = (w / 2) * kappa, // control point offset horizontal
                    oy = (h / 2) * kappa, // control point offset vertical
                    xe = x + w,           // x-end
                    ye = y + h,           // y-end
                    xm = x + w / 2,       // x-middle
                    ym = y + h / 2;       // y-middle

                ctx.moveTo(x, ym);
                ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
                ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
                ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
                ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;

                var xe = this.x;
                var ye = this.y;
                var we = this.w;
                var he = this.h;
                if (we < 0) {
                    xe += we;
                    we *= -1;
                }
                if (he < 0) {
                    ye += he;
                    he *= -1;
                }

                var w = this.width / 1.5;
                if (w < 5) w = 5;
                var xC = xe + we / 2;
                var yC = ye + he / 2;
                var a = we / 2 - w;
                var b = he / 2 - w;
                var A = we / 2 + w;
                var B = he / 2 + w;

                var e = ((x - xC) * (x - xC)) / (a * a) + ((y - yC) * (y - yC)) / (b * b);
                var E = ((x - xC) * (x - xC)) / (A * A) + ((y - yC) * (y - yC)) / (B * B);

                return (e > 1 && E < 1);
            };
            this.getNumberPosition = function () {
                return {
                    x: Math.min(this.x, this.x + this.w) + this.number.x - 10,
                    y: Math.min(this.y, this.y + this.h) + Math.abs(this.h / 4) + this.number.y
                }
            }
        }

        ObEllipse.prototype = new ObRecEll();

        function ObCircle() {
            this.R = 1;
            this.RLast = 1;
            this.type = 'circle';
            this.number = number();
            this.store = [];
            this.index = -1;
            this.show = true;

            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y, R: this.R});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.RLast = this.R = s.R;
                }
            };

            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                this.context.arc(this.x, this.y, this.R, 0, 2 * Math.PI, false);
                this.context.fillStyle = this.fillColor;
                this.context.fill();
                this.context.stroke();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
            this.drawMarks = function () {
                this.drawMark(this.x + this.R, this.y + this.R);
                this.drawMark(this.x + this.R, this.y - this.R);
                this.drawMark(this.x - this.R, this.y + this.R);
                this.drawMark(this.x - this.R, this.y - this.R);
            };
            this.setDefaultValue = function () {

            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;

                var xC = this.x, yC = this.y, w = this.width / 1.5, r, R;
                if (w < 5) w = 5;
                r = this.R - w;
                R = this.R + w;
                var point = (xC - x) * (xC - x) + (yC - y) * (yC - y);

                return (point >= r * r && point <= R * R);
            };
            this.move = function (dx, dy) {
                switch (this.marker) {
                    case 0:
                        this.R = Math.max(Math.abs(this.RLast - dx), Math.abs(this.RLast - dy));
                        break;
                    case 1:
                        this.R = Math.max(Math.abs(this.RLast + dx), Math.abs(this.RLast - dy));
                        break;
                    case 2:
                        this.R = Math.max(Math.abs(this.RLast + dx), Math.abs(this.RLast + dy));
                        break;
                    case 3:
                        this.R = Math.max(Math.abs(this.RLast - dx), Math.abs(this.RLast + dy));
                        break;
                    default :
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                }
            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.RLast = this.R;
                this.moveEndNumber();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
                if (this.checkMarker(x, y, this.x - this.R, this.y - this.R)) this.marker = 0;
                if (this.checkMarker(x, y, this.x + this.R, this.y - this.R)) this.marker = 1;
                if (this.checkMarker(x, y, this.x + this.R, this.y + this.R)) this.marker = 2;
                if (this.checkMarker(x, y, this.x - this.R, this.y + this.R)) this.marker = 3;
            };
            this.getNumberPosition = function () {
                return {x: this.x - this.R + this.number.x - 10, y: this.y - this.R / 2 + this.number.y}
            };
            this.remove = function (context) {
                context.clearRect(this.x - this.R - 20, this.y - this.R - 20, this.R * 2 + 40, this.R * 2 + 40);
                this.removeNumber();
            };
        }

        ObCircle.prototype = ObTools;

        function ObSticker() {
            this.w = 200;
            this.h = 92;
            this.wLast = 200;
            this.hLast = 92;
            this.text = '';
            this.type = 'sticker';
            this.number = {};
            this.store = [];
            this.index = -1;
            this.show = true;
            this.arrow = 1; //1,2,3,4
            this.arrowposition = {x: 0, y: 0};
            this.size = 12;
            this.family = 'Arial';

            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y, w: this.w, h: this.h, t: this.text});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.wLast = this.w = s.w;
                    this.hLast = this.h = s.h;
                    this.text = s.t;
                }
            };
            this.getMarkPoints = function (arr) {
                var p = {x: this.x, y: this.y};
                switch (arr || this.arrow) {
                    case 2:
                        p.x = this.x - this.w / 2 - 30;
                        p.y = this.y - this.h / 2 - 30;
                        break;
                    case 3:
                        p.y = this.y - this.h - 60;
                        break;
                    case 4:
                        p.x = this.x + this.w / 2 + 30;
                        p.y = this.y - this.h / 2 - 30;
                        break;
                }
                return p;
            };
            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;

                this.setDrawOptions();

                this.context.lineWidth = 1;
                this.context.strokeStyle = 'transparent';
                this.context.fillStyle = this.color;//'#FFDD00';

                if (this.marker === 0) {
                    this.context.save();
                    this.context.globalAlpha = 0.3;
                    this.context.beginPath();
                    p = this.getMarkPoints(2);
                    this.context.moveTo(p.x, p.y);
                    this.context.lineTo(p.x + 30, p.y - 32);
                    this.context.lineTo(p.x + 30, p.y + 32);
                    this.context.lineTo(p.x, p.y);

                    p = this.getMarkPoints(3);
                    this.context.moveTo(p.x, p.y);
                    this.context.lineTo(p.x - 40, p.y + 30);
                    this.context.lineTo(p.x + 40, p.y + 30);
                    this.context.lineTo(p.x, p.y);

                    p = this.getMarkPoints(4);
                    this.context.moveTo(p.x, p.y);
                    this.context.lineTo(p.x - 30, p.y - 32);
                    this.context.lineTo(p.x - 30, p.y + 32);
                    this.context.lineTo(p.x, p.y);

                    p = this.getMarkPoints(1);
                    this.context.moveTo(p.x, p.y);
                    this.context.lineTo(p.x - 40, p.y - 30);
                    this.context.lineTo(p.x + 40, p.y - 30);
                    this.context.lineTo(p.x, p.y);
                    this.context.closePath();
                    this.context.fill();
                    this.context.stroke();
                    this.context.restore();
                }

                this.context.beginPath();

                var p = this.getMarkPoints();
                this.context.moveTo(p.x, p.y);
                switch (this.arrow) {
                    case 2:
                        this.context.lineTo(p.x + 30, p.y - 32);
                        this.context.lineTo(p.x + 30, p.y + 32);
                        this.context.lineTo(p.x, p.y);
                        break;
                    case 3:
                        this.context.lineTo(p.x - 40, p.y + 30);
                        this.context.lineTo(p.x + 40, p.y + 30);
                        this.context.lineTo(p.x, p.y);
                        break;
                    case 4:
                        this.context.lineTo(p.x - 30, p.y - 32);
                        this.context.lineTo(p.x - 30, p.y + 32);
                        this.context.lineTo(p.x, p.y);
                        break;
                    default:
                        this.context.lineTo(p.x - 40, p.y - 30);
                        this.context.lineTo(p.x + 40, p.y - 30);
                        this.context.lineTo(p.x, p.y);
                }

                this.context.moveTo(this.x - this.w / 2, this.y - 30);
                this.context.lineTo(this.x - this.w / 2, this.y - this.h - 30);
                this.context.lineTo(this.x + this.w / 2, this.y - this.h - 30);
                this.context.lineTo(this.x + this.w / 2, this.y - 30);
                this.context.lineTo(this.x - this.w / 2, this.y - 30);

                this.context.closePath();
                this.context.fill();
                this.context.stroke();

                if (this.current && state.tool === TOOLS.EDIT && !state.move) {
                    this.createSticker();
                } else {
                    if (this.current && textarea) {
                        textarea.blur();
                    }
                    this.drawTextSticker();
                }

                if (this.current) this.drawMarks();

//                this.drawNumber();
            };
            this.saveText = function (value) {
                this.text = value;
                textarea.remove();
                textarea = null;
                this.store[this.store.length - 1].t = this.text;
                this.drawTextSticker();
            };
            this.createSticker = function () {
                var x = this.x - this.w / 2 + 10;
                var y = this.y - this.h - 30 + 10;
                var w = this.w - 20;
                var h = this.h - 20;

                if (textarea) {
                } else {
                    textarea = $('<textarea>', {
                        'class': 'sticker-text',
                        'wrap': 'physical',
                        'placeholder': chrome.i18n.getMessage("nimbusPlaceholderEnterText"),
                        'text': this.text
                    }).appendTo('#nsc_canvas');
                    var _sticker = this;
                    textarea.blur(function (event) {
                        (function (v, s) {
                            // if (v == '') {
                            //     s.show = false;
                            // }
                            s.saveText(v);
                        })(this.value, _sticker);
                    });
                    textarea.keydown(function (event) {
                        if (event.keyCode === 13 && event.ctrlKey) {
                            (function (v, s) {
                                // if (v == '') {
                                //     s.show = false;
                                // }
                                s.saveText(v);
                            })(this.value, _sticker);
                        }
                    });
                }

                textarea.css({
                    'width': w + 'px',
                    'height': h + 'px',
                    'top': y,
                    'left': x,
                    'font-size': this.size + 'px',
                    'font-family': this.family
                });

                textarea.focus();

            };
            this.drawTextSticker = function () {
                var w = this.w - 20;
                var h = this.h - 20;

                this.context.save();
                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = 'black';
                ctx.textBaseline = "top";
                ctx.textAlign = "center";
                ctx.font = this.size + 'px ' + this.family;
                ctx.shadowColor = 'transparent';

                wrapText(ctx, this.text, 0, 0, w, w / 2 + this.size / 5, -1, this.size);

                this.context.shadowColor = 'transparent';
                this.context.drawImage(canvas, this.x - this.w / 2 + 10, this.y - this.h - 30 + 10);
                this.context.restore();
            };
            this.drawMarks = function () {
                var p = this.getMarkPoints();
                this.drawMark(p.x, p.y);
                this.drawMark(this.x - this.w / 2, this.y - this.h - 30);
                this.drawMark(this.x + this.w / 2, this.y - this.h - 30);

                this.drawMark(this.x - this.w / 2, this.y - 30);
                this.drawMark(this.x + this.w / 2, this.y - 30);
            };
            this.setDefaultValue = function () {

            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;

                var x1 = this.x - this.w / 2;
                var y1 = this.y - this.h - 30;
                var x2 = this.x + this.w / 2;

                var p = this.getMarkPoints();
                return (x >= x1 && x <= x2 && y >= y1 && y <= this.y - 30) || (
                        x >= p.x - ((this.arrow === 2) ? 0 : 30) && x <= p.x + ((this.arrow === 4) ? 0 : 30) && y >= p.y - ((this.arrow === 3) ? 0 : 30) && y <= p.y + ((this.arrow === 1) ? 0 : 30)
                    );
            };
            this.move = function (dx, dy) {
                switch (this.marker) {
                    case 0:
                        if (this.arrowposition.y + dy > this.y - 30) {
                            this.arrow = 1;
                        } else if (this.arrowposition.y + dy < this.y - this.h - 30) {
                            this.arrow = 3;
                        } else if (this.arrowposition.x + dx < this.x - this.w / 2) {
                            this.arrow = 2;
                        } else if (this.arrowposition.x + dx > this.x + this.w / 2) {
                            this.arrow = 4;
                        }
                        break;
                    case 1:
                        this.w = this.wLast - dx * 2;
                        this.h = this.hLast - dy;
                        break;
                    case 2:
                        this.w = this.wLast + dx * 2;
                        this.h = this.hLast - dy;
                        break;
                    case 3:
                        this.w = this.wLast - dx * 2;
                        if (this.hLast + dy >= 34) {
                            this.h = this.hLast + dy;
                            this.y = this.yLast + dy;
                        }
                        break;
                    case 4:
                        this.w = this.wLast + dx * 2;
                        if (this.hLast + dy >= 34) {
                            this.h = this.hLast + dy;
                            this.y = this.yLast + dy;
                        }
                        break;
                    default :
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                }
                if (this.w < 150) this.w = 150;
                if (this.h < 34) this.h = 34;
            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.wLast = this.w;
                this.hLast = this.h;

                this.arrowposition = this.getMarkPoints();
                this.moveEndNumber();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
                var p = this.getMarkPoints();
                if (this.checkMarker(x, y, p.x, p.y)) this.marker = 0;
                if (this.checkMarker(x, y, this.x - this.w / 2, this.y - this.h - 30)) this.marker = 1;
                if (this.checkMarker(x, y, this.x + this.w / 2, this.y - this.h - 30)) this.marker = 2;

                if (this.checkMarker(x, y, this.x - this.w / 2, this.y - 30)) this.marker = 3;
                if (this.checkMarker(x, y, this.x + this.w / 2, this.y - 30)) this.marker = 4;
            };
            this.getNumberPosition = function () {
                return {x: this.x - this.w / 2 + this.number.x - 15, y: this.y - this.h - 30 + this.number.y - 15}
            };
            this.remove = function (context) {
                var x1 = this.x - this.w / 2;
                var y1 = this.y - this.h - 30;
                context.clearRect(x1 - 50, y1 - 50, this.w + 100, this.h + 100);
                this.removeNumber();
            }
        }

        ObSticker.prototype = ObTools;

        function ObText() {
            this.w = 500;
            this.h = 50;
            this.wLast = 500;
            this.hLast = 50;
            this.text = '';
            this.size = 12;
            this.marker_swift = 8;
            this.type = 'text';
            this.number = number();
            this.store = [];
            this.index = -1;
            this.show = true;
            this.family = 'Arial';

            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y, w: this.w, h: this.h, t: this.text, size: this.size});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.wLast = this.w = s.w;
                    this.hLast = this.h = s.h;
                    this.text = s.t;
                    this.size = s.size;
                }
            };

            this.draw = function (context) {
                if (!this.show) return;
                this.context = context;
                this.context.shadowColor = 'transparent';

                if (this.current && state.tool === TOOLS.EDIT && !state.move) {
                    this.createText();
                } else {
                    if (this.current && textarea) {
                        textarea.blur();
                    }
                    this.drawText();
                }

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
            this.drawText = function () {
                // if (this.text === '') this.text = 'еntеr thе tеxt';

                var canvas = document.createElement('canvas');
                canvas.width = this.w + 30;
                canvas.height = this.h + 30;

                var ctx = canvas.getContext("2d");

                var saveCtx = this.context;
                this.context = ctx;
                this.setDrawOptions();

                ctx.textBaseline = "top";
                ctx.font = this.size + 'px ' + this.family;
                ctx.textAlign = "start";

//                if (this.current && this.marker > -1) {
//                    var s = lineH(ctx, this.text, this.w, this.h, 0, 0, this.size);
//                    if(Math.abs(this.size-s)>3){
//                        this.size = s;
//                        ctx.font = this.size + 'px Arial';
//                    }
//                }
                wrapText(ctx, this.text, 10, 10, this.w, 0, 0, this.size);

                this.context = saveCtx;
                this.context.save();
                this.context.shadowColor = 'transparent';
                this.context.drawImage(canvas, this.x - 10, this.y - 12);
                this.context.restore();
            };
            this.setDefaultValue = function () {

            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;
                return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h);
            };
            this.saveText = function (value) {
                this.text = value;
                textarea.remove();
                textarea = null;
                this.store[this.store.length - 1].t = this.text;
                this.drawText();
            };
            this.createText = function () {
                if (textarea) {
                } else {
//                    if (this.text === 'еntеr thе tеxt') this.text = '';
                    textarea = $('<textarea>', {
                        'wrap': 'physical',
                        'placeholder': chrome.i18n.getMessage("nimbusPlaceholderEnterText"),
                        'text': this.text
                    }).appendTo('#nsc_canvas');
                    if (this.shadow.enable) textarea.css({textShadow: '1px 1px ' + this.shadow.blur + 'px ' + this.shadow.color});
                    var _text = this;
                    textarea.blur(function (event) {
                        (function (v, s) {
                            if (v == '') {
                                s.show = false;
                            }
                            s.saveText(v)
                        })(this.value, _text);
                    });
                    textarea.keydown(function (event) {

                        if (event.keyCode == 13 && event.ctrlKey) {
                            (function (v, s) {
                                if (v == '') {
                                    s.show = false;
                                }
                                s.saveText(v);
                            })(this.value, _text);
                        }
                    });
                }

                textarea.css({
                    'width': this.w + 'px',
                    'height': this.h + 'px',
                    'top': this.y,
                    'left': this.x,
                    'color': this.color,
                    'font-size': this.size + 'px',
                    'font-family': this.family
                });
                textarea.focus();
            };
            this.move = function (dx, dy) {

                switch (this.marker) {
                    case 0:
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                        this.w = this.wLast - dx;
                        this.h = this.hLast - dy;
                        break;
                    case 1:
                        this.y = this.yLast + dy;
                        this.w = this.wLast + dx;
                        this.h = this.hLast - dy;
                        break;
                    case 2:
                        this.w = this.wLast + dx;
                        this.h = this.hLast + dy;
                        break;
                    case 3:
                        this.x = this.xLast + dx;
                        this.w = this.wLast - dx;
                        this.h = this.hLast + dy;
                        break;
                    default :
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                }
                if (this.marker >= 0) {
                    if (this.x > (this.xLast + this.wLast - this.marker_swift)) {
                        this.x = this.xLast + this.wLast - this.marker_swift;
                    }
                    if (this.y > (this.yLast + this.hLast - this.marker_swift)) {
                        this.y = this.yLast + this.hLast - this.marker_swift;
                    }

                    if (this.w < this.marker_swift) {
                        this.w = this.marker_swift;
                    }
                    if (this.h < this.marker_swift) {
                        this.h = this.marker_swift;
                    }
                }

            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.wLast = this.w;
                this.hLast = this.h;
                this.moveEndNumber();
            };
            this.drawMarks = function () {
                this.drawMark(this.x - this.marker_swift, this.y - this.marker_swift);
                this.drawMark(this.x + this.w + this.marker_swift, this.y - this.marker_swift);
                this.drawMark(this.x + this.w + this.marker_swift, this.y + this.h + this.marker_swift);
                this.drawMark(this.x - this.marker_swift, this.y + this.h + this.marker_swift);

                this.context.beginPath();
                this.context.strokeStyle = '#ccc';
                this.context.moveTo(this.x, this.y);
                this.context.lineTo(this.x + this.w, this.y);
                this.context.lineTo(this.x + this.w, this.y + this.h);
                this.context.lineTo(this.x, this.y + this.h);
                this.context.lineTo(this.x, this.y);
                this.context.lineWidth = 1;
                this.context.stroke();
                this.context.closePath();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
                if (this.checkMarker(x, y, this.x - this.marker_swift, this.y - this.marker_swift)) this.marker = 0;
                if (this.checkMarker(x, y, this.x + this.w + this.marker_swift, this.y - this.marker_swift)) this.marker = 1;
                if (this.checkMarker(x, y, this.x + this.w + this.marker_swift, this.y + this.h + this.marker_swift)) this.marker = 2;
                if (this.checkMarker(x, y, this.x - this.marker_swift, this.y + this.h + this.marker_swift)) this.marker = 3;
            };
            this.getNumberPosition = function () {
                return {
                    x: Math.min(this.x, this.x + this.w) + this.number.x - 15,
                    y: Math.min(this.y, this.y + this.h) + this.number.y - 20
                }
            };
            this.remove = function (context) {
                context.clearRect(this.x - 20, this.y - 20, this.w + 40, this.h + 40);
                this.removeNumber();
            }
        }

        ObText.prototype = ObTools;

        function ObTextArrow() {
            this.type = 'textarrow';
            this.store = [];
            this.number = {};
            this.index = -1;
            this.show = true;
            this.text = '';
            this.position = 2; //1, 2, 3, 4
            this.onArea = false;
            this.size = 12;
            this.family = 'Arial';

            this.x2 = 1;
            this.y2 = 1;
            this.x2Last = 1;
            this.y2Last = 1;

            this.xb1 = 0;
            this.yb1 = 0;
            this.xb2 = 0;
            this.yb2 = 0;
            this.xb1Last = 0;
            this.yb1Last = 0;
            this.xb2Last = 0;
            this.yb2Last = 0;

            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({
                    x: this.x,
                    y: this.y,
                    x2: this.x2,
                    y2: this.y2,
                    xb1: this.xb1,
                    yb1: this.yb1,
                    xb2: this.xb2,
                    yb2: this.yb2,
                    t: this.text
                });
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.x2Last = this.x2 = s.x2;
                    this.y2Last = this.y2 = s.y2;

                    this.xb1Last = this.xb1 = s.xb1;
                    this.yb1Last = this.yb1 = s.yb1;
                    this.xb2Last = this.xb2 = s.xb2;
                    this.yb2Last = this.yb2 = s.yb2;
                    this.text = s.t;
                }
            };
            this.setDefaultValue = function () {
                this.x2 = this.x + 5;
                this.y2 = this.y + 5;
                this.x2Last = this.x2;
                this.y2Last = this.y2;
            };
            this.draw = function (context) {
                if (!this.show) return;

                this.determineJointPosition();
                this.setJointPosition();

                this.context = context;
                this.context.beginPath();
                this.setDrawOptions();
                this.context.lineCap = "round";
                this.context.moveTo(this.x, this.y);
                this.context.lineTo(this.x2, this.y2);
                drawArrow(this.x, this.y, this.x2, this.y2, context, this.width);

                this.context.lineCap = "round";
                this.context.closePath();
                this.context.stroke();
                this.context.beginPath();
                this.context.fillStyle = '#ffee77';
                this.context.moveTo(this.xb2, this.yb2);
//                this.context.lineTo(this.xb2, this.yb2);
                this.context.lineTo(this.xb1, this.yb2);
                this.context.lineTo(this.xb1, this.yb1);
                this.context.lineTo(this.xb2, this.yb1);
                this.context.lineTo(this.xb2, this.yb2);

                this.context.closePath();
                this.context.fill();

                if (this.current && state.tool === TOOLS.EDIT && !state.move) {
                    this.createArea();
                } else {
                    if (this.current && textarea) {
                        textarea.blur();
                    }
                    this.drawTextArea();
                }

                if (this.current) this.drawMarks();

//                this.drawNumber();

            };
            this.saveText = function (value) {
                this.text = value;
                textarea.remove();
                textarea = null;
                this.store[this.store.length - 1].t = this.text;
                this.drawTextArea();
            };
            this.createArea = function () {
                var x = this.xb1 + 10;
                var y = this.yb1 + 10;
                var w = this.xb2 - this.xb1 - 20;
                var h = this.yb2 - this.yb1 - 20;

                if (textarea) {
                } else {
                    textarea = $('<textarea>', {
                        'class': 'sticker-text',
                        'wrap': 'physical',
                        'placeholder': chrome.i18n.getMessage("nimbusPlaceholderEnterText"),
                        'text': this.text
                    }).appendTo('#nsc_canvas');
                    var _textarrow = this;
                    textarea.blur(function (event) {
                        (function (v, s) {
                            // if (v == '') {
                            //     s.show = false;
                            // }
                            s.saveText(v);
                        })(this.value, _textarrow);
                    });
                    textarea.keydown(function (event) {
                        if (event.keyCode == 13 && event.ctrlKey) {
                            (function (v, s) {
                                // if (v == '') {
                                //     s.show = false;
                                // }
                                s.saveText(v);
                            })(this.value, _textarrow);
                        }
                    });
                }

                textarea.css({
                    'width': w + 'px',
                    'height': h + 'px',
                    'top': y,
                    'left': x,
                    'font-size': this.size + 'px',
                    'font-family': this.family
                });

                textarea.focus();

            };
            this.drawTextArea = function () {
                var w = this.xb2 - this.xb1 - 20;
                var h = this.yb2 - this.yb1 - 20;

                this.context.save();
                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext("2d");
                ctx.fillStyle = 'black';
                ctx.textBaseline = "top";
                ctx.textAlign = "center";
                ctx.font = this.size + 'px ' + this.family;
                ctx.shadowColor = 'transparent';

                wrapText(ctx, this.text, 0, 0, w, w / 2 + this.size / 5, -1, this.size);

                this.context.shadowColor = 'transparent';
                this.context.drawImage(canvas, this.xb1 + 10, this.yb1 + 10);
                this.context.restore();
            };
            this.drawMarks = function () {
                this.drawMark(this.x, this.y);
                this.drawMark(this.x2, this.y2);
                this.drawMark(this.xb1, this.yb1);
                this.drawMark(this.xb2, this.yb1);
                this.drawMark(this.xb1, this.yb2);
                this.drawMark(this.xb2, this.yb2);
            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;
                var w = this.width / 1.5;
                if (w < 5) w = 5;

                if ((x >= Math.min(this.x, this.x2) && x <= Math.max(this.x, this.x2) && y >= Math.min(this.y, this.y2) && y <= Math.max(this.y, this.y2))) {
                    var a = Math.pow(((this.x - this.x2) * (this.x - this.x2) + (this.y - this.y2) * (this.y - this.y2)), 0.5);
                    var b = Math.pow(((this.x - x) * (this.x - x) + (this.y - y) * (this.y - y)), 0.5);
                    var c = Math.pow(((x - this.x2) * (x - this.x2) + (y - this.y2) * (y - this.y2)), 0.5);
                    var p = (a + b + c) / 2;
                    var S = Math.pow((p * (p - a) * (p - b) * (p - c)), 0.5);
                    var h = 2 * S / a;
                    if (h <= w) return true;
                }
                return (x >= this.xb1 && x <= this.xb2 && y >= this.yb1 && y <= this.yb2);
            };
            this.move = function (dx, dy) {
                if (this.marker == 1 || (this.marker == -1 && !this.onArea)) {
                    this.x2 = this.x2Last + dx;
                    this.y2 = this.y2Last + dy;
                }
                if (this.marker == -1 || this.marker == 0) {
                    this.x = this.xLast + dx;
                    this.y = this.yLast + dy;

                    this.xb1 = this.xb1Last + dx;
                    this.yb1 = this.yb1Last + dy;
                    this.xb2 = this.xb2Last + dx;
                    this.yb2 = this.yb2Last + dy;
                }

                if (this.marker == 2 || this.marker == 4) {
                    this.xb1 = this.xb1Last + dx;
                    if ((this.xb2 - this.xb1) < 33) {
                        this.xb1 = this.xb2 - 33;
                    }
                }

                if (this.marker == 2 || this.marker == 3) {
                    this.yb1 = this.yb1Last + dy;
                    if ((this.yb2 - this.yb1) < 33) {
                        this.yb1 = this.yb2 - 33;
                    }
                }

                if (this.marker == 3 || this.marker == 5) {
                    this.xb2 = this.xb2Last + dx;
                    if ((this.xb2 - this.xb1) < 33) {
                        this.xb2 = this.xb1 + 33;
                    }
                }

                if (this.marker == 4 || this.marker == 5) {
                    this.yb2 = this.yb2Last + dy;
                    if ((this.yb2 - this.yb1) < 33) {
                        this.yb2 = this.yb1 + 33;
                    }
                }

            };
            this.setJointPosition = function () {
                var x = this.xb1 + (this.xb2 - this.xb1) / 2;
                var y = this.yb1 + (this.yb2 - this.yb1) / 2;
                switch (this.position) {
                    case 1:
                        this.x = x;
                        this.y = this.yb1;
                        break;
                    case 2:
                        this.x = this.xb2;
                        this.y = y;
                        break;
                    case 3:
                        this.x = x;
                        this.y = this.yb2;
                        break;
                    case 4:
                        this.x = this.xb1;
                        this.y = y;
                        break;
                }
            };
            this.determineJointPosition = function () {
//                var x = this.xb1 + (this.xb2 - this.xb1) / 2;
//                var y = this.yb1 + (this.yb2 - this.yb1) / 2;

                if ((this.x2 >= this.xb1 && this.x2 <= this.xb2) || (this.y2 >= this.yb1 && this.y2 <= this.yb2)) {
                    if (this.y2 <= this.yb1) this.position = 1;
                    if (this.x2 >= this.xb2) this.position = 2;
                    if (this.y2 >= this.yb2) this.position = 3;
                    if (this.x2 <= this.xb1) this.position = 4;
                } else {
//                    var l,lmax = Infinity;
//
//                    l = this.getDistance(x, this.yb1);
//                    if ( l < lmax) {
//                        this.position = 1;
//                        lmax = l;
//                    }
//                    l = this.getDistance(this.xb2, y);
//                    if (l < lmax) {
//                        this.position = 2;
//                        lmax = l;
//                    }
//                    l = this.getDistance(x, this.yb2);
//                    if (l < lmax) {
//                        this.position = 3;
//                        lmax = l;
//                    }
//                    l = this.getDistance(this.xb1, y);
//                    if (l < lmax) {
//                        this.position = 4;
//                        lmax = l;
//                    }
                }

            };
            this.getDistance = function (x, y) {
                var xdiff = x - this.x2;
                var ydiff = y - this.y2;
                return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.x2Last = this.x2;
                this.y2Last = this.y2;

                this.xb1Last = this.xb1;
                this.yb1Last = this.yb1;
                this.xb2Last = this.xb2;
                this.yb2Last = this.yb2;
                this.moveEndNumber();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;

                this.onArea = x >= this.xb1 && x <= this.xb2 && y >= this.yb1 && y <= this.yb2;

                if (this.checkMarker(x, y, this.x, this.y)) this.marker = 0;
                if (this.checkMarker(x, y, this.x2, this.y2)) this.marker = 1;

                if (this.checkMarker(x, y, this.xb1, this.yb1)) this.marker = 2;
                if (this.checkMarker(x, y, this.xb2, this.yb1)) this.marker = 3;
                if (this.checkMarker(x, y, this.xb1, this.yb2)) this.marker = 4;
                if (this.checkMarker(x, y, this.xb2, this.yb2)) this.marker = 5;

            };
            this.getNumberPosition = function () {
                return {x: this.xb1 + this.number.x - 15, y: this.yb1 + this.number.y - 15}
            };
            this.remove = function (context) {
                var x1 = Math.min(this.x, this.x2);
                var y1 = Math.min(this.y, this.y2);
                var x2 = Math.max(this.x, this.x2);
                var y2 = Math.max(this.y, this.y2);
                context.clearRect(x1 - 80, y1 - 80, x2 - x1 + 160, y2 - y1 + 160);
                context.clearRect(this.xb1 - 20, this.yb1 - 20, this.xb2 - this.xb1 + 40, this.yb2 - this.yb1 + 40);

                this.removeNumber();
            }
        }

        ObTextArrow.prototype = ObTools;

        function ObNumber() {
            this.x = 0;
            this.y = 0;
            this.xLast = 0;
            this.yLast = 0;
            this.R = 22;
            this.show = true;
            this.index = -1;
            this.type = 'number';
            this.store = [];
            this.number = 1;
            this.undo = function () {
                this.index--;
                if (this.index < 0) {
                    this.show = false;
                } else {
                    this.show = true;
                    this.readStore();
                }
            };
            this.redo = function () {
                this.index++;
                if (this.index > -1) {
                    this.show = true;
                    this.readStore();
                } else {
                    this.show = false;
                }
            };
            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                }
            };

            this.draw = function (context) {
                if (!this.show) return;

                this.context = context;
                this.context.beginPath();
                this.context.arc(this.x, this.y, this.R, 0, 2 * Math.PI, false);
                this.context.fillStyle = 'red';
                this.context.fill();

                this.context.fillStyle = 'white';
                this.context.textBaseline = "middle";
                this.context.textAlign = "center";
                this.context.font = '26px Arial';
                this.context.shadowColor = 'transparent';
                this.context.fillText(this.number, this.x, this.y);
            };
            this.setDefaultValue = function () {

            };
            this.getNumberPosition = function () {
                return false;
            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;

                var xC = this.x, yC = this.y, w = this.width / 1.5, R;
                if (w < 5) w = 5;
                R = this.R + w;
                var point = (xC - x) * (xC - x) + (yC - y) * (yC - y);

                return (point <= R * R);
            };
            this.move = function (dx, dy) {
                switch (this.marker) {
                    case 0:
                        this.R = Math.max(Math.abs(this.RLast - dx), Math.abs(this.RLast - dy));
                        break;
                    case 1:
                        this.R = Math.max(Math.abs(this.RLast + dx), Math.abs(this.RLast - dy));
                        break;
                    case 2:
                        this.R = Math.max(Math.abs(this.RLast + dx), Math.abs(this.RLast + dy));
                        break;
                    case 3:
                        this.R = Math.max(Math.abs(this.RLast - dx), Math.abs(this.RLast + dy));
                        break;
                    default :
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                }
            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.RLast = this.R;
                this.moveEndNumber();
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
            };
            this.remove = function (context) {
                context.clearRect(this.x - this.R - 20, this.y - this.R - 20, this.R * 2 + 40, this.R * 2 + 40);
            };

        }

        ObNumber.prototype = ObTools;

        function ObImage(data) {
            this.w = 0;
            this.h = 0;
            this.wLast = 0;
            this.hLast = 0;
            this.data = data || null;
            this.show = true;
            this.index = -1;
            this.type = 'img';
            this.store = [];
            this.number = number();
            this.saveStore = function () {
                this.index++;
            };

            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y, w: this.w, h: this.h});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                    this.wLast = this.w = s.w;
                    this.hLast = this.h = s.h;
                }
            };
            this.draw = function (context) {
                if (!this.show)return;
                this.context = context;
                this.context.beginPath();

                var dx = this.w / this.data.width;
                var dy = this.h / this.data.height;

                var canvas = document.createElement('canvas');
                canvas.width = this.data.width;
                canvas.height = this.data.height;
                canvas.getContext('2d').putImageData(this.data, 0, 0);

                this.setDrawOptions();
                this.context.save();
                this.context.scale(dx, dy);
                this.context.drawImage(canvas, this.x / dx, this.y / dy);
                this.context.restore();

                if (this.current) this.drawMarks();

                this.drawNumber();
            };
            this.includesPoint = function (x, y) {
                if (!this.show || this.lock) return false;

                var x1 = Math.min(this.x, this.x + this.w);
                var y1 = Math.min(this.y, this.y + this.h);
                var x2 = Math.max(this.x, this.x + this.w);
                var y2 = Math.max(this.y, this.y + this.h);

                return (x >= x1 && x <= x2 && y >= y1 && y <= y2);
            };
            this.move = function (dx, dy) {
                switch (this.marker) {
                    case 0:
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                        this.w = this.wLast - dx;
                        this.h = this.hLast - dy;
                        break;
                    case 1:
                        this.y = this.yLast + dy;
                        this.w = this.wLast + dx;
                        this.h = this.hLast - dy;
                        break;
                    case 2:
                        this.w = this.wLast + dx;
                        this.h = this.hLast + dy;
                        break;
                    case 3:
                        this.x = this.xLast + dx;
                        this.w = this.wLast - dx;
                        this.h = this.hLast + dy;
                        break;
                    default :
                        this.x = this.xLast + dx;
                        this.y = this.yLast + dy;
                }

                if (this.marker >= 0) {
                    if (this.x > (this.xLast + this.wLast - 5)) {
                        this.x = this.xLast + this.wLast - 5;
                    }
                    if (this.y > (this.yLast + this.hLast - 5)) {
                        this.y = this.yLast + this.hLast - 5;
                    }

                    if (this.w < 5) {
                        this.w = 5;
                    }
                    if (this.h < 5) {
                        this.h = 5;
                    }
                }
            };
            this.moveEnd = function () {
                this.xLast = this.x;
                this.yLast = this.y;
                this.wLast = this.w;
                this.hLast = this.h;
                this.moveEndNumber();
            };
            this.drawMarks = function () {
                this.drawMark(this.x, this.y);
                this.drawMark(this.x, this.y + this.h);
                this.drawMark(this.x + this.w, this.y);
                this.drawMark(this.x + this.w, this.y + this.h);
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
                if (this.checkMarker(x, y, this.x, this.y)) this.marker = 0;
                if (this.checkMarker(x, y, this.x + this.w, this.y)) this.marker = 1;
                if (this.checkMarker(x, y, this.x + this.w, this.y + this.h)) this.marker = 2;
                if (this.checkMarker(x, y, this.x, this.y + this.h)) this.marker = 3;
            };
            this.setElProperties = function () {
            };
            this.getNumberPosition = function () {
                return {
                    x: Math.min(this.x, this.x + this.w) + this.number.x - 15,
                    y: Math.min(this.y, this.y + this.h) + this.number.y - 20
                }
            };
            this.remove = function (context) {
                var x1 = Math.min(this.x, this.x + this.w);
                var y1 = Math.min(this.y, this.y + this.h);
                var x2 = Math.max(this.x, this.x + this.w);
                var y2 = Math.max(this.y, this.y + this.h);
                context.clearRect(x1 - 10, y1 - 10, x2 - x1 + 20, y2 - y1 + 20);
                this.removeNumber();
            }
        }

        ObImage.prototype = ObTools;

        function ObNoEdit(data) {
            this.x = Infinity;
            this.y = Infinity;
            this.xLast = 0;
            this.yLast = 0;
            this.x2 = 0;
            this.y2 = 0;
            this.imgData = data || null;
            this.show = true;
            this.index = -1;
            this.type = '';
            this.store = [];
            this.undo = function () {
                this.index--;
                if (this.index < 0) {
                    this.show = false;
                } else {
                    this.show = true;
                    this.readStore();
                }
            };
            this.redo = function () {
                this.index++;
                if (this.index > -1) {
                    this.show = true;
                    this.readStore();
                } else {
                    this.show = false;
                }
            };
            this.saveStore = function () {
                this.index++;
                var l = this.store.length;
                this.store.splice(this.index, l - this.index);
                this.store.push({x: this.x, y: this.y});
            };
            this.readStore = function () {
                if (this.index > -1 && this.index < this.store.length) {
                    var s = this.store[this.index];
                    this.xLast = this.x = s.x;
                    this.yLast = this.y = s.y;
                }
            };
            this.draw = function (context) {
                if (!this.show)return;
                this.context = context;
                this.context.beginPath();
                this.context.shadowColor = 'transparent';
                var canvas = document.createElement('canvas');
                canvas.width = this.imgData.width;
                canvas.height = this.imgData.height;
                canvas.getContext('2d').putImageData(this.imgData, 0, 0);

                this.context.drawImage(canvas, this.x - 30, this.y - 30);
            };
            this.includesPoint = function (x, y) {
                if (this.type === 'blur' || this.type === 'blur_all' || this.type === 'pen') return false;
                if (x > this.x && x < this.x2 && y > this.y && y < this.y2) {
                    var xc = x - this.x + 30;
                    var yc = y - this.y + 30;
                    var n = (yc * this.imgData.width + xc) * 4;
                    if (this.imgData.data[n + 3] > 20) {
                        return true;
                    }
                }
                return false;
            };
            this.move = function (dx, dy) {
                this.x = this.xLast + dx;
                this.y = this.yLast + dy;
            };
            this.moveEnd = function () {
                this.x2 += this.x - this.xLast;
                this.y2 += this.y - this.yLast;
                this.xLast = this.x;
                this.yLast = this.y;
            };
            this.checkMarkers = function (x, y) {
                this.marker = -1;
            };
            this.setCursor = function (x, y) {
                var canva = $('#nsc_canvas');
                canva.css("cursor", "default");
                if (this.includesPoint(x, y)) {
                    canva.css("cursor", "move");
                }
            };
            this.checkNumber = function () {
                return false;
            };
            this.remove = function (context) {
                context.clearRect(this.x - 80, this.y - 80, this.x2 - this.xLast + 160, this.y2 - this.yLast + 160);
            }
        }

        // ************  end Objects ***************//

        var clone = function (obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        };

        var drawStart = function (event) {
            window.onmousemove = draw;
            // event.preventDefault();
            state.moved = false;
            state.created = false;
            state.drawing = false;
            resetHistory();
            currentObject = {};

            state.startDrawX = Math.floor((event.pageX - $(canvas.current.canvas).offset().left) / kzoom);
            state.startDrawY = Math.floor((event.pageY - $(canvas.current.canvas).offset().top) / kzoom);

            if (!objects[currentN]) currentN = objects.length - 1;

            if (state.tool === TOOLS.TEXT) {
                event.preventDefault();
            }

            if (currentN >= 0 && state.tool === TOOLS.EDIT) {
                objects[currentN].checkMarkers(state.startDrawX, state.startDrawY);
                setColorProperty(state.strokeColor);
                setWidthProperty(state.lineThickness);
                setFillColorProperty(state.fillColor);
                setFontProperty(state.fontSize, state.fontFamily);
                if (objects[currentN].marker >= 0) {
                    state.move = true;
                    drawNoCurrent();
                    return;
                }
                if (objects[currentN].checkNumber(state.startDrawX, state.startDrawY)) {
                    state.move = true;
                    drawNoCurrent();
                    return;
                }
            }
            if (textarea) {
                textarea.blur();
            }
            checkObject(state.startDrawX, state.startDrawY);

            if (currentN >= 0) {
                setEditTools();
                state.move = true;

                if (!('imgData' in objects[currentN])) {
                    objects[currentN].setElProperties();
                }

                drawNoCurrent();
                return;
            }
            if (state.tool === TOOLS.EDIT) {
                currentN = -1;
                state.tool = state.lasttools;

                if (state.tool === TOOLS.STICKER || state.tool === TOOLS.TEXT) {
                    state.drawing = false;
                    return;
                }

                // if(state.tool === TOOLS.BLUR_OTHER) {
                //     state.created = true;
                // }
            }

            canvas.current.context.lineWidth = state.lineThickness;

            points.push([state.startDrawX, state.startDrawY]);

            if (state.shadow.enable) {
                canvas.current.context.shadowColor = state.shadow.color;
                canvas.current.context.shadowBlur = state.shadow.blur;
                canvas.current.context.shadowOffsetX = 1;
                canvas.current.context.shadowOffsetY = 1;
            } else {
                canvas.current.context.shadowColor = 'transparent';
            }

            canvas.current.context.fillStyle = state.strokeColor;
            canvas.current.context.strokeStyle = state.strokeColor;

            $(document).trigger('redactor_set_tools', self.getTools());

            switch (state.tool) {
                case TOOLS.EMPTY_CIRCLE:
                    currentObject = new ObCircle();
                    break;
                case TOOLS.EMPTY_RECTANGLE:
                    currentObject = new ObRectangle();
                    break;
                case TOOLS.ROUNDED_RECTANGLE:
                    currentObject = new ObRoundedRectangle();
                    break;
                case TOOLS.ELLIPSE:
                    currentObject = new ObEllipse();
                    break;
                case TOOLS.LINE:
                    currentObject = new ObLine();
                    break;
                case TOOLS.LINE_DOTTED:
                    currentObject = new ObNoEdit();
                    currentObject.type = 'line_dotted';
                    break;
                case TOOLS.ARROW:
                    currentObject = new ObArrow();
                    break;
                case TOOLS.ARROW_DOUBLE:
                    currentObject = new ObArrowDouble();
                    break;
                case TOOLS.ARROW_CURVE:
                    currentObject = new ObNoEdit();
                    currentObject.type = 'arrow_curve';
                    break;
                case TOOLS.LINE_CURVE:
                    currentObject = new ObNoEdit();
                    currentObject.type = 'line_curve';
                    break;
                case TOOLS.HIGHLIGHT:
                    canvas.current.context.lineWidth = LS.setting.width * 4;
                    canvas.current.context.fillStyle = 'rgba(255, 255, 0, 0.5)';
                    canvas.current.context.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                case TOOLS.PEN:
                    currentObject = new ObNoEdit();
                    currentObject.type = 'pen';
                    points = [
                        {x: state.startDrawX, y: state.startDrawY}
                    ];
                    canvas.current.context.shadowColor = 'transparent';
                    canvas.current.context.beginPath();
                    canvas.current.context.arc(state.startDrawX, state.startDrawY, state.lineThickness / 2, 0, 2 * Math.PI, false);
                    canvas.current.context.fill();
                    state.created = true;
                    break;
                case TOOLS.STICKER:
                    currentObject = new ObSticker();
                    if (textarea) {
                        textarea.blur();
                    } else {
                        currentObject.x = state.startDrawX;
                        currentObject.y = state.startDrawY;
                        currentObject.arrowposition = {x: state.startDrawX, y: state.startDrawY};
                        currentObject.color = state.strokeColor;
                        currentObject.size = state.fontSize;
                        currentObject.family = state.fontFamily;
                        currentObject.draw(canvas.current.context);
                        state.created = true;
                    }
                    break;
                case TOOLS.TEXT:
                    currentObject = new ObText();
                    if (textarea) {
                        textarea.blur();
                    } else {
                        currentObject.setValue(state.startDrawX - 4, state.startDrawY - state.fontSize / 2, state.lineThickness, state.strokeColor);
                        currentObject.size = state.fontSize;
                        currentObject.family = state.fontFamily;
                        currentObject.h = state.fontSize * 2 + 4;
                        currentObject.current = true;
                        setEditTools();
                        currentN = objects.length;
                        currentObject.number.n = getNumber();
                        currentObject.shadow = $.extend({}, state.shadow);
                        currentObject.draw(canvas.current.context);
                        state.drawing = true;
                        state.created = true;
                        drawEnd(null);
                        return;
                    }
                    break;
                case TOOLS.TEXT_ARROW:
                    currentObject = new ObTextArrow();
                    currentObject.size = state.fontSize;
                    currentObject.family = state.fontFamily;
                    break;
                case TOOLS.NUMBER:
                    currentObject = new ObNumber();
                    currentObject.x = state.startDrawX;
                    currentObject.y = state.startDrawY;
                    for (var i = 0, l = objects.length; i < l; i++) {
                        if (objects[i].type == 'number' && objects[i].show) {
                            currentObject.number += 1;
                        }
                    }
                    currentObject.draw(canvas.current.context);
                    state.created = true;
                    break;
                case TOOLS.BLUR:
                    _this.mergeBg();
                    History.undoAll();
                    currentObject = new ObNoEdit();
                    currentObject.type = 'blur';
                    state.created = true;
                    break;
                case TOOLS.BLUR_OTHER:
                    currentObject = new ObNoEdit();
                    currentObject.type = 'blur_all';
                    state.created = true;
                    break;
                case TOOLS.ERASER:
                    currentObject = new ObNoEdit();
                    break;
            }

            if ('imgData' in currentObject) {
                currentObject.x = state.startDrawX;
                currentObject.y = state.startDrawY;
                currentObject.xLast = state.startDrawX;
                currentObject.yLast = state.startDrawY;
                currentObject.x2 = state.startDrawX;
                currentObject.y2 = state.startDrawY;
            }
            if ('setValue' in currentObject && state.tool !== TOOLS.EDIT) {
                if (state.tool !== TOOLS.STICKER && state.tool !== TOOLS.TEXT_ARROW && state.tool !== TOOLS.NUMBER) {
                    currentObject.number.n = getNumber();
                }
                currentObject.setValue(state.startDrawX, state.startDrawY, state.lineThickness, state.strokeColor);
                currentObject.fillColor = state.fillColor;
            }
            currentObject.shadow = $.extend({}, state.shadow);
            canvas.current.context.beginPath();
            canvas.current.context.moveTo(state.startDrawX, state.startDrawY);
            state.drawing = true;
        };

        var draw = function (event) {

            var x = Math.floor((event.pageX - $(canvas.current.canvas).offset().left) / kzoom);
            var y = Math.floor((event.pageY - $(canvas.current.canvas).offset().top) / kzoom);

            if (state.startDrawX === x && state.startDrawY === y) {
                return true;
            }
            if (x < 0) {
                x = 0;
            } else if (x > canvas.common.width) {
                x = canvas.common.width
            }
            if (y < 0) {
                y = 0;
            } else if (y > canvas.common.height) {
                y = canvas.common.height;
            }
            if (state.drawing) {
                state.created = true;

                if ('imgData' in currentObject) {
                    if (currentObject.x > x) {
                        currentObject.x = x;
                        currentObject.xLast = x;
                    }
                    if (currentObject.y > y) {
                        currentObject.y = y;
                        currentObject.yLast = y;
                    }
                    if (currentObject.x2 < x) {
                        currentObject.x2 = x;
                    }
                    if (currentObject.y2 < y) {
                        currentObject.y2 = y;
                    }
                }

                switch (state.tool) {

                    case TOOLS.EMPTY_CIRCLE:

                        currentObject.remove(canvas.current.context);

                        var xdiff = x - state.startDrawX;
                        var ydiff = y - state.startDrawY;
                        var r = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);

                        currentObject.R = r;
                        currentObject.RLast = r;
                        currentObject.draw(canvas.current.context);

                        break;

                    case TOOLS.EMPTY_RECTANGLE:
                    case TOOLS.ROUNDED_RECTANGLE:
                    case TOOLS.ELLIPSE:

                        currentObject.remove(canvas.current.context);

                        var w = x - state.startDrawX;
                        var h = y - state.startDrawY;
                        if (event.shiftKey) {
                            if (Math.abs(x - state.startDrawX) < Math.abs(y - state.startDrawY)) {
                                w = Math.abs(h) * (w < 0 ? -1 : 1);
                            } else {
                                h = Math.abs(w) * (h < 0 ? -1 : 1);
                            }
                        }
                        currentObject.w = w;
                        currentObject.h = h;
                        currentObject.wLast = w;
                        currentObject.hLast = h;
                        currentObject.draw(canvas.current.context);

                        break;

                    case TOOLS.ARROW:
                    case TOOLS.ARROW_DOUBLE:
                    case TOOLS.LINE:

                        currentObject.remove(canvas.current.context);
                        canvas.current.context.lineCap = "butt";

                        if (event.shiftKey) {
                            if (Math.abs(x - state.startDrawX) < Math.abs(y - state.startDrawY)) {
                                x = state.startDrawX;
                            } else {
                                y = state.startDrawY;
                            }
                        }
                        currentObject.x2 = x;
                        currentObject.y2 = y;
                        currentObject.x2Last = x;
                        currentObject.y2Last = y;
                        currentObject.draw(canvas.current.context);

                        break;

                    case TOOLS.HIGHLIGHT:
                    case TOOLS.PEN:

                        canvas.current.context.lineCap = "round";

                        var onPaint = function () {

                            // Saving all the points in an array
                            points.push({x: x, y: y});

                            if (points.length < 3) {
                                var b = points[0];
                                canvas.current.context.beginPath();
                                //ctx.moveTo(b.x, b.y);
                                //ctx.lineTo(b.x+50, b.y+50);
                                canvas.current.context.arc(b.x, b.y, canvas.current.context.lineWidth / 2, 0, Math.PI * 2, !0);
                                canvas.current.context.fill();
                                canvas.current.context.closePath();

                                return;
                            }

                            // Tmp canvas is always cleared up before drawing.
                            currentObject.remove(canvas.current.context);

                            canvas.current.context.beginPath();
                            canvas.current.context.moveTo(points[0].x, points[0].y);

                            for (var i = 1; i < points.length - 2; i++) {
                                var c = (points[i].x + points[i + 1].x) / 2;
                                var d = (points[i].y + points[i + 1].y) / 2;

                                canvas.current.context.quadraticCurveTo(points[i].x, points[i].y, c, d);
                            }

                            // For the last 2 points
                            canvas.current.context.quadraticCurveTo(
                                points[i].x,
                                points[i].y,
                                points[i + 1].x,
                                points[i + 1].y
                            );
                            canvas.current.context.stroke();
                        };

                        onPaint();
                        break;
                    case TOOLS.ARROW_CURVE:
                    case TOOLS.LINE_DOTTED:
                    case TOOLS.LINE_CURVE:
                        canvas.current.context.lineCap = "round";

                        var l = points.length;
                        if ((Math.abs(points[l - 1][0] - x) > 3) || (Math.abs(points[l - 1][1] - y) > 3)) {
                            points.push([x, y]);

                            currentObject.remove(canvas.current.context);
                            canvas.current.context.beginPath();
                            if (state.tool === TOOLS.LINE_DOTTED) {
                                canvas.current.context.setLineDash([0.001, state.lineThickness * 2]);
                            }
                            canvas.current.context.moveTo(state.startDrawX, state.startDrawY);

                            for (var i = 2; i < l; i++) {
                                canvas.current.context.lineTo(points[i][0], points[i][1]);
                            }

                            canvas.current.context.lineTo(x, y);

                            if (l > 5 && state.tool === TOOLS.ARROW_CURVE) {
                                var x1 = (points[l - 6][0] + x) / 2;
                                var y1 = (points[l - 6][1] + y) / 2;
                                drawArrow((points[l - 3][0] + x1) / 2, (points[l - 3][1] + y1) / 2, x, y, canvas.current.context, state.lineThickness);
                            }

                            canvas.current.context.stroke();
                        }

                        break;

                    case TOOLS.ERASER:

                        canvas.background.context.beginPath();
                        canvas.background.context.arc(x, y, state.lineThickness * 2, 0, 2 * Math.PI, false);
                        canvas.background.context.clear();
                        break;

                    case TOOLS.BLUR:

                        canvas.current.context.shadowColor = 'transparent';
                        canvas.current.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
                        blurImage(state.startDrawX, state.startDrawY, x, y);

                        break;

                    case TOOLS.BLUR_OTHER:
                        canvas.current.context.shadowColor = 'transparent';
                        canvas.current.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
                        blurOther(state.startDrawX, state.startDrawY, x, y);
                        break;

                    case TOOLS.TEXT:
//                        canvas.current.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
//                        currentObject.x = x - 4;
//                        currentObject.y = y - (state.lineThickness * 5) / 2;
//                        currentObject.xLast = currentObject.x;
//                        currentObject.yLast = currentObject.y;
//                        currentObject.draw(canvas.current.context);
                        break;

                    case TOOLS.STICKER:
                        currentObject.remove(canvas.current.context);
                        currentObject.x = x;
                        currentObject.y = y;
                        currentObject.arrowposition = {x: x, y: y};
                        currentObject.xLast = x;
                        currentObject.yLast = y;
                        currentObject.draw(canvas.current.context);
                        break;

                    case TOOLS.TEXT_ARROW:
                        currentObject.remove(canvas.current.context);
                        currentObject.x2 = x;
                        currentObject.y2 = y;
                        currentObject.x2Last = x;
                        currentObject.y2Last = y;

                        currentObject.xb1Last = currentObject.xb1 = state.startDrawX - 280;
                        currentObject.yb1Last = currentObject.yb1 = state.startDrawY - 70;
                        currentObject.xb2Last = currentObject.xb2 = state.startDrawX;
                        currentObject.yb2Last = currentObject.yb2 = state.startDrawY + 70;

                        currentObject.draw(canvas.current.context);

                        canvas.current.context.lineCap = "butt";

                        break;

                    case TOOLS.NUMBER:
                        break;
                }

                scrollPage(event);

            } else {
                if (state.tool === TOOLS.EDIT) {
                    if (state.move) {
                        scrollPage(event);
                        objects[currentN].remove(canvas.current.context);
                        var dx = x - state.startDrawX;
                        var dy = y - state.startDrawY;
                        if (objects[currentN].number && objects[currentN].number.active) {
                            objects[currentN].moveNumber(dx, dy);
                        } else {
                            objects[currentN].move(dx, dy, event.shiftKey);
                        }
                        objects[currentN].draw(canvas.current.context);
                        state.moved = true;
                    }
                }
            }
        };

        var drawCursor = function (event) {

            if (!state.drawing) {

                var x = Math.floor((event.pageX - $(canvas.current.canvas).offset().left) / kzoom);
                var y = Math.floor((event.pageY - $(canvas.current.canvas).offset().top) / kzoom);

                if (state.tool === TOOLS.EDIT) {
                    if (!state.move) {
                        objects[currentN].setCursor && objects[currentN].setCursor(x, y);
                    }
                } else {
                    textarea && textarea.blur();
                    checkObject(x, y);
                    canvas.current.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
                    if (currentN > -1) {
                        objects[currentN].draw(canvas.current.context);
                    }
                }
            }
        };

        var drawEnd = function (event) {
            if (state.drawing) {
                state.drawing = false;

                if ('imgData' in currentObject) {
                    if (state.tool !== TOOLS.BLUR_OTHER) {
                        var x = currentObject.x - 30;
                        var y = currentObject.y - 30;
                        var w = currentObject.x2 - currentObject.x + 60;
                        var h = currentObject.y2 - currentObject.y + 60;
                    } else {
                        currentObject.type = 'blur_all';
                        currentObject.x = 0;
                        currentObject.y = 0;
                        currentObject.xLast = 0;
                        currentObject.yLast = 0;
                        x = -30;
                        y = -30;
                        w = canvas.common.width + 60;
                        h = canvas.common.height + 60;
                    }
                    currentObject.imgData = canvas.current.context.getImageData(x, y, w, h);
                } else {
                    currentObject.current = true;
                    setEditTools();
                    currentN = objects.length;
                }
                if (state.created) {
                    objects.push(currentObject);
                    saveHistory();
                } else {
                    currentN = -1;
                    currentObject = {};
                    state.tool = state.lasttools;
                }
            }
            if (state.move) {
                state.move = false;
                if (state.moved) {
                    objects[currentN].moveEnd();
                    saveHistory();
                }
                if (objects[currentN].marker !== undefined) objects[currentN].marker = -1;
            }

            canvas.current.context.setLineDash([]);
            canvas.current.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
            drawAll();
            points = [];
            window.onmousemove = null;
            clearTimeout(timer.up);
            clearTimeout(timer.bottom);
            clearTimeout(timer.right);
            clearTimeout(timer.left);
        };

        var getNumber = function () {
            var nmax = maxNumber;
            var n = 0;
            for (var i = 0, l = objects.length; i < l; i++) {
                n = objects[i].number;
                if (objects[i].show && n && n.n && (n.n > nmax)) nmax = n.n;
            }
            return ++nmax;
        };

        var scrollPage = function (event) {
            var clientY = event.clientY,
                clientX = event.clientX,
                restY = window.innerHeight - clientY,
                restX = window.innerWidth - clientX,
                scrollTop = window.pageYOffset,
                scrollLeft = window.pageXOffset;
            if (clientY < 50) scrollTop -= 50;
            if (clientX < 50) scrollLeft -= 50;
            if (restY < 50) scrollTop += 50 - restY;
            if (restX < 50) scrollLeft += 50 - restX;

            window.scrollTo(scrollLeft, scrollTop);
        };

        var resetHistory = function () {
            var l, k = [], n = objects.length;
            for (l = 0; l < n; l++) {
                if (!objects[l].show) {
                    k.push(l);
                }
            }
            if (k[0] !== undefined) {
                objects.splice(k[0], k.length);
            }
            if (canvas.cache.action === 'undo') {
                canvas.cache = {};
            }

        };

        var saveHistory = function () {
            History.index++;
            History.max = History.index;
            History.setButton();

//            resetHistory();

            var l, n = objects.length;
            for (l = 0; l < n; l++) {
                objects[l].saveStore && objects[l].saveStore();
            }

        };

        var checkObject = function (x, y) {
            $('#nsc_canvas').css("cursor", getDefaultCursor());

            currentN = -1;
            var l, n = objects.length - 1;
            for (l = n; l >= 0; l--) {
                objects[l].current = false;
            }
            for (l = n; l >= 0; l--) {
                if (objects[l].checkNumber(x, y)
                    || objects[l].includesPoint(x, y)) {
                    if (state.lock && n != l) {
                        break;
                    }
                    objects[l].current = true;
                    currentN = l;
                    objects[l].setCursor(x, y);
                    return true;
                }
            }
            return false;
        };

        var setEditTools = function () {
            if (state.tool !== TOOLS.EDIT) state.lasttools = state.tool;
            state.tool = TOOLS.EDIT;


            if (currentN >= 0) {
                showFontSettings(objects[currentN])
            }
        };

        var getDefaultCursor = function () {
            if (state.tool === TOOLS.BLUR || state.tool === TOOLS.BLUR_OTHER) {
                return "crosshair";
            }
            if (state.tool === TOOLS.TEXT) {
                return "text";
            }
            if (state.tool === TOOLS.PEN || state.tool === TOOLS.HIGHLIGHT) {
                return "url(images/pencil.cur), auto";
            }
            return "default";
        };

        var drawNoCurrent = function () {
            canvas.background.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
            objects[currentN].draw(canvas.current.context);
            for (var i = 0, l = objects.length; i < l; i++) {
                if (currentN !== i) {
                    objects[i].draw(canvas.background.context);
                }
            }
        };

        var drawAll = function () {
            canvas.background.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
            for (var i = 0, l = objects.length; i < l; i++) {
                objects[i].draw && objects[i].draw(canvas.background.context);
            }
        };

        var calculateArrowCoordinates = function (startX, startY, endX, endY, arrowWidth) {
            var arrowHeight = arrowWidth * 2;
            var p1 = function () {
                var x = startX - endX;
                var y = startY - endY;
                var hypotenuse = Math.sqrt(x * x + y * y);
                hypotenuse = (hypotenuse == 0 ? arrowHeight : hypotenuse) / 2;
                var dx = x / hypotenuse * arrowHeight;
                var dy = y / hypotenuse * arrowHeight;
                return {x: endX + dx, y: endY + dy};
            };

            var p2 = function (p1, direct) {
                var x = p1.x - startX;
                var y = p1.y - startY;
                var hypotenuse = Math.sqrt(x * x + y * y);
                hypotenuse = (hypotenuse == 0 ? arrowHeight : hypotenuse) / 2;
                var dx = (y / hypotenuse * arrowWidth) * direct;
                var dy = (x / hypotenuse * arrowWidth) * direct;
                return {x: p1.x + dx, y: p1.y - dy}
            };

            return {p1: p2(p1(), 1), p2: p2(p1(), -1)};
        };

        var drawArrow = function (x1, y1, x2, y2, context, w) {
            var arrowCoordinates = calculateArrowCoordinates(x1, y1, x2, y2, w);

            var xb1 = (arrowCoordinates.p1.x + x2) / 2;
            var yb1 = (arrowCoordinates.p1.y + y2) / 2;
            var xb2 = (arrowCoordinates.p2.x + x2) / 2;
            var yb2 = (arrowCoordinates.p2.y + y2) / 2;

            var xb3 = (xb1 + x2) / 2;
            var yb3 = (yb1 + y2) / 2;
            var xb4 = (xb2 + x2) / 2;
            var yb4 = (yb2 + y2) / 2;

            var xb5 = (arrowCoordinates.p1.x + xb1) / 2;
            var yb5 = (arrowCoordinates.p1.y + yb1) / 2;
            var xb6 = (arrowCoordinates.p2.x + xb2) / 2;
            var yb6 = (arrowCoordinates.p2.y + yb2) / 2;

            context.moveTo(x2, y2);
            context.lineTo(arrowCoordinates.p2.x, arrowCoordinates.p2.y);
            context.lineTo(arrowCoordinates.p1.x, arrowCoordinates.p1.y);
            context.lineTo(x2, y2);
            context.lineTo(arrowCoordinates.p2.x, arrowCoordinates.p2.y);

            context.bezierCurveTo(xb6, yb6, xb5, yb5, arrowCoordinates.p1.x, arrowCoordinates.p1.y);
            context.bezierCurveTo(xb1, yb1, xb2, yb2, arrowCoordinates.p2.x, arrowCoordinates.p2.y);
            context.bezierCurveTo(xb4, yb4, xb3, yb3, arrowCoordinates.p1.x, arrowCoordinates.p1.y);
            context.lineJoin = 'miter';
            context.lineCap = 'butt';
        };

//        var lineH = function(context, text, maxWidth, maxHeight, marginLeft, marginTop, lineHeight) {
//            context.font = lineHeight + 'px Arial';
//            var lines = text.replace('\r', '').split('\n');
//            var countWords = lines.length;
//            var max = 0;
//
//            for (var i = 0; i < countWords; i++) {
//
//                var word = lines[i].split(/\s+/g);
//                var countWord = word.length;
//                var line = "";
//                for (var n = 0; n < countWord; n++) {
//                    var m = context.measureText(word[n]).width;
//                    if (m > max) max = m;
//                    var testLine = line + word[n] + " ";
//                    var testWidth = context.measureText(testLine).width;
//                    if (testWidth > maxWidth && n !== 0) {
//                        marginTop += lineHeight;
//                    } else {
//                        line = testLine;
//                    }
//                }
//                marginTop += lineHeight;
//            }
//
//            if (max > maxWidth) {
//                return lineHeight - 5;
//            } else if (marginTop > maxHeight) {
//                return lineHeight - 10;
//            } else if (marginTop * 1.5 < maxHeight) {
//                return lineHeight + 10;
//            }
//
//            return lineHeight;
//
//        };

        var wrapText = function (context, text, x, y, maxWidth, marginLeft, marginTop, lineHeight) {

            var lines = text.replace('\r', '').split('\n');

            var countWords = lines.length;
            for (var i = 0; i < countWords; i++) {

                var word_pre = lines[i].split(/\s+/g);
                var word = [];
                var countWord = word_pre.length;
                var line = "";
                for (var k = 0; k < countWord; k++) {
                    if (context.measureText(word_pre[k]).width > maxWidth) {
                        word = word.concat(word_pre[k].split(/(?=(?:.{10})+$)/));
                    } else {
                        word.push(word_pre[k])
                    }
                }
                countWord = word.length;

                for (var n = 0; n < countWord; n++) {
                    var testLine = line + word[n] + " ";
                    var testWidth = context.measureText(testLine).width;
                    if (testWidth > maxWidth) {
                        context.fillText(line, x + marginLeft, y + marginTop);
                        line = word[n] + " ";
                        marginTop += +lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                context.fillText(line, x + marginLeft, y + marginTop);

                marginTop += +lineHeight;
            }

        };

        var blurImage = function (startX, startY, endX, endY) {
            var x = startX < endX ? startX : endX;
            var y = startY < endY ? startY : endY;
            var width = Math.abs(endX - startX);
            var height = Math.abs(endY - startY);

            if (width > 4 && height > 4) {
                var imageData = canvas.fon.context.getImageData(x, y, width, height);
                imageData = blurData(imageData, 4);
                canvas.current.context.putImageData(imageData, x, y)
            }
        };

        var blurAll = function () {
            blur = canvas.fon.context.getImageData(0, 0, canvas.common.width, canvas.common.height);
            blur = blurData(blur, 3);
            canvas.current.context.putImageData(blur, 0, 0);
        };

        var blurOther = function (startX, startY, endX, endY) {
            var x = startX < endX ? startX : endX;
            var y = startY < endY ? startY : endY;
            var width = Math.abs(endX - startX);
            var height = Math.abs(endY - startY);
            // canvas.current.context.putImageData(blur, 0, 0);

            if (width > 0 && height > 0) {
                canvas.current.context.drawImage(canvas.fon.canvas, x, y, width, height, x, y, width, height);
                canvas.current.context.lineWidth = 1;
                canvas.current.context.strokeStyle = '#999';
                canvas.current.context.strokeRect(x + 0.5, y + 0.5, width, height);
            }

            blur = canvas.current.context.getImageData(0, 0, canvas.common.width, canvas.common.height);
        };

        var blurData = function (img, passes) {
            var i, j, k, n, w = img.width, h = img.height, im = img.data, rounds = passes || 0, pos = step = jump = inner = outer = arr = 0;
            var outer, inner, step, jump, arr;

            for (n = 0; n < rounds; n++) {
                for (var m = 0; m < 2; m++) {
                    if (m) {

                        outer = w;
                        inner = h;
                        step = w * 4;
                    } else {

                        outer = h;
                        inner = w;
                        step = 4;
                    }
                    for (i = 0; i < outer; i++) {
                        jump = m === 0 ? i * w * 4 : 4 * i;
                        for (k = 0; k < 3; k++) {
                            pos = jump + k;
                            arr = 0;

                            arr = im[pos] + im[pos + step] + im[pos + step * 2];
                            im[pos] = Math.floor(arr / 3);

                            arr += im[pos + step * 3];
                            im[pos + step] = Math.floor(arr / 4);

                            arr += im[pos + step * 4];
                            im[pos + step * 2] = Math.floor(arr / 5);
                            for (j = 3; j < inner - 2; j++) {
                                arr = Math.max(0, arr - im[pos + (j - 2) * step] + im[pos + (j + 2) * step]);
                                im[pos + j * step] = Math.floor(arr / 5);
                            }
                            arr -= im[pos + (j - 2) * step];
                            im[pos + j * step] = Math.floor(arr / 4);
                            arr -= im[pos + (j - 1) * step];
                            im[pos + (j + 1) * step] = Math.floor(arr / 3);
                        }
                    }
                }
            }
            return img;
        };

        var nativeSupport = function () {
            var el = document.createElement('canvas');
            return el.getContext != undefined;
        };

        this.initialize = function (options) {

            settings = $.extend({}, defaults, options);

            $(this).css("position", "relative");

            canvas.common.width = $(this).width();
            canvas.common.height = $(this).height();
            canvas.common.container = this;

            canvas.fon.canvas = document.createElement('canvas');
            $(canvas.fon.canvas).attr("width", canvas.common.width).attr("height", canvas.common.height).attr("id", 'canvasfon').css("position", "absolute").css("top", "0px").css("left", "0px").css("zIndex", 0);

            canvas.background.canvas = document.createElement('canvas');
            $(canvas.background.canvas).attr("width", canvas.common.width).attr("height", canvas.common.height).attr("id", 'canvasbg').css("position", "absolute").css("top", "0px").css("left", "0px").css("zIndex", 0);

            canvas.current.canvas = document.createElement('canvas');
            $(canvas.current.canvas).attr("width", canvas.common.width).attr("height", canvas.common.height).attr("id", 'canvascurrent').css("position", "absolute").css("top", "0px").css("left", "0px").css("zIndex", 1);

            $(this).append(canvas.fon.canvas);
            $(this).append(canvas.background.canvas);
            $(this).append(canvas.current.canvas);

            if (typeof FlashCanvas != "undefined") {
                FlashCanvas.initElement(canvas.background.canvas);
                FlashCanvas.initElement(canvas.current.canvas);
            }

            canvas.fon.context = canvas.fon.canvas.getContext('2d');
            canvas.background.context = canvas.background.canvas.getContext('2d');
            canvas.current.context = canvas.current.canvas.getContext('2d');

            $(canvas.current.canvas).bind('mousedown', drawStart);
            $(canvas.current.canvas).bind('mousemove', drawCursor);
            $(canvas.current.canvas).bind('mouseup', drawEnd);

            return this;
        };

        this.getTools = function () {
            var key;
            for (key in TOOLS) {
                if (TOOLS[key] == state.tool) {
                    break;
                }
            }

            return key;
        };

        this.setTool = function (key) {
            state.tool = TOOLS[key];
        };

        this.toolDefault = function () {
            state.tool = '';
            showFontSettings(null, true);
        };

        this.activatePen = function () {
            state.tool = TOOLS.PEN;
            showFontSettings(false);
        };
        this.activateHighlight = function () {
            state.tool = TOOLS.HIGHLIGHT;
            showFontSettings(false);
        };
        this.activateEraser = function () {
            state.tool = TOOLS.ERASER;
            showFontSettings(false);
        };
        this.activateEmptyCircle = function () {
            state.tool = TOOLS.EMPTY_CIRCLE;
            showFontSettings(false);
        };
        this.activateCircle = function () {
            state.tool = TOOLS.CIRCLE;
            showFontSettings(false);
        };
        this.activateEmptyRectangle = function () {
            state.tool = TOOLS.EMPTY_RECTANGLE;
            showFontSettings(false);
        };
        this.activateRectangle = function () {
            state.tool = TOOLS.RECTANGLE;
            showFontSettings(false);
        };
        this.activateRoundedRectangle = function () {
            state.tool = TOOLS.ROUNDED_RECTANGLE;
            showFontSettings(false);
        };
        this.activateEllipse = function () {
            state.tool = TOOLS.ELLIPSE;
            showFontSettings(false);
        };
        this.activateLine = function () {
            state.tool = TOOLS.LINE;
            showFontSettings(false);
        };
        this.activateCurveLine = function () {
            state.tool = TOOLS.LINE_CURVE;
            showFontSettings(false);
        };
        this.activateDottedLine = function () {
            state.tool = TOOLS.LINE_DOTTED;
            showFontSettings(false);
        };
        this.activateArrow = function () {
            state.tool = TOOLS.ARROW;
            showFontSettings(false);
        };
        this.activateCurveArrow = function () {
            state.tool = TOOLS.ARROW_CURVE;
            showFontSettings(false);
        };
        this.activateDoubleArrow = function () {
            state.tool = TOOLS.ARROW_DOUBLE;
            showFontSettings(false);
        };
        this.activateSpray = function () {
            state.tool = TOOLS.SPRAY;
            showFontSettings(false);
        };
        this.activateBlur = function () {
            state.tool = TOOLS.BLUR;
            showFontSettings(false);
        };
        this.activateBlurOther = function () {
            state.tool = TOOLS.BLUR_OTHER;
            _this.mergeBg();
            History.undoAll();
            saveHistory();
            // $('body').addClass("wait");
            // setTimeout(function () {
            blurAll();
            //     $('body').removeClass("wait");
            currentObject = new ObNoEdit();
            state.drawing = true;
            state.created = true;
            drawEnd(null);
            // }, 200);
            showFontSettings(false);
        };
        this.sticker = function () {
            state.tool = TOOLS.STICKER;
            showFontSettings(true);
        };
        this.text = function () {
            state.tool = TOOLS.TEXT;
            showFontSettings(true);
        };
        this.textArrow = function () {
            state.tool = TOOLS.TEXT_ARROW;

            showFontSettings(true);
        };
        this.activeteNumber = function () {
            state.tool = TOOLS.NUMBER;
            showFontSettings(null, true);
        };

        this.loadBackgroundImage = function (imgUrl, cb) {
            var pic = new Image();
            pic.onload = function () {
                var z = 1;//window.devicePixelRatio || 1;
                var h = pic.height / z;
                var w = pic.width / z;

                $(_this).width(w).height(h);

                canvas.common.width = w;
                canvas.common.height = h;

                $(canvas.fon.canvas).attr("width", w);
                $(canvas.fon.canvas).attr("height", h);
                $(canvas.current.canvas).attr("width", w);
                $(canvas.current.canvas).attr("height", h);
                $(canvas.background.canvas).attr("width", w);
                $(canvas.background.canvas).attr("height", h);

                // canvas.fon.context.drawImage(pic, 0, 0, w, h);
                canvas.fon.context.drawImage(pic, 0, 0, w * z, h * z, 0, 0, w, h);

                _this.zoom(true);
                cb && cb();

            };
            pic.src = imgUrl;
        };

        this.loadImageObject = function (data, xp, yp) {
            var x = (xp && Math.floor((xp - $(canvas.current.canvas).offset().left) / kzoom)) || 1;
            var y = (yp && Math.floor((yp - $(canvas.current.canvas).offset().top) / kzoom)) || 1;

            var pic = new Image();
            pic.onload = function () {

                var canvas = document.createElement('canvas');
                canvas.width = pic.width;
                canvas.height = pic.height;
                var context = canvas.getContext('2d');
                context.drawImage(pic, 0, 0);
                currentObject = new ObImage();
                currentObject.x = currentObject.xLast = x;
                currentObject.y = currentObject.yLast = y;
                currentObject.w = currentObject.wLast = pic.width;
                currentObject.h = currentObject.hLast = pic.height;
                currentObject.number.n = getNumber();
                currentObject.data = context.getImageData(0, 0, pic.width, pic.height);
                state.drawing = true;
                state.created = true;
                drawEnd(null);
            };
            pic.src = data;
        };

        this.undo = function () {
            History.undo();
        };

        this.redo = function () {
            History.redo();
        };

        this.mergeBg = function () {
            maxNumber = getNumber() - 1;
            canvas.cache.action = 'merge';
            this.done();
            canvas.fon.context.drawImage(canvas.background.canvas, 0, 0);
            this.clearAll();
            objects = [];
        };

        this.resizeElements = function (width, height) {
            $(this).width(width).height(height);

            $(canvas.fon.canvas).attr("width", width).attr("height", height);
            $(canvas.background.canvas).attr("width", width).attr("height", height);
            $(canvas.current.canvas).attr("width", width).attr("height", height);

            canvas.common.width = width;
            canvas.common.height = height;

            drawAll();
            this.zoom(true);
        };

        this.changeSize = function (width, height) {

            if (width !== canvas.common.width || height !== canvas.common.height) {

                this.mergeBg();

                History.saveToCache();

                var pic = new Image();
                pic.onload = function () {
                    canvas.fon.context.drawImage(pic, 0, 0, pic.width, pic.height, 0, 0, width, height);
                };
                pic.src = canvas.fon.canvas.toDataURL("image/png");
                this.resizeElements(width, height);
                History.undoAll();
                saveHistory();
            }
        };

        this.cropImage = function (size) {

            var w = Math.round(size.w / kzoom), h = Math.round(size.h / kzoom), x = Math.round(size.x / kzoom), y = Math.round(size.y / kzoom);

            if ((x + w) > canvas.common.width) w = canvas.common.width - x;
            if ((y + h) > canvas.common.height) h = canvas.common.height - y;

//            for (var i = 0, l = objects.length; i < l; i++) {
//                objects[i].move(-x, -y);
//                objects[i].moveEnd();
//            }
            this.mergeBg();

            History.saveToCache();

            var fonData = canvas.fon.context.getImageData(x, y, w, h);

            this.resizeElements(w, h);

            canvas.fon.context.putImageData(fonData, 0, 0);
            History.undoAll();
            saveHistory();
        };

        this.changeFillColor = function (color) {
            if (currentN > -1) {
                objects[currentN].fillColor = color;
                drawAll();
            }
            state.fillColor = color;
            LS.fillColor = color;
            localStorage.setItem('fillColor', color);
        };

        this.changeStrokeColor = function (color) {
            if (currentN > -1) {
                objects[currentN].color = color;
                drawAll();
            }
            this.setToolsColor(color);
            state.strokeColor = color;
        };

        this.changeStrokeSize = function (size) {
            if (currentN > -1) {
                //if (objects[currentN].type === 'text') {
                //    objects[currentN].size = size * 5;
                //} else {
                objects[currentN].width = +size;
                //}
                drawAll();
            }
            this.setToolsWigth(size);
            state.lineThickness = +size
        };

        this.changeShadow = function (shadow) {
            if (currentN > -1) {
                objects[currentN].shadow = shadow;
                drawAll();
            }
            this.setShadow(shadow);
        };

        this.changeSprayDensity = function (density) {
            state.sprayDensity = density
        };

        this.getImage = function () {
            return canvas.background.canvas.toDataURL("image/png");
        };

        this.getZoom = function () {
            return kzoom;
        };

        this.zoom = function (k) {
            if (k === true) {
                k = kzoom;
            }
            this.css('-webkit-transform', 'scale(' + k + ')');
            kzoom = k;

            $('#nsc_canvas_wrap').width(Math.max($(window).width(), $(this).width() * k));

            var marginH = Math.round(-0.5 * (1 - k) * $(this).height());
            var marginW = Math.round(-0.5 * (1 - k) * $(this).width());

            var b = ($('body').width() - k * $(this).width()) / 2;
            if (b < 0) {
                b = 0
            }
            this.css('margin-left', b + marginW + 'px');
            this.css('margin-top', marginH + 'px');
            this.css('margin-bottom', marginH + 'px');
        };

        this.autoZoom = function () {
            var d = canvas.common.width / $(window).width();
            var z = 1;
            if (d > 0.99) {
                z = 0.75;
                if (d > 1.99) z = 0.5;
                if (d > 2.99) z = 0.25;
                $("#nsc_zoom_percent").val(z).trigger('change');
                _this.zoom(z);
            }
        };

        this.clearAll = function () {
            canvas.background.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
            canvas.current.context.clearRect(0, 0, canvas.common.width, canvas.common.height);
        };

        this.undoAll = function () {
            maxNumber = 0;
            this.done();
            History.undoAll();
            this.clearAll();
            $('#nsc_redactor_undo_all').addClass('inert');
        };

        this.changeOpacity = function (opacity) {
            canvas.current.context.globalAlpha = opacity / 100;
        };

        this.done = function () {
            if (textarea) textarea.blur();
            if (currentN > -1) objects[currentN].current = false;
            if (state.tool === TOOLS.EDIT) state.tool = state.lasttools;
            state.drawing = false;
            state.move = false;
            currentN = -1;
            drawAll();
        };
        this.delete = function (e) {
            // if (currentObject.x !== undefined) {
            //     History.max--;
            //     History.undo();
            //     currentObject = {};
            // }
            if (state.tool === TOOLS.EDIT) {
                if (textarea && textarea[0].value !== '' && e.code !== 'Delete') return;
                state.tool = state.lasttools;
                if (currentN > -1) {
                    objects[currentN].show = false;
                    if (textarea) {
                        textarea.remove();
                        textarea = null;
                    }

                    for (var i = 0, n = 0, l = objects.length; i < l; i++) {
                        if (objects[i].type === 'number' && objects[i].show) {
                            objects[i].number = ++n;
                        }
                    }

                    saveHistory();
                    drawAll();
                }
            }
        };

        this.copy = function (e) {
            if (state.tool === TOOLS.EDIT && currentN > -1) {
                copyObject = cloneObject(objects[currentN])
            }
        };

        this.paste = function (e) {
            if (!Object.keys(copyObject).length) return;

            var dx = Math.floor((e.pageX - $(canvas.current.canvas).offset().left) / kzoom) - copyObject.x;
            var dy = Math.floor((e.pageY - $(canvas.current.canvas).offset().top) / kzoom) - copyObject.y;

            objects.push(cloneObject(copyObject));
//            copyObject = null;

            objects[objects.length - 1].move(dx, dy, false);
            objects[objects.length - 1].moveEnd();

            saveHistory();
            drawAll();
        };

        this.move = function (k) {
            if (currentN <= -1) return;

            var x = 0, y = 0, step = 3;

            if (k == 37 /*left*/) x -= step;
            if (k == 38 /*up*/) y -= step;
            if (k == 39 /*right*/) x += step;
            if (k == 40 /*down*/) y += step;

            if (objects[currentN].type != 'text' && objects[currentN].type != 'sticker' && objects[currentN].type != 'textarrow') {
                objects[currentN].marker = -1;
                objects[currentN].move(x, y, false);
                objects[currentN].moveEnd();
            }

            saveHistory();
            drawAll();
        };

        this.lockUnlock = function () {
            state.lock = !state.lock;
        };

        this.setToolsWigth = function (w) {
            LS.setting.width = w;
            localStorage.setItem('setting', JSON.stringify(LS.setting));
        };

        this.setToolsColor = function (c) {
            LS.setting.color = c;
            localStorage.setItem('setting', JSON.stringify(LS.setting));
        };

        this.setShadow = function (s) {
            state.shadow = s;
            LS.shadow = s;
            localStorage.setItem('shadow', JSON.stringify(s));
        };

        this.getShadow = function () {
            if (currentN > -1) {
                return objects[currentN].shadow;
            }
            return state.shadow;
        };

        this.setEnableNumbers = function (n) {
            enablenumbers = n;
            drawAll();
        };

        this.getFon = function () {
            return {
                size: state.fontSize,
                family: state.fontFamily
            }
        };

        this.setFontSize = function (s) {
            if (currentN > -1) {
                if (typeof objects[currentN].family !== 'undefined') {
                    objects[currentN].size = s;
                }
                drawAll();
            }
            state.fontSize = s;

            LS.font.size = s;
            localStorage.setItem('font', JSON.stringify(LS.font));
            setFontProperty(s, false);
        };

        this.setFontFamily = function (f) {
            if (currentN > -1) {
                if (typeof objects[currentN].family !== 'undefined') {
                    objects[currentN].family = f;
                }
                drawAll();
            }
            state.fontFamily = f;

            LS.font.family = f;
            localStorage.setItem('font', JSON.stringify(LS.font));

            setFontProperty(false, f);
        };

        this.scrollPage = scrollPage;

        return this.initialize();
    }

})(jQuery);