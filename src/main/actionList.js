import { BrowserWindow } from 'electron'

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
let clientList = []

const actionList =
{
  list(socket, buffer) {
    if (clientList.find((elem) => elem.socket === socket)) {
      socket.write('\n')
      return ;
    }
    let window = new BrowserWindow({
      height: 563,
      useContentSize: true,
      width: 1000
    })
    window.loadURL(winURL)
    console.log('window loaded')
    const length = clientList.push( { socket, window } )
    window.on('closed', () => {
      let elem = clientList[length - 1]
      elem.socket.end()
      elem.socket = null
      elem.window = null
    })
    socket.write('\nActivePanel=1\n')
  },
  ping(socket) { 
    socket.write('ack\n')
  },
  map(socket, key, value) {
  }
}

function parseHWC(client, hwc, value) {
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
  client.send('HWC', {
    id,
    direction,
    value
  })
}

export function response(socket, command) {
  let index = command.indexOf('=')
  if (index >= 0) {
    let key = command.slice(0, index)
    let value = command.substring(index + 1)
    let client = clientList.find((elem) => elem.socket === socket)
    if (!client) return
    if (key.match(/^HWC*/)) parseHWC(client.window.webContents, key, value)
    else client.window.webContents.send(key, value)
  } else {
  const f = actionList[command]
  if (f !== undefined) f(socket, command);
  else socket.write('nack\n')
  }
}

export function request (window, message) {
  let client = clientList.find((elem) => elem.window && elem.window.webContents === window)
  if (!client)
    return
  client.socket.write(message)
}
