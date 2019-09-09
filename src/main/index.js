import { app, ipcMain } from 'electron'
import * as net from 'net'
import * as readline from 'readline'
import { request, response } from './actionList'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const port = process.env.SK_RAW_PANEL_PORT ? process.env.SK_RAW_PANEL_PORT : 9923


function createServer () {
  ipcMain.on('request', (event, data) => request(event.sender, data))
  let server = net.createServer((socket) => {
    socket.setEncoding('utf8')
    let rl = readline.createInterface({input: socket })
    rl.on('line', (line) => response(socket, line));
  })
  server.listen(port, '0.0.0.0')
}

app.on('ready', createServer)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
