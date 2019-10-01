import * as  bitmap from 'bitmap-manipulation'
import { ipcMain } from 'electron'

const commands = {
  open({ filename }) {
    console.log(filename)
  }
}

export default {
  register(window) {
    ipcMain.on('bitmap', (event, data) => this.handle(window, data))
  },
  handle(window, data) {
    commands[data.command](data.value)
  }
}

