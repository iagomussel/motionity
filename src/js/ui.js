// Update panel (when selecting / de-selecting objects)
function updatePanel(selection) {
  if (!selection) {
    $('#align').addClass('align-off');
    $('#object-specific').html(canvas_panel);
    $('#preset').append("<option value='custom'>Custom</option>");
    presets.forEach(function (preset) {
      $('#preset').append(
        "<option value='" +
          preset.id +
          "'>" +
          preset.name +
          '</option>'
      );
    });
    $('#preset').val(activepreset);
    $('#canvas-duration input').val(duration / 1000);
    $('#preset').niceSelect();
    updatePanelValues();
    colormode = 'back';
    o_fill.setColor(canvas.backgroundColor);
  } else if (
    selection &&
    canvas.getActiveObjects().length == 1 &&
    canvas.getActiveObject().get('assetType') == 'audio'
  ) {
    $('#object-specific').html(audio_panel);
    $('#object-volume input').val(
      canvas.getActiveObject().get('volume') * 200
    );
  } else if (
    selection &&
    canvas.getActiveObjects().length == 1 &&
    canvas.getActiveObject().get('type') != 'group'
  ) {
    if (!cropping) {
      updateChromaUI();
      checkFilter();
    }
    $('#align').removeClass('align-off');
    $('#object-specific').html(object_panel);
    if (
      canvas.getActiveObject().get('type') == 'image' &&
      !canvas.getActiveObject().get('assetType')
    ) {
      $('#object-specific').append(image_panel);
      $('#object-specific').append(image_more_panel);
    } else if (
      canvas.getActiveObject().get('id').indexOf('Video') >= 0
    ) {
      $('#object-specific').append(image_panel);
      $('#object-specific').append(video_more_panel);
    } else {
      $('#object-specific').append(back_panel);
    }
    objects.forEach(function (object) {
      if (object.id != canvas.getActiveObject().get('id')) {
        $('#masks').append(
          "<option value='" +
            object.id +
            "'>" +
            object.id +
            '</option>'
        );
      }
    });
    $('#masks').niceSelect();
    var selectme = document.getElementById('select-opacity');
    o_slider = new RangeSlider(selectme, {
      design: '2d',
      theme: 'default',
      handle: 'round',
      popup: null,
      showMinMaxLabels: false,
      unit: '%',
      min: 0,
      max: 100,
      value: 100,
      onmove: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        canvas.getActiveObject().set({
          opacity: x / 100,
        });
        canvas.renderAll();
      },
      onfinish: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        updateObjectValues('opacity');
      },
      onstart: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
      },
    });
    if (canvas.getActiveObject().get('type') == 'rect') {
      $('#object-specific').append(shape_panel);
    } else if (
      canvas.getActiveObject().get('type') == 'path' ||
      canvas.getActiveObject().get('type') == 'circle'
    ) {
      $('#object-specific').append(path_panel);
    } else if (canvas.getActiveObject().get('type') == 'textbox') {
      $('#object-specific').append(text_panel);
      selectme = document.getElementById('select-letter');
      o_letter_slider = new RangeSlider(selectme, {
        design: '2d',
        theme: 'default',
        handle: 'round',
        popup: null,
        showMinMaxLabels: false,
        unit: '%',
        min: -200,
        max: 200,
        value: parseFloat(
          (canvas.getActiveObject().get('charSpacing') / 10).toFixed(
            2
          )
        ),
        onmove: function (x) {
          document
            .getElementById('text-h')
            .getElementsByTagName('input')[0].value = x;
          canvas.getActiveObject().set({ charSpacing: x * 10 });
          canvas.renderAll();
          updatePanelValues();
        },
        onfinish: function (x) {
          document
            .getElementById('text-h')
            .getElementsByTagName('input')[0].value = x;
          updateObjectValues('opacity3');
        },
        onstart: function (x) {
          document
            .getElementById('text-h')
            .getElementsByTagName('input')[0].value = x;
        },
      });
      selectme = document.getElementById('select-line');
      o_line_slider = new RangeSlider(selectme, {
        design: '2d',
        theme: 'default',
        handle: 'round',
        popup: null,
        showMinMaxLabels: false,
        unit: '%',
        min: 1,
        max: 500,
        value: parseFloat(
          (canvas.getActiveObject().get('lineHeight') * 100).toFixed(
            2
          )
        ),
        onmove: function (x) {
          document
            .getElementById('text-v')
            .getElementsByTagName('input')[0].value = x;
          canvas
            .getActiveObject()
            .set({ lineHeight: parseFloat(x / 100) });
          canvas.renderAll();
        },
        onfinish: function (x) {
          document
            .getElementById('text-v')
            .getElementsByTagName('input')[0].value = x;
          updateObjectValues('opacity3');
        },
        onstart: function (x) {
          document
            .getElementById('text-v')
            .getElementsByTagName('input')[0].value = x;
        },
      });
      updateTextValues();
    }
    $('#object-specific').append(stroke_panel);
    $('#object-specific').append(shadow_panel);
    $('#line-cap').niceSelect();
    updatePanelValues();
  } else if (
    canvas.getActiveObjects().length > 1 ||
    canvas.getActiveObject().get('type') == 'group'
  ) {
    $('#align').removeClass('align-off');
    $('#object-specific').html(object_panel);
    if (canvas.getActiveObject().get('type') == 'group') {
      if (
        canvas.getActiveObject().get('assetType') == 'animatedText'
      ) {
        $('#object-specific').append(other_panel);
        $('#object-specific').append(animated_text_panel);
        $('#object-specific').append(start_animation_panel);
        fonts.forEach(function (font) {
          $('#font-picker').append(
            "<option value='" + font + "'>" + font + '</option>'
          );
        });
        $('#font-picker').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.fontFamily
        );
        $('#font-picker').niceSelect();
        $('#text-color input').val(
          convertToHex(
            animatedtext.find(
              (x) => x.id == canvas.getActiveObject().id
            ).props.fill
          )
        );
        $('#color-text-side').css(
          'background-color',
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.fill
        );
        text_animation_list.forEach(function (preset) {
          $('#preset-picker').append(
            "<option value='" +
              preset.name +
              "'>" +
              preset.label +
              '</option>'
          );
        });
        $('#preset-picker').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.preset
        );
        $('#preset-picker').niceSelect();
        $('.order-toggle-item-active').removeClass(
          'order-toggle-item-active'
        );
        $('.order-toggle-item-active-2').removeClass(
          'order-toggle-item-active-2'
        );
        if (
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.order == 'backward'
        ) {
          $('#order-backward').addClass('order-toggle-item-active');
        } else {
          $('#order-forward').addClass('order-toggle-item-active');
        }
        if (
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.typeAnim == 'letter'
        ) {
          $('#type-letters').addClass('order-toggle-item-active-2');
        } else {
          $('#type-words').addClass('order-toggle-item-active-2');
        }
        $('#easing-picker').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.easing
        );
        $('#easing-picker').niceSelect();
        $('#durationinput').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.duration / 1000
        );
        $('#masks').niceSelect();
      }
      /*
            if (canvas.getActiveObject().isGroup) {
                $("#object-specific").append(group_panel);
            } else {
                $("#object-specific").append(other_panel);
            }
            objects.forEach(function(object){
                if (object.id != canvas.getActiveObject().get("id")) {
                    $("#masks").append("<option value='"+object.id+"'>"+object.id+"</option>");
                }
            });
            $("#masks").niceSelect();
						*/
    } else {
      $('#object-specific').append(selection_panel);
    }
    var selectme = document.getElementById('select-opacity');
    o_slider = new RangeSlider(selectme, {
      design: '2d',
      theme: 'default',
      handle: 'round',
      popup: null,
      showMinMaxLabels: false,
      unit: '%',
      min: 0,
      max: 100,
      value: 100,
      onmove: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        canvas.getActiveObject().set({ opacity: x / 100 });
        canvas.renderAll();
      },
      onfinish: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        updateObjectValues('opacity');
      },
      onstart: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
      },
    });
    updatePanelValues();
  }
}

function convertToHex(nonHexColorString) {
  var ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = nonHexColorString;
  return ctx.fillStyle.toUpperCase();
}

function updateStrokeValues() {
  const object = canvas.getActiveObject();
  $('.line-join-active').removeClass('line-join-active');
  if (
    object.get('strokeDashArray') == false &&
    object.get('strokeWidth') == 0
  ) {
    $('#miter').addClass('line-join-active');
    $('#miter img').attr('src', 'assets/miter-active.svg');
  } else if (object.get('strokeDashArray') == false) {
    $('#bevel').addClass('line-join-active');
    $('#bevel img').attr('src', 'assets/bevel-active.svg');
  } else if (object.get('strokeDashArray') == [10, 5]) {
    $('#round').addClass('line-join-active');
    $('#round img').attr('src', 'assets/round-active.svg');
  } else {
    $('#small-dash').addClass('line-join-active');
    $('#small-dash img').attr('src', 'assets/dash2-active.svg');
  }
}

function toggleAnimationOrder() {
  var object = canvas.getActiveObject();
  $('.order-toggle-item-active').removeClass(
    'order-toggle-item-active'
  );
  if ($(this).attr('id') == 'order-backward') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ order: 'backward' }, canvas);
  } else if ($(this).attr('id') == 'order-forward') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ order: 'forward' }, canvas);
  }
  $(this).addClass('order-toggle-item-active');
  animate(currenttime, false);
  save();
}
function toggleAnimationType() {
  var object = canvas.getActiveObject();
  $('.order-toggle-item-active-2').removeClass(
    'order-toggle-item-active-2'
  );
  if ($(this).attr('id') == 'type-words') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ typeAnim: 'word' }, canvas);
  } else if ($(this).attr('id') == 'type-letters') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ typeAnim: 'letter' }, canvas);
  }
  $(this).addClass('order-toggle-item-active-2');
  animate(currenttime, false);
  save();
}
$(document).on(
  'click',
  '.order-toggle-item:not(.order-toggle-item-active)',
  toggleAnimationOrder
);
$(document).on(
  'click',
  '.order-toggle-item-2:not(.order-toggle-item-active-2)',
  toggleAnimationType
);

function updateTextValues() {
  const object = canvas.getActiveObject();
  fonts.forEach(function (font) {
    $('#font-picker').append(
      "<option value='" + font + "'>" + font + '</option>'
    );
  });
  $('#font-picker').val(object.get('fontFamily'));
  $('#font-picker').niceSelect();
  $('#text-h input').val(
    parseFloat((object.get('charSpacing') / 10).toFixed(2))
  );
  $('#text-v input').val(
    parseFloat((object.get('lineHeight') * 100).toFixed(2))
  );
  if (object.get('textAlign') == 'left') {
    $('#align-text-left').addClass('align-text-active');
    $('#align-text-left img').attr(
      'src',
      'assets/align-text-left-active.svg'
    );
  } else if (object.get('textAlign') == 'center') {
    $('#align-text-center').addClass('align-text-active');
    $('#align-text-center img').attr(
      'src',
      'assets/align-text-center-active.svg'
    );
  } else if (object.get('textAlign') == 'right') {
    $('#align-text-right').addClass('align-text-right-active');
    $('#align-text-right img').attr(
      'src',
      'assets/align-text-right-active.svg'
    );
  } else {
    $('#align-text-justify').addClass('align-text-justify-active');
    $('#align-text-justify img').attr(
      'src',
      'assets/align-text-justify-active.svg'
    );
  }
  if (
    object.get('fontWeight') == 'bold' ||
    object.get('fontWeight') == 700
  ) {
    $('#format-bold').addClass('format-text-active');
    $('#format-bold img').attr('src', 'assets/bold-active.svg');
  }
  if (object.get('fontStyle') == 'italic') {
    $('#format-italic').addClass('format-text-active');
    $('#format-italic img').attr('src', 'assets/italic-active.svg');
  }
  if (object.get('underline') == true) {
    $('#format-underline').addClass('format-text-active');
    $('#format-underline img').attr(
      'src',
      'assets/underline-active.svg'
    );
  }
  if (object.get('linethrough') == true) {
    $('#format-strike').addClass('format-text-active');
    $('#format-strike img').attr('src', 'assets/strike-active.svg');
  }
}

