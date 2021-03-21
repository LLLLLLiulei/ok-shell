'use strict'

process.env.BABEL_ENV = 'renderer'

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const babelrc = require('../.babelrc.js')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

let rendererConfig = {
  mode: process.env.NODE_ENV,
  devtool: '#cheap-module-source-map',
  entry: {
    renderer: path.join(__dirname, '../src/renderer/app.ts'),
  },

  module: {
    rules: [
      {
        test: /\.(ts|js|vue)$/,
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
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          'thread-loader',
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              happyPackMode: true,
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.tsx$/,
        loader: 'babel-loader!ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: ['vue-style-loader', 'css-loader', 'less-loader'],
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader',
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
      {
        test: /\.vue$/,
        use: [
          'thread-loader',
          {
            loader: 'vue-loader',
            options: {
              extractCSS: true,
              loaders: {
                sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
                scss: 'vue-style-loader!css-loader!sass-loader',
                less: 'vue-style-loader!css-loader!less-loader',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]',
          },
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]',
          },
        },
      },
    ],
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production',
  },
  plugins: [
    new VueLoaderPlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['renderer'],
      template: path.resolve(__dirname, '../src/index.ejs'),
      templateParameters(compilation, assets, options) {
        return {
          compilation: compilation,
          webpack: compilation.getStats().toJson(),
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: options,
          },
          process,
          isWeb: false,
        }
      },
      minify: {
        removeComments: true,
      },
      nodeModules: process.env.NODE_ENV !== 'production' ? path.resolve(__dirname, '../node_modules') : false,
    }),

    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.BUILD_TARGET': JSON.stringify(process.env.BUILD_TARGET),
      __DEV: JSON.stringify(process.env.NODE_ENV === 'development'),
      IS_WEB: JSON.stringify(process.env.BUILD_TARGET === 'web'),
      IS_MAC: JSON.stringify(process.env.BUILD_TARGET === 'darwin'),
      __TEST: JSON.stringify(process.env.TEST === 'true'),
    }),
  ],
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/electron'),
  },
  optimization: {
    minimizer: [],
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, '../src'),
      '@@': path.join(__dirname, '../src/renderer/views'),
      '@src': path.join(__dirname, '../src'),
    },
    extensions: ['.js', '.ts', '.tsx', '.vue', '.json', '.css', '.node'],
  },
  target: 'electron-renderer',
}

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      __static: `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`,
    })
  )
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = ''

  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    })
  )
}

module.exports = rendererConfig
