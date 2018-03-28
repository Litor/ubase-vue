import loaders from './webpack.loaders.js'
import plugins from './webpack.plugins.js'
import vueEntry from 'vue-entry'
import path from 'path'
import config from '../config'
import {isSingleAppMode} from 'vue-entry/dist/bootstrap/utils'
var vueEntryConfig = config.vueEntryConfig

let singleAppMode = isSingleAppMode(vueEntryConfig)

let webpackConfig = {
  context: path.resolve(config.src),
  entry: vueEntry(vueEntryConfig),
  resolve: {
    modules: [
      path.resolve(config.src),
      path.resolve('./node_modules/'),
    ],
    alias: Object.assign({}, config.alias),
    extensions: ['.js', '.vue']
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

if(config.rootFontSize){
  webpackConfig.vue = {
    postcss: [require('postcss-cssnext')({
      features: {
        rem: false
      }
    }), require('postcss-pxtorem')({
      rootValue: config.rootFontSize || 20,
      propWhiteList: []
    })],
      autoprefixer: false
  }
}

export default webpackConfig