// Update panel inputs based on object values
function updatePanelValues() {
  if (canvas.getActiveObject()) {
    if (canvas.getActiveObject().get('assetType') == 'audio') {
      $('#object-volume input').val(
        canvas.getActiveObject().get('volume') * 200
      );
      return false;
    }
    setting = true;
    var tempstore = false;
    var object = canvas.getActiveObject();
    if (
      canvas.getActiveObjects.length > 1 ||
      object.get('type') == 'activeSelection'
    ) {
      object = object.toGroup();
      object.set({
        shadow: {
          blur: 0,
          color: 'black',
          offsetX: 0,
          offsetY: 0,
          opacity: 0,
        },
      });
      tempstore = true;
    }
    if (object.get('assetType') == 'animatedText') {
      $('#animated-text input').val(
        animatedtext.find((x) => x.id == object.id).text
      );
    }
    if (objects.find((x) => x.id == object.get('id'))) {
      if (
        $(
          "#masks option[value='" +
            objects.find((x) => x.id == object.get('id')).mask +
            "']"
        ).length == 0
      ) {
        $('#masks').val('none');
        objects.find((x) => x.id == object.get('id')).mask = 'none';
        object.clipPath = null;
        canvas.renderAll();
      } else {
        $('#masks').val(
          objects.find((x) => x.id == object.get('id')).mask
        );
      }
      $('#masks').niceSelect('update');
    }
    updateStrokeValues();
    $('#object-x input').val(
      parseFloat(
        (
          object.get('left') -
          artboard.get('left') -
          (object.get('width') * object.get('scaleX')) / 2
        ).toFixed(2)
      )
    );
    $('#object-y input').val(
      parseFloat(
        (
          object.get('top') -
          artboard.get('top') -
          (object.get('height') * object.get('scaleY')) / 2
        ).toFixed(2)
      )
    );
    $('#object-w input').val(
      parseFloat(
        (object.get('width') * object.get('scaleX')).toFixed(2)
      )
    );
    $('#object-h input').val(
      parseFloat(
        (object.get('height') * object.get('scaleY')).toFixed(2)
      )
    );
    $('#object-r input').val(
      parseFloat(object.get('angle').toFixed(2))
    );
    $('#object-stroke input').val(
      parseFloat(object.get('strokeWidth').toFixed(2))
    );
    if (object.get('type') != 'group') {
      $('#object-shadow-x input').val(
        parseFloat(object.shadow.offsetX.toFixed(2))
      );
      $('#object-shadow-y input').val(
        parseFloat(object.shadow.offsetY.toFixed(2))
      );
      $('#object-blur input').val(
        parseFloat(object.shadow.blur.toFixed(2))
      );
      colormode = 'stroke';
      o_fill.setColor(object.get('stroke'));
      colormode = 'shadow';
      o_fill.setColor(object.shadow.color);
    }
    o_slider.setValue(object.get('opacity') * 100);
    if (object.get('type') == 'rect') {
      $('#object-corners input').val(
        parseFloat(object.get('rx').toFixed(2))
      );
      colormode = 'fill';
      o_fill.setColor(object.get('fill'));
    } else if (
      object.get('type') == 'path' ||
      object.get('type') == 'circle' ||
      object.get('type') == 'textbox'
    ) {
      colormode = 'fill';
      o_fill.setColor(object.get('fill'));
    }
    if (tempstore) {
      object.toActiveSelection();
      canvas.renderAll();
    }
    setting = false;
  } else {
    $('#canvas-w input').val(artboard.get('width'));
    $('#canvas-h input').val(artboard.get('height'));
  }
}

// Update opacity input
function updateInputs(id) {
  if (canvas.getActiveObject().get('assetType') == 'audio') {
    return false;
  }
  if ($('#object-o input').val() > 100) {
    $('#object-o input').val(100);
  } else if ($('#object-o input').val() < 0) {
    $('#object-o input').val(0);
  }
  o_slider.setValue($('#object-o input').val());
  if (
    !isNaN(parseFloat($('#object-color-fill-opacity input').val())) &&
    id == 'object-color-fill-opacity'
  ) {
    if ($('#object-color-fill-opacity input').val() > 100) {
      $('#object-color-fill-opacity').val(100);
    } else if ($('#object-color-fill-opacity input').val() < 0) {
      $('#object-color-fill-opacity input').val(0);
    }
    colormode = 'fill';
    o_fill.setColor(
      'rgba(' +
        o_fill.getColor().toRGBA()[0] +
        ',' +
        o_fill.getColor().toRGBA()[1] +
        ',' +
        o_fill.getColor().toRGBA()[2] +
        ',' +
        $('#object-color-fill-opacity input').val() / 100 +
        ')'
    );
  }
  if (
    !isNaN(
      parseFloat($('#object-color-stroke-opacity input').val())
    ) &&
    id == 'object-color-stroke-opacity'
  ) {
    if ($('#object-color-stroke-opacity input').val() > 100) {
      $('#object-color-stroke-opacity').val(100);
    } else if ($('#object-color-stroke-opacity input').val() < 0) {
      $('#object-color-stroke-opacity input').val(0);
    }
    colormode = 'stroke';
    o_fill.setColor(
      'rgba(' +
        o_fill.getColor().toRGBA()[0] +
        ',' +
        o_fill.getColor().toRGBA()[1] +
        ',' +
        o_fill.getColor().toRGBA()[2] +
        ',' +
        $('#object-color-stroke-opacity input').val() / 100 +
        ')'
    );
  }
  if (
    !isNaN(
      parseFloat($('#object-color-shadow-opacity input').val())
    ) &&
    id == 'object-color-shadow-opacity'
  ) {
    if ($('#object-color-shadow-opacity input').val() > 100) {
      $('#object-color-shadow-opacity').val(100);
    } else if ($('#object-color-shadow-opacity input').val() < 0) {
      $('#object-color-shadow-opacity input').val(0);
    }
    colormode = 'shadow';
    o_fill.setColor(
      'rgba(' +
        o_fill.getColor().toRGBA()[0] +
        ',' +
        o_fill.getColor().toRGBA()[1] +
        ',' +
        o_fill.getColor().toRGBA()[2] +
        ',' +
        $('#object-color-shadow-opacity input').val() / 100 +
        ')'
    );
  }
}

// Update object position based on panel input values
function updateObjectValues(type) {
  autoSave();
  if (canvas.getActiveObjects().length > 0) {
    if ($(this).find('input').val() || type) {
      var object = canvas.getActiveObject();
      if ($(this).attr('id') == 'animated-text') {
        return false;
      }
      if ($(this).attr('id') == 'animated-text-duration') {
        var obj = p_keyframes.find((x) => x.id == object.id);
        var length = obj.end - obj.start;
        if ($(this).find('input').val() * 1000 > length) {
          $(this)
            .find('input')
            .val(length / 1000);
        }
        animatedtext
          .find((x) => x.id == object.id)
          .setProp(
            { duration: $(this).find('input').val() * 1000 },
            canvas
          );
        save();
        return false;
      }
      if ($(this).attr('id') == 'object-volume') {
        newKeyframe(
          'volume',
          canvas.getActiveObject(),
          currenttime,
          parseFloat($(this).find('input').val()) / 200,
          true
        );
        canvas
          .getActiveObject()
          .set(
            'volume',
            parseFloat($(this).find('input').val()) / 200
          );
      }
      editingpanel = true;
      var selection = false;
      const tempselection = canvas.getActiveObjects();
      const id = $(this).attr('id');
      updateInputs(id);
      if (tempselection.length > 1) {
        object = object.toGroup();
        selection = true;
      }
      if (objects.find((x) => x.id == object.get('id'))) {
        objects.find((x) => x.id == object.get('id')).mask =
          $('#masks').val();
        if ($('#masks').val() == 'none') {
          object.clipPath = null;
          canvas.renderAll();
        } else {
          object.clipPath = canvas.getItemById($('#masks').val());
          canvas.renderAll();
        }
      }
      object.set({
        left:
          parseFloat($('#object-x input').val()) +
          artboard.get('left') +
          (object.get('width') * object.get('scaleX')) / 2,
        top:
          parseFloat($('#object-y input').val()) +
          artboard.get('top') +
          (object.get('height') * object.get('scaleY')) / 2,
        scaleX: parseFloat(
          $('#object-w input').val() / object.get('width')
        ),
        scaleY: parseFloat(
          $('#object-h input').val() / object.get('height')
        ),
        angle: parseFloat($('#object-r input').val()),
        opacity: parseFloat($('#object-o input').val() / 100),
        strokeWidth: parseFloat($('#object-stroke input').val()),
      });
      if (object.get('type') != 'group') {
        object.set({
          shadow: {
            color: object.shadow.color,
            offsetX: parseFloat($('#object-shadow-x input').val()),
            offsetY: parseFloat($('#object-shadow-y input').val()),
            opacity: 1,
            blur: parseFloat($('#object-blur input').val()),
          },
        });
      }
      canvas.renderAll();
      if (tempselection.length > 1) {
        object.toActiveSelection();
        object = canvas.getActiveObject();
      }
      canvas.discardActiveObject();
      tempselection.forEach(function (obj) {
        keyframeChanges(obj, type, id, selection);
      });
      if (object) {
        reselect(object);
        editingpanel = false;
      }
      $('#' + id + ' input').focus();
      save();
      if (type) {
        updatePanelValues();
      } else if ($(this).find('input').val().length > 0) {
        updatePanelValues();
      }
    }
  } else {
    if (
      $(this).attr('id') == 'canvas-w' ||
      $(this).attr('id') == 'canvas-h'
    ) {
      artboard.set({
        width: parseFloat($('#canvas-w input').val()),
        height: parseFloat($('#canvas-h input').val()),
      });
      canvas.renderAll();
      resizeCanvas();
      if (activepreset != 'custom') {
        if (
          presets.find((x) => x.id == activepreset).width !=
            $('#canvas-w input').val() ||
          presets.find((x) => x.id == activepreset).height !=
            $('#canvas-h input').val()
        ) {
          activepreset = 'custom';
          updatePanel();
        }
      }
    } else if ($(this).attr('id') == 'canvas-duration') {
      if (!isNaN(parseFloat($(this).find('input').val()))) {
        setDuration(parseFloat($(this).find('input').val()) * 1000);
      }
    }
    if (!isNaN(parseFloat($('#canvas-color-opacity input').val()))) {
      if ($('#canvas-color-opacity input').val() > 100) {
        $('#canvas-color-opacity input').val(100);
      } else if ($('#canvas-color-opacity input').val() < 0) {
        $('#canvas-color-opacity input').val(0);
      }
      colormode = 'back';
      o_fill.setColor(
        'rgba(' +
          o_fill.getColor().toRGBA()[0] +
          ',' +
          o_fill.getColor().toRGBA()[1] +
          ',' +
          o_fill.getColor().toRGBA()[2] +
          ',' +
          $('#canvas-color-opacity input').val() / 100 +
          ')'
      );
    }
  }
}
function setTextAnimation() {
  var object = canvas.getActiveObject();
  animatedtext
    .find((x) => x.id == object.id)
    .reset(
      $(this).parent().find('input').val(),
      animatedtext.find((x) => x.id == object.id).props,
      canvas
    );
}

