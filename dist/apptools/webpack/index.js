'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

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

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

var _debounce = require('debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _jsBeautify = require('js-beautify');

var _jsBeautify2 = _interopRequireDefault(_jsBeautify);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_colors2.default.setTheme({
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
});

var projectType = null;
var tempFileContents = {
  entryFiles: {}
};

var existPath = [];

exports.default = function (path, webpack, userConfig) {
  userConfig.langs = userConfig.langs || ['cn'];
  var entrys = {};

  projectType = checkProjectType(path);

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

    // http://habrahabr.ru/post/245991/
    plugins: (0, _webpack4.default)(path, webpack),

    postcss: function postcss() {
      return [(0, _autoprefixer2.default)({
        browsers: ['last 3 versions'],
        cascade: false
      })];
    },

    cssLoader: {
      sourceMap: _config2.default.isDevelope,
      localIdentName: _config2.default.isDevelope ? '[local]' : '[hash:5]'
    },

    jadeLoader: {
      locals: _config2.default,
      pretty: _config2.default.isDevelope
    },

    devtool: _config2.default.isDebug ? '#inline-source-map' : false
  };

  return webpackConfig;
};

function checkProjectType(path) {
  var projectType = null;
  var indexHtml = path.resolve(_config2.default.src) + '/pages/index.html';
  var routeJs = path.resolve(_config2.default.src) + '/pages/routes.js';
  if (existPath.includes(indexHtml) && existPath.includes(routeJs) || _fs2.default.existsSync(indexHtml) && _fs2.default.existsSync(routeJs)) {
    projectType = 'singleApp';
    existPath.push(indexHtml);
    existPath.push(routeJs);
  }

  return projectType;
}

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
    var appVuexFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.vuex.js').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.vuex.js'));

    // 获取app下的vue组件及components下的组件
    var appVueFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.vue').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/components/**/*.vue'));

    // 获取app下的所有国际化文件路径列表
    var appI18nFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.i18n.js');

    var globalI18nFilesPath = _glob2.default.sync(path.resolve(_config2.default.src) + '/*.i18n.js') || [];

    var routeFilePath = path.resolve(_config2.default.src) + '/pages/' + appName + '/routes.js';
    var indexHtmlFilePath = path.resolve(_config2.default.src) + '/pages/' + appName + '/index.html';
    var configFilePath = path.resolve(_config2.default.src) + '/pages/' + appName + '/config.json';

    // 解析vuex文件路径 生成对应的vuex初始化语句
    var vuexTpl = generateVuexTpl(appVuexFilesPath);

    // 生成全局注册vue组件的语句
    var vueCompnentTpl = userConfig.autoImportVueComponent === false ? {} : generateVueCompnentRegisterTpl(appVueFilesPath);

    // 为每个app在tempfile文件夹中生成国际化文件
    generateI18nFile(appI18nFilesPath, globalI18nFilesPath);

    var i18nImport = generateI18nImport(appName);

    // 框架代码 引用路径
    var ubaseVuePath = _config2.default.isProduction ? '../../ubase-vue' : '../../ubase-vue';

    var fileContent = templateReplace(appEntryTemplate, {
      importTpl: { content: vuexTpl.importTpl, relativePath: true, required: true, statement: true },
      setValueTpl: { content: vuexTpl.setValueTpl, relativePath: true, required: true, statement: true },
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
      i18nImport: { content: i18nImport, relativePath: false, required: true, statement: true },
      routes: { content: routeFilePath, relativePath: true, required: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: true },
      config: { content: configFilePath, relativePath: true, required: true },
      rootRoute: { content: '/' + appName, relativePath: false, required: true }
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
      var uid = uniqueIndex++;
      checkFileNameValid(filename, '.vuex.js');
      importTpl.push('var ' + filename + 'Store' + uid + ' = require("' + relativePath(vuexFile) + '");');
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store' + uid + ';');
    });

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    };
  }

  function generateI18nImport(appName) {
    var importI18nArray = [];
    userConfig.langs.forEach(function (item) {
      importI18nArray.push('require("./' + appName + '/' + item + '.lang.json")');
    });

    return importI18nArray.join('\n');
  }

  function translateEs6to5(file) {
    var content = _fs2.default.readFileSync(file);
    var result = babel.transform(content, {
      presets: ['es2015']
    });
    var exports = {};
    eval(result.code);

    return exports;
  }

  // 创建国际化文件，收集app下的国际化文件， 按语言类型生成相应的国际化文件
  function generateI18nFile(fileList, globalI18nFileList) {
    var uniqueIndex = 0;
    var singleApp = projectType === 'singleApp';
    var i18nContainer = {};

    fileList.forEach(function (i18nFile) {
      var appName = i18nFile.replace(/.*\/pages\/([^\/]*).*$/, '$1');
      var filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1');

      var exports = translateEs6to5(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item] = i18nContainer[item] || {};
          i18nContainer[item][filename] = exports.default[item] || {};
        } else {
          i18nContainer[appName] = i18nContainer[appName] || {};
          if (i18nContainer[appName][item]) {
            i18nContainer[appName][item][filename] = exports.default[item] || {};
          } else {
            i18nContainer[appName][item] = {};
            i18nContainer[appName][item][filename] = exports.default[item] || {};
          }
        }
      });
    });

    // 每个app添加全局国际化文件信息
    globalI18nFileList.forEach(function (i18nFile) {
      var filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1');
      var exports = translateEs6to5(i18nFile);

      userConfig.langs.forEach(function (item) {
        if (singleApp) {
          i18nContainer[item][filename] = exports.default[item] || {};
        } else {
          Object.keys(i18nContainer).forEach(function (appName) {
            i18nContainer[appName][item][filename] = exports.default[item] || {};
          });
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
        if (!existPath.includes(appPath) && !_fs2.default.existsSync(appPath)) {
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

  function checkFileNameValid(filename, format) {
    if (filename.indexOf('-') > 0 || filename.indexOf('.') > 0) {
      console.error(_colors2.default.red('文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：' + filename + format));
      process.exit();
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
      checkFileNameValid(filename, '.vue');
      var uid = uniqueIndex++;
      importTpl.push('var ' + filename + 'Component' + uid + ' = require("' + relativePath(vuexFile) + '");');
      importTpl.push(filename + 'Component' + uid + "._ubase_component_name = '" + filename + "'");
      setValueTpl.push('Vue.component(' + filename + 'Component' + uid + '.name || "' + filename + '", ' + filename + 'Component' + uid + ');');
    });

    return {
      importTpl: importTpl.join('\n'),
      setValueTpl: setValueTpl.join('\n')
    };
  }

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath);
  }

  /**
   * 模板替换方法
   * @param  {[type]} template [模板]
   * @param  {[type]} config   [配置对象]
   * @return {[type]}          [description]
   */
  function templateReplace(template, config) {
    Object.keys(config).forEach(function (item) {
      var re = new RegExp('\\{\\{' + item + '\\}\\}', 'g');
      var statementre = new RegExp('\\\'\\{\\{' + item + '\\}\\}\\\'', 'g');

      if (config[item].statement) {
        template = template.replace(statementre, config[item].content);
        return;
      }
      if (!config[item].relativePath) {
        template = template.replace(re, config[item].content);
        return;
      }

      if (!existPath.includes(config[item].content) && _fs2.default.existsSync(config[item].content)) {
        template = template.replace(re, relativePath(config[item].content)).replace(/\\/g, '/');
      } else {
        if (config[item].required) {
          console.error(_colors2.default.red(config[item].content + '文件不存在!'));
          process.exit();
        } else {
          template = template.replace(re, config[item].default);
        }
      }
    });

    return template;
  }

  return entrys;
}

var reGeneratorEntryFiles = (0, _debounce2.default)(generatorEntryFiles, 200);