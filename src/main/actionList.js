import { BrowserWindow } from 'electron'
import { serialize, deserialize } from '../lib/hardwareController'

const actionList =
{
  list(window, socket) {
    socket.write('\nActivePanel=1\n')
  },
  ping(window, socket) { 
    console.log('ping')
    socket.write('ack\n')
  },
  nack(window, socket) {
  }
}

function defaultAction(window, socket, { command, value }) {
}

function forward(window, socket, { command, value, raw }) {
  window.webContents.send(command, { value, raw })
}

function getAction({ command, value }) {
  const f = actionList[command]
  if (f) return f
  else if (value) return forward
  return defaultAction
}

export function response(window, socket, command) {
  const action = deserialize(command)
  console.log(action)
  const f = getAction(action)
  try {
  f(window, socket, action)
  } catch (err) {
    console.log(err)
  }
}

export function request(window, socket, command) {
  console.log('request', command)
  const buffer = serialize(command)
  window.webContents.send('raw_command', {
    raw: buffer.slice(0, buffer.length -1)
  })
  try {
    socket.write(buffer)
  } catch (err) {
    console.log(err)
    window.webContents.send('disconnected')
  }
}