$(document).on('input', '.property-input', updateObjectValues);
$(document).on('change', '.property-input', updateObjectValues);
$(document).on('change', '#masks', updateObjectValues);
$(document).on('click', '#animatedset', setTextAnimation);

// Toggle picker (maybe it could be condensed?)
function togglePicker() {
  const object = canvas.getActiveObject();
  if (!o_fill.isOpen()) {
    newcolorkeyframe = true;
    if ($(this).attr('id') == 'object-color-fill') {
      colormode = 'fill';
      o_fill.setColor(object.get('fill'));
    } else if ($(this).attr('id') == 'object-color-stroke') {
      colormode = 'stroke';
      o_fill.setColor(object.get('stroke'));
    } else if ($(this).attr('id') == 'canvas-color') {
      colormode = 'back';
      o_fill.setColor(canvas.backgroundColor);
    } else if ($(this).attr('id') == 'chroma-color') {
      colormode = 'chroma';
      if (object.filters.find((x) => x.type == 'RemoveColor')) {
        o_fill.setColor(
          object.filters.find((x) => x.type == 'RemoveColor').color
        );
      } else {
        o_fill.setColor('#FFF');
      }
    } else if ($(this).attr('id') == 'text-color') {
      colormode = 'text';
      o_fill.setColor(
        animatedtext.find((x) => x.id == object.id).props.fill
      );
    } else {
      colormode = 'shadow';
      o_fill.setColor(object.shadow.color);
    }
    newcolorkeyframe = false;
    o_fill.show();
  } else {
    o_fill.hide();
  }
}
$(document).on('click', '#canvas-color', togglePicker);
$(document).on('click', '#object-color-fill', togglePicker);
$(document).on('click', '#object-color-stroke', togglePicker);
$(document).on('click', '#object-color-shadow', togglePicker);
$(document).on('click', '#chroma-color', togglePicker);
$(document).on('click', '#text-color', togglePicker);

window.onLoadImage = function (temp) {
  $(temp).css('background-image', 'none');
};

