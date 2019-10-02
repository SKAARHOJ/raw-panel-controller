'use strict';

var selectedHWc = [];
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
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.remove('selectedEl');
  }
}

function setScrollLink(e, hwcIndex) { // Sets scroll link for SVG element
  const _hwcIndex = hwcIndex;
  return setAttributes(e, {
    'click': function() {
        toggleHWc(_hwcIndex);
          getElementById('fn' + _hwcIndex).scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
    },
    'cursor': 'pointer'
  });
}


function toggleHWc(hwcIndex) {
  var oldState = selectedHWc[hwcIndex];

  selectedHWc.fill(0);

  if (hwcIndex < HWc.length) {
    selectedHWc[hwcIndex] = oldState ? 0 : 1;
  }

  setCookie('selectedHWc', selectedHWc.join());
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

export default function(_HWc, vueComponent, map) { // Initializes the whole page.
  HWc = _HWc
  let e = document.getElementById('ctrlimg')

  // Creates "function" container div
  for (let i = 0; i < HWc.length; ++i) {
    
    if (!map[0].has(i)
      || vueComponent.hidden.map[i]) continue
    vueComponent.hidden.map[i] = i
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
        b.addEventListener('click', () => vueComponent.show(i))
        break;
    }
    // addSVGElement(setScrollLink(paintMainElement(b), i), HWc[i][5]);
    addSVGElement(paintMainElement(b), HWc[i][5]);

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
