'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getArg = require('./helpers/getArg');

var src = './src';
var dest = './www';

exports.default = {
  src: src,
  dest: dest,
  components: src + '/components',
  pages: src + '/pages',
  modules: src + '/modules/',

  assets: {
    images: 'statics/images',
    scripts: 'statics/scripts',
    styles: 'statics/styles',
    fonts: 'statics/fonts'
  },

  isProduction: _getArg.production,
  isDevelope: !_getArg.production,
  isDebug: _getArg.debug,
  loadappcore: _getArg.loadappcore,
  NODE_ENV: _getArg.production ? 'production' : 'develope',

  server: {
    port: 8081
  }
};