// Populate shape grid on left panel
function populateGrid(type) {
  if (type == 'shape-tool') {
    $('#shapes-row').html('');
    $('#emojis-row').html('');
    shape_grid_items.forEach(function (item) {
      $('#shapes-row').append(
        "<div class='grid-item'><img onload='onLoadImage(this)' draggable=false src='" +
          item +
          "'></div>"
      );
    });
    emoji_items.forEach(function (item) {
      $('#emojis-row').append(
        "<div class='grid-emoji-item'><img  onload='onLoadImage(this)' draggable=false src='" +
          item +
          "'></div>"
      );
    });
  } else if (type == 'image-tool') {
    $('#images-grid').html('');
    image_categories.forEach(function (category) {
      $('#categories').append(
        "<div class='category' data-name='" +
          category.name +
          "'><img onload='onLoadImage(this)' src='" +
          category.image +
          "'>" +
          category.name +
          '</div>'
      );
    });
  } else if (type == 'video-tool') {
    $('#images-grid').html('');
    video_categories.forEach(function (category) {
      $('#categories').append(
        "<div class='category' data-name='" +
          category.name +
          "'><img onload='onLoadImage(this)' src='" +
          category.image +
          "'>" +
          category.name +
          '</div>'
      );
    });
  } else if (type == 'images-tab') {
    $('#images-grid').html('');
    var flag = false;
    uploaded_images
      .slice()
      .reverse()
      .forEach(function (item) {
        if (!item.hidden) {
          flag = true;
          $('#images-grid').append(
            "<div class='image-grid-item' data-src='" +
              item.src +
              "' data-type='" +
              item.type +
              "' data-key='" +
              item.key +
              "'><img class='delete-media' draggable=false src='assets/more-options.svg'><img draggable=false onload='onLoadImage(this)' class='image-thing' src='" +
              item.thumb +
              "'</div>"
          );
        }
      });
    $('#landing').remove();
    if (!flag) {
      $('#upload-tabs').after(
        '<div id="landing" class="upload-landing"><div id="landing-text">Your uploaded images will show up here for easy access.</div></div>'
      );
    }
  } else if (type == 'videos-tab') {
    $('#images-grid').html('');
    var flag = false;
    uploaded_videos
      .slice()
      .reverse()
      .forEach(function (item) {
        if (!item.hidden) {
          flag = true;
          $('#images-grid').append(
            "<div class='video-grid-item' data-src='" +
              item.src +
              "' data-type='" +
              item.type +
              "' data-key='" +
              item.key +
              "'><img class='delete-media' draggable=false src='assets/more-options.svg'><img draggable=false onload='onLoadImage(this)' class='image-thing' src='" +
              item.thumb +
              "'></div>"
          );
        }
      });
    $('#landing').remove();
    if (!flag) {
      $('#upload-tabs').after(
        '<div id="landing" class="upload-landing"><div id="landing-text">Your uploaded videos will show up here for easy access.</div></div>'
      );
    }
  } else if (type == 'audio-tool') {
    var flag = false;
    audio_items.forEach(function (item) {
      if (item.src == background_key) {
        flag = true;
        $('#audio-list').append(
          "<div class='audio-item audio-item-active' data-src='" +
            item.src +
            "'><div class='audio-preview'><img src='assets/play-button.svg'></div><img class='audio-thumb' src='" +
            item.thumb +
            "'><div class='audio-info'><div class='audio-info-title'>" +
            item.name +
            "</div><a href='" +
            item.link +
            "' target='_blank' class='audio-info-desc'>" +
            item.desc +
            "</a><div class='audio-info-duration'>" +
            item.duration +
            '</div></div></div></div>'
        );
      } else {
        $('#audio-list').append(
          "<div class='audio-item' data-src='" +
            item.src +
            "'><div class='audio-preview'><img src='assets/play-button.svg'></div><img class='audio-thumb' src='" +
            item.thumb +
            "'><div class='audio-info'><div class='audio-info-title'>" +
            item.name +
            "</div><a href='" +
            item.link +
            "' target='_blank' class='audio-info-desc'>" +
            item.desc +
            "</a><div class='audio-info-duration'>" +
            item.duration +
            '</div></div></div></div>'
        );
      }
    });
  } else if (type == 'text-tool') {
    $('#shapes-cont').append("<p class='row-title'>Animated</p>");
    $('#shapes-cont').append(
      "<div class='animated-text-grid'></div>"
    );
    text_animation_list.forEach(function (text) {
      $('.animated-text-grid').append(
        "<div class='animated-text-item noselect' data-id='" +
          text.name +
          "'><img draggable='false' class='noselect' src='" +
          text.src +
          "'></div>"
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Sans Serif</p>");
    text_items.sansserif.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          ", sans-serif'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Serif</p>");
    text_items.serif.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Monospace</p>");
    text_items.monospace.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Handwriting</p>");
    text_items.handwriting.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Display</p>");
    text_items.display.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
  }
}

function scrollBottom() {
  if (
    $(this).scrollTop() + $(this).innerHeight() >=
    $(this)[0].scrollHeight - 50
  ) {
    loadMoreMedia();
  }
  if ($(this).scrollTop() > 0) {
    $('#search-fixed').addClass('search-scrolling');
  } else {
    $('.search-scrolling').removeClass('search-scrolling');
  }
}

function addAnimatedText() {
  var newtext = new AnimatedText('Your text', {
    left: artboard.get('left') + artboard.get('width') / 2,
    top: artboard.get('top') + artboard.get('height') / 2,
    preset: $(this).attr('data-id'),
    typeAnim: 'letter',
    order: 'forward',
    fontFamily: 'Syne',
    duration: 1000,
    easing: 'easeInQuad',
    fill: '#FFFFFF',
  });
  animatedtext.push(newtext);
  newtext.render(canvas);
}

$(document).on('click', '.animated-text-item', addAnimatedText);

// Switch active panel in the library
function updateBrowser(type) {
  $('#browser').scrollTop(0);
  if (type == 'image-tool') {
    $('#browser-container').html(image_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'shape-tool') {
    $('#browser-container').html(shape_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'video-tool') {
    $('#browser-container').html(video_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'text-tool') {
    $('#browser-container').html(text_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'upload-tool') {
    $('#browser-container').html(upload_browser);
    populateGrid('images-tab');
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'audio-tool') {
    $('#browser-container').html(audio_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  }
}

// Switch tab in the uploads depending on item being uploaded
function updateUploadType() {
  $('.upload-tab-active').removeClass('upload-tab-active');
  $(this).addClass('upload-tab-active');
  populateGrid($(this).attr('id'));
}
$(document).on(
  'click',
  '.upload-tab:not(.upload-tab-active)',
  updateUploadType
);

// Switch tool
function switchTool(e) {
  $('#browser').removeClass('collapsed');
  $('#canvas-area').removeClass('canvas-full');
  if ($(this).attr('id') == 'more-tool') {
    showMore();
    return false;
  }
  resizeCanvas();
  var act = $('.tool-active');
  if (act.attr('id') == 'image-tool') {
    act.find('img').attr('src', 'assets/image.svg');
  } else if (act.attr('id') == 'text-tool') {
    act.find('img').attr('src', 'assets/text.svg');
  } else if (act.attr('id') == 'mockup-tool') {
    act.find('img').attr('src', 'assets/mockup.svg');
  } else if (act.attr('id') == 'video-tool') {
    act.find('img').attr('src', 'assets/video.svg');
  } else if (act.attr('id') == 'shape-tool') {
    act.find('img').attr('src', 'assets/shape.svg');
  } else if (act.attr('id') == 'upload-tool') {
    act.find('img').attr('src', 'assets/uploads.svg');
  } else if (act.attr('id') == 'audio-tool') {
    act.find('img').attr('src', 'assets/audio.svg');
  }
  $('.tool-active').removeClass('tool-active');
  $(this).addClass('tool-active');
  if ($(this).attr('id') == 'image-tool') {
    $(this).find('img').attr('src', 'assets/image-active.svg');
  } else if ($(this).attr('id') == 'text-tool') {
    $(this).find('img').attr('src', 'assets/text-active.svg');
  } else if ($(this).attr('id') == 'mockup-tool') {
    $(this).find('img').attr('src', 'assets/mockup-active.svg');
  } else if ($(this).attr('id') == 'video-tool') {
    $(this).find('img').attr('src', 'assets/video-active.svg');
  } else if ($(this).attr('id') == 'shape-tool') {
    $(this).find('img').attr('src', 'assets/shape-active.svg');
  } else if ($(this).attr('id') == 'upload-tool') {
    $(this).find('img').attr('src', 'assets/uploads-active.svg');
  } else if ($(this).attr('id') == 'audio-tool') {
    $(this).find('img').attr('src', 'assets/audio-active.svg');
  }
  setMobileAssetsActive(false);
  updateBrowser($(this).attr('id'));
  syncMobileLibrarySelect();
  resetHeight();
}
$(document).on('click', '.tool:not(.tool-active)', switchTool);

// Replace image or video by dragging on top and holding a key
function replaceObject(src, object) {
  var img = new Image();
  var width = object.width;
  var height = object.height;
  oldsrc = object._originalElement.currentSrc;
  oldobj = object;
  img.onload = function () {
    object.setElement(img);
    object.set('width', width);
    object.set('height', height);
    canvas.renderAll();
  };
  img.src = src;
}

// Drag object from the panel
function dragObject(e) {
  if (e.button === 2) {
    return false;
  }
  var pointerId = e.pointerId;
  var captureTarget = e.currentTarget;
  if (captureTarget && captureTarget.setPointerCapture) {
    captureTarget.setPointerCapture(pointerId);
  }
  var drag = $(this).clone();
  drag.css({
    background: 'transparent',
    boxShadow: 'none',
    color: '#000',
  });
  drag.appendTo('body');
  drag.css({
    position: 'absolute',
    zIndex: 9999999,
    left: $(this).offset().left,
    top: $(this).offset().top,
    width: canvas.getZoom() * drag.width(),
    pointerEvents: 'none',
    opacity: 0,
  });
  var pageX = e.pageX;
  var pageY = e.pageY;
  var offset = drag.offset();
  var offsetx = drag.offset().left + drag.width() / 2 - e.pageX;
  var offsety = drag.offset().top + drag.height() / 2 - e.pageY;
  var replacing = false;
  draggingPanel = true;
  var move = false;
  canvas.discardActiveObject();
  canvas.renderAll();
  function dragging(e) {
    $('#bottom-area').addClass('noselect');
    $('#toolbar').addClass('noselect');
    $('#browser').addClass('noselect');
    $('#properties').addClass('noselect');
    $('#controls').addClass('noselect');
    move = true;
    var left = offset.left + (e.pageX - pageX);
    var top = offset.top + (e.pageY - pageY);
    drag.offset({ left: left, top: top });

    if (
      overCanvas &&
      canvas.getActiveObject() &&
      !replacing &&
      canvas.getActiveObject().type == 'image' &&
      (drag.hasClass('image-grid-item') ||
        drag.hasClass('video-grid-item'))
    ) {
      if (e.ctrlKey) {
        drag.css('visibility', 'hidden');
        replaceObject(
          drag.attr('data-src'),
          canvas.getActiveObject()
        );
        replacing = true;
      } else {
        $('#replace-image').addClass('replace-active');
      }
    } else if (
      (replacing && !canvas.getActiveObject()) ||
      (replacing && !e.ctrlKey)
    ) {
      drag.css('visibility', 'visible');
      replaceObject(oldsrc, oldobj);
      replacing = false;
      canvas.discardActiveObject();
      $('#replace-image').removeClass('replace-active');
    } else {
      $('#replace-image').removeClass('replace-active');
    }

    if (overCanvas) {
      drag.css({ opacity: 1 });
    } else {
      drag.css({ opacity: 0.5 });
    }
  }
  function released(e) {
    $('#replace-image').removeClass('replace-active');
    $('#bottom-area').removeClass('noselect');
    $('#toolbar').removeClass('noselect');
    $('#browser').removeClass('noselect');
    $('#properties').removeClass('noselect');
    $('#controls').removeClass('noselect');
    draggingPanel = false;
    if (
      captureTarget &&
      captureTarget.releasePointerCapture &&
      pointerId !== undefined
    ) {
      captureTarget.releasePointerCapture(pointerId);
    }
    $(window)
      .off('pointermove', dragging)
      .off('pointerup pointercancel', released);
    canvasx = canvas.getPointer(e).x;
    canvasy = canvas.getPointer(e).y;
    var xpos = canvasx + offsetx - artboard.get('left');
    var ypos = canvasy + offsety - artboard.get('top');
    if (!overCanvas && move) {
      drag.remove();
      return false;
    }
    if (move && !replacing) {
      if (drag.hasClass('grid-item')) {
        newSVG(
          drag.find('img').attr('src'),
          xpos,
          ypos,
          drag.width(),
          false
        );
      } else if (drag.hasClass('image-external-grid-item')) {
        $('#load-image').addClass('loading-active');
        savePixabayImage(
          drag.attr('data-src'),
          xpos,
          ypos,
          drag.width()
        );
      } else if (drag.hasClass('video-external-grid-item')) {
        savePixabayVideo(
          drag.attr('data-src'),
          drag.find('img').attr('src'),
          xpos,
          ypos
        );
      } else if (drag.hasClass('image-grid-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.attr('data-src'),
          xpos,
          ypos,
          drag.width(),
          false
        );
      } else if (drag.hasClass('grid-emoji-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.find('img').attr('src'),
          xpos,
          ypos,
          drag.width(),
          false
        );
      } else if (drag.hasClass('add-text')) {
        if (drag.attr('id') == 'heading-text') {
          newTextbox(
            50,
            700,
            'Add a heading',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'subheading-text') {
          newTextbox(
            22,
            500,
            'Add a subheading',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'body-text') {
          newTextbox(
            18,
            400,
            'Add body text',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        } else {
          newTextbox(
            18,
            400,
            'Your text',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        }
      } else if (drag.hasClass('video-grid-item')) {
        $('#load-video').addClass('loading-active');
        loadVideo(drag.attr('data-src'), canvasx, canvasy);
      }
    } else if (!move && !replacing) {
      if (drag.hasClass('grid-item')) {
        newSVG(
          drag.find('img').attr('src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          100,
          true
        );
      } else if (drag.hasClass('image-external-grid-item')) {
        savePixabayImage(
          drag.attr('data-src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          150
        );
      } else if (drag.hasClass('video-external-grid-item')) {
        savePixabayVideo(
          drag.attr('data-src'),
          drag.find('img').attr('src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2
        );
      } else if (drag.hasClass('image-grid-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.attr('data-src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          150,
          true
        );
      } else if (drag.hasClass('grid-emoji-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.find('img').attr('src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          50,
          true
        );
      } else if (drag.hasClass('add-text')) {
        if (drag.attr('id') == 'heading-text') {
          newTextbox(
            50,
            700,
            'Add a heading',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'subheading-text') {
          newTextbox(
            22,
            500,
            'Add a subheading',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'body-text') {
          newTextbox(
            18,
            400,
            'Add body text',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        } else {
          newTextbox(
            18,
            400,
            'Your text',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        }
      } else if (drag.hasClass('video-grid-item')) {
        $('#load-video').addClass('loading-active');
        loadVideo(
          drag.attr('data-src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          true
        );
      }
    }
    drag.remove();
  }
  $(window)
    .on('pointerup pointercancel', released)
    .on('pointermove', dragging);
}
$(document).on('pointerdown', '.image-grid-item', dragObject);
$(document).on('pointerdown', '.video-grid-item', dragObject);
$(document).on('pointerdown', '.grid-item', dragObject);
$(document).on('pointerdown', '.grid-emoji-item', dragObject);
$(document).on('pointerdown', '.add-text', dragObject);
$(document).on('mousedown click mouseup', '.credit', function (e) {
  e.stopPropagation();
});

// Collapse library
function collapsePanel() {
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
    setMobileLibraryOpen(false);
    return;
  }
  $('#browser').addClass('collapsed');
  $('#behind-browser').addClass('collapsed');
  $('#canvas-area').addClass('canvas-full');
  var act = $('.tool-active');
  if (act.attr('id') == 'image-tool') {
    act.find('img').attr('src', 'assets/image.svg');
  } else if (act.attr('id') == 'text-tool') {
    act.find('img').attr('src', 'assets/text.svg');
  } else if (act.attr('id') == 'mockup-tool') {
    act.find('img').attr('src', 'assets/mockup.svg');
  } else if (act.attr('id') == 'video-tool') {
    act.find('img').attr('src', 'assets/video.svg');
  } else if (act.attr('id') == 'shape-tool') {
    act.find('img').attr('src', 'assets/shape.svg');
  } else if (act.attr('id') == 'upload-tool') {
    act.find('img').attr('src', 'assets/uploads.svg');
  }
  $('.tool-active').removeClass('tool-active');
  resizeCanvas();
}
$(document).on('click', '#collapse', collapsePanel);
$(document).on('click', '.tool-active', collapsePanel);

// Change canvas dimensions to selected preset
function setPreset() {
  if ($(this).val() != 'custom') {
    artboard.set({
      width: presets.find((x) => x.id == $(this).val()).width,
      height: presets.find((x) => x.id == $(this).val()).height,
    });
    canvas.renderAll();
    resizeCanvas();
  }
  activepreset = $(this).val();
  updatePanel();
  save();
}
$(document).on('change', '#preset', setPreset);

function setTextPreset() {
  var object = canvas.getActiveObject();
  animatedtext
    .find((x) => x.id == object.id)
    .setProp({ preset: $(this).val() }, canvas);
  save();
}
function setTextEasing() {
  var object = canvas.getActiveObject();
  animatedtext
    .find((x) => x.id == object.id)
    .setProp({ easing: $(this).val() }, canvas);
  save();
}
$(document).on('change', '#preset-picker', setTextPreset);
$(document).on('change', '#easing-picker', setTextEasing);

// Delete media from the panel
function deleteMedia(e) {
  e.preventDefault();
  e.stopPropagation();
  var key = $(this).parent().attr('data-key');
  if (
    window.confirm(
      'Are you sure you want to permanently delete this asset? It will also remove any instances of it in the canvas.'
    )
  ) {
    deleteAsset(key);
  }
}
$(document).on('mousedown', '.delete-media', deleteMedia);

// Save layer name
function saveLayerName() {
  $('.name-active').prop('readonly', true);
  if ($('.name-active').val() == '') {
    $('.name-active').val('Untitled layer');
  }
  objects.find(
    (x) =>
      x.id == $('.name-active').parent().parent().attr('data-object')
  ).label = $('.name-active').val();
  save();
  $('.name-active').removeClass('name-active');
  if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    document.selection.empty();
  }
  editinglayer = false;
}
$(document).on('focusout', '.layer-custom-name', saveLayerName);

// Zoom to specific level
function zoomTo() {
  var zoom;
  if ($(this).attr('data-zoom') == 'in') {
    zoom = canvas.getZoom() + 0.2;
  } else if ($(this).attr('data-zoom') == 'out') {
    zoom = canvas.getZoom() - 0.2;
  } else {
    zoom = parseInt($(this).attr('data-zoom')) / 100;
  }
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.setZoom(1);
  canvas.renderAll();
  var vpw = canvas.width / zoom;
  var vph = canvas.height / zoom;
  var x = artboard.left + artboard.width / 2 - vpw / 2;
  var y = artboard.top + artboard.height / 2 - vph / 2;
  canvas.absolutePan({ x: x, y: y });
  canvas.setZoom(zoom);
  canvas.renderAll();
  $('#zoom-level span').html(
    (canvas.getZoom() * 100).toFixed(0) + '%'
  );
}
$(document).on('click', '.zoom-options-item', zoomTo);

// Add background audio (temporary)
function addBackgroundAudio() {
  background_audio = new Audio('assets/audio.wav');
}

// Hide all modals
function hideModals() {
  $('.modal-open').removeClass('modal-open');
}
$('#background-overlay').on('click', hideModals);

// Open download modal
function downloadModal() {
  if (!recording) {
    hideModals();
    $('#download-modal').addClass('modal-open');
    $('#background-overlay').addClass('modal-open');
  }
}
$('#download').on('click', downloadModal);

// Open import/export modal
function importExportModal() {
  hideModals();
  $('#import-export-modal').toggleClass('modal-open');
  $('#background-overlay').toggleClass('modal-open');
}
$('#share').on('click', importExportModal);

var mobileLayout = {
  active: false,
  layerHome: null,
  propertiesHome: null,
  sheetMode: 'layers',
  assetsActive: false,
  assetsCategory: 'All',
  assetsQuery: '',
  scrubberTimer: null
};

var speedEditor = {
  active: false,
  points: [
    { t: 0, v: 1.15 },
    { t: 0.5, v: 4 },
    { t: 1, v: 8 }
  ],
  selectedIndex: 1,
  dragging: false,
  dragIndex: null,
  timer: null
};

var speedPresets = [
  [
    { t: 0, v: 1.15 },
    { t: 0.35, v: 3 },
    { t: 1, v: 8 }
  ],
  [
    { t: 0, v: 8 },
    { t: 0.6, v: 6 },
    { t: 1, v: 1.15 }
  ],
  [
    { t: 0, v: 1.15 },
    { t: 0.4, v: 8 },
    { t: 0.8, v: 1.4 },
    { t: 1, v: 4 }
  ],
  [
    { t: 0, v: 2 },
    { t: 0.5, v: 2 },
    { t: 1, v: 8 }
  ],
  [
    { t: 0, v: 8 },
    { t: 0.5, v: 1.2 },
    { t: 1, v: 8 }
  ]
];

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function getSpeedRange() {
  return { min: 1.15, max: 8 };
}

function mapSpeedToY(speed, height) {
  var range = getSpeedRange();
  var ratio = (speed - range.min) / (range.max - range.min);
  return height - ratio * height;
}

function mapYToSpeed(y, height) {
  var range = getSpeedRange();
  var ratio = 1 - y / height;
  return range.min + ratio * (range.max - range.min);
}

function buildSpeedPath(points, width, height) {
  if (!points.length) {
    return '';
  }
  var p = points.map(function (pt) {
    return { x: pt.t * width, y: mapSpeedToY(pt.v, height) };
  });
  if (p.length === 1) {
    return 'M ' + p[0].x + ' ' + p[0].y;
  }
  var d = 'M ' + p[0].x + ' ' + p[0].y;
  for (var i = 0; i < p.length - 1; i++) {
    var p0 = p[i - 1] || p[i];
    var p1 = p[i];
    var p2 = p[i + 1];
    var p3 = p[i + 2] || p2;
    var cp1x = p1.x + (p2.x - p0.x) / 6;
    var cp1y = p1.y + (p2.y - p0.y) / 6;
    var cp2x = p2.x - (p3.x - p1.x) / 6;
    var cp2y = p2.y - (p3.y - p1.y) / 6;
    d +=
      ' C ' +
      cp1x +
      ' ' +
      cp1y +
      ', ' +
      cp2x +
      ' ' +
      cp2y +
      ', ' +
      p2.x +
      ' ' +
      p2.y;
  }
  return d;
}

function sortSpeedPoints() {
  speedEditor.points.sort(function (a, b) {
    return a.t - b.t;
  });
}

function getSpeedValueAt(t) {
  if (!speedEditor.points.length) {
    return 1.15;
  }
  sortSpeedPoints();
  if (t <= speedEditor.points[0].t) {
    return speedEditor.points[0].v;
  }
  if (t >= speedEditor.points[speedEditor.points.length - 1].t) {
    return speedEditor.points[speedEditor.points.length - 1].v;
  }
  for (var i = 0; i < speedEditor.points.length - 1; i++) {
    var a = speedEditor.points[i];
    var b = speedEditor.points[i + 1];
    if (t >= a.t && t <= b.t) {
      var ratio = (t - a.t) / (b.t - a.t || 1);
      return a.v + (b.v - a.v) * ratio;
    }
  }
  return speedEditor.points[0].v;
}

function renderSpeedEditor() {
  var $svg = $('#speed-editor-svg');
  if (!$svg.length) {
    return;
  }
  var width = 360;
  var height = 220;
  sortSpeedPoints();
  $('#speed-editor-path').attr(
    'd',
    buildSpeedPath(speedEditor.points, width, height)
  );
  var pointsHtml = '';
  speedEditor.points.forEach(function (pt, index) {
    var x = pt.t * width;
    var y = mapSpeedToY(pt.v, height);
    var outerClass = 'speed-point-outer';
    if (index === speedEditor.selectedIndex) {
      outerClass += ' active';
    }
    pointsHtml +=
      "<circle class='" +
      outerClass +
      "' data-index='" +
      index +
      "' cx='" +
      x +
      "' cy='" +
      y +
      "' r='10'/>";
    pointsHtml +=
      "<circle class='inner' data-index='" +
      index +
      "' cx='" +
      x +
      "' cy='" +
      y +
      "' r='5'/>";
    pointsHtml +=
      "<circle class='hit' data-index='" +
      index +
      "' cx='" +
      x +
      "' cy='" +
      y +
      "' r='18'/>";
  });
  $('#speed-editor-points').html(pointsHtml);
  updateSpeedEditorPlayhead();
}

function updateSpeedEditorPlayhead() {
  var width = 360;
  var height = 220;
  var timeRatio = 0;
  if (typeof timelinetime !== 'undefined' && timelinetime > 0) {
    timeRatio = clamp(currenttime / timelinetime, 0, 1);
  }
  var x = timeRatio * width;
  var value = getSpeedValueAt(timeRatio);
  var y = mapSpeedToY(value, height);
  $('#speed-editor-playhead').attr({ x1: x, x2: x });
  $('#speed-editor-playhead-dot').attr({ cx: x, cy: y });
}

function startSpeedEditorTimer() {
  if (speedEditor.timer) {
    return;
  }
  speedEditor.timer = setInterval(updateSpeedEditorPlayhead, 120);
}

function stopSpeedEditorTimer() {
  if (speedEditor.timer) {
    clearInterval(speedEditor.timer);
    speedEditor.timer = null;
  }
}

function loadSpeedFromSelection() {
  var selection = canvas && canvas.getActiveObject
    ? canvas.getActiveObject()
    : null;
  if (!selection) {
    return;
  }
  var meta = objects.find(function (obj) {
    return obj.id == selection.get('id');
  });
  if (meta && meta.speedCurve && meta.speedCurve.length) {
    speedEditor.points = meta.speedCurve.map(function (pt) {
      return { t: pt.t, v: pt.v };
    });
    speedEditor.selectedIndex = Math.min(1, speedEditor.points.length - 1);
  }
}

function saveSpeedToSelection() {
  var selection = canvas && canvas.getActiveObject
    ? canvas.getActiveObject()
    : null;
  if (!selection) {
    return;
  }
  var meta = objects.find(function (obj) {
    return obj.id == selection.get('id');
  });
  if (meta) {
    meta.speedCurve = speedEditor.points.map(function (pt) {
      return { t: pt.t, v: pt.v };
    });
    save();
  }
}

function storeHome($el) {
  return { parent: $el.parent(), next: $el.next() };
}

function restoreElement($el, home) {
  if (!home || !home.parent || home.parent.length === 0) {
    return;
  }
  if (home.next && home.next.length) {
    $el.insertBefore(home.next);
  } else {
    $el.appendTo(home.parent);
  }
}

function applyMobileLayout() {
  var isMobile =
    window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
  if (isMobile && !mobileLayout.active) {
    var $layerList = $('#layer-list');
    var $properties = $('#properties');
    if (!mobileLayout.layerHome) {
      mobileLayout.layerHome = storeHome($layerList);
    }
    if (!mobileLayout.propertiesHome) {
      mobileLayout.propertiesHome = storeHome($properties);
    }
    $('#mobile-sheet-body').append($layerList, $properties);
    $('body').removeClass('mobile-sheet-open');
    $('body')
      .removeClass('mobile-sheet-properties')
      .addClass('mobile-sheet-layers');
    $('.mobile-sheet-tab').removeClass('mobile-sheet-tab-active');
    $('.mobile-sheet-tab[data-sheet="layers"]').addClass(
      'mobile-sheet-tab-active'
    );
    mobileLayout.active = true;
    syncMobileLibrarySelect();
    startMobileScrubber();
  } else if (!isMobile && mobileLayout.active) {
    restoreElement($('#layer-list'), mobileLayout.layerHome);
    restoreElement($('#properties'), mobileLayout.propertiesHome);
    $('body')
      .removeClass('mobile-sheet-open')
      .removeClass('mobile-sheet-layers')
      .removeClass('mobile-sheet-properties')
      .removeClass('timeline-collapsed')
      .removeClass('mobile-library-open')
      .removeClass('mobile-speed-open');
    $('#mobile-library').removeClass('mobile-toggle-active');
    setMobileAssetsActive(false);
    stopMobileScrubber();
    mobileLayout.active = false;
  }
}

function syncMobileLibrarySelect() {
  if (!mobileLayout.active) {
    return;
  }
  if (mobileLayout.assetsActive) {
    return;
  }
  var activeTool = $('.tool-active').attr('id');
  if (!activeTool) {
    return;
  }
  var $select = $('#mobile-library-select');
  if ($select.length && $select.find('option[value="' + activeTool + '"]').length) {
    $select.val(activeTool);
  }
}

var mobileAssets = [
  { name: 'Beach', src: 'assets/beach.png', category: 'Nature' },
  { name: 'Forest', src: 'assets/forest.png', category: 'Nature' },
  { name: 'Nature', src: 'assets/nature.png', category: 'Nature' },
  { name: 'Rain', src: 'assets/rain.png', category: 'Nature' },
  { name: 'Summer', src: 'assets/summer.png', category: 'Nature' },
  { name: 'Space', src: 'assets/space.png', category: 'Abstract' },
  { name: 'Wallpaper', src: 'assets/wallpaper.png', category: 'Abstract' },
  { name: 'Background', src: 'assets/background.png', category: 'Abstract' },
  { name: 'Street', src: 'assets/street.png', category: 'Urban' },
  { name: 'Office', src: 'assets/office.png', category: 'Urban' },
  { name: 'Cars', src: 'assets/cars.png', category: 'Urban' },
  { name: 'Travel', src: 'assets/travel.png', category: 'Lifestyle' },
  { name: 'Food', src: 'assets/food.png', category: 'Lifestyle' },
  { name: 'Meditation', src: 'assets/meditation.png', category: 'Lifestyle' },
  { name: 'Work', src: 'assets/work.png', category: 'Lifestyle' },
  { name: 'Animals', src: 'assets/animals.png', category: 'Lifestyle' }
];

function setMobileAssetsActive(active) {
  mobileLayout.assetsActive = active;
  if (!active) {
    mobileLayout.assetsCategory = 'All';
    mobileLayout.assetsQuery = '';
  }
}

function isMobileQuickActionsActive() {
  return mobileLayout.active && $('body').hasClass('mobile-page');
}

function updateMobileQuickActions() {
  if (!isMobileQuickActionsActive()) {
    return;
  }
  var selection = canvas && canvas.getActiveObject
    ? canvas.getActiveObject()
    : null;
  var hasSelection = !!selection;
  $('body').toggleClass('mobile-selection', hasSelection);
  var $groupBtn = $('#mobile-action-group');
  if (!hasSelection) {
    $groupBtn.text('Group');
    $('#mobile-action-lock').text('Lock');
    return;
  }
  if (selection.type === 'group') {
    $groupBtn.text('Ungroup');
  } else if (selection.type === 'activeSelection') {
    $groupBtn.text('Group');
  } else {
    $groupBtn.text('Group');
  }
  var lockLabel = selection.selectable === false ? 'Unlock' : 'Lock';
  $('#mobile-action-lock').text(lockLabel);
  $('#mobile-action-snap').toggleClass(
    'active',
    typeof snapEnabled === 'undefined' ? true : !!snapEnabled
  );
}

function startMobileScrubber() {
  if (mobileLayout.scrubberTimer) {
    return;
  }
  mobileLayout.scrubberTimer = setInterval(updateMobileScrubberUI, 200);
}

function stopMobileScrubber() {
  if (mobileLayout.scrubberTimer) {
    clearInterval(mobileLayout.scrubberTimer);
    mobileLayout.scrubberTimer = null;
  }
}

function updateMobileScrubberUI() {
  if (!isMobileQuickActionsActive()) {
    return;
  }
  if (typeof timelinetime === 'undefined') {
    return;
  }
  var max = Math.max(0, Math.round(timelinetime));
  var value = Math.max(0, Math.round(currenttime || 0));
  $('#mobile-mini-scrubber-range').attr('max', max).val(value);
  var totalSeconds = value / 1000;
  var minutes = Math.floor(totalSeconds / 60);
  var seconds = Math.floor(totalSeconds % 60);
  $('#mobile-mini-time').text(
    ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)
  );
}

function setMobileScrubTime(value) {
  if (typeof timelinetime === 'undefined') {
    return;
  }
  paused = true;
  currenttime = Math.min(Math.max(0, value), timelinetime);
  if (currenttime % 16.666 != 0) {
    currenttime = Math.ceil(currenttime / 16.666) * 16.666;
  }
  if (typeof renderTime === 'function') {
    renderTime();
  }
  if ($('#seekbar').length) {
    $('#seekbar').offset({
      left:
        offset_left +
        $('#inner-timeline').offset().left +
        currenttime / timelinetime
    });
  }
  animate(false, currenttime);
  updatePanelValues();
}

function renderMobileAssetsPanel() {
  if (!mobileLayout.active) {
    return;
  }
  var $container = $('#browser-container');
  var categories = ['All', 'Nature', 'Urban', 'Lifestyle', 'Abstract'];
  var query = (mobileLayout.assetsQuery || '').toLowerCase().trim();
  var category = mobileLayout.assetsCategory || 'All';
  var filtered = mobileAssets.filter(function (asset) {
    var matchesCategory = category === 'All' || asset.category === category;
    var matchesQuery =
      !query || asset.name.toLowerCase().indexOf(query) !== -1;
    return matchesCategory && matchesQuery;
  });
  var chipsHtml = categories
    .map(function (cat) {
      var activeClass = cat === category ? ' active' : '';
      return (
        "<button class='mobile-assets-chip" +
        activeClass +
        "' data-category='" +
        cat +
        "'>" +
        cat +
        '</button>'
      );
    })
    .join('');
  var cardsHtml = filtered
    .map(function (asset) {
      return (
        "<div class='image-grid-item mobile-assets-card' data-src='" +
        asset.src +
        "' data-type='image' data-category='" +
        asset.category +
        "'>" +
        "<img draggable='false' src='" +
        asset.src +
        "' alt=''>" +
        '<span>' +
        asset.name +
        '</span></div>'
      );
    })
    .join('');
  $container.html(
    "<div class='mobile-assets-panel'>" +
      "<div class='mobile-assets-header'>" +
      "<div class='mobile-assets-title'>Assets</div></div>" +
      "<div class='mobile-assets-search'><img src='assets/search.svg' alt=''>" +
      "<input id='mobile-assets-search-input' placeholder='Search assets' value='" +
      (mobileLayout.assetsQuery || '') +
      "'></div>" +
      "<div class='mobile-assets-chips'>" +
      chipsHtml +
      '</div>' +
      "<div class='mobile-assets-grid'>" +
      cardsHtml +
      '</div></div>'
  );
}

function showMobileAssetsPanel() {
  if (!mobileLayout.active) {
    return;
  }
  setMobileAssetsActive(true);
  renderMobileAssetsPanel();
}

function setMobileLibraryOpen(open) {
  if (!mobileLayout.active) {
    return;
  }
  if (open) {
    $('body').removeClass('mobile-speed-open');
    $('#browser').removeClass('collapsed');
    $('#behind-browser').removeClass('collapsed');
    $('body').addClass('mobile-library-open');
    $('#mobile-library').addClass('mobile-toggle-active');
    if ($('#mobile-library-select').val() === 'mobile-assets') {
      showMobileAssetsPanel();
    }
    syncMobileLibrarySelect();
  } else {
    $('body').removeClass('mobile-library-open');
    $('#mobile-library').removeClass('mobile-toggle-active');
  }
}

function setMobileSpeedOpen(open) {
  if (!mobileLayout.active) {
    return;
  }
  if (open) {
    $('body').addClass('mobile-speed-open');
    setMobileLibraryOpen(false);
    speedEditor.active = true;
    loadSpeedFromSelection();
    renderSpeedEditor();
    startSpeedEditorTimer();
  } else {
    $('body').removeClass('mobile-speed-open');
    speedEditor.active = false;
    stopSpeedEditorTimer();
  }
}

function setMobileSheet(mode) {
  if (!mobileLayout.active) {
    return;
  }
  var alreadyOpen = $('body').hasClass('mobile-sheet-open');
  if (alreadyOpen && mobileLayout.sheetMode === mode) {
    $('body').removeClass('mobile-sheet-open');
    return;
  }
  mobileLayout.sheetMode = mode;
  $('body')
    .addClass('mobile-sheet-open')
    .removeClass('mobile-sheet-layers mobile-sheet-properties')
    .addClass('mobile-sheet-' + mode);
  $('.mobile-sheet-tab').removeClass('mobile-sheet-tab-active');
  $('.mobile-sheet-tab[data-sheet="' + mode + '"]').addClass(
    'mobile-sheet-tab-active'
  );
}

$(document).on('click', '.mobile-sheet-tab', function () {
  setMobileSheet($(this).attr('data-sheet'));
});
$(document).on('click', '#mobile-sheet-handle', function () {
  if (!$('body').hasClass('mobile-sheet-open')) {
    setMobileSheet(mobileLayout.sheetMode);
  } else {
    $('body').removeClass('mobile-sheet-open');
  }
});
$(document).on('click', '#mobile-library', function () {
  var isOpen = $('body').hasClass('mobile-library-open');
  setMobileLibraryOpen(!isOpen);
});
$(document).on('click', '#mobile-speed', function () {
  var isOpen = $('body').hasClass('mobile-speed-open');
  setMobileSpeedOpen(!isOpen);
});
$(document).on('click', '#speed-editor-close', function () {
  setMobileSpeedOpen(false);
});
$(document).on('click', '#speed-editor-apply', function () {
  saveSpeedToSelection();
  setMobileSpeedOpen(false);
});
$(document).on('click', '.speed-preset', function () {
  $('.speed-preset').removeClass('active');
  $(this).addClass('active');
  var index = $(this).index();
  if (speedPresets[index]) {
    speedEditor.points = speedPresets[index].map(function (pt) {
      return { t: pt.t, v: pt.v };
    });
    speedEditor.selectedIndex = Math.min(1, speedEditor.points.length - 1);
    renderSpeedEditor();
  }
});
$(document).on('click', '#speed-editor-add', function () {
  var timeRatio = 0;
  if (typeof timelinetime !== 'undefined' && timelinetime > 0) {
    timeRatio = clamp(currenttime / timelinetime, 0, 1);
  }
  var value = getSpeedValueAt(timeRatio);
  speedEditor.points.push({ t: timeRatio, v: value });
  sortSpeedPoints();
  speedEditor.selectedIndex = speedEditor.points.findIndex(function (pt) {
    return pt.t === timeRatio && pt.v === value;
  });
  if (speedEditor.selectedIndex < 0) {
    speedEditor.selectedIndex = 0;
  }
  renderSpeedEditor();
});
$(document).on('click', '#speed-editor-delete', function () {
  if (speedEditor.selectedIndex === null) {
    return;
  }
  if (speedEditor.points.length <= 2) {
    return;
  }
  if (
    speedEditor.selectedIndex === 0 ||
    speedEditor.selectedIndex === speedEditor.points.length - 1
  ) {
    return;
  }
  speedEditor.points.splice(speedEditor.selectedIndex, 1);
  speedEditor.selectedIndex = Math.min(
    speedEditor.selectedIndex,
    speedEditor.points.length - 1
  );
  renderSpeedEditor();
});
$(document).on('pointerdown', '#speed-editor-points .hit', function (e) {
  e.preventDefault();
  var idx = parseInt($(this).attr('data-index'), 10);
  if (isNaN(idx)) {
    return;
  }
  speedEditor.dragging = true;
  speedEditor.dragIndex = idx;
  speedEditor.selectedIndex = idx;
  renderSpeedEditor();
});
$(document).on('pointermove', function (e) {
  if (!speedEditor.dragging || speedEditor.dragIndex === null) {
    return;
  }
  e.preventDefault();
  var svg = document.getElementById('speed-editor-svg');
  if (!svg) {
    return;
  }
  var rect = svg.getBoundingClientRect();
  var width = 360;
  var height = 220;
  var x = clamp(e.clientX - rect.left, 0, rect.width);
  var y = clamp(e.clientY - rect.top, 0, rect.height);
  var t = clamp(x / rect.width, 0, 1);
  var v = mapYToSpeed((y / rect.height) * height, height);
  v = clamp(v, getSpeedRange().min, getSpeedRange().max);
  if (speedEditor.dragIndex === 0) {
    t = 0;
  } else if (speedEditor.dragIndex === speedEditor.points.length - 1) {
    t = 1;
  }
  speedEditor.points[speedEditor.dragIndex] = { t: t, v: v };
  renderSpeedEditor();
});
$(document).on('pointerup pointercancel', function () {
  if (speedEditor.dragging) {
    speedEditor.dragging = false;
    speedEditor.dragIndex = null;
  }
});
$(document).on('click', '#mobile-library-close', function () {
  setMobileLibraryOpen(false);
});
$(document).on('change', '#mobile-library-select', function () {
  var toolId = $(this).val();
  if (toolId === 'mobile-assets') {
    showMobileAssetsPanel();
    return;
  }
  setMobileAssetsActive(false);
  if (toolId) {
    $('#' + toolId).trigger('click');
  }
});
$(document).on('input', '#mobile-assets-search-input', function () {
  mobileLayout.assetsQuery = $(this).val();
  renderMobileAssetsPanel();
});
$(document).on('click', '.mobile-assets-chip', function () {
  mobileLayout.assetsCategory = $(this).attr('data-category');
  renderMobileAssetsPanel();
});

function toggleSnapGuides() {
  if (typeof snapEnabled === 'undefined') {
    window.snapEnabled = true;
  }
  snapEnabled = !snapEnabled;
  $('#mobile-action-snap').toggleClass('active', !!snapEnabled);
}

function duplicateSelection() {
  var selection = canvas.getActiveObject();
  if (!selection) {
    return;
  }
  clipboard = selection;
  cliptype = 'object';
  copyObject();
}

function toggleLockSelection() {
  var selection = canvas.getActiveObject();
  if (!selection) {
    return;
  }
  var $layer = $(".layer[data-object='" + selection.get('id') + "']");
  if ($layer.length) {
    $layer.find('.lock').trigger('click');
  } else {
    selection.selectable = !selection.selectable;
    if (!selection.selectable) {
      canvas.discardActiveObject();
    }
    canvas.renderAll();
  }
  updateMobileQuickActions();
}

function toggleGroupSelection() {
  var selection = canvas.getActiveObject();
  if (!selection) {
    return;
  }
  if (selection.type === 'group') {
    unGroup(selection);
  } else if (selection.type === 'activeSelection') {
    group();
  }
  updateMobileQuickActions();
}

function flipSelection(axis) {
  var selection = canvas.getActiveObject();
  if (!selection) {
    return;
  }
  if (selection.type === 'activeSelection') {
    selection._objects.forEach(function (obj) {
      obj.set(axis, !obj.get(axis));
      obj.setCoords();
    });
    reselect(selection);
  } else {
    selection.set(axis, !selection.get(axis));
    selection.setCoords();
  }
  canvas.renderAll();
  save();
  updatePanelValues();
}

function alignSelection(type) {
  var selection = canvas.getActiveObject();
  if (!selection) {
    return;
  }
  if (selection.type === 'activeSelection') {
    var tempselection = selection;
    canvas.discardActiveObject();
    tempselection._objects.forEach(function (object) {
      alignControls(object, type);
      canvas.renderAll();
      newKeyframe('left', object, currenttime, object.get('left'), true);
      newKeyframe('top', object, currenttime, object.get('top'), true);
    });
    reselect(tempselection);
  } else {
    alignControls(selection, type);
    canvas.renderAll();
    newKeyframe('left', selection, currenttime, selection.get('left'), true);
    newKeyframe('top', selection, currenttime, selection.get('top'), true);
  }
}

$(document).on('click', '#mobile-action-duplicate', duplicateSelection);
$(document).on('click', '#mobile-action-group', toggleGroupSelection);
$(document).on('click', '#mobile-action-lock', toggleLockSelection);
$(document).on('click', '#mobile-action-flip-h', function () {
  flipSelection('flipX');
});
$(document).on('click', '#mobile-action-flip-v', function () {
  flipSelection('flipY');
});
$(document).on('click', '#mobile-action-align-left', function () {
  alignSelection('align-left');
});
$(document).on('click', '#mobile-action-align-center', function () {
  alignSelection('align-center-h');
  alignSelection('align-center-v');
});
$(document).on('click', '#mobile-action-align-right', function () {
  alignSelection('align-right');
});
$(document).on('click', '#mobile-action-align-top', function () {
  alignSelection('align-top');
});
$(document).on('click', '#mobile-action-align-middle', function () {
  alignSelection('align-center-v');
});
$(document).on('click', '#mobile-action-align-bottom', function () {
  alignSelection('align-bottom');
});
$(document).on('click', '#mobile-action-snap', toggleSnapGuides);
$(document).on('input', '#mobile-mini-scrubber-range', function () {
  var value = parseFloat($(this).val());
  setMobileScrubTime(value);
});

function initMobileSelectionListeners() {
  if (!canvas || !canvas.on) {
    return;
  }
  canvas.on('selection:created', function () {
    updateMobileQuickActions();
    if (speedEditor.active) {
      loadSpeedFromSelection();
      renderSpeedEditor();
    }
  });
  canvas.on('selection:updated', function () {
    updateMobileQuickActions();
    if (speedEditor.active) {
      loadSpeedFromSelection();
      renderSpeedEditor();
    }
  });
  canvas.on('selection:cleared', function () {
    updateMobileQuickActions();
  });
  updateMobileQuickActions();
}

function waitForCanvas() {
  var tries = 0;
  var timer = setInterval(function () {
    if (canvas && canvas.on) {
      clearInterval(timer);
      initMobileSelectionListeners();
      return;
    }
    tries += 1;
    if (tries > 50) {
      clearInterval(timer);
    }
  }, 100);
}

$(document).ready(waitForCanvas);

function setMobileSelectActive(active) {
  if (active) {
    setHandToolActive(false);
    canvas.selection = true;
    $('#mobile-select').addClass('mobile-toggle-active');
    $('#mobile-pan').removeClass('mobile-toggle-active');
  }
}

function setMobilePanActive(active) {
  if (active) {
    setHandToolActive(true);
    canvas.selection = false;
    $('#mobile-pan').addClass('mobile-toggle-active');
    $('#mobile-select').removeClass('mobile-toggle-active');
  } else {
    setHandToolActive(false);
    canvas.selection = true;
    $('#mobile-pan').removeClass('mobile-toggle-active');
    $('#mobile-select').addClass('mobile-toggle-active');
  }
}

$(document).on('click', '#mobile-select', function () {
  setMobileSelectActive(true);
});
$(document).on('click', '#mobile-pan', function () {
  setMobilePanActive(!$('#mobile-pan').hasClass('mobile-toggle-active'));
});
$(document).on('click', '#mobile-undo', function () {
  $('#undo').trigger('click');
});
$(document).on('click', '#mobile-redo', function () {
  $('#redo').trigger('click');
});
$(document).on('click', '#mobile-add-text', function () {
  newTextbox(
    50,
    700,
    'Add a heading',
    artboard.get('left') + artboard.get('width') / 2,
    artboard.get('top') + artboard.get('height') / 2,
    300,
    true,
    'Inter'
  );
});
$(document).on('click', '#mobile-panels', function () {
  var hasSelection =
    canvas && canvas.getActiveObject && canvas.getActiveObject();
  setMobileSheet(hasSelection ? 'properties' : 'layers');
});
$(document).on('click', '#mobile-export', function () {
  downloadModal();
});

$(window).on('resize', applyMobileLayout);
$(document).ready(applyMobileLayout);

function searchInput() {
  var value = $(this).val().toLowerCase();
  if (value == '') {
    $('#delete-search').removeClass('show-delete');
  } else {
    $('#delete-search').addClass('show-delete');
  }
}

function fancyTimeFormat(duration) {
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;
  var ret = '';
  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }
  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

function loadMoreMedia() {
  var value = $('#browser-search input').val();
  if (value != '' && page != false) {
    page += 1;
    if ($('#image-tool').hasClass('tool-active')) {
      var URL =
        'https://pixabay.com/api/?key=' +
        API_KEY +
        '&q=' +
        encodeURIComponent(value) +
        '&page=' +
        page;
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            $('#images-grid').append(
              "<div class='image-grid-item image-external-grid-item' data-src='" +
                hit.webformatURL +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><img draggable=false onload='onLoadImage(this)' src='" +
                hit.webformatURL +
                "'</div>"
            );
          });
        } else {
          page = false;
        }
      });
    } else if ($('#video-tool').hasClass('tool-active')) {
      var URL =
        'https://pixabay.com/api/videos/?key=' +
        API_KEY +
        '&q=' +
        encodeURIComponent(value) +
        '&page=' +
        page;
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            var video = hit.videos.medium.url;
            $('#images-grid').append(
              "<div class='image-grid-item video-external-grid-item' data-src='" +
                video +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><div id='time-video'>" +
                fancyTimeFormat(hit.duration) +
                "</div><img draggable=false onload='onLoadImage(this)' src='assets/transparent.png'</div>"
            );
            createVideoThumbnail(video, 250, 0, true).then(function (
              data
            ) {
              $(".image-grid-item[data-src='" + video + "']")
                .find('img')
                .attr('src', data);
            });
          });
        } else {
          page = false;
        }
      });
    }
  }
}

function search() {
  page = 1;
  var value = $('#browser-search input').val();
  if ($('#image-tool').hasClass('tool-active')) {
    var URL =
      'https://pixabay.com/api/?key=' +
      API_KEY +
      '&q=' +
      encodeURIComponent(value) +
      '&page=' +
      page;
    $('#images-grid').html('');
    if (value != '') {
      $('#pixabay').addClass('hide-pixabay');
      $('#landing').addClass('hide-landing');
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            $('#images-grid').append(
              "<div class='image-grid-item image-external-grid-item' data-src='" +
                hit.webformatURL +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><img draggable=false onload='onLoadImage(this)' src='" +
                hit.webformatURL +
                "'</div>"
            );
          });
        } else {
          $('#shapes-cont').html(
            "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
              encodeURIComponent(value) +
              '&#x22;. Please try a different query.</div>'
          );
        }
      });
    } else {
      $('#pixabay').removeClass('hide-pixabay');
      $('#landing').removeClass('hide-landing');
    }
  } else if ($('#video-tool').hasClass('tool-active')) {
    var URL =
      'https://pixabay.com/api/videos/?key=' +
      API_KEY +
      '&q=' +
      encodeURIComponent(value);
    $('#images-grid').html('');
    if (value != '') {
      $('#landing').addClass('hide-landing');
      $('#pixabay').addClass('hide-pixabay');
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            var video = hit.videos.medium.url;
            $('#images-grid').append(
              "<div class='image-grid-item video-external-grid-item' data-src='" +
                video +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><div id='time-video'>" +
                fancyTimeFormat(hit.duration) +
                "</div><img draggable=false onload='onLoadImage(this)' src='assets/transparent.png'</div>"
            );
            //createVideoThumbnail(video, 250, 0, true).then(function(data){
            $(".image-grid-item[data-src='" + video + "']")
              .find('img')
              .attr(
                'src',
                'https://i.vimeocdn.com/video/' +
                  hit.picture_id +
                  '_640x360.jpg'
              );
            //});
          });
        } else {
          $('#shapes-cont').html(
            "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
              encodeURIComponent(value) +
              '&#x22;. Please try a different query.</div>'
          );
        }
      });
    } else {
      $('#pixabay').removeClass('hide-pixabay');
      $('#landing').removeClass('hide-landing');
    }
  } else if ($('#shape-tool').hasClass('tool-active')) {
    if (value == '') {
      $('#shapes-cont').html(
        '<p class="row-title">Shapes</p><div class="gallery-row" id="shapes-row"></div><p class="row-title">Emojis</p><div class="gallery-row" id="emojis-row"></div>'
      );
      populateGrid('shape-tool');
    } else {
      $('.row-title').remove();
      $('.gallery-row').remove();
      $('#shapes-cont').html("<div class='gallery-row'></div>");
      var combined = shape_grid_items.concat(emoji_items);
      var flag = false;
      combined.forEach(function (item) {
        if (item.indexOf(value) > -1) {
          flag = true;
          if (item.indexOf('emoji') > -1) {
            $('.gallery-row').append(
              "<div class='grid-emoji-item'><img draggable=false src='" +
                item +
                "'></div>"
            );
          } else {
            $('.gallery-row').append(
              "<div class='grid-item'><img draggable=false src='" +
                item +
                "'></div>"
            );
          }
        }
      });
      if (!flag) {
        $('#shapes-cont').html(
          "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
            encodeURIComponent(value) +
            '&#x22;. Please try a different query.</div>'
        );
      }
    }
  } else if ($('#text-tool').hasClass('tool-active')) {
    if (value == '') {
      $('#browser-container').html(text_browser);
      populateGrid('text-tool');
    } else {
      $('#shapes-cont').html('');
      $('.row-title').remove();
      var flag = false;
      fonts.forEach(function (font) {
        if (font.toLowerCase().indexOf(value) > -1) {
          flag = true;
          WebFont.load({
            google: {
              families: [font],
            },
          });
          $('#shapes-cont').append(
            "<div id='item-text' class='add-text noselect' data-font='" +
              font +
              "' style='font-family: " +
              font +
              "'>" +
              font +
              '</div>'
          );
        }
      });
      if (!flag) {
        $('#shapes-cont').html(
          "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
            encodeURIComponent(value) +
            '&#x22;. Please try a different query.</div>'
        );
      }
    }
  }
}

