import autoprefixer from 'autoprefixer'
import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'
import glob from 'glob'
import fs from 'fs'
import colors from 'colors'
import _ from 'lodash'

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
  // appPathList 工程下所有app的主页面入口文件
  let appPathList = glob.sync(path.resolve(config.src) + '/pages/*')

  // app入口文件模板
  let appEntryTemplate = fs.readFileSync(__dirname + '/../appindex/index.js', 'utf8')

  let entrys = {}
  var appsList = []

  appPathList.forEach(function (appPath) {
    let appName = appPath.replace(/.*\/pages\/([^\/]*)$/, '$1')

    // 获取app下所有vuex文件路径列表
    let appVuexFilesPath = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.vuex.js').concat(glob.sync(path.resolve(config.src) + '/*.vuex.js'))

    // 获取app下的vue组件及components下的组件
    let appVueFilesPath = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.vue').concat(glob.sync(path.resolve(config.src) + '/components/**/*.vue'))

    // 获取app下的所有国际化文件路径列表
    let appI18nFilesPath = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.i18n.js').concat(glob.sync(path.resolve(config.src) + '/*.i18n.js'))

    let routeFilePath = appPath + '/routes.js'
    let indexHtmlFilePath = appPath + '/index.html'
    let configFilePath = appPath + '/config.json'

    // 解析vuex文件路径 生成对应的vuex初始化语句
    var vuexTpl = generateVuexTpl(appVuexFilesPath)

    // 生成全局注册vue组件的语句
    var vueCompnentTpl = generateVueCompnentRegisterTpl(appVueFilesPath)

    // 生成初始化国际化的语句
    var appI18nFilesTpl = generateappI18nRegisterTpl(appI18nFilesPath)

    let fileContent = templateReplace(appEntryTemplate, {
      importTpl: {content: vuexTpl.importTpl, relativePath: true, required: true, statement: true},
      setValueTpl: {content: vuexTpl.setValueTpl, relativePath: true, required: true, statement: true},
      vueCompnentimportTpl: {content: vueCompnentTpl.importTpl, relativePath: true, required: true, statement: true},
      vueCompnentsetValueTpl: {
        content: vueCompnentTpl.setValueTpl,
        relativePath: true,
        required: true,
        statement: true
      },
      i18nimportTpl: {content: appI18nFilesTpl.importTpl, relativePath: true, required: true, statement: true},
      i18nsetValueTpl: {content: appI18nFilesTpl.setValueTpl, relativePath: true, required: true, statement: true},
      routes: {content: routeFilePath, relativePath: true, required: true},
      indexHtml: {content: indexHtmlFilePath, relativePath: true, required: true},
      config: {content: configFilePath, relativePath: true, required: true},
      rootRoute: {content: '/' + appName, relativePath: false, required: true}
    })

    fs.writeFileSync(__dirname + '/../tempfile/' + appName + '.js', fileContent, 'utf8')
    entrys[appName + '/' + appName] = __dirname + '/../tempfile/' + appName + '.js'
    appsList.push(appName)
  })

  /**
   * * 生成vuex初始化语句 STORE在appindex/index.js中已定义
   * @param  {[Array]} fileList [vuex文件列表]
   * @return {[Object]}         [importTpl：require语句；setValueTpl: 赋值语句]
   */
  function generateVuexTpl(fileList) {
    var importTpl = []
    var setValueTpl = []
    fileList.forEach(function (vuexFile) {
      let filename = vuexFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1')
      let uid = _.uniqueId()
      checkFileNameValid(filename, '.vuex.js')
      importTpl.push('var ' + filename + 'Store' + uid + ' = require("' + relativePath(vuexFile) + '");')
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store' + uid + ';')
    })

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    }
  }

  /**
   * * 生成国际化初始化语句 UBASE_INITI18N是ubase-vue中定义的一个全局方法
   * @param  {[Array]} fileList [i18n文件列表]
   * @return {[Object]}         [importTpl：require语句；setValueTpl: 赋值语句]
   */
  function generateappI18nRegisterTpl(fileList) {
    let importTpl = []
    let setValueTpl = ['var _alli18n = {};']
    fileList.forEach(function (i18nFile) {
      let filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1')
      let uid = _.uniqueId()
      checkFileNameValid(filename, '.i18n.js')
      importTpl.push('var ' + filename + 'I18n' + uid + ' = require("' + relativePath(i18nFile) + '");')
      setValueTpl.push('_alli18n["' + filename + '"]=' + filename + 'I18n' + uid + ';')
    })

    setValueTpl.push('window.UBASE.initI18n(_alli18n)')

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    }
  }

  function checkFileNameValid(filename, format) {
    if (filename.indexOf('-') > 0 || filename.indexOf('.') > 0) {
      console.error(colors.red('文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：' + filename + format))
      process.exit()
    }
  }

  /**
   * *全局注册vue组件，避免在业务开发的时候手动一个个import
   */
  function generateVueCompnentRegisterTpl(fileList) {
    let importTpl = []
    let setValueTpl = []
    fileList.forEach(function (vuexFile) {
      let filename = vuexFile.replace(/.*\/([^\/]*)\.vue/, '$1')
      checkFileNameValid(filename, '.vue')
      let uid = _.uniqueId()
      importTpl.push('var ' + filename + 'Component' + uid + ' = require("' + relativePath(vuexFile) + '");')
      setValueTpl.push('Vue.component(' + filename + 'Component' + uid + '.name || "' + filename + '", ' + filename + 'Component' + uid + ');')
    })

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    }
  }

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath)
  }

  /**
   * 模板替换方法
   * @param  {[type]} template [模板]
   * @param  {[type]} config   [配置对象]
   * @return {[type]}          [description]
   */
  function templateReplace(template, config) {
    Object.keys(config).forEach(function (item) {
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
          console.error(colors.red(config[item].content + '文件不存在!'))
          process.exit()
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
      extensions: ['', '.js', '.vue']
    },

    output: {
      publicPath: config.isDevelope ? '../' : '../',
      filename: config.isDevelope ? '[name].js' : '[name]-[chunkhash].js',
      chunkFilename: '[name]-[id].js',
    },

    watch: config.isDevelope,

    module: {
      loaders: loaders(path),
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
