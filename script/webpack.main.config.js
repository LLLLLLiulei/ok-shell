'use strict'

process.env.BABEL_ENV = 'main'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')
const BabiliWebpackPlugin = require('babili-webpack-plugin')
const babelrc = require('../.babelrc.js')

let mainConfig = {
  mode: process.env.NODE_ENV,
  entry: {
    main: path.join(__dirname, '../src/main/index.ts'),
  },
  externals: [...Object.keys(dependencies || {})],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader' || 'awesome-typescript-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter'),
          },
        },
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: babelrc(),
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron'),
  },
  optimization: {
    minimizer: [],
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
  resolve: {
    extensions: ['.js', '.ts', '.json', '.node'],
  },
  target: 'electron-main',
}

/**
 * Adjust mainConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
    })
  )
}

/**
 * Adjust mainConfig for production settings
 */
if (process.env.NODE_ENV !== 'development') {
  mainConfig.plugins.push(
    // new BabiliWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    })
  )
}

module.exports = mainConfig