function searchCategory() {
  $('#browser-search input').val($(this).attr('data-name'));
  $('#delete-search').addClass('show-delete');
  search();
  $('#pixabay').addClass('hide-pixabay');
}

function deleteSearch() {
  $('#browser-search input').val('');
  $('#delete-search').removeClass('show-delete');
  if ($('#shape-tool').hasClass('tool-active')) {
    $('#shapes-cont').html(
      '<p class="row-title">Shapes</p><div class="gallery-row" id="shapes-row"></div><p class="row-title">Emojis</p><div class="gallery-row" id="emojis-row"></div>'
    );
    populateGrid('shape-tool');
  } else if ($('#image-tool').hasClass('tool-active')) {
    $('#images-grid').html('');
    $('#landing').removeClass('hide-landing');
    $('#pixabay').removeClass('hide-pixabay');
  } else if ($('#video-tool').hasClass('tool-active')) {
    $('#images-grid').html('');
    $('#landing').removeClass('hide-landing');
    $('#pixabay').removeClass('hide-pixabay');
  } else if ($('#text-tool').hasClass('tool-active')) {
    $('#browser-container').html(text_browser);
    populateGrid('text-tool');
  }
}
$(document).on('click', '#delete-search', deleteSearch);
$(document).on('input', '#browser-search input', searchInput);
$(document).on('click', '#search-button', search);
$(document).on('click', '.category', searchCategory);

