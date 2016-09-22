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

exports.default = function (path, webpack, userConfig) {
  var appEntryFiles = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/*/*.vue');
  var packageName = appEntryFiles[0].replace(/.*\/([^\/]*)\/src\/.*/, '$1');
  var entryIndexTemplate = _fs2.default.readFileSync(__dirname + '/../appindex/index.js', 'utf8');

  var indexHtmlFilePath = path.resolve(_config2.default.src) + '/index.html';
  var configFilePath = path.resolve(_config2.default.src) + '/config.json';

  var entrys = {};
  var appsList = [];

  appEntryFiles.forEach(function (entryFilePath) {
    var filename = entryFilePath.replace(/.*\/([^\/]*)\.vue/, '$1');
    var appName = entryFilePath.replace(/.*\/pages\/(.*)\/[^\/]*\.vue/, '$1');
    if (appName !== filename) {
      return;
    }

    var appVuexFiles = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.vuex.js').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.vuex.js'));
    var appVueFiles = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.vue').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/components/**/*.vue'));
    var appI18nFiles = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/' + appName + '/**/*.i18n.js').concat(_glob2.default.sync(path.resolve(_config2.default.src) + '/*.i18n.js'));
    var routeFilePath = entryFilePath.replace(filename + '.vue', 'routes.js');
    var i18nFilePath = entryFilePath.replace(filename + '.vue', 'i18n.js');

    var vuexTpl = generateVuexTpl(appVuexFiles);
    var vueCompnentTpl = generateVueCompnentRegisterTpl(appVueFiles);
    var appI18nFilesTpl = generateappI18nRegisterTpl(appI18nFiles);

    var fileContent = templateReplace(entryIndexTemplate, {
      entry: { content: entryFilePath, relativePath: true, required: true },
      importTpl: { content: vuexTpl.importTpl, relativePath: true, required: true, statement: true },
      setValueTpl: { content: vuexTpl.setValueTpl, relativePath: true, required: true, statement: true },
      vueCompnentimportTpl: { content: vueCompnentTpl.importTpl, relativePath: true, required: true, statement: true },
      vueCompnentsetValueTpl: { content: vueCompnentTpl.setValueTpl, relativePath: true, required: true, statement: true },
      i18nimportTpl: { content: appI18nFilesTpl.importTpl, relativePath: true, required: true, statement: true },
      i18nsetValueTpl: { content: appI18nFilesTpl.setValueTpl, relativePath: true, required: true, statement: true },
      routes: { content: routeFilePath, relativePath: true, required: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: false },
      config: { content: configFilePath, relativePath: true, required: false },
      rootRoute: { content: '/' + filename, relativePath: false, required: true },
      i18n: { content: i18nFilePath, relativePath: true, required: false, default: '../appindex/i18n.js' }
    });

    _fs2.default.writeFileSync(__dirname + '/../tempfile/' + filename + '.js', fileContent, 'utf8');
    entrys[filename + '/' + filename] = __dirname + '/../tempfile/' + filename + '.js';
    appsList.push(filename);
  });

  function generateVuexTpl(fileList) {
    var importTpl = [];
    var setValueTpl = [];
    fileList.forEach(function (vuexFile) {
      var filename = vuexFile.replace(/.*\/([^\/]*)\.vuex\.js/, '$1');
      checkFileNameValid(filename + '.vuex.js');
      importTpl.push('var ' + filename + 'Store = require("' + relativePath(vuexFile) + '");');
      setValueTpl.push('STORE.modules.' + filename + ' = ' + filename + 'Store');
    });

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    };
  }

  function generateappI18nRegisterTpl(fileList) {
    var importTpl = [];
    var setValueTpl = ['var _alli18n = {};'];
    fileList.forEach(function (i18nFile) {
      var filename = i18nFile.replace(/.*\/([^\/]*)\.i18n\.js/, '$1');
      checkFileNameValid(filename + '.i18n.js');
      importTpl.push('var ' + filename + 'I18n = require("' + relativePath(i18nFile) + '");');
      setValueTpl.push('_alli18n["' + filename + '"]=' + filename + 'I18n');
    });

    setValueTpl.push('window.UBASE_INITI18N(_alli18n)');

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    };
  }

  function checkFileNameValid(filename) {
    if (filename.indexOf('-') > 0) {
      console.error(_colors2.default.red('文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：' + filename));
      process.exit();
    }
  }

  function generateVueCompnentRegisterTpl(fileList) {
    var importTpl = [];
    var setValueTpl = [];
    fileList.forEach(function (vuexFile) {
      var filename = vuexFile.replace(/.*\/([^\/]*)\.vue/, '$1');
      checkFileNameValid(filename + '.vue');
      importTpl.push('var ' + filename + 'Component = require("' + relativePath(vuexFile) + '");');
      setValueTpl.push('Vue.component("' + filename + '", ' + filename + 'Component)');
    });

    return {
      importTpl: importTpl.join('\n;'),
      setValueTpl: setValueTpl.join('\n;')
    };
  }

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath);
  }

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

      if (_fs2.default.existsSync(config[item].content)) {
        template = template.replace(re, relativePath(config[item].content)).replace(/\\/g, '/');
      } else {
        if (config[item].required) {
          console.log(config[item].content + '文件不存在!');
        } else {
          template = template.replace(re, config[item].default);
        }
      }
    });

    return template;
  }

  var webpackConfig = {
    context: path.resolve(_config2.default.src),
    entry: entrys,
    resolve: {
      root: [path.resolve(_config2.default.src), path.resolve('./node_modules/')],
      alias: Object.assign({}, userConfig.alias),
      extensions: ['', '.js']
    },

    output: {
      publicPath: _config2.default.isDevelope ? 'http://localhost:' + _config2.default.server.port + '/' : '',
      // filename: packageName + '/[name].js',
      // chunkFilename: packageName + '/[name]-[id].js',
      filename: '[name].js',
      chunkFilename: '[name]-[id].js'
    },

    watch: _config2.default.isDevelope,

    module: {
      loaders: (0, _webpack2.default)(path, {
        packageName: packageName,
        appsList: JSON.stringify(appsList)
      })
    },

    // http://habrahabr.ru/post/245991/
    plugins: (0, _webpack4.default)(path, webpack, { packageName: packageName }),

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