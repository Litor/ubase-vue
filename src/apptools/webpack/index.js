import autoprefixer from 'autoprefixer'
import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'
import glob from 'glob'
import fs from 'fs'

export default (path, webpack) => {
  let entry = glob.sync(path.resolve(config.src) + "/pages/*/*.vue")
  let entrys = {}
  let text = fs.readFileSync(__dirname + '/../appindex/index.js', 'utf8')
  let appName = entry[0].replace(/.*\/([^\/]*)\/src\/.*/, '$1')
  console.log('NAME:' + appName)
  var appsList = []
  entry.forEach(function(item) {
    let filename = item.replace(/.*\/([^\/]*)\.vue/, '$1')
    let routeFilename = item.replace(filename + '.vue', filename + '.routes.js')
    let vuexFilename = item.replace(filename + '.vue', filename + '.vuex.js')
    let indexHtml = path.resolve(config.src) + '/index.html'
    let globalVuex = path.resolve(config.src) + '/global.vuex.js'
    let fileContent = text.replace(/\{\{entry\}\}/g, path.relative(__dirname + '/../tempfile', item).replace(/\\/g, '/'))
      .replace(/\{\{store\}\}/g, path.relative(__dirname + '/../tempfile', vuexFilename).replace(/\\/g, '/'))
      .replace(/\{\{globalStore\}\}/g, path.relative(__dirname + '/../tempfile', globalVuex).replace(/\\/g, '/'))
      .replace(/\{\{routes\}\}/g, path.relative(__dirname + '/../tempfile', routeFilename).replace(/\\/g, '/'))
      .replace(/\{\{indexHtml\}\}/g, path.relative(__dirname + '/../tempfile', indexHtml).replace(/\\/g, '/'))
      .replace(/\{\{rootRoute\}\}/g, '/' + filename)
      .replace(/\{\{config\}\}/g, path.relative(__dirname + '/../tempfile', path.resolve(config.src) + '/config.json').replace(/\\/g, '/'))
    fs.writeFileSync(__dirname + '/../tempfile/' + filename + '.js', fileContent, 'utf8')
    entrys[filename] = __dirname + '/../tempfile/' + filename + '.js'
    appsList.push(filename)
  })

  return {
    context: path.resolve(config.src),
    entry: entrys,
    resolve: {
      root: [
        path.resolve(config.src),
        path.resolve('./node_modules/'),
      ],
      alias: {},
      extensions: ['', '.js']
    },

    output: {
      publicPath: config.isDevelope ? 'http://localhost:' + config.server.port + '/' : '',
      filename: appName + '/[name].js',
      chunkFilename: appName + '/[name]-[id].js',
    },

    watch: config.isDevelope,

    module: {
      loaders: loaders(path, {
        appName: appName,
        appsList: JSON.stringify(appsList)
      }),
    },

    // http://habrahabr.ru/post/245991/
    plugins: plugins(path, webpack),

    postcss: () => [
      autoprefixer({
        browsers: ['last 3 versions'],
        cascade: false,
      }),
      // precss,
    ],

    cssLoader: {
      sourceMap: config.isDevelope,
      localIdentName: config.isDevelope ? '[local]' : '[hash:5]',
    },

    jadeLoader: {
      locals: config,
      pretty: config.isDevelope,
    },

    devtool: config.isDebug ? '#inline-source-map' : false,
  }
}
