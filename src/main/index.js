import { app, ipcMain, BrowserWindow } from 'electron'
import * as net from 'net'
import * as readline from 'readline'
import { request, response } from './actionList'

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const defaultPort = process.env.SK_RAW_PANEL_PORT ? process.env.SK_RAW_PANEL_PORT : 9923

function restartServer(server, window, { port }) {
  server.close()
  server.listen(port, '0.0.0.0')
  window.webContents.send('restarted')
}

function createServer () {
  ipcMain.on('restart', (event, data) => restartServer(server, window, data))
  let window = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  window.loadURL(winURL)
  window.on('closed', () => {
    server.close()
  })
  let server = net.createServer((socket) => {
    socket.setEncoding('utf8')
    let rl = readline.createInterface({input: socket })
    ipcMain.on('request', (event, data) => request(socket, data))
    window.webContents.send('connected', {})
    rl.on('line', (line) => response(window, socket, line));
  })
  server.listen(defaultPort, '0.0.0.0')
}

app.on('ready', createServer)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
