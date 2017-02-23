'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getArg = require('./helpers/getArg');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var projectPath = process.cwd();

var content = _fs2.default.readFileSync(projectPath + '/ubase.config.json', 'utf-8');

var userConfig = JSON.parse(content);

exports.default = {
  src: './src',
  dest: userConfig.dist || './dist',
  vueLibBuildIn: true,
  app: '/app',
  components: './src/components',
  pages: './src/pages',

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