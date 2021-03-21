'use strict'
const webpackConfig = require('./webpack.web.config')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

webpackConfig.plugins.push(new BundleAnalyzerPlugin())

module.exports = webpackConfig
