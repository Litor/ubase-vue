import loaders from './webpack.loaders.js'
import plugins from './webpack.plugins.js'
import glob from 'glob'
import fs from 'fs'
import _ from 'lodash'
import beautify from 'js-beautify'
import vueEntry from 'vue-entry'
import webpack from 'webpack'
import path from 'path'
import config from '../config'
import {isSingleAppMode} from 'vue-entry/dist/bootstrap/utils'
var vueEntryConfig = config.vueEntryConfig

let singleAppMode = isSingleAppMode(vueEntryConfig)

let webpackConfig = {
  context: path.resolve(config.src),
  entry: vueEntry(vueEntryConfig),
  resolve: {
    root: [
      path.resolve(config.src),
      path.resolve('./node_modules/'),
    ],
    alias: Object.assign({}, config.alias),
    extensions: ['', '.js', '.vue']
  },

  output: {
    publicPath: singleAppMode ? './' : '../',
    filename: config.isDeveloper ? '[name].js' : '[name]-[chunkhash].js',
    chunkFilename: 'statics/chunk/[name]-[id].js',
  },

  watch: config.isDeveloper,

  module: {
    loaders: loaders,
  },

  plugins: plugins,

  devtool: config.isDebug ? '#inline-source-map' : false,
}

export default webpackConfig

