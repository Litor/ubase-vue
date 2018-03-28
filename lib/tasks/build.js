'use strict';

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _gulpConnect = require('gulp-connect');

var _gulpConnect2 = _interopRequireDefault(_gulpConnect);

var _httpProxyMiddleware = require('http-proxy-middleware');

var _httpProxyMiddleware2 = _interopRequireDefault(_httpProxyMiddleware);

var _errorHandler = require('../helpers/errorHandler');

var _errorHandler2 = _interopRequireDefault(_errorHandler);

var _webpackStream = require('webpack-stream');

var _webpackStream2 = _interopRequireDefault(_webpackStream);

var _vinylNamed = require('vinyl-named');

var _vinylNamed2 = _interopRequireDefault(_vinylNamed);

var _webpack = require('../webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _gulpEnv = require('gulp-env');

var _gulpEnv2 = _interopRequireDefault(_gulpEnv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var envs = { NODE_ENV: _config2.default.NODE_ENV };

_gulp2.default.task('webpack', _gulp2.default.series(function (cb) {
    return _gulp2.default.src([__dirname + '/index.js']).pipe(_gulpEnv2.default.set(envs)).pipe((0, _errorHandler2.default)()).pipe((0, _vinylNamed2.default)()).pipe((0, _webpackStream2.default)(_webpack2.default)).pipe(_gulp2.default.dest(_config2.default.argDist || _config2.default.dest)).pipe(_gulpConnect2.default.reload()).on('end', function () {
        cb();
        if (_config2.default.isProduction) {
            process.exit();
        }
    });
}));

_gulp2.default.task('connect', function () {
    _gulpConnect2.default.server({
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

_gulp2.default.task('clean', function () {
    var dest = _config2.default.dest;
    try {
        _del2.default.sync([dest + '/**/*', '!' + dest + '/WEB-INF/**', '!' + dest + '/APP_INFO/**'], { force: true });
    } catch (e) {
        console.log('%s do not clean', dest);
    }
});

_gulp2.default.task('build', _gulp2.default.series(_gulp2.default.parallel('clean', 'webpack'), function () {}));

_gulp2.default.task('default', _gulp2.default.series(_gulp2.default.parallel('clean', 'webpack', 'connect'), function () {}));