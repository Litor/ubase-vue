'use strict';

require('index.html');

require('config.json');

var _routes = require('routes');

var _routes2 = _interopRequireDefault(_routes);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.STARTAPP(_store2.default, _routes2.default);