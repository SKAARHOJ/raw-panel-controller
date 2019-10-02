import { app, ipcMain, BrowserWindow } from 'electron'
import * as net from 'net'
import * as readline from 'readline'
import { request, response } from './actionList'
import bitmap from './bitmap'

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const defaultPort = process.env.SK_RAW_PANEL_PORT ? process.env.SK_RAW_PANEL_PORT : 9923


function restart({server, client, state_serverMode, window }, { port, ip, serverMode }) {
  server.close()
  state_serverMode = serverMode
  if (!serverMode) {
    console.log(`listening on ${ip}:${port}`)
    server.listen(port, ip)
  } else {
    try {
    console.log('connecting client')
      client.connect(port, ip)
    } catch (err) {
      window.webContents.send('error/client_connection_refused')
      return ;
    }
    linkSocket(client, window)
  }
  window.webContents.send('restarted')
}

function linkSocket(socket, window) {
  socket.setEncoding('utf8')
  socket.on('error', (err) => console.log(err))
  socket.on('close', () => {
    window.webContents.send('socket_closed')
  })
  ipcMain.on('request', (event, data) => request(window, socket, data))
  let rl = readline.createInterface({input: socket })
  rl.on('line', (line) => response(window, socket, line));
  window.webContents.send('connected', true)
}

function createWindow () {
  let window = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })
  window.loadURL(winURL)
  let state = {
    server: net.createServer((socket) => linkSocket(socket, window)),
    client: new net.Socket(),
    serverMode: false,
    window,
  }
  ipcMain.on('connected', (event, data) => {
    if (!state.serverMode) {
      state.server.getConnections((err, count) => {
        if (err) return;
        state.window.webContents.send('connected', count > 0)
      })
    } else {
      state.window.webContents.send('connected', !state.client.pending)
    }
  })
  ipcMain.on('restart', (event, data) => restart(state, data))
  window.on('closed', () => {
    state.server.close()
    if (!state.client.pending) state.client.end()
  })
  bitmap.register(window)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
