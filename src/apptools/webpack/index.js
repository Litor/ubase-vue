import autoprefixer from 'autoprefixer'
import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'
import glob from 'glob'
import fs from 'fs'
import colors from 'colors'

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'red',
  info: 'green',
  data: 'blue',
  help: 'cyan',
  warn: 'yellow',
  debug: 'magenta',
  error: 'red'
})

export default (path, webpack, userConfig) => {
  let appEntryFiles = glob.sync(path.resolve(config.src) + '/pages/*/*.vue')
  let packageName = appEntryFiles[0].replace(/.*\/([^\/]*)\/src\/.*/, '$1')
  let entryIndexTemplate = fs.readFileSync(__dirname + '/../appindex/index.js', 'utf8')

  let indexHtmlFilePath = path.resolve(config.src) + '/index.html'
  let configFilePath = path.resolve(config.src) + '/config.json'

  let entrys = {}
  var appsList = []

  appEntryFiles.forEach(function(entryFilePath) {
    let filename = entryFilePath.replace(/.*\/([^\/]*)\.vue/, '$1')
    let appName = entryFilePath.replace(/.*\/pages\/(.*)\/[^\/]*\.vue/, '$1')
    if (appName !== filename) {
      return
    }

    let appVuexFiles = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.vuex.js').concat(glob.sync(path.resolve(config.src) + '/*.vuex.js'))
    let appVueFiles = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.vue').concat(glob.sync(path.resolve(config.src) + '/components/**/*.vue'))
    let appI18nFiles = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.i18n.js').concat(glob.sync(path.resolve(config.src) + '/*.i18n.js'))
    let routeFilePath = entryFilePath.replace(filename + '.vue', 'routes.js')
    let i18nFilePath = entryFilePath.replace(filename + '.vue', 'i18n.js')

    var vuexTpl = generateVuexTpl(appVuexFiles)
    var vueCompnentTpl = generateVueCompnentRegisterTpl(appVueFiles)
    var appI18nFilesTpl = generateappI18nRegisterTpl(appI18nFiles)

    let fileContent = templateReplace(entryIndexTemplate, {
      entry: { content: entryFilePath, relativePath: true, required: true },
      importTpl: { content: vuexTpl.importTpl, relativePath: true, required: true, statement: true },
      setValueTpl: { content: vuexTpl.setValueTpl, relativePath: true, required: true, statement: true },
      vueCompnentimportTpl: { content: vueCompnentTpl.importTpl, relativePath: true, required: true, statement: true },
      vueCompnentsetValueTpl: { content: vueCompnentTpl.setValueTpl, relativePath: true, required: true, statement: true },
      i18nimportTpl: { content: appI18nFilesTpl.importTpl, relativePath: true, required: true, statement: true },
      i18nsetValueTpl: { content: appI18nFilesTpl.setValueTpl, relativePath: true, required: true, statement: true },
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

  function generateVuexTpl(fileList) {
    var importTpl = []
    var setValueTpl = []
    fileList.forEach(function(vuexFile) {
      let filename = vuexFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1')
      checkFileNameValid(filename + '.vuex.js')
      importTpl.push('var _' + filename + 'Store = require("' + relativePath(vuexFile) + '");var ' + filename + 'Store = _interopRequireWildcard(_' + filename + 'Store)')
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store')
    })

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    }
  }

  function generateappI18nRegisterTpl(fileList) {
    var importTpl = []
    var setValueTpl = ['var _alli18n = {};']
    fileList.forEach(function(i18nFile) {
      let filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1')
      checkFileNameValid(filename + '.i18n.js')
      importTpl.push('var _' + filename + 'I18n = require("' + relativePath(i18nFile) + '");var ' + filename + 'I18n = _interopRequireWildcard(_' + filename + 'I18n)')
      setValueTpl.push('_alli18n["' + filename + '"]=' + filename + 'I18n')
    })

    setValueTpl.push('window.UBASE_INITI18N(_alli18n)')

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    }
  }

  function checkFileNameValid(filename) {
    if (filename.indexOf('-') > 0) {
      console.error(colors.red('文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：' + filename))
      process.exit()
    }
  }

  function generateVueCompnentRegisterTpl(fileList) {
    var importTpl = []
    var setValueTpl = []
    fileList.forEach(function(vuexFile) {
      let filename = vuexFile.replace(/.*\/([^\/]*)\.vue/, '$1')
      checkFileNameValid(filename + '.vue')
      importTpl.push('var _' + filename + 'Component = require("' + relativePath(vuexFile) + '");var ' + filename + 'Component = _interopRequireWildcard(_' + filename + 'Component)')
      setValueTpl.push('Vue.component("' + filename + '", ' + filename + 'Component)')
    })

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    }
  }

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath)
  }

  function templateReplace(template, config) {
    Object.keys(config).forEach(function(item) {
      let re = new RegExp('\\{\\{' + item + '\\}\\}', 'g')
      let statementre = new RegExp('\\\'\\{\\{' + item + '\\}\\}\\\'', 'g')

      if (config[item].statement) {
        template = template.replace(statementre, config[item].content)
        return
      }
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
      // filename: packageName + '/[name].js',
      // chunkFilename: packageName + '/[name]-[id].js',
      filename: '[name].js',
      chunkFilename: '[name]-[id].js',
    },

    watch: config.isDevelope,

    module: {
      loaders: loaders(path, {
        packageName: packageName,
        appsList: JSON.stringify(appsList)
      }),
    },

    // http://habrahabr.ru/post/245991/
    plugins: plugins(path, webpack, { packageName: packageName }),

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
