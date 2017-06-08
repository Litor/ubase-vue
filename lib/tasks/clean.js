'use strict';

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_gulp2.default.task('clean', function (cb) {
  var dest = _config2.default.dest;
  try {
    _del2.default.sync([dest + '/**/*', '!' + dest + '/WEB-INF/**', '!' + dest + '/APP_INFO/**'], { force: true });
  } catch (e) {
    console.log('%s do not clean', dest);
  }
});