function replaceAudioBackground() {
  var src = $(this).attr('data-src');
  newAudioLayer(src);
  /*
	if ($(this).hasClass("audio-item-active")) {
		background_audio = false;
		background_key = false;
		$(this).removeClass("audio-item-active");
		save();
	} else {
		var src = $(this).attr("data-src");
		if (background_audio != false) {
			$("#audio-upload-button").removeClass("remove-audio");
			$("#audio-upload-button").html('<img src="assets/upload.svg"> Upload audio');
		}
		db.collection("projects").doc({id: 1}).update({
			audiosrc: src,
		});
		background_audio = new Audio(src);
		background_audio.crossOrigin = "anonymous";
		background_key = src;
		save();
		$(this).addClass("audio-item-active");
	}		
	*/
}
$(document).on('click', '.audio-item', replaceAudioBackground);

function previewAudioBackground(e) {
  e.preventDefault();
  e.stopPropagation();
  var src = $(this).parent().attr('data-src');
  if ($(this).find('img').attr('src') == 'assets/play-button.svg') {
    temp_audio = new Audio(src);
    temp_audio.crossOrigin = 'anonymous';
    temp_audio.currentTime = 0;
    temp_audio.play();
    $(this).find('img').attr('src', 'assets/pause-button.svg');
  } else {
    if (temp_audio != false) {
      temp_audio.pause();
    }
    $(this).find('img').attr('src', 'assets/play-button.svg');
  }
}
$(document).on('click', '.audio-preview', previewAudioBackground);

