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

    $(document).on('ready_redactor', function () {
        if (nimbus_screen.locationParam() === 'blank') {
            $('#nsc_canvas_wrap').addClass('blank');
            $('#nsc_redactor_panel_open_img').show();
            if (!LS.disableHelper) {
                $('#nsc_capture_helper').fadeIn(100);
            }
        } else {
            $('#nsc_drop_file').remove();
        }

        var $panel_button = $('.nsc-panel-button');
        $panel_button
            .on('click', function (e) {
                jcrop && jcrop.destroy();
                $('#pole_crop').remove();

                if ($(this).hasClass('not_change_active')) {
                    $panel_button./*not(this).removeClass('active').end().*/filter(this).toggleClass('active');
                } else if (!$(this).find('select').length) {
                    // $(document).tooltip("hide");
                    $panel_button.not('.change').removeClass('active').filter(this).addClass('active');
                } else {
                    // $(document).tooltip("hide");
                    if ($(e.target).hasClass('.nsc-panel-text') || $(e.target).closest('.nsc-panel-text').length) {
                        var $targetButton = ($(e.target).closest('.nsc-panel-select').length ? $(e.target).closest('.nsc-panel-select') : $(e.target)).closest('.nsc-panel-button');
                        var $option = $targetButton.find('select option:selected');
                        $targetButton.find('li').removeClass('active').filter('[data-value=\'' + $option.val() + '\']').addClass('active').trigger('click');
                    }
                }
            })
            .contextmenu(function (e) {
                if ($(e.currentTarget).hasClass('tools') && confirm('Set by default?')) {
                    var id = $(e.currentTarget).find('option:selected').data('toolId');
                    if ($(e.target).closest('.nsc-panel-dropdown-icon').length) {
                        id = $(e.target).closest('.nsc-panel-dropdown-icon').data('toolId');
                    }
                    localStorage.defaultTool = id;
                    $(document).trigger('redactor_set_tools', id);
                    // nimbus_screen.canvasManager.setTool(id);
                }
                return false;
            })
            .find('select')
            .each(function () {
                var select = this;
                $(select)
                    .on('change', function (e) {
                        var $option_selected = $(this).find('option:selected');
                        var $panel_text = $(this).closest('.nsc-panel-button').find('.nsc-panel-text');
                        $panel_text.attr('title', $option_selected.attr('title'));

                        if ($panel_text.find('.nsc-panel-text-font').length) {
                            $panel_text.find('.nsc-panel-text-font').text($option_selected.text());
                        } else if ($panel_text.find('.nsc-panel-text-value').length) {
                            if ($option_selected.data('icon')) {
                                $panel_text.find('.nsc-panel-text-value').prev('span').remove().end().before($('<span>').addClass($option_selected.data('icon')))
                            }
                            $panel_text.find('.nsc-panel-text-value').text($option_selected.text());
                        } else {
                            $panel_text.find('span').attr('class', $option_selected.attr('class'));
                        }
                    })
                    .trigger('change')
                    .hide()
                    .after($('<ul>'))
                    .find('option')
                    .each(function (index, option) {
                        $(select)
                            .next('ul')
                            .append(
                                $('<li>')
                                    .addClass($(select).attr('class'))
                                    .attr('data-tool-id', $(option).data('toolId'))
                                    .attr('title', $(option).data('i18n') ? chrome.i18n.getMessage($(option).data('i18n')) : '')
                                    .attr('data-value', $(option).val())
                                    .on('click', function (e) {
                                        $panel_button.not('.change').removeClass('active').find('li').removeClass('active');
                                        $(select).closest('.nsc-panel-button').addClass('active');
                                        $(this).addClass('active');
                                        $(select).find('option').attr('selected', false).prop("selected", false).filter('[value="' + $(this).data('value') + '"]').attr('selected', 'selected').prop("selected", true);
                                        $(select).trigger('change');
                                        $(option).closest('.nsc-panel-dropdown').hide().trigger('hide');
                                    })
                                    .append(function () {
                                            var dom = [];
                                            if ($(option).data('icon')) {
                                                dom.push($('<span>').addClass($(option).data('icon')))
                                            }
                                            dom.push($('<span>').addClass($(option).attr('class')).text($(option).text()));
                                            return dom;
                                        }
                                    )
                            )
                    })
            });

        $(document).on('click', function (e) {
            var $target_dropdown = $(e.target).closest('.nsc-panel-dropdown');
            if (($(e.target).closest('.nsc-panel-trigger').length && $(e.target).closest('.nsc-panel-select').length)
                || ($(e.target).closest('.nsc-panel-text').length && $(e.target).closest('.nsc-panel-button').hasClass('assembled'))) {
                var $target = $(e.target).closest('.nsc-panel-select').length ? $(e.target).closest('.nsc-panel-select') : $(e.target);
                $target_dropdown = $target.next('.nsc-panel-dropdown');
                if ($target_dropdown.is(':visible')) {
                    $target_dropdown.hide().trigger('hide');
                } else {
                    $target_dropdown.show().trigger('show');
                }
            }
            $('.nsc-panel-dropdown').not($target_dropdown).hide();
        });

        $(document).on('redactor_set_tools', function (e, tools) {
            var $option = $('[data-tool-id=' + tools + ']');

            if ($option.attr('selected') !== 'selected') {
                $option.closest('select').find('option').attr('selected', false).filter($option).attr({'selected': 'selected'});

                $panel_button.filter($option.closest('.nsc-panel-button')).find('li[data-tool-id=' + tools + ']').trigger('click');

                window.setTimeout(function ($select) {
                    $select.trigger('change');
                }.bind(this, $option.closest('select')), 100)
            }
        });

        if (localStorage.defaultTool === undefined) {
            localStorage.defaultTool = nimbus_screen.canvasManager.getTools();
        }
        $(document).trigger('redactor_set_tools', localStorage.defaultTool);

        $('.nsc-panel-dropdown').on('show', function () {
            $(this).closest('.nsc-panel-button').tooltip().tooltip("disable");
        });

        $('.nsc-panel-dropdown').on('hide', function () {
            $('.nsc-panel-button').tooltip().tooltip("enable");

            // $('.nsc-panel-button').each(function (index, button) {
            //     var i18n = $(button).data('i18n');
            //     if (i18n) {
            //         $(button).tooltip().tooltip("enable");
            //     }
            // })
        });

        $("#zoom_out").click(function () {
            var z = nimbus_screen.canvasManager.getZoom();
            if (z > 0.25) {
                z -= 0.25;
            }
            $("#nsc_zoom_percent").val(z).trigger('change');
            nimbus_screen.canvasManager.zoom(z);
        });

        $("#zoom_in").click(function () {
            var z = nimbus_screen.canvasManager.getZoom();
            if (z < 2) {
                z += 0.25;
            }
            $("#nsc_zoom_percent").val(z).trigger('change');
            nimbus_screen.canvasManager.zoom(z);
        });

        $('#nsc_zoom_percent').on('change', function () {
            var z = +this.value;
            nimbus_screen.canvasManager.zoom(z);
            return false;
        });

        var $resize_form = $("#nsc_redactor_resize_form");
        var $resize_img_width = $("#nsc_redactor_resize_img_width");
        var $resize_img_height = $("#nsc_redactor_resize_img_height");
        var $resize_proportional = $("#nsc_redactor_resize_proportional");

        var size = nimbus_screen.getEditCanvasSize();
        $resize_img_width.val(size.w);
        $resize_img_height.val(size.h);

        $resize_img_width.on('input', function () {
            if ($resize_proportional.prop('checked')) {
                var size = nimbus_screen.getEditCanvasSize();
                $resize_img_height.val(Math.round(this.value * size.h / size.w));
            }
        });

        $resize_img_height.on('input', function () {
            if ($resize_proportional.prop('checked')) {
                var size = nimbus_screen.getEditCanvasSize();
                $resize_img_width.val(Math.round(this.value * size.w / size.h));
            }
        });

        $resize_proportional.on('change', function () {
            if (this.checked) {
                var firstSize = nimbus_screen.getEditCanvasSize();
                $resize_img_width.val(firstSize.fW);
                $resize_img_height.val(firstSize.fH);
            }
        });

        $resize_form.on('submit', function () {
            nimbus_screen.canvasManager.changeSize(this.width.value, this.height.value);
            return false;
        });

        $resize_form.find('button').on('click', function () {
            $resize_form.closest('.nsc-panel-dropdown').hide().trigger('hide');
        });

        $("#nsc_redactor_crop").on('click', function () {
            var pole = $('<div id="pole_crop">').prependTo('#nsc_canvas_wrap');
            var size = nimbus_screen.getEditCanvasSize();
            var zoom = nimbus_screen.canvasManager.getZoom();
            var position = $('#nsc_canvas').offset();

            pole.css('width', size.w * zoom);
            pole.css('height', size.h * zoom);
            pole.css('position', 'absolute');
            pole.css('left', position.left + 'px');
            pole.css('top', 0);
            // pole.css('top', position.top + 'px');

            var crop = $('<div>').appendTo(pole);
            crop.css('width', '100%');
            crop.css('height', '100%');
            crop.css('position', 'absolute');
            crop.css('left', '0px');
            crop.css('top', '0px');

            jcrop = $.Jcrop(crop, {
                keySupport: true,
                onSelect: createCoords,
                onChange: showCards,
                onMousemove: function (e) {
                    nimbus_screen.canvasManager.scrollPage(e);
                }
            });
        });

        $('#nsc_redactor_pens').on('change', function () {
            switch (this.value) {
                case 'pen':
                    nimbus_screen.canvasManager.activatePen();
                    break;
                case 'highlight':
                    nimbus_screen.canvasManager.activateHighlight();
                    break;
            }
        });

        $('#nsc_redactor_square').on('change', function () {
            switch (this.value) {
                case 'rectangle':
                    nimbus_screen.canvasManager.activateEmptyRectangle();
                    break;
                case 'rounded_rectangle':
                    nimbus_screen.canvasManager.activateRoundedRectangle();
                    break;
                case 'sphere':
                    nimbus_screen.canvasManager.activateEmptyCircle();
                    break;
                case 'ellipse':
                    nimbus_screen.canvasManager.activateEllipse();
                    break;
            }
        });

        $('#nsc_redactor_arrow').on('change', function (e) {
            console.log(this.value);
            switch (this.value) {
                case 'arrow_line':
                    nimbus_screen.canvasManager.activateArrow();
                    break;
                case 'arrow_curve':
                    nimbus_screen.canvasManager.activateCurveArrow();
                    break;
                case 'arrow_double':
                    nimbus_screen.canvasManager.activateDoubleArrow();
                    break;
                case 'line':
                    nimbus_screen.canvasManager.activateLine();
                    break;
                case 'line_curve':
                    nimbus_screen.canvasManager.activateCurveLine();
                    break;
                case 'line_dotted':
                    nimbus_screen.canvasManager.activateDottedLine();
                    break;
            }
        });

        $('#nsc_redactor_text_arrow').on('change', function (e) {
            switch (this.value) {
                case 'text_arrow':
                    nimbus_screen.canvasManager.textArrow();
                    break;
                case 'sticker':
                    nimbus_screen.canvasManager.sticker();
                    break;
            }
        });


        $('#nsc_redactor_blur').on('change', function (e) {
            switch (this.value) {
                case 'blur':
                    nimbus_screen.canvasManager.activateBlur();
                    break;
                case 'blur-all':
                    nimbus_screen.canvasManager.activateBlurOther();
                    break;
            }
        });

        $("#nsc_redactor_text").on('click', function (e) {
            nimbus_screen.canvasManager.text();
        });

        $('#nsc_redactor_font_size').on('input js-change', function (e) {
            $(this).closest('.nsc-panel-button').find('.nsc-panel-text-value').text(this.value + 'px');
            if (e.type != 'js-change') {
                nimbus_screen.canvasManager.setFontSize(this.value);
            }
        }).trigger('input');

        $('#nsc_redactor_font_family').on('change', function (e) {
            nimbus_screen.canvasManager.setFontFamily(this.value);
        });

        $('#nsc_redactor_line_width').on('change', function (e) {
            nimbus_screen.canvasManager.changeStrokeSize(this.value);
        }).val(LS.setting.width).trigger('change');

        $("#nsc_redactor_fill_color").spectrum({
            color: LS.fillColor,
            flat: true,
            showAlpha: true,
            showButtons: false,
            move: function (color) {
                $("#nsc_redactor_fill_color").closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('background-color', color.toRgbString());
                nimbus_screen.canvasManager.changeFillColor(color.toRgbString());
            }
        }).closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('background-color', LS.fillColor);

        $('#nsc_redactor_fill_color').closest('.nsc-panel-dropdown').on('show', function () {
            $("#nsc_redactor_fill_color").spectrum("reflow");
        });

        $("#nsc_redactor_stroke_color").spectrum({
            color: LS.setting.color,
            flat: true,
            showAlpha: true,
            showButtons: false,
            move: function (color) {
                $("#nsc_redactor_stroke_color").closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('border-color', color.toRgbString());
                nimbus_screen.canvasManager.changeStrokeColor(color.toRgbString());
            }
        }).closest('.nsc-panel-button').find('.nsc-panel-icon-fill-inner').css('border-color', LS.setting.color);

        $('#nsc_redactor_stroke_color').closest('.nsc-panel-dropdown').on('show', function () {
            $("#nsc_redactor_stroke_color").spectrum("reflow");
        });

        nimbus_screen.canvasManager.changeShadow(LS.shadow);

        $('#nsc_redactor_shadow').closest('.nsc-panel-dropdown').on('show', function () {
            var shadow = nimbus_screen.canvasManager.getShadow();

            $('#nsc_redactor_shadow').prop("checked", shadow.enable);
            $('#nsc_redactor_shadow_width').val(shadow.blur);
            $('#nsc_redactor_shadow_color').spectrum({
                color: shadow.color,
                showAlpha: true,
                showButtons: false,
                move: function (color) {
                    $('#nsc_redactor_shadow_color').val(color.toRgbString()).trigger('change');
                }
            });
        });

        $('#nsc_redactor_shadow, #nsc_redactor_shadow_color, #nsc_redactor_shadow_width').on('change', function () {
            nimbus_screen.canvasManager.changeShadow({
                enable: $('#nsc_redactor_shadow').prop("checked"),
                blur: $('#nsc_redactor_shadow_width').val(),
                color: $('#nsc_redactor_shadow_color').spectrum("get").toRgbString()
            });
        });

        $('#nsc_redactor_lock').on('click', function () {
            nimbus_screen.canvasManager.lockUnlock();
        });

        $("#nsc_redactor_undo").on('click', function () {
            nimbus_screen.canvasManager.undo();
        });

        $("#nsc_redactor_redo").on('click', function () {
            nimbus_screen.canvasManager.redo();
        });

        $("#nsc_redactor_undo_all").on('click', function () {
            nimbus_screen.canvasManager.undoAll();
            nimbus_screen.canvasManager.loadBackgroundImage(imgdata);
        });

        $("#nsc_redactor_numbers").on('change', function (e) {
            switch (this.value) {
                case 'numbers':
                    LS.enablenumbers = !LS.enablenumbers;
                    nimbus_screen.canvasManager.setEnableNumbers(LS.enablenumbers);
                    break;
                case 'number':
                    nimbus_screen.canvasManager.activeteNumber();
                    break;
            }
        });

        $('#nsc_redactor_open_image').on('click', function () {
            $('#nsc_redactor_open_image').prev('input').click();
            $(document).tooltip("destroy");
        });

        $('#nsc_redactor_capture_desktop, #nsc_capture_desktop').click(function () {
            var bgScreen = chrome.extension.getBackgroundPage().screenshot;
            bgScreen.captureDesctop(function (data) {
                imgdata = data;
                nimbus_screen.canvasManager.undoAll();
                nimbus_screen.canvasManager.loadBackgroundImage(imgdata)
                $('#nsc_drop_file').hide();
                $('#nsc_canvas_wrap').removeClass('blank');
                $(document).tooltip("destroy");
            });
        });

        $('#nsc_create_blank').click(function () {
            $('#nsc_drop_file').hide();
            $('#nsc_canvas_wrap').removeClass('blank');
        })

    });

});