import { BrowserWindow } from 'electron'
import { serialize, deserialize } from '../lib/hardwareController'

const actionList =
{
  list(window, socket) {
    socket.write('\nActivePanel=1\n')
  },
  ping(window, socket) { 
    socket.write('ack\n')
  },
}

function defaultAction(window, socket, { command, value }) {
  socket.write('nack\n')
}

function forward(window, socket, { command, value }) {
  window.webContents.send(command, value)
}

function getAction({ command, value }) {
  const f = actionList[command]
  if (f) return f
  else if (value) return forward
  return defaultAction
}

export function response(window, socket, command) {
  const action = deserialize(command)
  const f = getAction(action)
  f(window, socket, action)
}

export function request(socket, command) {
  const buffer = serialize(command)
  console.log(buffer)
  socket.write(buffer)
}