/* Filters options */
function checkFilter() {
  resetFilters();
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if (
      canvas.getActiveObjects().length == 1 &&
      (obj.type == 'image' || obj.type == 'video')
    ) {
      var value = 'none';
      if (obj.filters.length > 0) {
        obj.filters.forEach(function (filter) {
          if (
            filter.type == 'BlackWhite' ||
            filter.type == 'Invert' ||
            filter.type == 'Sepia' ||
            filter.type == 'Kodachrome' ||
            filter.type == 'Polaroid' ||
            filter.type == 'Technicolor' ||
            filter.type == 'Brownie' ||
            filter.type == 'Vintage'
          ) {
            value = filter.type;
          } else if (filter.type == 'Brightness') {
            sliders
              .find((x) => x.name == 'filter-brightness')
              .slider.setValue(filter.brightness * 100);
          } else if (filter.type == 'Contrast') {
            sliders
              .find((x) => x.name == 'filter-contrast')
              .slider.setValue(filter.contrast * 100);
          } else if (filter.type == 'Vibrance') {
            sliders
              .find((x) => x.name == 'filter-vibrance')
              .slider.setValue(filter.vibrance * 100);
          } else if (filter.type == 'Saturation') {
            sliders
              .find((x) => x.name == 'filter-saturation')
              .slider.setValue(filter.saturation * 100);
          } else if (filter.type == 'HueRotation') {
            sliders
              .find((x) => x.name == 'filter-hue')
              .slider.setValue(filter.rotation * 100);
          } else if (filter.type == 'Blur') {
            blurslider.setValue(filter.blur * 100);
          } else if (filter.type == 'Noise') {
            noiseslider.setValue(filter.noise);
          }
          $('#filters-list').val(value);
          $('#filters-list').niceSelect('update');
        });
      } else {
        $('#filters-list').val(value);
        $('#filters-list').niceSelect('update');
      }
    }
  }
}
function clearFilters() {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    obj.filters = $.grep(obj.filters, function (i) {
      return (
        i.type != 'BlackWhite' &&
        i.type != 'Invert' &&
        i.type != 'Sepia' &&
        i.type != 'Kodachrome' &&
        i.type != 'Polaroid' &&
        i.type != 'Technicolor' &&
        i.type != 'Brownie' &&
        i.type != 'Vintage'
      );
    });
    canvas.renderAll();
  }
}
function applyFilter(name) {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if (name == 'Sepia') {
      obj.filters.push(new f.Sepia());
    } else if (name == 'Invert') {
      obj.filters.push(new f.Invert());
    } else if (name == 'BlackWhite') {
      obj.filters.push(new f.BlackWhite());
    } else if (name == 'Kodachrome') {
      obj.filters.push(new f.Kodachrome());
    } else if (name == 'Polaroid') {
      obj.filters.push(new f.Polaroid());
    } else if (name == 'Technicolor') {
      obj.filters.push(new f.Technicolor());
    } else if (name == 'Vintage') {
      obj.filters.push(new f.Vintage());
    } else if (name == 'Brownie') {
      obj.filters.push(new f.Brownie());
    }
    obj.applyFilters();
    canvas.renderAll();
    save();
  }
}
function updateMediaFilters() {
  var value = $(this).val();
  if (canvas.getActiveObject()) {
    clearFilters();
    applyFilter(value);
  }
}
$(document).on('change', '#filters select', updateMediaFilters);

