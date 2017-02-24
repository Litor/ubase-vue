'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getArg = require('./helpers/getArg');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _localStorage = require('./localStorage');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userConfig = JSON.parse((0, _localStorage.getItem)('userConfig'));

exports.default = {
  vueEntryConfig: {
    src: './src',
    vueLibBuildIn: true,
    components: './src/components',
    pages: './src/pages',
    alias: userConfig.alias || {},
    proxy: userConfig.proxy || [],
    langs: userConfig.langs,
    autoImportVueComponent: userConfig.autoImportVueComponent,
    exportName: 'Ubase'
  },

  src: './src',
  dest: userConfig.dist || './dist',
  app: '/app',

  assets: {
    images: 'statics/images',
    scripts: 'statics/scripts',
    styles: 'statics/styles',
    fonts: 'statics/fonts'
  },

  isProduction: _getArg.production,
  isDeveloper: !_getArg.production,
  isDebug: _getArg.debug,
  NODE_ENV: _getArg.production ? 'production' : 'developer',

  server: {
    port: userConfig.port || 8081
  }
};