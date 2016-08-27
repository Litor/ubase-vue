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
  var entry = _glob2.default.sync(path.resolve(_config2.default.src) + '/pages/*/*.vue');
  var entrys = {};
  var text = _fs2.default.readFileSync(__dirname + '/../appindex/index.js', 'utf8');
  var appName = entry[0].replace(/.*\/([^\/]*)\/src\/.*/, '$1');
  console.log('NAME:' + appName);
  var appsList = [];
  entry.forEach(function (item) {
    var filename = item.replace(/.*\/([^\/]*)\.vue/, '$1');
    var routeFilename = item.replace(filename + '.vue', filename + '.routes.js');
    var vuexFilename = item.replace(filename + '.vue', filename + '.vuex.js');
    var indexHtml = path.resolve(_config2.default.src) + '/index.html';
    var globalVuex = path.resolve(_config2.default.src) + '/global.vuex.js';
    var fileContent = text.replace(/\{\{entry\}\}/g, path.relative(__dirname + '/../tempfile', item).replace(/\\/g, '/')).replace(/\{\{store\}\}/g, path.relative(__dirname + '/../tempfile', vuexFilename).replace(/\\/g, '/')).replace(/\{\{globalStore\}\}/g, path.relative(__dirname + '/../tempfile', globalVuex).replace(/\\/g, '/')).replace(/\{\{routes\}\}/g, path.relative(__dirname + '/../tempfile', routeFilename).replace(/\\/g, '/')).replace(/\{\{indexHtml\}\}/g, path.relative(__dirname + '/../tempfile', indexHtml).replace(/\\/g, '/')).replace(/\{\{rootRoute\}\}/g, '/' + filename).replace(/\{\{config\}\}/g, path.relative(__dirname + '/../tempfile', path.resolve(_config2.default.src) + '/config.json').replace(/\\/g, '/'));
    _fs2.default.writeFileSync(__dirname + '/../tempfile/' + filename + '.js', fileContent, 'utf8');
    entrys[filename] = __dirname + '/../tempfile/' + filename + '.js';
    appsList.push(filename);
  });

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
      filename: appName + '/[name].js',
      chunkFilename: appName + '/[name]-[id].js'
    },

    watch: _config2.default.isDevelope,

    module: {
      loaders: (0, _webpack2.default)(path, {
        appName: appName,
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

  console.log(webpackConfig.resolve);
  return webpackConfig;
};