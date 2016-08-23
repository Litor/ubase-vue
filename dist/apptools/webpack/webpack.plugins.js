'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _stringReplaceWebpackPlugin = require('string-replace-webpack-plugin');

var _stringReplaceWebpackPlugin2 = _interopRequireDefault(_stringReplaceWebpackPlugin);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (path, webpack) {
  var plugins = [

  // fix for moment
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), new webpack.optimize.AggressiveMergingPlugin({
    moveToParents: true
  }),

  // удаляем повторые модули
  new webpack.optimize.DedupePlugin(),

  // не билдим сборки, когда ошибка
  new webpack.NoErrorsPlugin(),

  // собирает все общие скрипты чанка в commons.js
  /*new webpack.optimize.CommonsChunkPlugin({
    name: 'commons',
    // chunks: ['commons'],
    // minChunks: Infinity,
    children: true,
    // minSize: 1*1024,
  }),*/

  new _extractTextWebpackPlugin2.default(_config2.default.assets.styles + '/[name].css', {
    // allChunks: true,
    disable: true //config.isDevelope,
  }), new _stringReplaceWebpackPlugin2.default(), new webpack.DefinePlugin({
    DEBUG: _config2.default.isDebug,
    NODE_ENV: '\'' + _config2.default.NODE_ENV + '\''
    // config: JSON.stringify(config),
  })];

  _config2.default.isProduction && plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: {
      // except: [
      //   'Vue', 'vue', 'vue-router', 'vue-i18n',
      //   'Framework7', 'Dom7', 'exports', 'require',
      // ],
    }
  }));

  _config2.default.loadappcore && plugins.push(new _copyWebpackPlugin2.default([{ from: __dirname + '/../../../dist/ubase-vue.js', to: path.resolve('./') }]));

  return plugins;
};