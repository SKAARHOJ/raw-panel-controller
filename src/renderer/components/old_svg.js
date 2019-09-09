'use strict';

var expandedView = false;
var firstJump = true;
var lastSelectedElement = undefined;
var shiftPressed = false;
var hideStates = [];
var hideDeviceCore = [];
var selectedHWc = [];
var svgSizes = [];
var maxFactor = 100;
var sorter;

var dragLogicTree = [];
var dropLogicTree = [];

let HWc;

function getElementById(id) { // Returns element by ID
  return document.getElementById(id);
}

function setAttributes(element, attributes) { // Sets element attributes from array
  for (var attribute in attributes) {
    if (attribute === 'change' || attribute === 'click') {
      element.addEventListener(attribute, attributes[attribute]);
      continue;
    }
    element.setAttribute(attribute, attributes[attribute]);
  }
  return element;
}

function deselectHWcElement() {
  var elements = document.getElementsByClassName('hwcElement');
  for (i = 0; i < elements.length; i++) {
    elements[i].classList.remove('selectedEl');
  }
}

function setScrollLink(e, hwcIndex) { // Sets scroll link for SVG element
  const _hwcIndex = hwcIndex;
  return setAttributes(e, {
    'click': function() {
      if (expandedView) {
        lastSelectedElement = undefined;
        getElementById('fn' + _hwcIndex).scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      } else {
        toggleHWc(_hwcIndex);
        updateHWcDisplay();
        if (!shiftPressed) {
          getElementById('fn' + _hwcIndex).scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    },
    'cursor': 'pointer'
  });
}

function scrollToBox(i) {
  if (!!i) {
    window.scrollToBox(0, getElementById('fn' + i).offsetTop + getElementById('fn' + i).offsetHeight - window.innerHeight + 10)
  }
}

function svgSize(size) {
  if (size > maxFactor) size = maxFactor;
  if (size < 10) size = 10;

  var sum = 0;
  for (var key in svgSizes) {
    if (svgSizes.hasOwnProperty(key)) {
      var _size = svgSizes[key] * size + '%';
      getElementById(key).setAttribute('width', _size);
    }
  }

  setCookie('svgSize', size);
}

function toggleHWc(hwcIndex) {
  var oldState = selectedHWc[hwcIndex];

  if (!shiftPressed) {
    selectedHWc.fill(0);
  }

  if (hwcIndex < HWc.length) {
    selectedHWc[hwcIndex] = oldState ? 0 : 1;
  }

  setCookie('selectedHWc', selectedHWc.join());
}

function updateHWcDisplay(atLoad) {
  deselectHWcElement();
  if (expandedView) {
    getElementById("fn_notice").style.display = "none";
    for (var i = 0; i < HWc.length; i++) {
      getElementById("fn" + i).style.display = "block";
    }
  } else {
    for (var j = 0; j < HWc.length; j++) {
      getElementById("fn" + j).style.display = "none";
    }

    var lastSelected = null;
    var selectedElements = 0;
    for (var i = 0; i < HWc.length; i++) {
      if (selectedHWc[i]) {
        getElementById("hwc" + i).classList.add("selectedEl");
        getElementById("fn" + i).style.display = 'block';
        lastSelected = i;
        selectedElements++;
      }
    }

    //getElementById("fn_notice").style.display = selectedElements > 0 ? "none" : "block";

    if (atLoad === undefined && firstJump) {
      scrollToBox(lastSelected);
      firstJump = false;
    }
  }
}

function paintMainElement(e) { // Main paint
  return setAttributes(e, {
    'fill': '#dddddd',
    'stroke': '#000',
    'stroke-width': '2'
  });
}

function paintSubElement(e) { // Sub element paint
  return setAttributes(e, {
    'fill': '#cccccc',
    'stroke': '#666',
    'stroke-width': '1'
  });
}

function createElementWithAttributes(n, attr) { // Creates element with attributes
  return setAttributes(document.createElement(n), attr);
}

function createSVGWithAttributes(n, attr) { // Creates SVG element with attributes
  if (attr['class'] == undefined) attr['class'] = 'addEl';
  return setAttributes(document.createElementNS("http://www.w3.org/2000/svg", n), attr);
}

function addSVGElement(element, display) { // Add SVG element
  appendChild(getElementById("ctrlimg" + (display ? display : "")), element);
  getElementById("ctrlimg" + (display ? display : "")).style.display = '';
}

function appendChild(e1, e2) {
  e1.appendChild(e2);
}

var escapeapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

function escape(st) {
  return String(st).replace(/[&<>"'`=\/]/g, function(s) {
    return escapeapeMap[s];
  });
}

function rLbl(t) { // TODO: What is this
  t = t.split('|');
  return escape(t[0]) + (t.length > 1 ? '<br/>' + escape(t[1]) : '');
}

var hwcSource = -1;
var stateSource = -1;

function copyStateBehaviour(hwcIndex, stateIndex) {
  var controls = document.querySelectorAll('.ins');
  for (var i = 0; i < controls.length; i++) {
    controls[i].style.visibility = 'visible';
  }
  hwcSource = hwcIndex;
  stateSource = stateIndex;
}

function insertStateBehaviour(hwcDest, stateDest) {
  if (!HWv[hwcDest]) HWv[hwcDest] = [];
  HWv[hwcDest][stateDest] = (HWv[hwcSource] && HWv[hwcSource][stateSource]) ? HWv[hwcSource][stateSource] : [];
  writeStateBehaviour(hwcDest, stateDest);

  var controls = document.querySelectorAll('.ins');
  for (var i = 0; i < controls.length; i++) {
    controls[i].style.visibility = 'hidden';
  }
}

function deleteStateBehaviour(hwcDest, stateDest) {
  if (HWv[hwcDest]) HWv[hwcDest][stateDest] = [];
  writeStateBehaviour(hwcDest, stateDest);
}

function getCookie(name) {
  var cookies = decodeURIComponent(document.cookie).split(';');
  if (Array.isArray(cookies)) {
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i];
      while (c.charAt(0) == ' ') c = c.substring(1);

      if (c.indexOf(name) == 0) {
        return c.substring(name.length + 1, c.length)
      }
    }
  }
  return "";
}

