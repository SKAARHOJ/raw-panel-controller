export default (svg, component, typeTraits) => {
  let attributes = {
    'fill-opacity': 0,
    stroke: 'black',
    'stroke-opacity': 1,
    'stroke-width': 10,
    'stroke-linejoin': 'round',
  }
  let elem
  if (generator[component.type]) {
    elem = generator[component.type](component, attributes, typeTraits[component.type])
  } else return;
  setAttributes(elem, attributes)
  svg.appendChild(elem)
}

function setAttributes(elem, attributes) {
  for (let key in attributes) {
    elem.setAttribute(key, attributes[key])
  }
}

const types = {
  knob: 15,
  button: 134
}

const generator = {
  [types.knob](component, attributes, traits) {
    attributes.cx = component.x
    attributes.cy = component.y
    attributes.r = traits.w * 0.5
    return document.createElementNS('http://www.w3.org/2000/svg', 'circle')
  },
  [types.button](component, attributes, traits) {
    attributes.x = component.x - 67
    attributes.y = component.y - 40//114
    attributes.rx = 5
    attributes.ry = 5
    attributes.width = traits.w
    attributes.height = traits.h
    console.log(traits.sub[0])
    return document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  }
}
