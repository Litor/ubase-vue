'use strict';

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _errorHandler = require('../helpers/errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _webpackStream = require('webpack-stream');

var _webpackStream2 = _interopRequireDefault(_webpackStream);

var _vinylNamed = require('vinyl-named');

var _vinylNamed2 = _interopRequireDefault(_vinylNamed);

var _gulpConnect = require('gulp-connect');

var _gulpConnect2 = _interopRequireDefault(_gulpConnect);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _webpack = require('../webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _gulpEnv = require('gulp-env');

var _gulpEnv2 = _interopRequireDefault(_gulpEnv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var envs = { NODE_ENV: _config2.default.NODE_ENV };

_gulp2.default.task('webpack', function () {
  return _gulp2.default.src([]).pipe(_gulpEnv2.default.set(envs)).pipe((0, _errorHandler2.default)()).pipe((0, _vinylNamed2.default)()).pipe((0, _webpackStream2.default)(_webpack2.default)).pipe(_gulp2.default.dest(_config2.default.argDist || _config2.default.dest)).pipe(_gulpConnect2.default.reload()).on('end', function () {
    if (_config2.default.isProduction) {
      process.exit();
    }
  });
});