function setCookie(name, value) {
  var d = new Date();
  d.setTime(d.getTime + 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + value + ";expires=" + d.toUTCString() + ";path=/";
}

var _labels = [];

function labelChanged(label) {
  if (label === undefined) return;
  var parts = label.name.split('_');
  if (parts.length != 3) return;

  _labels[parts[1]][parts[2]] = label.value;
}

function updateLabels() {
  // Labels section
  var e = getElementById("labels");

  while (e.firstChild)
    e.removeChild(e.firstChild);

  // Text fields for size
  var rows = getElementById('dynLbl_rows'); // dynamicLabel
  var cols = getElementById('dynLbl_cols');
  var h;
  var w;

  if (!rows.value) {
    h = dynamicLabelsRows;
  } else {
    h = parseInt(rows.value, 10);
    if (isNaN(h)) {
      h = dynamicLabelsRows;
    }
  }

  if (!cols.value) {
    w = dynamicLabelsCols;
  } else {
    w = parseInt(cols.value, 10);
    if (isNaN(w)) {
      w = dynamicLabelsCols;
    }
  }

  if (w > 30) w = 30;
  if (h > 10) h = 10;

  rows.value = h;
  cols.value = w;

  _labels = [];
  for (var _c = 0; _c < w; _c++) {
    _labels[_c] = [];
    for (var _r = 0; _r < h; _r++) {
      _labels[_c][_r] = "";
    }
  }

  var table = createElementWithAttributes("table", {
    "style": "border-spacing: 5px; border-collapse: separate"
  });

  var rowElement = createElementWithAttributes("tr");
  for (var col = 0; col < w + 1; col++) {
    var head = createElementWithAttributes("th", {
      "style": "text-align: center"
    });

    if (col > 0) {
      head.innerHTML = col;
    }
    appendChild(rowElement, head);
  }
  appendChild(table, rowElement);

  for (var row = 0; row < h; row++) {
    var rowElement = createElementWithAttributes("tr");
    for (var col = 0; col < w + 1; col++) {
      var data = createElementWithAttributes("td", {
        "style": "font-weight: bold; text-align: right"
      });

      if (col > 0) {
        var label = '';
        if (dynamicLabels.length >= col && dynamicLabels[col - 1].length > row) {
          label = dynamicLabels[col - 1][row];
        }

        var input = createElementWithAttributes("input", {
          "name": "dynLbl_" + (col - 1) + "_" + row,
          "value": label,
          "oninput": "labelChanged(this);"
        });
        appendChild(data, input);
      } else if (col == 0) {
        data.innerHTML = row + 1;
      }

      appendChild(rowElement, data);
    }
    appendChild(table, rowElement);
  }

  appendChild(e, table);
}

export default function(_HWc) { // Initializes the whole page.
  HWc = _HWc
  let e = document.getElementById('ctrlimg')

  for (var i = 0; i < HWc.length; i++) {
  }

  document.body.onkeydown = function(e) {
    if (e.keyCode == 16) {
      shiftPressed = true;
    }
  }
  document.body.onkeyup = function(e) {
    if (e.keyCode == 16) {
      shiftPressed = false;
    }
  }


  // Creates "function" container div
  for (var i = 0; i < HWc.length; i++) {
    // Defines dimensions of HW element symbols
    var componentDimensions = {
      1: [120, 120], // KP01/12
      2: [150, 150], // KP01/15
      3: [174, 174], // KP01/17
      4: [120, 120], // NP01
      5: [80, 80], // HB2
      6: [60, 60], // Copal
      7: [160, 140], // Dome
      8: [150, 150], // Elastomer/15
      9: [100, 100], // Elastomer/10
      10: [200, 190], // SSW/H
      11: [190, 200], // SSW/V
      12: [150, 150], // Elastomer/15 + display
      13: [100, 100], // Elastomer/10 + display
      14: [160], // Enc1 + Display
      15: [160], // Enc1
      16: [240], // Enc2
      17: [400], // Enc3
      18: [160], // Enc1 + Display, Wide
      19: [160], // Pot
      20: [274, 30], // Slider20/H
      21: [30, 274], // Slider20/V
      22: [520, 30], // Slider45/H
      23: [30, 520], // Slider45/V
      24: [675, 30], // Slider60/H
      25: [30, 675], // Slider60/V
      26: [600, 58], // Tbar/H
      27: [58, 600], // Tbar/V
      28: [30, 710], // M Slider63/V
      30: [246, 78], // OLED 128x32 display
      31: [211, 787], // OLED 256x64 display, upright
      32: [787, 211], // OLED 256x64 display
      33: [142, 123], // Smart Display
      34: [508, 142], // DOGM Display
      35: [238, 76], // OLED 128x32 display (half 256x32)
      36: [570, 151], // OLED 128x32 display, 2.2"
      38: [140, 340], // VU Array
      39: [20], // Bi color LED
      40: [250, 40], // IOpin
      50: [430, 230], // SmartSwitch Menu, H
      51: [230, 430], // SmartSwitch Menu, V
      54: [377, 510], // Rocker Menu, H
      56: [851, 361], // Regular menu
      60: [340, 144], // DB9
      61: [340, 222], // DIN
      70: [90, 60], // OLED 128x32 display 64x32 tile (goes with 30 in status displays, 0.91")
      71: [360, 90], // OLED 256x64 display 128x32 tile (For 3.2" displays)
      72: [126, 70], // OLED 256x64 display 64x32 tile (For 3.2" displays)
      73: [360, 180], // OLED 256x64 display 64x32 tile (For 3.2" displays)
      74: [115, 60], // OLED 256x32 display 64x32 tile (For 1.8" displays)
      75: [134, 76], // OLED 256x32 display 64x32 tile, full size (For 1.8" displays)
      76: [187, 91], // OLED 32x128 display 64x32 tile, full size
      77: [775, 70], // 3.2" OLED 22x256 display tile, full size
      78: [187, 61], // OLED display 64x24 tile, full size
      80: [441 - 25, 248 - 25], // TouchField, 1/16
      81: [882 - 10, 496 - 10], // TouchField, Quarter
      90: [350, 490], // RCP Joystick, base (slider)
      91: [350], // RCP Joystick, wheel (slider)
      92: [120], // RCP Joystick, top button
      93: [220], // Thumb Joystick, LR
      94: [220], // Thumb Joystick, UD
      95: [100], // Thumb Joystick, top button
      96: [533], // 4-Axis Joystick, LR
      97: [493], // 4-Axis Joystick, UD
      98: [360], // 4-Axis Joystick, Rotate
      99: [100], // 4-Axis Joystick, top button
      100: [530], // Shuttle wheel
      101: [380], // Jog encoder
      102: [280], // SIL Joystick, LR
      103: [240], // SIL Joystick, UD
      104: [120, 280], // Zoom rocker

      110: [160], // Enc1 + Display (RCP)

      124: [150, 150], // KP01/15 + display
      125: [150, 150], // Elastomer/15 + display
      126: [100, 120], // Elastomer/10x12
      127: [60, 70], // Elastomer/6x7
      128: [60, 70], // Elastomer/6x7 + display L
      129: [70, 60], // Elastomer/7x6
      130: [120, 100], // Elastomer/12x10
      131: [150, 100], // Elastomer/15x10
      132: [150, 130], // Elastomer/15x13
      133: [150, 100], // Elastomer/15x10 + display
      134: [150, 130], // Elastomer/15x13 + display
      135: [210, 100], // Elastomer/21x10
      136: [210, 130], // Elastomer/21x13
      137: [210, 100], // Elastomer/21x10 + display
      138: [210, 130], // Elastomer/21x13 + display
      139: [210, 130], // Elastomer/21x13 + display (RCP)

      140: [81, 31], // Status LEDs				
      141: [127, 31], // Tally LED Bar
      142: [50, 240], // Slider LED Bar 7 (MiniFLy)
      143: [100, 520], // Slider LED Bar 10
      144: [568, 50], // Tally LED Bar, large (ID display)
      145: [80, 520], // Slider LED Bar 10, narrow

      250: [214, 34], // Controller / Module
    };

    // Draws base symbols:
    switch (HWc[i].type) {
      default:
        if (!componentDimensions[HWc[i].type][1]) {
          var b = createSVGWithAttributes("circle", {
            'cx': HWc[i].x,
            'cy': HWc[i].y,
            'r': componentDimensions[HWc[i].type][0] / 2,
            'class': 'hwcElement',
            'id': 'hwc' + i
          });
        } else {
          var b = createSVGWithAttributes("rect", {
            'x': HWc[i].x - componentDimensions[HWc[i].type][0] / 2,
            'y': HWc[i].y - componentDimensions[HWc[i].type][1] / 2,
            'rx': 10,
            'ry': 10,
            'width': componentDimensions[HWc[i].type][0],
            'height': componentDimensions[HWc[i].type][1],
            'class': 'hwcElement',
            'id': 'hwc' + i
          });
        }
        break;
    }
    addSVGElement(setScrollLink(paintMainElement(b), i), HWc[i][5]);

    // Adds extra graphics in some cases of symbols:
    switch (HWc[i].type) {
      case 10:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - (componentDimensions[HWc[i].type][0] - 30) / 2,
          'y': HWc[i].y - (componentDimensions[HWc[i].type][1] - 50) / 2,
          'rx': 10,
          'ry': 10,
          'width': componentDimensions[HWc[i].type][0] - 30,
          'height': componentDimensions[HWc[i].type][1] - 50
        })), HWc[i][5]);
        break;
      case 12:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 134 / 2,
          'y': HWc[i].y - 152 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 134,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 13:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 134 / 2,
          'y': HWc[i].y - 148 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 134,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 14:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 134 / 2,
          'y': HWc[i].y - 152 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 134,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 18:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 221 / 2,
          'y': HWc[i].y - 152 - 76 / 2 - 20,
          'rx': 5,
          'ry': 5,
          'width': 221,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 20:
      case 22:
      case 24:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - (componentDimensions[HWc[i].type][0]) / 3,
          'y': HWc[i].y - 125 / 2,
          'width': 100,
          'height': 125
        })), HWc[i][5]);
        break;
      case 21:
      case 23:
      case 25:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 125 / 2,
          'y': HWc[i].y + (componentDimensions[HWc[i].type][1]) / 3 - 50,
          'width': 125,
          'height': 100
        })), HWc[i][5]);
        break;
      case 27:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 420 / 2,
          'y': HWc[i].y + (componentDimensions[HWc[i].type][1]) / 4 - 157 / 2,
          'width': 420,
          'height': 157
        })), HWc[i][5]);
        break;
      case 28:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 125 / 2,
          'y': HWc[i].y + (componentDimensions[HWc[i].type][1]) / 4 - 250 / 2,
          'width': 125,
          'height': 250
        })), HWc[i][5]);
        break;
      case 38:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 50,
          'y': HWc[i].y - 300 / 2,
          'width': 30,
          'height': 300
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x + 50 - 30,
          'y': HWc[i].y - 300 / 2,
          'width': 30,
          'height': 300
        })), HWc[i][5]);
        break;
      case 50:
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x + 110,
          'cy': HWc[i].y,
          'r': 80
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 200,
          'y': HWc[i].y - (190) / 2,
          'rx': 10,
          'ry': 10,
          'width': 200,
          'height': 190
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 200 + 15,
          'y': HWc[i].y - (190 - 50) / 2,
          'rx': 10,
          'ry': 10,
          'width': 200 - 30,
          'height': 190 - 50
        })), HWc[i][5]);
        break;
      case 51:
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x,
          'cy': HWc[i].y + 110,
          'r': 80
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - (200) / 2,
          'y': HWc[i].y - 200,
          'rx': 10,
          'ry': 10,
          'width': 200,
          'height': 190
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - (200 - 30) / 2,
          'y': HWc[i].y + 25 - 200,
          'rx': 10,
          'ry': 10,
          'width': 200 - 30,
          'height': 190 - 50
        })), HWc[i][5]);
        break;
      case 54:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 300 / 2,
          'y': HWc[i].y - 384 / 2,
          'rx': 5,
          'ry': 5,
          'width': 300,
          'height': 384
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 220 / 2,
          'y': HWc[i].y - 153 / 2,
          'rx': 5,
          'ry': 5,
          'width': 220,
          'height': 153
        })), HWc[i][5]);
        break;
      case 56:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 400,
          'y': HWc[i].y - 142 / 2,
          'rx': 5,
          'ry': 5,
          'width': 508,
          'height': 142
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x + 320,
          'cy': HWc[i].y - 82,
          'r': 80
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x + 320,
          'cy': HWc[i].y + 82,
          'r': 80
        })), HWc[i][5]);
        break;
      case 90:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 75,
          'y': HWc[i].y - 490 / 2,
          'width': 150,
          'height': 490
        })), HWc[i][5]);
        break;
      case 101:
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x - 99,
          'cy': HWc[i].y - 18,
          'r': 60
        })), HWc[i][5]);
        break;
      case 110:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 187 / 2,
          'y': HWc[i].y - 76 / 2 - 200,
          'rx': 5,
          'ry': 5,
          'width': 187,
          'height': 91,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 124:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 134 / 2,
          'y': HWc[i].y - 152 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 134,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 125:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 207 / 2,
          'y': HWc[i].y - 152 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 207,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 128:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 187 / 2 - 156,
          'y': HWc[i].y - 91 / 2,
          'rx': 5,
          'ry': 5,
          'width': 187,
          'height': 91,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 133:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 134 / 2,
          'y': HWc[i].y - 134 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 134,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 134:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 134 / 2,
          'y': HWc[i].y - 152 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 134,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 137:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 221 / 2,
          'y': HWc[i].y - 134 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 221,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 138:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 221 / 2,
          'y': HWc[i].y - 152 - 76 / 2,
          'rx': 5,
          'ry': 5,
          'width': 221,
          'height': 76,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 139:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 187 / 2,
          'y': HWc[i].y - 76 / 2 - 169,
          'rx': 5,
          'ry': 5,
          'width': 187,
          'height': 91,
          'style': 'fill:rgb(33,33,33);'
        })), HWc[i][5]);
        break;
      case 141:
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x - 40,
          'cy': HWc[i].y,
          'r': 10
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x,
          'cy': HWc[i].y,
          'r': 10
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("circle", {
          'cx': HWc[i].x + 40,
          'cy': HWc[i].y,
          'r': 10
        })), HWc[i][5]);
        break;
      case 142:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2 - 33,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2 + 33,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2 - 33 * 2,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2 + 33 * 2,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2 - 33 * 3,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 31 / 2,
          'y': HWc[i].y - 21 / 2 + 33 * 3,
          'width': 31,
          'height': 21
        })), HWc[i][5]);
        break;
      case 143:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 0.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 0.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 1.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 1.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 2.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 2.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 3.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 3.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 4.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 80 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 4.5,
          'width': 80,
          'height': 30
        })), HWc[i][5]);
        break;
      case 145:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 0.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 0.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 1.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 1.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 2.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 2.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 3.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 3.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 - 50 * 4.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 60 / 2,
          'y': HWc[i].y - 21 / 2 + 50 * 4.5,
          'width': 60,
          'height': 30
        })), HWc[i][5]);
        break;
      case 250:
        addSVGElement(paintSubElement(createSVGWithAttributes("rect", {
          'x': HWc[i].x - 210 / 2,
          'y': HWc[i].y - 30 / 2,
          'rx': 5,
          'ry': 5,
          'width': 210,
          'height': 30,
          'style': 'fill:rgb(103,118,131);'
        })), HWc[i][5]);
        break;
    }

    // Adds text of symbol:
    var sp = HWc[i].txt.split("|")
    var len = sp.length;
    if (len > 1 && sp[1].length > 0) len = 2;
    else len = 1;
    for (var tl = 0; tl < len; tl++) {
      var b = createSVGWithAttributes('text', {
        'x': HWc[i].x,
        'y': HWc[i].y + 43 + tl * 60 - (len * 60 / 2),
        'text-anchor': 'middle',
        'fill': '#000',
        'font-weight': 'bold',
        'font-size': '35'
      });
      b.textContent = sp[tl];
      //			if (HWc[i].type==40)	{setAttributes(b,{'text-anchor':'start','x':HWc[i].x+20});}
      addSVGElement(b, HWc[i][5]);
    }

    // Number Label:
    var b = createSVGWithAttributes('text', {
      'x': HWc[i].x - componentDimensions[HWc[i].type][0] / 2 + 4,
      'y': HWc[i].y - (componentDimensions[HWc[i].type][1] ? componentDimensions[HWc[i].type][1] : componentDimensions[HWc[i].type][0]) / 2 + 20,
      'fill': '#000',
      'font-size': '20',
      'stroke': '#dddddd',
      'stroke-width': '6px',
      'paint-order': 'stroke'
    });
    b.textContent = i + 1;
    addSVGElement(b, HWc[i][5]);


    // Creates "function" container div
    var b = createElementWithAttributes("div", {
      id: "fn" + i
    });
    if (!expandedView) {
      b.style.display = 'none';
    }
    appendChild(e, b);
  }


  var svgElements = document.getElementsByTagName('svg');
  var initWidth = [];
  var parentWidth = 0;
  var maxHeight = 0;
  var maxWidth = 0
  for (var i = 0; i < svgElements.length; i++) {
    if (svgElements[i].id.startsWith('ctrlimg')) {
      var svg = getElementById(svgElements[i].id);
      if (svg) {
        var width = svg.getBoundingClientRect().width;
        parentWidth = svg.parentElement.offsetWidth;
        var height = svg.getBoundingClientRect().height
        if (height > maxHeight) {
          maxHeight = height;
        }
        if (width > maxWidth) {
          maxWidth = width;
        }
        initWidth[svgElements[i].id] = width;
      }
    }
  }

  var sum = 0;
  for (var key in initWidth) {
    if (initWidth.hasOwnProperty(key)) {
      svgSizes[key] = initWidth[key] / parentWidth;
      sum += initWidth[key];
    }
  }


  maxFactor = parentWidth / maxWidth * 100;

  var initValue = getCookie('svgSize');
  if (initValue == "") {
    initValue = 95 * parentWidth / sum;
    if (initValue * maxHeight / 100 > 1000) {
      initValue = 100000 / maxHeight;
    }
  }

  getElementById('ctrlimg').parentElement.insertAdjacentHTML('afterbegin', '<div style="margin: 20px"><p style="text-align: center; font-size: 16px; font-weight: bold">Size:</p><input style="width:300px; margin: auto" type="range" value="' + initValue + '" min="10" max="' + maxFactor + '" oninput="svgSize(this.value)" /></div>');
  svgSize(initValue);


  updateHWcDisplay(true);
  updateLabels();
}

