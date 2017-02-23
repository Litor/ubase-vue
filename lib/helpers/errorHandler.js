'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gulpPlumber = require('gulp-plumber');

var _gulpPlumber2 = _interopRequireDefault(_gulpPlumber);

var _gulpNotify = require('gulp-notify');

var _gulpNotify2 = _interopRequireDefault(_gulpNotify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  return (0, _gulpPlumber2.default)({
    errorHandler: _gulpNotify2.default.onError({
      title: '<%= error.name %>',
      message: '<%= error.message %>',
      sound: true
    })
  });
};