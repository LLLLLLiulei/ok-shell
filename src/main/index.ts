import fs from 'fs'
import path from 'path'
import { app, ipcMain, Menu, BrowserWindow, globalShortcut } from 'electron'
import packageInfo from '../../package.json'

const NODE_GLOBAL: Obj = global as Obj

app.name = packageInfo.name

if (process.env.NODE_ENV !== 'development') {
  NODE_GLOBAL.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow: Nullable<BrowserWindow> = null

const mainURL = process.env.NODE_ENV === 'development' ? 'http://localhost:9089/index.html' : `file://${__dirname}/index.html`

NODE_GLOBAL.args = process.argv
NODE_GLOBAL.mainProcessArgv = process.argv

const showWindow = () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
    mainWindow.focus()
  }
}

console.log(path.resolve(__dirname, 'preload', 'index.js'))
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    height: 1920,
    width: 1080,
    title: packageInfo.productName,
    resizable: true,
    maximizable: true,
    frame: true,
    show: false,
    center: true,
    hasShadow: true,
    fullscreenable: true,
    backgroundColor: '#000',
    opacity: 1,
    // transparent: true,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: false,
      webSecurity: true,
      preload: path.resolve(__dirname, 'preload', 'index.js'),
    },
  })

  mainWindow.webContents.on('did-finish-load', function () {
    mainWindow?.setMenuBarVisibility(true)
    mainWindow?.show()
    mainWindow?.focus()
  })

  mainWindow.on('close', function (e) {
    if (process.platform === 'win32') {
      e.preventDefault()
      !mainWindow?.isDestroyed() && mainWindow?.hide()
    }
  })

  mainWindow.loadURL(mainURL)
  return mainWindow
}

const openDevTools = () => {
  if (process.env.NODE_ENV === 'development') {
    // mainWindow?.webContents.openDevTools()
    let vueDevToolPath = path.join(__static, 'tools', 'vue-devtools', '6.0.0.3_0')
    if (fs.existsSync(vueDevToolPath)) {
      const ses = mainWindow?.webContents?.session
      ses?.removeExtension('Vue.js devtools')
      ses?.loadExtension(vueDevToolPath)
    }
  }
}

const setApplicationMenu = (params?: Obj) => {
  let modifyMenu = {
    label: '??????',
    submenu: [
      { role: 'undo', accelerator: 'CmdOrCtrl+Z', label: '??????' },
      { role: 'redo', accelerator: 'CmdOrCtrl+Y', label: '??????' },
      { type: 'separator' },
      { role: 'cut', accelerator: 'CmdOrCtrl+X', label: '??????' },
      { role: 'copy', accelerator: 'CmdOrCtrl+C', label: '??????' },
      { role: 'paste', accelerator: 'CmdOrCtrl+V', label: '??????' },
      { role: 'pasteandmatchstyle', label: '?????????????????????' },
      { role: 'delete', label: '??????' },
      { role: 'selectall', accelerator: 'CmdOrCtrl+A', label: '??????' },
    ],
  }
  let windowMenu: Obj = {
    label: '??????',
    submenu: [{ role: 'minimize' }, { role: 'close' }],
  }
  let devMenu = {
    id: 'devMenu',
    label: '??????',
    submenu: [
      { role: 'forcereload', accelerator: 'F5', label: '????????????' },
      { role: 'toggledevtools', accelerator: 'F6', label: '???????????????' },
    ],
  }

  const template: any[] = [modifyMenu, windowMenu]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: '??????' },
        { role: 'hideothers', label: '????????????' },
        { role: 'unhide', label: '????????????' },
        { type: 'separator' },
        { role: 'quit', label: '??????' },
      ],
    })
    windowMenu.submenu = [{ role: 'close' }, { role: 'minimize', label: '?????????' }, { role: 'zoom', label: '??????' }]
  }

  if (!params?.showDevMenu) {
    params = params || {}
    params.showDevMenu = process.env.NODE_ENV === 'development' || (NODE_GLOBAL.args.length > 1 && NODE_GLOBAL.args[1] === '--debugger')
  }
  params.showDevMenu === true && template.push(devMenu)
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

const registerGlobalShortcut = () => {
  globalShortcut.register('CommandOrControl+E+C+M', () => {
    let currentMenu: Nullable<Menu> = Menu.getApplicationMenu()
    let hasDevMenu = currentMenu?.items.some((i) => i.id && i.id === 'devMenu')
    let showDevMenu = !hasDevMenu
    setApplicationMenu({ showDevMenu })
  })
}

const ready = () => {
  if (process.env.NODE_ENV === 'development') {
    // ??????userData????????????????????????????????????????????????????????????????????????
    app.setPath('userData', path.join(__static, '..', '.userData'))
    NODE_GLOBAL.devMode = true
  } else {
    NODE_GLOBAL.devMode = false
  }

  // ??????????????????????????????
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
    return
  }
  createMainWindow()
  setApplicationMenu()
  openDevTools()
  registerGlobalShortcut()
}

app.on('ready', ready)
app.on('activate', () => {
  if (!app.isReady()) {
    return
  }
  let currentWindow = mainWindow || createMainWindow()

  if (currentWindow) {
    currentWindow.isMinimized() && currentWindow.restore()
    currentWindow.show()
  }
})
app.on('second-instance', (_event: any) => {
  showWindow()
})

ipcMain.on('app-quit', () => app.exit())
