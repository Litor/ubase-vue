'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (userConfig) {
  (0, _localStorage.setItem)('userConfig', JSON.stringify(userConfig));
  require('require-dir')('./tasks', { recurse: true });
};

var _localStorage = require('./localStorage');

process.noDeprecation = true;