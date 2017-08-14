'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _webpackLoaders = require('./webpack.loaders.js');

var _webpackLoaders2 = _interopRequireDefault(_webpackLoaders);

var _webpackPlugins = require('./webpack.plugins.js');

var _webpackPlugins2 = _interopRequireDefault(_webpackPlugins);

var _vueEntry = require('vue-entry');

var _vueEntry2 = _interopRequireDefault(_vueEntry);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _utils = require('vue-entry/dist/bootstrap/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vueEntryConfig = _config2.default.vueEntryConfig;

var singleAppMode = (0, _utils.isSingleAppMode)(vueEntryConfig);

var webpackConfig = {
  context: _path2.default.resolve(_config2.default.src),
  entry: (0, _vueEntry2.default)(vueEntryConfig),
  resolve: {
    root: [_path2.default.resolve(_config2.default.src), _path2.default.resolve('./node_modules/')],
    alias: Object.assign({}, _config2.default.alias),
    extensions: ['', '.js', '.vue']
  },

  output: {
    publicPath: singleAppMode ? './' : '../',
    filename: _config2.default.isDeveloper ? '[name].js' : '[name]-[chunkhash].js',
    chunkFilename: 'statics/chunk/[name]-[id].js'
  },

  watch: _config2.default.isDeveloper,

  module: {
    loaders: _webpackLoaders2.default
  },

  plugins: _webpackPlugins2.default,

  devtool: _config2.default.isDebug ? '#inline-source-map' : false
};

if (_config2.default.rootFontSize) {
  webpackConfig.vue = {
    postcss: [require('postcss-cssnext')({
      features: {
        rem: false
      }
    }), require('postcss-pxtorem')({
      rootValue: _config2.default.rootFontSize || 20,
      propWhiteList: []
    })],
    autoprefixer: false
  };
}

exports.default = webpackConfig;