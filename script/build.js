'use strict'

console.log('process.env.BUILD_TARGET ' + process.env.BUILD_TARGET) && process.env.BUILD_TARGET
console.log('process.env.MINI ' + process.env.MINI) && process.env.MINI
console.log('process.env.NODE_ENV ' + process.env.NODE_ENV)

const { say } = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const packager = require('electron-packager')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const buildConfig = require('./build.config')
const mainConfig = require('./webpack.main.config')
const fileWatcherConfig = require('./webpack.fileWatcher.config')
const rendererConfig = require('./webpack.renderer.config')
const webConfig = require('./webpack.web.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') clean()
else build()

function clean() {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

function build() {
  greeting()

  del.sync(['dist/electron/*', '!.gitkeep'])

  const tasks = ['main', 'renderer']
  const m = new Multispinner(tasks, {
    preText: 'building',
    postText: 'process',
  })

  let results = ''

  m.on('success', () => {
    process.stdout.write('\x1B[2J\x1B[0f')
    console.log(`\n\n${results}`)
    console.log(`${okayLog}take it away ${chalk.yellow('`electron-packager`')}\n`)
    process.env.BUILD_TARGET = process.env.BUILD_TARGET || process.platform
    process.env.BUILD_TARGET === 'darwin' ? bundleAppToDmg() : bundleApp()
  })

  pack(mainConfig)
    .then((result) => {
      results += result + '\n\n'
      m.success('main')
    })
    .catch((err) => {
      m.error('main')
      console.log(`\n  ${errorLog}failed to build main process`)
      console.error(`\n${err}\n`)
      process.exit(1)
    })

  pack(rendererConfig)
    .then((result) => {
      results += result + '\n\n'
      m.success('renderer')
    })
    .catch((err) => {
      m.error('renderer')
      console.log(`\n  ${errorLog}failed to build renderer process`)
      console.error(`\n${err}\n`)
      process.exit(1)
    })
}

function pack(config) {
  return new Promise((resolve, reject) => {
    config.mode = 'production'
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats
          .toString({
            chunks: false,
            colors: true,
          })
          .split(/\r?\n/)
          .forEach((line) => {
            err += `    ${line}\n`
          })

        reject(err)
      } else {
        resolve(
          stats.toString({
            chunks: false,
            colors: true,
          })
        )
      }
    })
  })
}

function bundleApp() {
  buildConfig.mode = 'production'
  packager(buildConfig)
    .then((res) => {})
    .catch((e) => {
      console.log(`\n${errorLog}${chalk.yellow('`electron-packager`')} says...\n`)
      console.log(e + '\n')
    })
}

function greeting() {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 85) text = 'lets-build'
  else if (cols > 60) text = 'lets-|build'
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false,
    })
  } else console.log(chalk.yellow.bold('\n  lets-build'))
  console.log()
}

function bundleAppToDmg() {
  const path = require('path')
  const builder = require('electron-builder')
  const packageInfo = require(path.join(__dirname, '../', 'package.json'))

  const productName = 'OkShell'
  const version = packageInfo.version || '0.0.1'
  const os = 'mac'
  const arch = 'x64'
  const ext = 'dmg'

  const params = {
    targets: builder.Platform.MAC.createTarget('dmg', arch),
    projectDir: path.join(__dirname, '../'),
    config: {
      productName,
      appId: 'OkShell',
      asar: true,
      compression: 'normal',
      artifactName: `${productName}-${version}-${os}-${arch}.${ext}`,
      electronDownload: {},
      dmg: {
        title: `${productName}-${version}`,
        background: 'build/dmg-backgroud.png',
        contents: [
          {
            x: 130,
            y: 220,
            type: 'file',
          },
          {
            x: 410,
            y: 220,
            type: 'link',
            path: '/Applications',
          },
        ],
      },
      mac: {
        target: 'dmg',
        icon: 'build/icons/icon.icns',
        category: 'OkShell',
        extendInfo: {
          CFBundleDocumentTypes: [
            {
              CFBundleTypeExtensions: [],
              CFBundleTypeIconFile: `${productName}.icns`,
            },
          ],
        },
      },
      directories: {
        output: 'build',
      },
      files: ['dist/electron', 'package.json'],
      win: {
        icon: 'build/icons/icon.ico',
      },
    },
  }
  // console.log(JSON.stringify(params))
  builder
    .build(params)
    .then((res) => {
      console.log('\n success! \n')
    })
    .catch((e) => {
      console.error(`\n${e}\n`)
      process.exit(1)
    })
}
