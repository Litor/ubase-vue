'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _webpack = require('./webpack.loaders');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpack3 = require('./webpack.plugins');

var _webpack4 = _interopRequireDefault(_webpack3);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _debounce = require('debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projectType = null;
var tempFileContents = {
  entryFiles: {}
};

var existPath = [];

exports.default = function (path, webpack, userConfig) {
  (0, _utils.setPath)(path);
  userConfig.langs = userConfig.langs || ['cn'];
  var entrys = {};

  projectType = (0, _utils.checkProjectType)();

  generatorEntryFiles(path, webpack, userConfig, entrys);

  var watcher = _chokidar2.default.watch([path.resolve(_config2.default.src) + '/pages/', path.resolve(_config2.default.src) + '/components/'], {
    persistent: true
  });

  var watcher2 = _chokidar2.default.watch([path.resolve(_config2.default.src) + '/pages/**/*.i18n.js'], {
    persistent: true
  });

  watcher.on('addDir', function () {
    reGeneratorEntryFiles(path, webpack, userConfig, entrys);
  }).on('unlinkDir', function () {
    reGeneratorEntryFiles(path, webpack, userConfig, entrys);
  }).on('unlink', function () {
    reGeneratorEntryFiles(path, webpack, userConfig, entrys);
  }).on('add', function () {
    reGeneratorEntryFiles(path, webpack, userConfig, entrys);
  });

  watcher2.on('change', function () {
    reGeneratorEntryFiles(path, webpack, userConfig, entrys);
  });

  var webpackConfig = {
    context: path.resolve(_config2.default.src),
    entry: entrys,
    resolve: {
      root: [path.resolve(_config2.default.src), path.resolve('./node_modules/')],
      alias: Object.assign({}, userConfig.alias),
      extensions: ['', '.js', '.vue']
    },

    output: {
      publicPath: projectType === 'singleApp' ? './' : '../',
      filename: _config2.default.isDevelope ? '[name].js' : '[name]-[chunkhash].js',
      chunkFilename: 'statics/chunk/[name]-[id].js'
    },

    watch: _config2.default.isDevelope,

    module: {
      loaders: (0, _webpack2.default)(path)
    },

    plugins: (0, _webpack4.default)(path, webpack),

    cssLoader: {
      sourceMap: _config2.default.isDevelope,
      localIdentName: _config2.default.isDevelope ? '[local]' : '[hash:5]'
    },

    devtool: _config2.default.isDebug ? '#inline-source-map' : false
  };

  return webpackConfig;
};

function generatorEntryFiles(path, webpack, userConfig, entrys) {
  // appPathList 工程下所有app的主页面入口文件
  var appPathList = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/*');

  // app入口文件模板
  var appEntryTemplate = _fs2.default.readFileSync(__dirname + '/../appindex/index.js', 'utf8');

  if (projectType === 'singleApp') {
    appPathList = ['.'];
  }

  appPathList.forEach(function (appPath) {

    var appName = appPath.replace(/.*\/pages\/([^\/]*)$/, '$1');

    // 获取app下所有vuex文件路径列表
    var appVuexFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + ('/pages/' + appName + '/**/*.vuex.js')).concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.vuex.js'));

    // 获取app下的vue组件及components下的组件
    var appVueFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + ('/pages/' + appName + '/**/*.vue')).concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/components/**/*.vue'));

    // 获取app下的使用的国际化文件路径列表
    var appI18nFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + ('/pages/' + appName + '/**/*.i18n.js')).concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.i18n.js'));

    var routeFilePath = path.resolve(_config2.default.src) + ('/pages/' + appName + '/routes.js');
    var indexHtmlFilePath = path.resolve(_config2.default.src) + ('/pages/' + appName + '/index.html');
    var configFilePath = path.resolve(_config2.default.src) + ('/pages/' + appName + '/config.json');

    // 解析vuex文件路径 生成对应的vuex初始化语句
    var vuexTpl = generateVuexTpl(appVuexFilesPath);

    // 生成全局注册vue组件的语句
    var vueCompnentTpl = userConfig.autoImportVueComponent === false ? {} : generateVueCompnentRegisterTpl(appVueFilesPath);

    // 为每个app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, appName);

    var i18nImport = '';
    var i18nInitStatement = '';

    if (appI18nFilesPath.length > 0) {
      i18nImport = generateI18nImport(appName);

      // 如果有国际化文件 则生成ajax获取国际化文件的语句
      i18nInitStatement = 'window._UBASE_PRIVATE.initI18n()';
    }

    // 如果有config.json则生成相应的require语句
    var configRequire = generateConfigRequire(configFilePath);

    // 如果有config.json 则生成执行时ajax获取它的语句
    var configInitStatement = generateConfigInitStatement(configRequire);

    // 框架代码 引用路径
    var ubaseVuePath = _config2.default.isProduction ? '../../ubase-vue' : '../../ubase-vue';

    var fileContent = (0, _utils.templateReplace)(appEntryTemplate, {
      importTpl: { content: vuexTpl.importTpl, statement: true },
      setValueTpl: { content: vuexTpl.setValueTpl, statement: true },
      configInitStatement: { content: configInitStatement, statement: true },
      i18nInitStatement: { content: i18nInitStatement, statement: true },
      vueCompnentimportTpl: {
        content: vueCompnentTpl.importTpl || '',
        relativePath: true,
        required: true,
        statement: true
      },
      ubase_vue: { content: ubaseVuePath, relativePath: false, required: true },
      vueCompnentsetValueTpl: {
        content: vueCompnentTpl.setValueTpl || '',
        relativePath: true,
        required: true,
        statement: true
      },
      i18nImport: { content: i18nImport, statement: true },
      routes: { content: routeFilePath, relativePath: true, required: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: true },
      requireConfig: { content: configRequire, statement: true }
    });

    var entryFilePath = __dirname + '/../tempfile/' + appName + '.js';

    // 判断入口文件是否已经存在， 如果存在切内容已过期 则重新写入（此时是为了防止对已经存在且内容未过期的入口文件重复写入触发webpack重新编译）
    if (tempFileContents[entryFilePath] != fileContent) {
      _fs2.default.writeFileSync(entryFilePath, fileContent);
      tempFileContents[entryFilePath] = fileContent;
    }

    entrys[appName + '/__main_entry__'] = entryFilePath;

    if (projectType === 'singleApp') {
      entrys = entryFilePath;
    }
  });

  /**
   * * 生成vuex初始化语句 STORE在appindex/index.js中已定义
   * @param  {[Array]} fileList [vuex文件列表]
   * @return {[Object]}         [importTpl：require语句；setValueTpl: 赋值语句]
   */
  function generateVuexTpl(fileList) {
    var uniqueIndex = 0;
    var importTpl = [];
    var setValueTpl = [];
    fileList.forEach(function (vuexFile) {
      var filename = vuexFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1');
      (0, _utils.checkFileDuplicate)(fileList, filename, 'vuex.js');
      var uid = uniqueIndex++;
      (0, _utils.checkFileNameValid)(filename, 'vuex.js');
      importTpl.push('var ' + filename + 'Store' + uid + ' = require("' + (0, _utils.relativePath)(vuexFile) + '");');
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store' + uid + ';');
    });

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    };
  }

  function generateConfigRequire(configFilePath) {
    if (_fs2.default.existsSync(configFilePath)) {
      return 'require("' + (0, _utils.relativePath)(configFilePath) + '")';
    }
    return '';
  }

  function generateConfigInitStatement(hasConfig) {
    if (hasConfig) {
      return 'window._UBASE_PRIVATE.init()';
    }

    return '';
  }

  function generateI18nImport(appName) {
    var importI18nArray = [];
    userConfig.langs.forEach(function (item) {
      importI18nArray.push('require("./' + appName + '/' + item + '.lang.json")');
    });

    return importI18nArray.join('\n');
  }

  // 创建国际化文件，收集app下的国际化文件， 按语言类型生成相应的国际化文件
  function generateI18nFile(fileList, appName) {
    var uniqueIndex = 0;
    var singleApp = projectType === 'singleApp';
    var i18nContainer = {};

    if (fileList.length === 0) {
      return;
    }

    fileList.forEach(function (i18nFile) {
      var filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1');
      (0, _utils.checkFileDuplicate)(fileList, filename, 'i18n.js');

      var exports = (0, _utils.translateEs6to5)(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item] = i18nContainer[item] || {};
          i18nContainer[item][filename] = exports.default && exports.default[item] || {};
        } else {
          i18nContainer[appName] = i18nContainer[appName] || {};
          if (i18nContainer[appName][item]) {
            i18nContainer[appName][item][filename] = exports.default && exports.default[item] || {};
          } else {
            i18nContainer[appName][item] = {};
            i18nContainer[appName][item][filename] = exports.default && exports.default[item] || {};
          }
        }
      });
    });

    if (singleApp) {
      userConfig.langs.forEach(function (item) {
        var fileContent = _jsBeautify2.default.js_beautify(JSON.stringify(i18nContainer[item] || ''), { indent_size: 2 });
        var filePath = __dirname + '/../tempfile/' + item + '.lang.json';
        if (tempFileContents[filePath] != fileContent) {
          _fs2.default.writeFileSync(filePath, fileContent);
          tempFileContents[filePath] = fileContent;
        }
      });
    } else {
      Object.keys(i18nContainer).forEach(function (appName) {
        var appPath = __dirname + '/../tempfile/' + appName + '/';
        if (!_lodash2.default.includes(existPath, appPath) && !_fs2.default.existsSync(appPath)) {
          _fs2.default.mkdirSync(appPath);
        }
        userConfig.langs.forEach(function (item) {
          var fileContent = _jsBeautify2.default.js_beautify(JSON.stringify(i18nContainer[appName][item] || ''), { indent_size: 2 });
          var filePath = appPath + item + '.lang.json';
          if (tempFileContents[filePath] != fileContent) {
            _fs2.default.writeFileSync(filePath, fileContent);
            tempFileContents[filePath] = fileContent;
          }
        });
      });
    }
  }

  /**
   * *全局注册vue组件，避免在业务开发的时候手动一个个import
   */
  function generateVueCompnentRegisterTpl(fileList) {
    var uniqueIndex = 0;
    var importTpl = [];
    var setValueTpl = [];
    fileList.forEach(function (vuexFile) {
      var filename = vuexFile.replace(/.*\/([^\/]*)\.vue/, '$1');
      if (userConfig.autoImportVueComponent !== false) {
        (0, _utils.checkFileDuplicate)(fileList, filename, 'vue');
      }
      (0, _utils.checkFileNameValid)(filename, 'vue');
      var uid = uniqueIndex++;
      var vueComponentName = filename + 'Component' + uid;
      importTpl.push('var ' + vueComponentName + ' = require("' + (0, _utils.relativePath)(vuexFile) + '");');
      importTpl.push(vueComponentName + '._ubase_component_name = \'' + filename + '\';');
      setValueTpl.push('Vue.component(' + vueComponentName + '.name || "' + filename + '", ' + vueComponentName + ');');
    });

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    };
  }

  return entrys;
}

var reGeneratorEntryFiles = (0, _debounce2.default)(generatorEntryFiles, 200);