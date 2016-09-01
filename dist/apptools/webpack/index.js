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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (path, webpack, userConfig) {
  var appEntryFiles = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/*/*.vue');
  var packageName = appEntryFiles[0].replace(/.*\/([^\/]*)\/src\/.*/, '$1');
  var entryIndexTemplate = _fs2.default.readFileSync(__dirname + '/../appindex/index.js', 'utf8');

  var indexHtmlFilePath = path.resolve(_config2.default.src) + '/index.html';
  var globalVuexFilePath = path.resolve(_config2.default.src) + '/global.vuex.js';
  var configFilePath = path.resolve(_config2.default.src) + '/config.json';

  var entrys = {};
  var appsList = [];

  appEntryFiles.forEach(function (entryFilePath) {
    var filename = entryFilePath.replace(/.*\/([^\/]*)\.vue/, '$1');
    var appName = entryFilePath.replace(/.*\/pages\/(.*)\/[^\/]*\.vue/, '$1');
    if (appName !== filename) {
      return;
    }
    var routeFilePath = entryFilePath.replace(filename + '.vue', filename + '.routes.js');
    var vuexFilePath = entryFilePath.replace(filename + '.vue', filename + '.vuex.js');
    var i18nFilePath = entryFilePath.replace(filename + '.vue', 'i18n.js');

    var fileContent = templateReplace(entryIndexTemplate, {
      entry: { content: entryFilePath, relativePath: true, required: true },
      store: { content: vuexFilePath, relativePath: true, required: true },
      globalStore: { content: globalVuexFilePath, relativePath: true, required: true },
      routes: { content: routeFilePath, relativePath: true, required: true },
      indexHtml: { content: indexHtmlFilePath, relativePath: true, required: true },
      config: { content: configFilePath, relativePath: true, required: true },
      rootRoute: { content: '/' + filename, relativePath: false, required: true },
      i18n: { content: i18nFilePath, relativePath: true, required: false, default: '../appindex/i18n.js' }
    });

    _fs2.default.writeFileSync(__dirname + '/../tempfile/' + filename + '.js', fileContent, 'utf8');
    entrys[filename] = __dirname + '/../tempfile/' + filename + '.js';
    appsList.push(filename);
  });

  function relativePath(filePath) {
    return path.relative(__dirname + '/../tempfile', filePath);
  }

  function templateReplace(template, config) {
    Object.keys(config).forEach(function (item) {
      var re = new RegExp('\\{\\{' + item + '\\}\\}', 'g');

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
      filename: packageName + '/[name].js',
      chunkFilename: packageName + '/[name]-[id].js'
    },

    watch: _config2.default.isDevelope,

    module: {
      loaders: (0, _webpack2.default)(path, {
        packageName: packageName,
        appsList: JSON.stringify(appsList)
      })
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