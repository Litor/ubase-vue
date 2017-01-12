import config from './config'
import loaders from './webpack.loaders'
import plugins from './webpack.plugins'
import glob from 'glob'
import fs from 'fs'
import _ from 'lodash'
import chokidar from 'chokidar'
import debounce from 'debounce'
import beautify from 'js-beautify'
import {
  checkFileDuplicate,
  checkFileNameValid,
  translateEs6to5,
  relativePath,
  templateReplace,
  setPath,
  checkProjectType,
  error
} from './utils'

var projectType = null
var tempFileContents = {
  entryFiles: {}
}

export default (path, webpack, userConfig) => {
  setPath(path)
  userConfig.langs = userConfig.langs || ['cn']
  let entrys = {}

  projectType = checkProjectType()

  generatorEntryFiles(path, webpack, userConfig, entrys)

  let watcher = chokidar.watch([path.resolve(config.src) + '/pages/', path.resolve(config.src) + '/components/'], {
    persistent: true
  });

  let watcher2 = chokidar.watch([path.resolve(config.src) + '/pages/**/*.i18n.js'], {
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
      loaders: loaders(path, userConfig),
    },

    plugins: plugins(path, webpack, userConfig),

    cssLoader: {
      sourceMap: config.isDevelope,
      localIdentName: config.isDevelope ? '[local]' : '[hash:5]',
    },

    devtool: config.isDebug ? '#inline-source-map' : false,
  }

  return webpackConfig
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
    let stat = fs.lstatSync(appPath)

    // 如果不是文件夹 则跳出 单app模式的'.'也是文件夹
    if (!stat.isDirectory()) {
      return
    }

    let appName = appPath.replace(/.*\/pages\/([^\/]*)$/, '$1')

    // 在tempfile下创建每个应用单独的文件夹 用于存储应用的私有文件（如国际化文件等）
    let tempAppPath = __dirname + '/../tempfile/' + appName + '/'
    if (!fs.existsSync(tempAppPath)) {
      fs.mkdirSync(tempAppPath)
    }

    // 获取app下所有state文件路径列表
    let appStateFilesPath = glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.vuex.js`).concat(glob.sync(path.resolve(config.src) + '/*.vuex.js'))
      .concat(glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.state.js`)).concat(glob.sync(path.resolve(config.src) + '/*.state.js'))

    // 获取app下的vue组件及components下的组件
    let appVueFilesPath = glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.vue`).concat(glob.sync(path.resolve(config.src) + '/components/**/*.vue'))

    // 获取app下的使用的国际化文件路径列表
    let appI18nFilesPath = glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.i18n.js`).concat(glob.sync(path.resolve(config.src) + '/*.i18n.js'))

    let indexHtmlFilePath = path.resolve(config.src) + `/pages/${appName}/index.html`
    let configFilePath = path.resolve(config.src) + `/pages/${appName}/config.json`

    // 解析state文件路径 生成对应的state初始化语句
    let stateStatements = generateStateStatements(appStateFilesPath)

    let vueStatements = generateVueStatements(appVueFilesPath)

    let i18nStatements = generateI18nStatements(appI18nFilesPath, appName)

    let configStatements = generateConfigStatements(configFilePath)

    let routeStatement = generateRouteStatements(appName)

    // 框架代码 引用路径
    let ubaseVuePath = config.isProduction ? '../../ubase-vue' : '../../ubase-vue'

    let fileContent = templateReplace(appEntryTemplate, {
      ubase_vue: {content: ubaseVuePath, relativePath: false, required: true},

      stateImportStatements: {content: stateStatements.import, statement: true},
      stateSetValueStatements: {content: stateStatements.setValue, statement: true},

      configRequireStatement: {content: configStatements.require, statement: true},
      configInitStatement: {content: configStatements.init, statement: true},

      vueComponentImportStatements: {content: vueStatements.import, statement: true},
      vueComponentSetValueStatements: {content: vueStatements.setValue, statement: true},

      i18nInitStatement: {content: i18nStatements.init, statement: true},
      i18nRequireStatements: {content: i18nStatements.require, statement: true},

      routes: {content: routeStatement, statement: true},
      indexHtml: {content: indexHtmlFilePath, relativePath: true, required: true}
    })

    let entryFilePath = `${__dirname}/../tempfile/${appName}.js`

    // 判断入口文件是否已经存在， 如果存在切内容已过期 则重新写入（此时是为了防止对已经存在且内容未过期的入口文件重复写入触发webpack重新编译）
    if (tempFileContents[entryFilePath] != fileContent) {
      fs.writeFileSync(entryFilePath, fileContent)
      tempFileContents[entryFilePath] = fileContent
    }

    entrys[appName + '/__main_entry__'] = entryFilePath
  })

  function generateRouteStatements(appName) {
    var routeStatement = ''
    var routesjs = path.resolve(config.src) + `/pages/${appName}/routes.js`
    var indexVue = path.resolve(config.src) + `/pages/${appName}/index.vue`
    var indexVueFolder = path.resolve(config.src) + `/pages/${appName}/index/index.vue`

    if (fs.existsSync(routesjs)) {
      routeStatement = `var routes = require('${relativePath(routesjs)}').default`
    } else if (fs.existsSync(indexVue)) {
      routeStatement = `var routes = {'/':{
                              component: require('${relativePath(indexVue)}')
                            }
                          }`
    } else if (fs.existsSync(indexVueFolder)) {
      routeStatement = `var routes = {'/':{
                              component: require('${relativePath(indexVueFolder)}')
                            }
                          }`
    } else {
      error('没有找到routes.js或index.vue文件')
    }

    return routeStatement
  }

  /**
   * 生成state初始化语句 STORE在appindex/index.js中已定义
   * @param  fileList state文件列表
   * @returns {{require: string, init: string}}
   */
  function generateStateStatements(fileList) {
    let uniqueIndex = 0
    let importTpl = []
    let setValueTpl = []
    fileList.forEach(function (stateFile) {
      let filename = ''

      if (stateFile.indexOf('.state.js') > 0) {
        filename = stateFile.replace(/.*\/([^\/]*)\.state\.js/, '$1')
        checkFileDuplicate(fileList, filename, 'state.js')
      } else {
        filename = stateFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1')
        checkFileDuplicate(fileList, filename, 'vuex.js')
      }

      let uid = uniqueIndex++
      importTpl.push(`var ${filename}Store${uid} = require("${relativePath(stateFile)}");`)
      setValueTpl.push(`STORE.modules.${filename} = ${filename}Store${uid};`)
    })

    return {
      import: importTpl.join('\n'),
      setValue: setValueTpl.join('\n')
    }
  }

  /**
   * 如果config.json存在 则生成入口文件中config.json需要的语句
   * @param configFilePath config文件路径
   * @returns {{require: string, init: string}}
   */
  function generateConfigStatements(configFilePath) {
    var configStatements = {require: '', init: ''}

    if (fs.existsSync(configFilePath)) {
      configStatements.require = 'require("' + relativePath(configFilePath) + '")'
      configStatements.init = 'window._UBASE_PRIVATE.init()'
    }

    return configStatements
  }

  /**
   * 如果国际化文件存在 则生成入口文件中初始化国际化需要的语句
   * @param appI18nFilesPath i18n文件列表
   * @param appName 应用名称
   * @returns {{require: string, init: string}}
   */
  function generateI18nStatements(appI18nFilesPath, appName) {
    var i18nStatements = {require: '', init: ''}

    if (appI18nFilesPath.length == 0) {
      return i18nStatements
    }

    // 为app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, appName)

    var importI18nArray = []
    userConfig.langs.forEach(function (item) {
      importI18nArray.push(`require("./${appName}/${item}.lang.json")`)
    })

    i18nStatements.require = importI18nArray.join('\n')
    i18nStatements.init = 'window._UBASE_PRIVATE.initI18n()'

    return i18nStatements
  }

  /**
   * 创建国际化文件，收集app下的国际化文件，按语言类型生成相应的国际化文件
   * @param fileList i18n文件列表
   * @param appName 应用名称
   */
  function generateI18nFile(fileList, appName) {
    let uniqueIndex = 0
    var singleApp = projectType === 'singleApp'
    var i18nContainer = {}

    if (fileList.length === 0) {
      return
    }

    fileList.forEach(function (i18nFile) {
      let filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1')
      checkFileDuplicate(fileList, filename, 'i18n.js')

      var exports = translateEs6to5(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item] = i18nContainer[item] || {}
          i18nContainer[item][filename] = (exports.default && exports.default[item]) || {};
        } else {
          i18nContainer[appName] = i18nContainer[appName] || {}
          if (i18nContainer[appName][item]) {
            i18nContainer[appName][item][filename] = (exports.default && exports.default[item]) || {}
          } else {
            i18nContainer[appName][item] = {}
            i18nContainer[appName][item][filename] = (exports.default && exports.default[item]) || {}
          }
        }
      });
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

  /**
   * 生成全局注册vue组件需要的语句
   * @param appVueFilesPath 应用中所有vue组件的路径列表
   */
  function generateVueStatements(appVueFilesPath) {
    var vueStatements = {import: '', setValue: ''}

    if (userConfig.autoImportVueComponent === false) {
      return vueStatements
    }

    let uniqueIndex = 0
    let importTpl = []
    let setValueTpl = []
    appVueFilesPath.forEach(function (vueFile) {
      let filename = vueFile.replace(/.*\/([^\/]*)\.vue/, '$1')

      checkFileDuplicate(appVueFilesPath, filename, 'vue')
      checkFileNameValid(filename, 'vue')

      let uid = uniqueIndex++
      let vueComponentName = filename + 'Component' + uid
      importTpl.push(`var ${vueComponentName} = require("${relativePath(vueFile)}");`)
      importTpl.push(`${vueComponentName}._ubase_component_name = '${filename}';`)
      setValueTpl.push(`Vue.component(${vueComponentName}.name || "${filename}", ${vueComponentName});`)
    })

    vueStatements.import = importTpl.join('\n')
    vueStatements.setValue = setValueTpl.join('\n')

    return vueStatements
  }

  return entrys
}

var reGeneratorEntryFiles = debounce(generatorEntryFiles, 200)