function drawLogicSelector(hwcIndex, stateIndex, actionIndex) {
  var functionLogic = getElementById("functionLogic-" + hwcIndex + "-" + stateIndex + "-" + actionIndex); // Find container element
  functionLogic.parentElement.classList.add("sort"); // make parent sortable


  functionLogic.innerHTML = '';
  if (actionIndex != 0) {
    if (HWdis[hwcIndex]) {
      var selectLogic = createElementWithAttributes("input", {
        "type": "hidden",
        "id": "sellgic_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
        "name": "sellgic_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
        "value": (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][0] & 16 ? 1 : 0)
      });
      appendChild(functionLogic, selectLogic);
    } else {
      // Shift level separator
      var display = (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][0] & 16) ? 'block' : 'none';
      functionLogic.innerHTML += '<hr style="display: ' + display + ';" class="hr-shift" >';
      const _hwcIndex = hwcIndex;
      const _stateIndex = stateIndex;
      const _actionIndex = actionIndex;
      const _functionLogic = functionLogic;

      var selectLogic = createElementWithAttributes("select", {
        "id": "sellgic_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
        "name": "sellgic_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
        'change': function() {
          setOrCreateHValue((getHValue(_hwcIndex, _stateIndex, _actionIndex, 0) & 15) | (this.value > 0 ? 16 : 0), _hwcIndex, _stateIndex, _actionIndex, 0);
          _functionLogic.children[0].style.display = this.value == 1 ? 'block' : 'none';
        }
      });
      appendChild(functionLogic, selectLogic);
      appendChild(selectLogic, new Option('and', 0, 0, (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][0] & 16 ? 0 : 1)));
      appendChild(selectLogic, new Option('or (shift)', 1, 0, (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][0] & 16 ? 1 : 0)));
    }
  }
}

