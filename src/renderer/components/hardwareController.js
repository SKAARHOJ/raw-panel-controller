import { ipcRenderer } from 'electron'

export default {
  sendHWCt(index, { title, isLabel, value, displayType }) {
    let display = 0;
    if (displayType.selected === 'Integer') display = 0
    else if (displayType.selected === 'No Display') display = 7
    const label = isLabel.value ? '1' : '0'
    const command =
      `HWCt#${index + 1}=${value.value}|${display}|0|${title.value}|${label}\n`
    console.log(command)
    ipcRenderer.send('request', command)
  },
  send(command) {
    console.log('sending')
    ipcRenderer.send('request', `${command}\n`)
  }
}
