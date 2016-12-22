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
  checkProjectType
} from './utils'

var projectType = null
var tempFileContents = {
  entryFiles: {}
}

var existPath = []

export default (path, webpack, userConfig) => {
  setPath(path)
  userConfig.langs = userConfig.langs || ['cn']
  var entrys = {}

  projectType = checkProjectType()

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

    plugins: plugins(path, webpack),

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

    let appName = appPath.replace(/.*\/pages\/([^\/]*)$/, '$1')

    // 获取app下所有vuex文件路径列表
    let appVuexFilesPath = glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.vuex.js`).concat(glob.sync(path.resolve(config.src) + '/*.vuex.js'))

    // 获取app下的vue组件及components下的组件
    let appVueFilesPath = glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.vue`).concat(glob.sync(path.resolve(config.src) + '/components/**/*.vue'))

    // 获取app下的使用的国际化文件路径列表
    let appI18nFilesPath = glob.sync(path.resolve(config.src) + `/pages/${appName}/**/*.i18n.js`).concat(glob.sync(path.resolve(config.src) + '/*.i18n.js'))

    let routeFilePath = path.resolve(config.src) + `/pages/${appName}/routes.js`
    let indexHtmlFilePath = path.resolve(config.src) + `/pages/${appName}/index.html`
    let configFilePath = path.resolve(config.src) + `/pages/${appName}/config.json`

    // 解析vuex文件路径 生成对应的vuex初始化语句
    var vuexTpl = generateVuexTpl(appVuexFilesPath)

    // 生成全局注册vue组件的语句
    var vueCompnentTpl = userConfig.autoImportVueComponent === false ? {} : generateVueCompnentRegisterTpl(appVueFilesPath)

    // 为每个app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, appName)

    var i18nImport = ''
    var i18nInitStatement = ''

    if (appI18nFilesPath.length > 0) {
      i18nImport = generateI18nImport(appName)

      // 如果有国际化文件 则生成ajax获取国际化文件的语句
      i18nInitStatement = 'window._UBASE_PRIVATE.initI18n()'
    }

    // 如果有config.json则生成相应的require语句
    var configRequire = generateConfigRequire(configFilePath)

    // 如果有config.json 则生成执行时ajax获取它的语句
    var configInitStatement = generateConfigInitStatement(configRequire)

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
      requireConfig: {content: configRequire, statement: true}
    })

    var entryFilePath = `${__dirname}/../tempfile/${appName}.js`

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
      importTpl.push(`var ${filename}Store${uid} = require("${relativePath(vuexFile)}");`)
      setValueTpl.push(`STORE.modules.${filename} = ${filename}Store${uid};`)
    })

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    }
  }

  function generateConfigRequire(configFilePath) {
    if (fs.existsSync(configFilePath)) {
      return 'require("' + relativePath(configFilePath) + '")'
    }
    return ''
  }

  function generateConfigInitStatement(hasConfig) {
    if (hasConfig) {
      return 'window._UBASE_PRIVATE.init()'
    }

    return ''
  }

  function generateI18nImport(appName) {
    var importI18nArray = []
    userConfig.langs.forEach(function (item) {
      importI18nArray.push(`require("./${appName}/${item}.lang.json")`)
    })

    return importI18nArray.join('\n')
  }

  // 创建国际化文件，收集app下的国际化文件， 按语言类型生成相应的国际化文件
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
      checkFileNameValid(filename, 'vue')
      let uid = uniqueIndex++
      let vueComponentName = filename + 'Component' + uid
      importTpl.push(`var ${vueComponentName} = require("${relativePath(vuexFile)}");`)
      importTpl.push(`${vueComponentName}._ubase_component_name = '${filename}';`)
      setValueTpl.push(`Vue.component(${vueComponentName}.name || "${filename}", ${vueComponentName});`)
    })

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    }
  }

  return entrys
}

var reGeneratorEntryFiles = debounce(generatorEntryFiles, 200)
