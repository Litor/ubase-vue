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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (path, webpack, userConfig) {
  return {
    context: path.resolve(_config2.default.src),
    entry: __dirname + '/../appindex/index.js',
    resolve: {
      root: [path.resolve(_config2.default.src), path.resolve('./node_modules/')],
      alias: {},
      extensions: ['', '.js']
    },

    output: {
      publicPath: _config2.default.isDevelope ? 'http://localhost:' + _config2.default.server.port + '/' : '',
      filename: _config2.default.assets.scripts + '/[name].js',
      chunkFilename: _config2.default.assets.scripts + '/[name]-[id].js'
    },

    watch: _config2.default.isDevelope,

    module: {
      loaders: (0, _webpack2.default)(path)
    },

    // http://habrahabr.ru/post/245991/
    plugins: (0, _webpack4.default)(path, webpack, userConfig),

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
};