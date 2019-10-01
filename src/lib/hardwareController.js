export function deserialize(line) {
  let index
  let command
  if (line.match(/^HWC*/)) command = parseHWC(line)
  else if ((index = line.indexOf('=')) >= 0) command = parseEquals(line, index)
  else command = {
    command: line,
    value: undefined
  }
  command.raw = line
  return command
}

export function serialize({ command, value }) {
  const serializer = commandSerializers[command]
  if (!serializer) {
    if (typeof(value) !== 'undefined') return `${command}=${value}\n`
    return `${command}\n`
  }
  return serializer(value)
}

function parseHWC(line) {
  let [ key, value ] = line.split('=')
  let i = key.indexOf('.')
  let direction = undefined
  let id = undefined
  if (i >= 0)  {
    let mask = +key.substring(i + 1)
    if (mask === 1) direction = 'Top'
    else if (mask === 2) direction = 'Left'
    else if (mask === 4) direction = 'Bottom'
    else if (mask === 8) direction = 'Right'
  }
  else i = key.length
  id = key.slice(4, i)
  return {
    command: 'HWC',
    value: {
      id,
      direction,
      value
    }
  }
}

function parseEquals(line, index) {
  return {
    command: line.slice(0, index),
    value: line.substring(index + 1)
  }
}

const commandSerializers = {
  HWCt({ index,  title, isLabel, value,
    displayType, label1, label2, value2 }) {
    let display = 0;
    if (displayType.selected === 'Integer') display = 0
    else if (displayType.selected === 'No Display') display = 7
    const label = isLabel ? '1' : '0'
    let command =
      `HWCt#${index + 1}=${value}|${display}|0|${title}|${label}`
    + `|${label1}`
    if (label2) command += `|${label2}|${value2}`
    return command + '\n'
  },
  HWCc({ index, state }) {
      return `HWCc#${index + 1}=${state}\n`
  },
  HWC({ index, state }) {
      return `HWC#${index + 1}=${state}\n`
  },
  HWCx({ index, type, value }) {
    const encoded = value + (type << 10)
    return `HWCx#${index}=${encoded}`
  },
  HWCg({index, buffer }) {
    if (!buffer) return ``
      let arr = new Array(3)
      arr[0] = buffer.slice(0, 86)
      arr[1] = buffer.slice(86, 172)
      arr[2] = buffer.slice(172, 256)
    return `HWCg#${index}=0:${arr[0].toString('base64')}`
    + `\nHWCg#${index}=1:${arr[1].toString('base64')}`
    + `\nHWCg#${index}=2:${arr[2].toString('base64')}\n`
  },
}
