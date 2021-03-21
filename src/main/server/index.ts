import { fork } from 'child_process'
import { resolve } from 'path'

fork(resolve(__dirname, 'ssh.js'))
fork(resolve(__dirname, 'pty.js'))
