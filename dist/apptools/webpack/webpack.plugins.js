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

var _webpackUbaseHashPlugin = require('./webpack-ubase-hash-plugin');

var _webpackUbaseHashPlugin2 = _interopRequireDefault(_webpackUbaseHashPlugin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (path, webpack) {
  var plugins = [

  // fix for moment
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/), new webpack.optimize.AggressiveMergingPlugin({
    moveToParents: true
  }), new webpack.optimize.DedupePlugin(), new webpack.NoErrorsPlugin(), new _extractTextWebpackPlugin2.default(_config2.default.assets.styles + '/[name].css', {
    // allChunks: true,
    disable: true //config.isDevelope,
  }), new _copyWebpackPlugin2.default([{
    from: path.resolve('./src/statics/**/*.json'),
    to: path.resolve('./www/')
  }]), new _stringReplaceWebpackPlugin2.default(), new webpack.DefinePlugin({
    DEBUG: _config2.default.isDebug,
    NODE_ENV: '\'' + _config2.default.NODE_ENV + '\''
  })];
  _config2.default.isProduction && plugins.push(new _webpackUbaseHashPlugin2.default());
  _config2.default.isProduction && plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    },
    mangle: {}
  }));

  return plugins;
};