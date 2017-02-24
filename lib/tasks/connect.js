'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _gulpConnect = require('gulp-connect');

var _gulpConnect2 = _interopRequireDefault(_gulpConnect);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _httpProxyMiddleware = require('http-proxy-middleware');

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_gulp2.default.task('connect', function () {
  return _gulpConnect2.default.server({
    root: _config2.default.dest,
    port: _config2.default.server.port || '8081',
    livereload: true,
    middleware: function middleware(connect, opt) {
      var proxys = [];

      if (_config2.default.proxy) {
        for (var i = 0; i < _config2.default.proxy.length; i++) {
          proxys.push((0, _httpProxyMiddleware2.default)(_config2.default.proxy[i].source, {
            target: _config2.default.proxy[i].target,
            changeOrigin: true,
            secure: false,
            headers: {
              Connection: 'keep-alive'
            }
          }));
        }
      }

      return proxys;
    }
  });
});

exports.default = _gulpConnect2.default;