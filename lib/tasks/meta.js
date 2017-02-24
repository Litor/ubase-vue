'use strict';

var _gulp = require('gulp');

var _gulp2 = _interopRequireDefault(_gulp);

var _del = require('del');

var _del2 = _interopRequireDefault(_del);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _copyRemoteFile = require('copy-remote-file');

var _copyRemoteFile2 = _interopRequireDefault(_copyRemoteFile);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_gulp2.default.task('meta', function (cb) {
  try {
    _del2.default.sync('./src/statics/meta-info/**/*.*');
  } catch (e) {
    console.log('%s do not clean', dest);
  }
  (0, _copyRemoteFile2.default)(_config2.default.metaInfoUrl, _path2.default.resolve('./src/statics/meta-info/'));
});