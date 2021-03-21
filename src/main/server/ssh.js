const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const expressWs = require('express-ws')
const { Client } = require('ssh2')
const path = require('path')

const SftpClient = require('ssh2-sftp-client')

const opts = {
  host: '',
  port: 122,
  username: 'root',
  password: '',
}

const createSshConn = () => {
  const conn = new Client()
  conn.connect(opts)
  return conn
}
const createSftpConn = () => {
  const sftp = new SftpClient()
  return sftp.connect(opts).then(() => sftp)
}

const router = express.Router()
expressWs(router)
router.ws('/ssh', function (ws, req) {
  let conn = createSshConn()
  conn.on('ready', function () {
    console.log('Client :: ready')
    conn.shell(function (err, stream) {
      if (err) return
      stream
        .on('close', function () {
          console.log('Stream :: close')
          conn.end()
        })
        .on('data', function (data) {
          console.log('OUTPUT: ' + data)
          ws.send(data)
        })
      ws.on('message', (msg) => {
        console.log('🚀 ~ file: index.ts ~ line 22 ~ ws.on ~ msg', msg)
        stream.write(msg)
      })
    })
  })
})

router.ws('/sftp', function (ws, req) {
  createSftpConn().then((sftp) => {
    sftp.list('/').then((data) => {
      console.log('🚀 ~ file: ssh.js ~ line 54 ~ sftp.list ~ data', data)
      data.forEach((i) => {
        i.path = path.join('/', i.name)
      })
      ws.send(JSON.stringify(data))
    })
    ws.on('message', (msg) => {
      console.log('🚀 ~ file: ssh.js ~ line 58 ~ ws.on ~ msg', msg)
      sftp.list(msg).then((data) => {
        console.log('🚀 ~ file: ssh.js ~ line 59 ~ sftp.list ~ data', data)
        data.forEach((i) => {
          i.path = path.join(msg, i.name)
        })
        ws.send(JSON.stringify(data))
      })
    })
  })
})

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/', router)

expressWs(app)
app.listen(4001)
