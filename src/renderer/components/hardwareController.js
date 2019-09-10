import { ipcRenderer } from 'electron'

export default {
  sendHWCt(index, { title, isLabel, value, displayType }) {
    let display = 0;
    if (displayType.value === 'Integer') display = 0
    else if (displayType.value === 'No Display') display = 7

    const command =
      `HWCt#${index + 1}=${value.value}|${display}|0|${title.value}|${isLabel.value}\n`
    ipcRenderer.send('request', command)
  },
  send(command) {
    console.log('sending')
    ipcRenderer.send('request', `${command}\n`)
  }
}