function hideActions(deviceIndex) {
  hideDeviceCore[deviceIndex] = true;
  document.querySelectorAll(".action-list-option-" + deviceIndex).forEach(function(element) {
    setAttributes(element, {
      "hidden": ""
    });
  });

}

function showActions(deviceIndex) {
  hideDeviceCore[deviceIndex] = false;
  document.querySelectorAll(".action-list-option-" + deviceIndex).forEach(function(element) {
    element.removeAttribute("hidden")
  });
}

function drawFunctionSelector(hwcIndex, stateIndex, actionIndex) {
  var e = getElementById("function-" + hwcIndex + "-" + stateIndex + "-" + actionIndex); // Find container element
  e.innerHTML = '';
  if (HWdis[hwcIndex]) {
    var select = createElementWithAttributes("input", {
      "type": "hidden",
      "id": "selfnc_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
      "name": "selfnc_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
      "value": (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] ? (HWv[hwcIndex][stateIndex][actionIndex][0] & 15) + "_" + HWv[hwcIndex][stateIndex][actionIndex][1] : "")
    });
    appendChild(e, select);
  } else {
    var select = createElementWithAttributes("select", {
      "id": "selfnc_" + hwcIndex + "_" + stateIndex + "_" + actionIndex,
      "name": "selfnc_" + hwcIndex + "_" + stateIndex + "_" + actionIndex
    });
    appendChild(e, select);

    var opt = createElementWithAttributes("option", {
      "class": "action-list-option"
    });
    appendChild(select, opt);
  }

  var p = [0, 0, 0];
  var longestOption = "";
  var longestOption
  for (var device = 0; device < devLst.length; device++) { // Go through device list
    for (var funct = 0; funct < devFunc[device].length; funct++) { // Go through functions per device
      if (devFunc[device][funct][0] & HWc[hwcIndex][0] || devFunc[device][funct][0] == 0) { // Check if function matches the type of HW component (or is "ALL" type)
        var selEl = (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && (HWv[hwcIndex][stateIndex][actionIndex][0] & 15) == devLst[device][0] && HWv[hwcIndex][stateIndex][actionIndex][1] == devFuncIdx[device][funct]) ? 1 : 0; // Is it selected?
        if (selEl) {
          p = [devLst[device][0], funct];
        }
        if (!HWdis[hwcIndex]) {
          var optionTitle = devLst[device][1] + ": " + devFunc[device][funct][1];
          var opt = new Option(optionTitle, devLst[device][0] + "_" + devFuncIdx[device][funct], 0, selEl);
          appendChild(select, opt); // Add the option
          if (optionTitle.length > longestOption.length) {
            longestOption = optionTitle;
          }

          opt.classList.add("action-list-option-" + device);
          if (hideDeviceCore[device]) {
            setAttributes(opt, {
              "hidden": ""
            });
          }
        }
      }
    }
  }

  select.style.width = (findWidth(longestOption) + "px");

  drawValueSelectorBox(hwcIndex, stateIndex, actionIndex, p[0], p[1]); // Draw value selector based on the selected element
  if (!HWdis[hwcIndex]) {
    const _hwcIndex = hwcIndex;
    const _stateIndex = stateIndex;
    const _actionIndex = actionIndex;
    setAttributes(select, {
      "change": function() {
        drawAllValueSelectors(_hwcIndex, _stateIndex, _actionIndex);
      }
    });
  }
  // ... and make sure value selector is redrawn when function selector is changed.
  if (!e.parentElement.querySelector("handle")) {
    var handle = createElementWithAttributes("div", {
      "class": "handle",
      "style": "display:inline-block;float:right;",
    });
    var dummy = createElementWithAttributes("div", {
      "style": "display:inline;visibility:  hidden;",
    });
    dummy.innerHTML = "&#9776;";
    handle.innerHTML = "&#9776;";
    appendChild(e.parentElement, dummy); // Stupid trick to keep parent div resizing while float is active
    appendChild(e.parentElement, handle);
  }
}

