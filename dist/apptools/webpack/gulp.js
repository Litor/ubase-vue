'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _errorHandler = require('./helpers/errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _vinylNamed = require('vinyl-named');

var _vinylNamed2 = _interopRequireDefault(_vinylNamed);

var _gulpConnect = require('gulp-connect');

var _gulpConnect2 = _interopRequireDefault(_gulpConnect);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _httpProxyMiddleware = require('http-proxy-middleware');

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

var _copyRemoteFile = require('copy-remote-file');

var _copyRemoteFile2 = _interopRequireDefault(_copyRemoteFile);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _gulpEnv = require('gulp-env');

var _gulpEnv2 = _interopRequireDefault(_gulpEnv);

var _webpackStream = require('webpack-stream');

var _webpackStream2 = _interopRequireDefault(_webpackStream);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var envs = { NODE_ENV: _config2.default.NODE_ENV };

exports.default = function (path, userConfig) {
  var dest = userConfig.dest || './www';

  _gulp2.default.task('webpack', function () {
    var webpackConfig = (0, _index2.default)(path, _webpack2.default, userConfig);
    _gulp2.default.src([]).pipe(_gulpEnv2.default.set(envs)).pipe((0, _errorHandler2.default)()).pipe((0, _vinylNamed2.default)()).pipe((0, _webpackStream2.default)(webpackConfig)).pipe(_gulp2.default.dest(dest)).pipe(_gulpConnect2.default.reload());
  });

  _gulp2.default.task('connect', function () {
    return _gulpConnect2.default.server({
      root: dest,
      port: userConfig.port || '8081',
      livereload: true,
      middleware: function middleware(connect, opt) {
        var proxys = [];

        if (userConfig.proxy) {
          for (var i = 0; i < userConfig.proxy.length; i++) {
            proxys.push((0, _httpProxyMiddleware2.default)(userConfig.proxy[i].source, {
              target: userConfig.proxy[i].target,
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

  _gulp2.default.task('meta', function (cb) {
    try {
      _del2.default.sync('./src/statics/meta-info/**/*.*');
    } catch (e) {
      console.log('%s do not clean', dest);
    }
    (0, _copyRemoteFile2.default)(userConfig.metaInfoUrl, path.resolve('./src/statics/meta-info/'));
  });

  _gulp2.default.task('clean', function (cb) {
    try {
      _del2.default.sync(dest);
    } catch (e) {
      console.log('%s do not clean', dest);
    }
  });

  _gulp2.default.task('build', ['clean', 'webpack']);
  _gulp2.default.task('default', ['clean', 'webpack', 'connect']);
};