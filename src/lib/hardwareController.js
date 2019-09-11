import { ipcRenderer } from 'electron'

export function deserialize(line) {
  let index
  if (line.match(/^HWC*/)) return parseHWC(line)
  else if ((index = line.indexOf('=')) >= 0) return parseEquals(line, index)
  else return {
    command: line,
    value: undefined
  }
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
    console.log(mask)
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
  HWCt({index,  title, isLabel, value, displayType }) {
    let display = 0;
    if (displayType.selected === 'Integer') display = 0
    else if (displayType.selected === 'No Display') display = 7
    const label = isLabel ? '1' : '0'
    const command =
      `HWCt#${index + 1}=${value}|${display}|0|${title}|${label}`
    return command
  },
  HWC({ index, state }) {
      return `HWC#${index + 1}=${state}\n`
  }
}