function findWidth(string) {
  if (string === undefined) return 0;

  var container = document.createElement("div");
  container.style.visibility = "hidden";
  container.style.position = "absolute";
  var text = document.createTextNode(string);
  container.appendChild(text);
  document.body.appendChild(container);

  var width = container.clientWidth;

  document.body.removeChild(container);
  return width;
}

function drawAllValueSelectors(hwcIndex, stateIndex, actionIndex) {
  var e = getElementById("selfnc_" + hwcIndex + "_" + stateIndex + "_" + actionIndex);
  var p = e.options[e.selectedIndex].value.split("_");
  if (!HWv[hwcIndex]) HWv[hwcIndex] = [];
  if (!HWv[hwcIndex][stateIndex]) HWv[hwcIndex][stateIndex] = [];
  if (!HWv[hwcIndex][stateIndex][actionIndex]) HWv[hwcIndex][stateIndex][actionIndex] = [];
  HWv[hwcIndex][stateIndex][actionIndex][0] = (p[0] & 15) | (getElementById("sellgic_" + hwcIndex + "_" + stateIndex + "_" + actionIndex) && getElementById("sellgic_" + hwcIndex + "_" + stateIndex + "_" + actionIndex).value > 0 ? 16 : 0);
  HWv[hwcIndex][stateIndex][actionIndex][1] = p[1];

  copyStateBehaviour(hwcIndex, stateIndex);

  for (var device = 0; device < devLst.length; device++) { // Go through device list
    if (devLst[device][0] == p[0]) {
      for (var funct = 0; funct < devFuncIdx[device].length; funct++) { // go through needed values
        if (devFuncIdx[device][funct] == p[1]) {
          drawValueSelectorBox(hwcIndex, stateIndex, actionIndex, p[0], funct);
          break;
        }
      }
      break;
    }
  }
  drawAddButton(hwcIndex, stateIndex);
}

function drawValueSelectorBox(hwcIndex, stateIndex, actionIndex, p0, p1) { // TODO what is W ?
  var e = getElementById("value-" + hwcIndex + "-" + stateIndex + "-" + actionIndex); // Find container element
  e.innerHTML = '';

  for (var device = 0; device < devLst.length; device++) {
    if (p0 == devLst[device][0]) {

      for (var n = 2; n < devFunc[device][p1].length; n++) {
        if (devFunc[device][p1][n]) {
          if (HWdis[hwcIndex]) {
            var selectValue = createElementWithAttributes("input", {
              "type": "hidden",
              "id": "selval_" + hwcIndex + "_" + stateIndex + "_" + actionIndex + "_" + n,
              "name": "selval_" + hwcIndex + "_" + stateIndex + "_" + actionIndex + "_" + n,
              "value": (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] ? HWv[hwcIndex][stateIndex][actionIndex][n] : "")
            });
            appendChild(e, selectValue);
          } else {
            const _hwcIndex = hwcIndex;
            const _stateIndex = stateIndex;
            const _actionIndex = actionIndex;
            const _valueIndex = n;

            var selectValue = createElementWithAttributes("select", {
              "id": "selval_" + hwcIndex + "_" + stateIndex + "_" + actionIndex + "_" + n,
              "name": "selval_" + hwcIndex + "_" + stateIndex + "_" + actionIndex + "_" + n,
              'change': function() {
                HWv[_hwcIndex][_stateIndex][_actionIndex][_valueIndex] = Number(this.value);
                copyStateBehaviour(_hwcIndex, _stateIndex);
              }
            });
            appendChild(e, selectValue);
            var isExt = Array.isArray(devFunc[device][p1][n]); // "Extended" means we use an array to indicate start-value, end-value and possibly a title
            var lRef = isExt ? devFunc[device][p1][n][0] : devFunc[device][p1][n]; // First entry... (could be a label, will indicate external value list reference if such is used)
            var vLst = -lRef - 1; // Reference to a shared external value list
            if (typeof lRef === 'string') { // In case the array is a number of strings...
              for (var m = 0; m < devFunc[device][p1][n].length; m++) {
                appendChild(selectValue, new Option(devFunc[device][p1][n][m], m, 0, (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][n] == m) ? 1 : 0));
              }
            } else { // ... otherwise it must be an integer, and...
              var prFx = isExt && typeof devFunc[device][p1][n][devFunc[device][p1][n].length - 1] === 'string' && devFunc[device][p1][n][devFunc[device][p1][n].length - 1] ? devFunc[device][p1][n][devFunc[device][p1][n].length - 1] + ": " : ""; // Label prefix
              var vLblOff = isExt && devFunc[device][p1][n].length >= 4 && typeof devFunc[device][p1][n][devFunc[device][p1][n].length - 2] === 'number' ? devFunc[device][p1][n][devFunc[device][p1][n].length - 2] : 0; // value label offset
              var nxtVal = 0;
              if (lRef < 0 && valLsts[vLst]) { // Is external value list used?
                //Create and append the options
                for (var m = 0; m < valLsts[vLst].length; m++) {
                  appendChild(selectValue, new Option(prFx + valLsts[vLst][m], m, 0, (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][n] == m) ? 1 : 0));
                  nxtVal = m + 1;
                }
              }
              if (lRef > 0 || (isExt && devFunc[device][p1][n][0] < devFunc[device][p1][n][1])) { // Creates a value range based on a single value or lRef setting the top value.
                for (var m = (isExt ? devFunc[device][p1][n][0] : 0); m <= (isExt ? devFunc[device][p1][n][1] : lRef); m++) {
                  appendChild(selectValue, new Option(prFx + (m + vLblOff), m, 0, (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][n] == m) ? 1 : 0));
                  nxtVal = m + 1;
                }
              }

              if (isExt) {
                for (var m = (lRef >= 0 ? 2 : 1); m < devFunc[device][p1][n].length - (vLblOff ? 2 : 1); m++) {
                  appendChild(selectValue, new Option(devFunc[device][p1][n][m], nxtVal, 0, (HWv[hwcIndex] && HWv[hwcIndex][stateIndex] && HWv[hwcIndex][stateIndex][actionIndex] && HWv[hwcIndex][stateIndex][actionIndex][n] == nxtVal) ? 1 : 0));
                  nxtVal++;
                }
              }
            }
          }
        }
      }
      break;
    }
  }
}

