const pty = require('node-pty')
const os = require('os')
const WebSocket = require('ws')

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'zsh'

const wss = new WebSocket.Server({ port: 4002 })
console.log('🚀 ~ file: pty.js ~ line 8 ~ wss', wss.address())

wss.on('connection', (ws) => {
  console.log('socket connection success')
  const ptyProcess = pty.spawn(shell, ['-l'], {
    name: 'xterm-color',
    cols: 80,
    rows: 100,
    cwd: process.env.HOME,
  })

  ws.on('message', (res) => {
    console.log('🚀 ~ file: pty.js ~ line 19 ~ ws.on ~ res', res)
    ptyProcess.write(res)
  })

  ptyProcess.on('data', (data) => {
    console.log('🚀 ~ file: pty.js ~ line 24 ~ data', data)
    process.stdout.write(data)
    ws.send(data)
  })
})