function resetFilters() {
  if (canvas.getActiveObject()) {
    var object = canvas.getActiveObject();
    if (object.filters) {
      if (!object.filters.find((x) => x.type == 'Blur')) {
        blurslider.setValue(0);
      }
      if (!object.filters.find((x) => x.type == 'Noise')) {
        noiseslider.setValue(0);
      }
      if (object.filters.length > 0) {
        sliders.forEach(function (slider) {
          var name = '';
          if (slider.name == 'filter-hue') {
            name = 'HueRotation';
          } else if (slider.name == 'filter-brightness') {
            name = 'Brightness';
          } else if (slider.name == 'filter-vibrance') {
            name = 'Vibrance';
          } else if (slider.name == 'filter-contrast') {
            name = 'Contrast';
          } else if (slider.name == 'filter-saturation') {
            name = 'Saturation';
          }
          if (!object.filters.find((x) => x.type == name)) {
            slider.slider.setValue(0);
          }
        });
      } else {
        sliders.forEach(function (slider) {
          slider.slider.setValue(0);
        });
      }
    } else {
      sliders.forEach(function (slider) {
        slider.slider.setValue(0);
      });
    }
  }
}
function removeFilters() {
  sliders.forEach(function (slider) {
    slider.slider.setValue(0);
  });
}
$(document).on('click', '#reset-filters', removeFilters);

function updateChromaValues() {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if ($('.status-active').attr('id') == 'status-on') {
      if (obj.filters.find((x) => x.type == 'RemoveColor')) {
        obj.filters.find((x) => x.type == 'RemoveColor').distance =
          chromaslider.getValue() / 100;
        obj.filters.find((x) => x.type == 'RemoveColor').color = $(
          '#chroma-color input'
        ).val();
      } else {
        obj.filters.push(
          new f.RemoveColor({
            distance: chromaslider.getValue() / 100,
            color: $('#chroma-color input').val(),
          })
        );
      }
      obj.applyFilters();
      canvas.renderAll();
      save();
    } else {
      if (obj.filters.find((x) => x.type == 'RemoveColor')) {
        obj.filters = $.grep(obj.filters, function (i) {
          return i.type != 'RemoveColor';
        });
        obj.applyFilters();
        canvas.renderAll();
        save();
      }
    }
  }
}

function updateChromaUI() {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if (obj.filters) {
      if (obj.filters.length > 0) {
        if (obj.filters.find((x) => x.type == 'RemoveColor')) {
          $('.status-active').removeClass('status-active');
          $('#status-on').addClass('status-active');
          chromaslider.setValue(
            obj.filters.find((x) => x.type == 'RemoveColor').distance
          );
          $('#chroma-color input').val(
            obj.filters.find((x) => x.type == 'RemoveColor').color
          );
          $('#color-chroma-side').css(
            'background-color',
            obj.filters.find((x) => x.type == 'RemoveColor').color
          );
        } else {
          $('.status-active').removeClass('status-active');
          $('#status-off').addClass('status-active');
          chromaslider.setValue(1);
          $('#chroma-color input').val('#FFFFFF');
          $('#color-chroma-side').css('background-color', '#FFFFF');
        }
      }
    }
  }
}

function toggleChroma() {
  if (canvas.getActiveObject()) {
    $('.status-active').removeClass('status-active');
    $(this).addClass('status-active');
    updateChromaValues();
  }
}

$(document).on(
  'click',
  '.status-trigger:not(.status-active)',
  toggleChroma
);

async function getColor() {
  try {
    const selectedColor = await eyeDropper.open();
    colormode = 'chroma';
    o_fill.setColor(selectedColor.sRGBHex);
  } catch (err) {}
}
$(document).on('click', '.pcr-current-color', getColor);

function closeFilters() {
  $('.show-filters').removeClass('show-filters');
}

function openFilters() {
  $('#filters-parent').addClass('show-filters');
}

$(document).on('click', '#filters-button', openFilters);
$(document).on('click', '#filters-close', closeFilters);

function toggleSpeed(e) {
  e.stopPropagation();
  e.preventDefault();
  $('#speed-settings').toggleClass('show-speed');
  $('#speed-arrow').toggleClass('arrow-on');
}
function setSpeed(e) {
  e.stopPropagation();
  e.preventDefault();
  speed = parseFloat($(this).attr('data-speed'));
  $('#speed span').html($(this).html());
  toggleSpeed(e);
  save();
}

$(document).on('click', '.speed', setSpeed);
$(document).on('click', '#speed', toggleSpeed);

function showMore() {
  $('#more-over').css(
    'top',
    $('#more-tool').offset().top + 5 - $('#more-over').height() / 4
  );
  $('#more-over').addClass('more-show');
}
function hideMore() {
  $('#more-over').removeClass('more-show');
}

function handleLottieUpload() {
  var filething = $('#filepick3').get(0).files;
  var reader = new FileReader();
  reader.onload = function (event) {
    newLottieAnimation(
      artboard.get('left') + artboard.get('width') / 2,
      artboard.get('top') + artboard.get('height') / 2,
      event.target.result
    );
  };
  reader.readAsDataURL(filething.item(0));
}

$(document).on('change', '#filepick3', handleLottieUpload);

function uploadLottie() {
  $('#filepick3').click();
}
$(document).on('click', '#upload-lottie', uploadLottie);