function checkConnection(e) {
  e.preventDefault();
  var form = this.form;
  var xhttp = new XMLHttpRequest();
  var buttonName = e.currentTarget.name;
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {
        var input = document.createElement("input");

        input.setAttribute("name", buttonName);

        input.setAttribute("type", "hidden");
        input.setAttribute("value", "1");

        form.appendChild(input);
        form.submit();
      } else {
        var text = "The Server is not reachable anymore, please make sure it is running and connected before resending the configuration!";
        modalWithText(text, "Error on Connection!");
      }
    }
  };
  xhttp.open("GET", "/ping", true);
  xhttp.send();
}

var submitButtons = document.getElementsByClassName("sBut");
for (var i = 0; i < submitButtons.length; i++) {
  submitButtons[i].addEventListener('click', checkConnection, false);
}


function syncToCores(e) {
  e.preventDefault();
  var form = this.form;
  var buttonName = e.currentTarget.name;
  var apiAddress = "https://cores.skaarhoj.com/api.php";
  var syncTarget = "";
  if (e.shiftKey) { // repress ctrl for staging
    apiAddress = "https://staging.skaarhoj.com/api.php"
    syncTarget = " (STAGING)"
  }

  var params = '{"cmd": "preset_list", "CID": "' + CID + '"}';
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.status == 200) {

        var response = JSON.parse(this.response);
        if (typeof response.presets === 'undefined') return;


        var text = "You are about to upload the current configuration to <b>cores.skaarhoj.com</b><br>Please select the preset you would like to save it in!";
        modalWithText(text, "Sync configuration to cores server" + syncTarget);
        var modalContent = getElementById('modal-content');
        var presetSelect = createElementWithAttributes("select", {
          "class": "",
          "id": "preset-list",
          "name": "presetName",
          "change": function() {
            if (this.selectedIndex === 0) {
              getElementById("sync-title").style.display = "inline";
            } else {
              getElementById("sync-title").style.display = "none";
            }
          }
        });

        var newOpt = createElementWithAttributes("option", {
          "class": "preset-list-option",
        });

        newOpt.innerHTML = "NEW";
        appendChild(presetSelect, newOpt);

        var deviceList = devLst.reduce(function(devices, entry) {
          if (entry[1] != "System") {
            devices.push(entry[1]);
          }
          return devices;
        }, []);

        var filteredPresets = response.presets.reduce(function(filtered, preset) {
          if (JSON.stringify(preset.devices) === JSON.stringify(deviceList)) {
            filtered.push(preset);
          }
          return filtered;
        }, []);

        filteredPresets.forEach(function(preset) {
          var opt = createElementWithAttributes("option", {
            "class": "preset-list-option",
            "selected": compilePreset == preset.uid ? "true" : "false"
          });

          opt.innerHTML = preset.title;
          appendChild(presetSelect, opt);
        });

        appendChild(modalContent, presetSelect);

        appendChild(modalContent, createElementWithAttributes("input", {
          "class": "",
          "id": "sync-title",
          "name": "title",
          "style": "display:none; margin: 0 10px;",
          "placeholder": "User Config",
        }));

        var importBtn = createElementWithAttributes("button", {
          "class": "sync-button",

          "click": function() {
            modal.close();

            var inputs = form.elements;
            var configData = {};

            for (var i = 0; i < inputs.length; i++) {
              configData[inputs[i].name] = inputs[i].value;
            }

            var selection = getElementById('preset-list').selectedIndex;
            if (selection != 0 && filteredPresets[selection - 1].uid != 0) {
              selection = filteredPresets[selection - 1].uid;
            }
            var title = getElementById("sync-title").value;
            var titleParam = "";
            if (title && title !== "") titleParam = '"title":"' + title + '",';
            var params = '{"cmd": "update_preset", "CID": "' + CID + '", "preset_id":"' + selection + '", "compile_preset_id":"' + compilePreset + '", "device_list":' + JSON.stringify(devLst) + ',' + titleParam + ' "config_data":' + JSON.stringify(configData) + '}';
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
              if (this.readyState == 4) {
                if (this.status == 200) {
                  var responseData = JSON.parse(this.response);
                  if (responseData.status == 'ok') {
                    var text = "Configuration has been uploaded to the Server as <br><b>" + responseData.presetName + "</b>";
                    modalWithText(text, "Sync successful!" + syncTarget);
                    setTimeout(function() {
                      if (window.modal) {
                        window.modal.close();
                      }
                    }, 2000);
                  } else {
                    var text = "There has been an error syncing the preset<br><b>" + responseData.description + "</b>";
                    console.log(responseData);
                    modalWithText(text, "Error syncing!" + syncTarget);
                  }
                } else {
                  var text = "There has been an connection error the preset";
                  modalWithText(text, "Error syncing!" + syncTarget);
                }
              }
            };

            xhttp.open("POST", apiAddress, true); // TODO: need to make this setable
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.send(params);

          }
        });
        importBtn.innerHTML = "Update";
        appendChild(modalContent, importBtn);

      } else {
        var text = "cores.skaarhoj.com is not reachable, please make sure your controller has a working internet connection!";
        modalWithText(text, "Error on connection!" + syncTarget);
      }
    }
  };

  xhttp.open("POST", apiAddress, true);
  xhttp.setRequestHeader('Content-type', 'application/json');
  xhttp.send(params);
}

var syncButtons = document.getElementsByClassName("syncToCores");
for (var i = 0; i < syncButtons.length; i++) {
  syncButtons[i].addEventListener('click', syncToCores, false);
}


