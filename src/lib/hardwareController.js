import { ipcRenderer } from 'electron'

export default {
  sendHWCt(index, { title, isLabel, value, displayType }) {
    let display = 0;
    if (displayType.selected === 'Integer') display = 0
    else if (displayType.selected === 'No Display') display = 7
    const label = isLabel.value ? '1' : '0'
    const command =
      `HWCt#${index + 1}=${value.value}|${display}|0|${title.value}|${label}`
    this.send(command)
  },
  send(command) {
    ipcRenderer.send('request', `${command}\n`)
  },
  parse(line) {
    let index
    if (line.match(/^HWC*/)) return this.parseHWC(line)
    else if ((index = line.indexOf('=')) >= 0) return this.parseEquals(line, index)
    else return {
      command: line,
      value: undefined
    }
  },
  parseHWC(line) {
    let i = hwc.indexOf('.')
    let direction = undefined
    let id = undefined
    if (i >= 0)  {
      let mask = +hwc.substring(i + 1)
      console.log(mask)
      if (mask === 1) direction = 'Top'
      else if (mask === 2) direction = 'Left'
      else if (mask === 4) direction = 'Bottom'
      else if (mask === 8) direction = 'Right'
    }
    else i = hwc.length
    id = hwc.slice(4, i)
    return {
      command: 'HWC',
      value: {
        id,
        direction,
        value
      }
    }
  },
  parseEquals(line, index) {
    return {
      command: line.slice(0, index),
      value: line.substring(index + 1)
    }
  }
}
