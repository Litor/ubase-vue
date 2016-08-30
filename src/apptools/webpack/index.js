import autoprefixer from 'autoprefixer'
import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'
import glob from 'glob'
import fs from 'fs'

export default (path, webpack, userConfig) => {
  let appEntryFiles = glob.sync(path.resolve(config.src) + '/pages/*/*.vue')
  let packageName = appEntryFiles[0].replace(/.*\/([^\/]*)\/src\/.*/, '$1')
  let entryIndexTemplate = fs.readFileSync(__dirname + '/../appindex/index.js', 'utf8')

  let indexHtmlFilePath = path.resolve(config.src) + '/index.html'
  let globalVuexFilePath = path.resolve(config.src) + '/global.vuex.js'
  let configFilePath = path.resolve(config.src) + '/config.json'

  let entrys = {}
  var appsList = []

  appEntryFiles.forEach(function(entryFilePath) {
    let filename = entryFilePath.replace(/.*\/([^\/]*)\.vue/, '$1')
    let routeFilePath = entryFilePath.replace(filename + '.vue', filename + '.routes.js')
    let vuexFilePath = entryFilePath.replace(filename + '.vue', filename + '.vuex.js')
    let i18nFilePath = entryFilePath.replace(filename + '.vue', 'i18n.js')

    let fileContent = templateReplace(entryIndexTemplate, {
      entry: { content: entryFilePath, relativePath: true, required: true },
      store: { content: vuexFilePath, relativePath: true, required: true },
      globalStore: { content: globalVuexFilePath, relativePath: true, required: true },
      routes: { content: routeFilePath, relativePath: true, required: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: true },
      config: { content: configFilePath, relativePath: true, required: true },
      rootRoute: { content: '/' + filename, relativePath: false, required: true },
      i18n: { content: i18nFilePath, relativePath: true, required: false, default: '../appindex/i18n.js' }
    })

    fs.writeFileSync(__dirname + '/../tempfile/' + filename + '.js', fileContent, 'utf8')
    entrys[filename] = __dirname + '/../tempfile/' + filename + '.js'
    appsList.push(filename)
  })

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath)
  }

  function templateReplace(template, config) {
    Object.keys(config).forEach(function(item) {
      let re = new RegExp('\\{\\{' + item + '\\}\\}', 'g')

      if (!config[item].relativePath) {
        template = template.replace(re, config[item].content)
        return
      }

      if (fs.existsSync(config[item].content)) {
        template = template.replace(re, relativePath(config[item].content)).replace(/\\/g, '/')
      } else {
        if (config[item].required) {
          console.log(config[item].content + '文件不存在!')
        } else {
          template = template.replace(re, config[item].default)
        }
      }

    })

    return template
  }

  let webpackConfig = {
    context: path.resolve(config.src),
    entry: entrys,
    resolve: {
      root: [
        path.resolve(config.src),
        path.resolve('./node_modules/'),
      ],
      alias: Object.assign({}, userConfig.alias),
      extensions: ['', '.js']
    },

    output: {
      publicPath: config.isDevelope ? 'http://localhost:' + config.server.port + '/' : '',
      filename: packageName + '/[name].js',
      chunkFilename: packageName + '/[name]-[id].js',
    },

    watch: config.isDevelope,

    module: {
      loaders: loaders(path, {
        packageName: packageName,
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

  return webpackConfig
}
