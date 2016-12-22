import autoprefixer from 'autoprefixer'
import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'
import glob from 'glob'
import fs from 'fs'
import colors from 'colors'
import _ from 'lodash'
import chokidar from 'chokidar'
import debounce from 'debounce'
import * as babel from 'babel-core'
import beautify from 'js-beautify'


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

var projectType = null
var tempFileContents = {
  entryFiles: {}
}

var existPath = []

export default (path, webpack, userConfig) => {
  userConfig.langs = userConfig.langs || ['cn']
  var entrys = {}

  projectType = checkProjectType(path)

  generatorEntryFiles(path, webpack, userConfig, entrys)

  var watcher = chokidar.watch([path.resolve(config.src) + '/pages/', path.resolve(config.src) + '/components/'], {
    persistent: true
  });

  var watcher2 = chokidar.watch([path.resolve(config.src) + '/pages/**/*.i18n.js'], {
    persistent: true
  });

  watcher
    .on('addDir', function () {
      reGeneratorEntryFiles(path, webpack, userConfig, entrys)
    })
    .on('unlinkDir', function () {
      reGeneratorEntryFiles(path, webpack, userConfig, entrys)
    })
    .on('unlink', function () {
      reGeneratorEntryFiles(path, webpack, userConfig, entrys)
    })
    .on('add', function () {
      reGeneratorEntryFiles(path, webpack, userConfig, entrys)
    })

  watcher2.on('change', function () {
    reGeneratorEntryFiles(path, webpack, userConfig, entrys)
  })

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
      publicPath: projectType === 'singleApp' ? './' : '../',
      filename: config.isDevelope ? '[name].js' : '[name]-[chunkhash].js',
      chunkFilename: 'statics/chunk/[name]-[id].js',
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

function checkProjectType(path,) {
  var projectType = null
  var indexHtml = path.resolve(config.src) + '/pages/index.html'
  var routeJs = path.resolve(config.src) + '/pages/routes.js'
  if ((_.includes(existPath, indexHtml) && _.includes(existPath, routeJs)) || (fs.existsSync(indexHtml) && fs.existsSync(routeJs))) {
    projectType = 'singleApp'
    existPath.push(indexHtml)
    existPath.push(routeJs)
  }

  return projectType
}

function generatorEntryFiles(path, webpack, userConfig, entrys) {
  // appPathList 工程下所有app的主页面入口文件
  let appPathList = glob.sync(path.resolve(config.src) + '/pages/*')

  // app入口文件模板
  let appEntryTemplate = fs.readFileSync(__dirname + '/../appindex/index.js', 'utf8')

  if (projectType === 'singleApp') {
    appPathList = ['.']
  }

  appPathList.forEach(function (appPath) {

    let appName = appPath.replace(/.*\/pages\/([^\/]*)$/, '$1')

    // 获取app下所有vuex文件路径列表
    let appVuexFilesPath = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.vuex.js').concat(glob.sync(path.resolve(config.src) + '/*.vuex.js'))

    // 获取app下的vue组件及components下的组件
    let appVueFilesPath = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.vue').concat(glob.sync(path.resolve(config.src) + '/components/**/*.vue'))

    // 获取app下的所有国际化文件路径列表
    let appI18nFilesPath = glob.sync(path.resolve(config.src) + '/pages/' + appName + '/**/*.i18n.js')

    let globalI18nFilesPath = glob.sync(path.resolve(config.src) + '/*.i18n.js') || []

    let routeFilePath = path.resolve(config.src) + '/pages/' + appName + '/routes.js'
    let indexHtmlFilePath = path.resolve(config.src) + '/pages/' + appName + '/index.html'
    let configFilePath = path.resolve(config.src) + '/pages/' + appName + '/config.json'

    // 解析vuex文件路径 生成对应的vuex初始化语句
    var vuexTpl = generateVuexTpl(appVuexFilesPath)

    // 生成全局注册vue组件的语句
    var vueCompnentTpl = userConfig.autoImportVueComponent === false ? {} : generateVueCompnentRegisterTpl(appVueFilesPath)

    // 为每个app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, globalI18nFilesPath)

    var i18nImport = generateI18nImport(appName)

    // 如果有config.json则生成相应的require语句
    var configRequire = generateConfigRequire(configFilePath)

    // 如果有config.json 则生成执行时ajax获取它的语句
    var configInitStatement = generateConfigInitStatement(configRequire)

    // 如果有国际化文件 则生成ajax获取国际化文件的语句
    var i18nInitStatement = generateI18nInitStatement(appVuexFilesPath)

    // 框架代码 引用路径
    var ubaseVuePath = config.isProduction ? '../../ubase-vue' : '../../ubase-vue'

    let fileContent = templateReplace(appEntryTemplate, {
      importTpl: {content: vuexTpl.importTpl, statement: true},
      setValueTpl: {content: vuexTpl.setValueTpl, statement: true},
      configInitStatement: {content: configInitStatement, statement: true},
      i18nInitStatement: {content: i18nInitStatement, statement: true},
      vueCompnentimportTpl: {
        content: vueCompnentTpl.importTpl || '',
        relativePath: true,
        required: true,
        statement: true
      },
      ubase_vue: {content: ubaseVuePath, relativePath: false, required: true},
      vueCompnentsetValueTpl: {
        content: vueCompnentTpl.setValueTpl || '',
        relativePath: true,
        required: true,
        statement: true
      },
      i18nImport: {content: i18nImport, statement: true},
      routes: {content: routeFilePath, relativePath: true, required: true},
      indexHtml: {content: indexHtmlFilePath, relativePath: true, required: true},
      requireConfig: {content: configRequire, statement: true},
      rootRoute: {content: '/' + appName, relativePath: false, required: true}
    })

    var entryFilePath = __dirname + '/../tempfile/' + appName + '.js'

    // 判断入口文件是否已经存在， 如果存在切内容已过期 则重新写入（此时是为了防止对已经存在且内容未过期的入口文件重复写入触发webpack重新编译）
    if (tempFileContents[entryFilePath] != fileContent) {
      fs.writeFileSync(entryFilePath, fileContent)
      tempFileContents[entryFilePath] = fileContent
    }

    entrys[appName + '/__main_entry__'] = entryFilePath

    if (projectType === 'singleApp') {
      entrys = entryFilePath
    }
  })

  /**
   * * 生成vuex初始化语句 STORE在appindex/index.js中已定义
   * @param  {[Array]} fileList [vuex文件列表]
   * @return {[Object]}         [importTpl：require语句；setValueTpl: 赋值语句]
   */
  function generateVuexTpl(fileList) {
    let uniqueIndex = 0
    var importTpl = []
    var setValueTpl = []
    fileList.forEach(function (vuexFile) {
      let filename = vuexFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1')
      checkFileDuplicate(fileList, filename, 'vuex.js')
      let uid = uniqueIndex++
      checkFileNameValid(filename, 'vuex.js')
      importTpl.push('var ' + filename + 'Store' + uid + ' = require("' + relativePath(vuexFile) + '");')
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store' + uid + ';')
    })

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    }
  }

  function generateConfigRequire(path) {
    if (fs.existsSync(path)) {
      return 'require("' + relativePath(path) + '")'
    }
    return ''
  }

  function generateConfigInitStatement(hasConfig) {
    if(hasConfig){
      return 'window._UBASE_PRIVATE.init()'
    }

    return ''
  }

  function generateI18nInitStatement(hasConfig) {
    if(hasConfig.length > 0){
      return 'window._UBASE_PRIVATE.initI18n()'
    }

    return ''
  }

  function generateI18nImport(appName) {
    var importI18nArray = []
    userConfig.langs.forEach(function (item) {
      importI18nArray.push('require("./' + appName + '/' + item + '.lang.json")')
    })

    return importI18nArray.join('\n')
  }

  function translateEs6to5(file) {
    var content = fs.readFileSync(file);
    var result = babel.transform(content, {
      presets: ['es2015']
    });
    var exports = {};
    eval(result.code)

    return exports
  }

  // 创建国际化文件，收集app下的国际化文件， 按语言类型生成相应的国际化文件
  function generateI18nFile(fileList, globalI18nFileList) {
    let uniqueIndex = 0
    var singleApp = projectType === 'singleApp'
    var i18nContainer = {}

    fileList.forEach(function (i18nFile) {
      let appName = i18nFile.replace(/.*\/pages\/([^\/]*).*$/, '$1')
      let filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1')
      checkFileDuplicate(fileList, filename, 'i18n.js')

      var exports = translateEs6to5(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item] = i18nContainer[item] || {}
          i18nContainer[item][filename] = exports.default[item] || {};
        } else {
          i18nContainer[appName] = i18nContainer[appName] || {}
          if (i18nContainer[appName][item]) {
            i18nContainer[appName][item][filename] = exports.default[item] || {}
          } else {
            i18nContainer[appName][item] = {}
            i18nContainer[appName][item][filename] = exports.default[item] || {}
          }
        }
      });
    })

    // 每个app添加全局国际化文件信息
    globalI18nFileList.forEach(function (i18nFile) {
      let filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1')
      let exports = translateEs6to5(i18nFile)

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item][filename] = exports.default[item] || {}
        } else {
          Object.keys(i18nContainer).forEach(function (appName) {
            i18nContainer[appName][item][filename] = exports.default[item] || {}
          })
        }
      })
    })

    if (singleApp) {
      userConfig.langs.forEach(function (item) {
        var fileContent = beautify.js_beautify(JSON.stringify(i18nContainer[item] || ''), {indent_size: 2})
        var filePath = __dirname + '/../tempfile/' + item + '.lang.json'
        if (tempFileContents[filePath] != fileContent) {
          fs.writeFileSync(filePath, fileContent)
          tempFileContents[filePath] = fileContent
        }
      })
    } else {
      Object.keys(i18nContainer).forEach(function (appName) {
        var appPath = __dirname + '/../tempfile/' + appName + '/'
        if (!_.includes(existPath, appPath) && !fs.existsSync(appPath)) {
          fs.mkdirSync(appPath)
        }
        userConfig.langs.forEach(function (item) {
          var fileContent = beautify.js_beautify(JSON.stringify(i18nContainer[appName][item] || ''), {indent_size: 2})
          var filePath = appPath + item + '.lang.json'
          if (tempFileContents[filePath] != fileContent) {
            fs.writeFileSync(filePath, fileContent)
            tempFileContents[filePath] = fileContent
          }
        })
      })
    }
  }

  function checkFileNameValid(filename, format) {
    if (filename.indexOf('-') > 0 || filename.indexOf('.') > 0) {
      console.error(colors.red('文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：' + filename + format))
      process.exit()
    }
  }

  function checkFileDuplicate(fileList, file, fileType) {
    var files = _.filter(fileList, function (item) {
      return _.endsWith(item, file + '.' + fileType)
    })

    if (files.length > 1) {
      console.error(colors.red(file + '.' + fileType + '文件命名重复, 同一个应用下' + fileType + '类型的文件命名不能重复，命名重复文件：\n' + files.join('\n')))
      process.exit()
    }
  }

  /**
   * *全局注册vue组件，避免在业务开发的时候手动一个个import
   */
  function generateVueCompnentRegisterTpl(fileList) {
    let uniqueIndex = 0
    let importTpl = []
    let setValueTpl = []
    fileList.forEach(function (vuexFile) {
      let filename = vuexFile.replace(/.*\/([^\/]*)\.vue/, '$1')
      if (userConfig.autoImportVueComponent !== false) {
        checkFileDuplicate(fileList, filename, 'vue')
      }
      checkFileNameValid(filename, '.vue')
      let uid = uniqueIndex++
      importTpl.push('var ' + filename + 'Component' + uid + ' = require("' + relativePath(vuexFile) + '");')
      importTpl.push(filename + 'Component' + uid + "._ubase_component_name = '" + filename + "'")
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

      if (!_.includes(existPath, config[item].content) && fs.existsSync(config[item].content)) {
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

  return entrys
}

var reGeneratorEntryFiles = debounce(generatorEntryFiles, 200)