/*
function writeCSS() {
    var st = getElementById("st");
    st.innerHTML = 'body{font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;}';
    st.innerHTML += 'h3 { border: #333333 solid 1px; padding:5px; margin: 25px 0 5px 0; background-color:#b9b9b9; border-radius:5px; }';
    st.innerHTML += '.lb {border: 1px solid #666666; border-radius:3px; background-color: #eeeeee; padding: 5px; margin: 5px;display: inline-block; text-align:center; min-width: 50px; cursor:pointer;}';
    st.innerHTML += '.ctrl { background-color:#adcfd8; }';
    st.innerHTML += '.fC { float:left; border: #999999 solid 1px; padding:2px; background-color:#eeeeee; border-radius:3px; box-sizing: border-box;}';
    st.innerHTML += '.clr { clear:left; } ';
    st.innerHTML += '.fC h4 { margin: 2px; } ';
    st.innerHTML += '#func { margin-top: 50px;} ';
    st.innerHTML += 'h2 { font-size: 40px; text-align: center; margin: 20px 0 100px 0; padding:15px; background-color:#0e4db4; color:white!important; border-radius:5px; }';
    st.innerHTML += '.sBut {position: fixed; bottom: 0px; right: 0px; background-color: #4CAF50; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; margin: 4px 2px; cursor: pointer; border-radius: 4px;}';
    st.innerHTML += '.ins {visibility:hidden;} .edt{float:right;background: #fff;padding:0 2px 0 2px;margin:0 2px 0 2px;border-radius:3px; border:1px solid #999999; background-color:#adcfd8;}';
    st.innerHTML += '.fp {color: #999999; font-size: 10px;}';
    st.innerHTML += '@media print { .sBut {display: none !important;}}';
    st.innerHTML += '.hwcElement:hover {stroke-width: 5px;stroke: #F00;}';
    st.innerHTML += '.addEl {pointer-events: none;}';
    st.innerHTML += '.hwcElement.selectedEl {stroke-width: 5px;stroke: #F00;fill: #FDB62B;}';
    st.innerHTML += '.alert {padding:15px;margin-bottom:20px;border:1px solid transparent;border-radius:4px}';
    st.innerHTML += '.alert-warning {color: #8a6d3b;background-color: #fcf8e3;border-color: #faebcc}';
    st.innerHTML += 'label.fp {display:inline-block; padding: 5px 10px; font-weight: normal; margin: 5px 5px; font-size: 14px; background-color: #ccc; border-radius: 7px; color: black;}';
    st.innerHTML += 'label.fp:hover{cursor: pointer;background-color:gold;}';
    st.innerHTML += 'label.isSelected{background-color:#90c9f1;}';
    st.innerHTML += 'label.deviceFilter.isSelected{background-color:#a8cf43;}';
    st.innerHTML += 'label.fp input[type="checkbox"] {position: relative; top: -2px; margin-right: 5px}';
    st.innerHTML += 'div#func select {max-width: 100%;margin-left:4px;}';
    st.innerHTML += '.hr-shift{margin-top: 0.5em!important;margin-bottom: 0.5em!important;margin-left: auto!important;margin-right: auto!important;border-style: inset!important;border-width: 1px!important;}';
    st.innerHTML += '[draggable] {-moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; user-select: none; -khtml-user-drag: element; -webkit-user-drag: element;}';
    st.innerHTML += '.sortable-over {border-top: 2px dashed;border-radius:2px;} .sortable-moving {border: 2px dashed;border-radius:2px; border-color:#999999}';
    st.innerHTML += '.movebox::after{content:"MV";float:right;background: #fff;padding:0 2px 0 2px;margin:0 2px 0 2px;border-radius:3px; border:1px solid #999999; background-color:#adcfd8; font-size:0.7em}';
    st.innerHTML += '.sortable-over > *, .sortable-over > * > * {pointer-events: none;}';
    st.innerHTML += '.nopevent > *, .nopevent > * > * {pointer-events: none;}';
    st.innerHTML += '.modal-close-btn{ float: right;float: right;font-size: 21px;font-weight: 700;line-height: 1;color: #000;text-shadow: 0 1px 0 #fff;filter: alpha(opacity=20);opacity: .2;background-color: transparent;border: none;}';
    st.innerHTML += '.modal{display:none;z-index:999;position: fixed;top: 50%;left: 50%;transform: translate(-50%, -50%);}.modal .modal-dialog{position:relative;margin:30px auto;width:430px;border-radius:6px;background:white;-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);box-shadow:0 3px 9px rgba(0,0,0,.5)}';
    st.innerHTML += '.modal-dialog{padding:15px;marign:10px;} .modal-header{padding-bottom:15px; font-size:22px;} .modal-body{padding-bottom:15px; font-size:14px;}';
    st.innerHTML += 'select {border: 0; -webkit-appearance: none;-moz-appearance: none;border: 1px solid #ccc;border-radius: 4px;background: url(\'data:image/svg+xml;utf8,<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="10px" height="10px" viewBox="0 0 255 255" style="enable-background:new 0 0 255 255;" xml:space="preserve"><g><g id="arrow-drop-down"><polygon points="0,63.75 127.5,191.25 255,63.75"/></g></g></svg>\') center right 5px no-repeat no-repeat;padding-right:15px;background-color:#f8f8f8;line-height: 1.7;padding-left:3px;}';
    st.innerHTML += 'select:focus {border-color: #66afe9;outline: 0!important;-webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6);}';
    st.innerHTML += 'select:-moz-focusring{ color: transparent;text-shadow: 0 0 0 #000;}';
}
 */

function getHValue(hwcIndex, stateIndex, actionIndex = -1, valueIndex = -1) {
  if (!HWv[hwcIndex]) return [];
  if (!HWv[hwcIndex][stateIndex]) return [];
  if (actionIndex == -1) return HWv[hwcIndex][stateIndex];

  if (!HWv[hwcIndex][stateIndex][actionIndex]) return [];
  if (valueIndex == -1) return HWv[hwcIndex][stateIndex][actionIndex];

  if (!HWv[hwcIndex][stateIndex][actionIndex][valueIndex]) return [];
  return HWv[hwcIndex][stateIndex][actionIndex][valueIndex];
}

function setHValue(newValue, hwcIndex, stateIndex, actionIndex = -1, valueIndex = -1) {
  if (!HWv[hwcIndex]) return false;
  if (!HWv[hwcIndex][stateIndex]) return false;
  if (actionIndex == -1) {
    HWv[hwcIndex][stateIndex] = newValue;
    return true;
  }

  if (!HWv[hwcIndex][stateIndex][actionIndex]) return false;
  if (valueIndex == -1) {
    HWv[hwcIndex][stateIndex][actionIndex] = newValue;
    return true;
  }

  if (!HWv[hwcIndex][stateIndex][actionIndex][valueIndex]) return false;
  HWv[hwcIndex][stateIndex][actionIndex][valueIndex] = newValue;
  return true;
}

function createHValue(newValue, hwcIndex, stateIndex, actionIndex = -1, valueIndex = -1) {
  if (!HWv[hwcIndex]) return false;
  if (!HWv[hwcIndex][stateIndex]) HWv[hwcIndex][stateIndex] = [];
  if (actionIndex == -1) {
    console.log("Setting");
    HWv[hwcIndex][stateIndex] = newValue;
    return true;
  }

  if (!HWv[hwcIndex][stateIndex][actionIndex]) HWv[hwcIndex][stateIndex][actionIndex] = [];
  if (valueIndex == -1) {
    HWv[hwcIndex][stateIndex][actionIndex] = newValue;
    return true;
  }

  if (!HWv[hwcIndex][stateIndex][actionIndex][valueIndex]) HWv[hwcIndex][stateIndex][actionIndex][valueIndex] = [];
  HWv[hwcIndex][stateIndex][actionIndex][valueIndex] = newValue;
  return true;
}

function setOrCreateHValue(newValue, hwcIndex, stateIndex, actionIndex = -1, valueIndex = -1) {
  if (!setHValue(newValue, hwcIndex, stateIndex, actionIndex, valueIndex)) {
    createHValue(newValue, hwcIndex, stateIndex, actionIndex, valueIndex);
  }
}


// Sortable implementation from https://www.cssscript.com/native-html5-drag-and-drop-sortable-js/
function Sortable(options) {
  var dragEl,
    isOver,
    slice = function(arr, start, end) {
      return Array.prototype.slice.call(arr, start, end)
    },
    sortables,
    overClass,
    movingClass;

  function handleDragStart(e) {
    //console.log('dragStart', e.target, e);
    /*        var isFirefox = typeof InstallTrigger !== 'undefined';

                if (isFirefox) {
                    alert("Firefox does not reliable support drag and drop to this date, please use a different browser until Mozilla fixes the issue");
                    return false;
                }*/

    e.dataTransfer.setData('text/html', this.innerHTML);
    e.dataTransfer.effectAllowed = 'move';
    dragEl = this;

    // this/e.target is the source node.
    this.classList.add(movingClass);
    var sorts = document.querySelectorAll(".sort");
    sorts.forEach(function(col) {
      if (col == this) return false;
      col.classList.add('nopevent');
    });

    //  this.classList.add("sortable-remove");
    var deletezone = createElementWithAttributes('div', {
      'id': 'deletezone',
      'class': 'sort deletezone',
      'style': 'position: fixed;bottom: 0px;right: 0px;height: 25%;width: 20%;background-color: #e106118c;color: white;border: 5px dashed;border-radius: 5px;border-color: #e10611;display: table; text-align: center;font-size: 24px;'
    });

    deletezone.innerHTML = "<span style='display: table-cell; vertical-align: middle; '>Drop here to delete action</span>"
    deletezone['addEventListener']('dragover', handleDragOver);
    deletezone['addEventListener']('dragenter', handleDragEnter);
    deletezone['addEventListener']('dragleave', handleDragLeave);
    deletezone['addEventListener']('drop', handleDrop);
    setTimeout(function() {
      appendChild(document.body, deletezone);
    }, 20);
  }

  function handleDragEnter(e) {
    //console.log('dragEnter', e.target);
    e.preventDefault(); // Allows us to drop.
    this.classList.add(overClass);
  }


  function handleDragOver(e) {
    //console.log('dragOver', e.target, e);
    e.preventDefault(); // Allows us to drop.
    if (this.classList.contains('sort')) {
      this.classList.add(overClass);
    }

    return false;
  }

  function handleDragLeave(e) {
    //console.log('dragleave', e.target, e);
    // this/e.target is previous target element.
    this.classList.remove(overClass);

  }

  function handleDrop(e) {
    var dropParent, dropIndex, dragIndex, dragParent;
    var isCrossDrag = false;
    // this/e.target is current target element.
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }
    if (e.preventDefault) {
      e.preventDefault(); // Allows us to drop.
    }

    if (this.id === 'deletezone') {
      var oldHwcIndex = dragEl.id.split("-")[1];
      var oldStateIndex = dragEl.id.split("-")[2];
      var oldActionIndex = dragEl.id.split("-")[3];
      HWv[oldHwcIndex][oldStateIndex].splice(oldActionIndex, 1);
      writeStateBehaviour(oldHwcIndex, oldStateIndex);
      return;
    }

    // Don't do anything if we're dropping on the same column we're dragging. And do not drag addbuttons
    if (dragEl !== this && dragEl.querySelector(".addButton") == null) {
      var dragBox = dragEl;
      var dropBox = this;
      dragParent = dragBox.parentElement;
      dropParent = dropBox.parentElement;
      if (dragParent != dropParent) {
        isCrossDrag = true;
      };

      dragIndex = slice(dragParent.children).indexOf(dragEl);
      dropIndex = slice(dropParent.children).indexOf(this);

      //drop on plus
      var isInsert = false
      if (dropBox.querySelector(".addButton") != null) isInsert = true;

      //###########
      var oldHwcIndex = dragBox.id.split("-")[1];
      var oldStateIndex = dragBox.id.split("-")[2];
      var oldActionIndex = dragBox.id.split("-")[3];

      var hwcIndex = dropBox.id.split("-")[1];
      var stateIndex = dropBox.id.split("-")[2];
      var actionIndex = dropBox.id.split("-")[3];

      /*
      // Swap logic
                        var oldActionData = getHValue(oldHwcIndex, oldStateIndex, oldActionIndex);
                        HWv[oldHwcIndex][oldStateIndex][oldActionIndex] = getHValue(hwcIndex, stateIndex, actionIndex);
                        setOrCreateHValue(oldActionData, hwcIndex, stateIndex, actionIndex);

                        if (isInsert) {
                            HWv[oldHwcIndex][oldStateIndex].splice(oldActionIndex, 1);
                        }
       */

      // Insert Logic
      var oldActionData = getHValue(oldHwcIndex, oldStateIndex, oldActionIndex);
      HWv[oldHwcIndex][oldStateIndex].splice(oldActionIndex, 1);
      if (!isCrossDrag && oldActionIndex < actionIndex) actionIndex--; // make order behaviour as expected (insert above)

      if (!HWv[hwcIndex][stateIndex]) HWv[hwcIndex][stateIndex] = [];
      HWv[hwcIndex][stateIndex].splice(actionIndex, 0, oldActionData);

      writeStateBehaviour(hwcIndex, stateIndex);
      if (isCrossDrag) writeStateBehaviour(oldHwcIndex, oldStateIndex);
    }
    return false;
  }

  function handleDragEnd(e) {
    var sorts = document.querySelectorAll(".sort");
    sorts.forEach(function(col) {
      col.classList.remove(overClass, movingClass, 'nopevent');
    });

    setTimeout(function() {
      var delzone = getElementById('deletezone');
      if (delzone != null) {
        delzone.parentNode.removeChild(delzone);
      }
    }, 50);

  }

  function destroy() {
    var sorts = document.querySelectorAll(".sort");
    sorts.forEach(function(col) {
      col.removeAttribute('draggable', 'true'); // Enable columns to be draggable.
      modifyListeners(col, false);
    });
    sortables = null;
    dragEl = null;
  }

  function modifyListeners(el, isAdd) {
    var addOrRemove = isAdd ? 'add' : 'remove';

    el[addOrRemove + 'EventListener']('dragstart', handleDragStart);
    el[addOrRemove + 'EventListener']('dragover', handleDragOver);
    el[addOrRemove + 'EventListener']('dragenter', handleDragEnter);
    el[addOrRemove + 'EventListener']('dragleave', handleDragLeave);
    el[addOrRemove + 'EventListener']('drop', handleDrop);
    el[addOrRemove + 'EventListener']('dragend', handleDragEnd);
  }

  function init() {
    sortables = document.querySelectorAll(".sort");

    overClass = 'sortable-over';
    movingClass = 'sortable-moving';

    sortables.forEach(function(col) {
      col.setAttribute('draggable', 'true'); // Enable columns to be draggable.
      modifyListeners(col, true)
    });
  }

  init();
  return {
    destroy: destroy
  };
}

function reInitSortable() {
  if (sorter != null) {
    sorter.destroy();
    sorter = Sortable({
      els: '.sort'
    });
  }
}
