'use strict';

var _test = require('../../src/apps/test2/test2.vue');

var _test2 = _interopRequireDefault(_test);

var _test2Routes = require('../../src/apps/test2/test2.routes.js');

var _test2Routes2 = _interopRequireDefault(_test2Routes);

var _test2Vuex = require('../../src/apps/test2/test2.vuex.js');

var store = _interopRequireWildcard(_test2Vuex);

require('../appindex/index.html');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootRoute = '/ubase-vue-example/test2';
var STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: { app: store }
};

Object.keys(_test2Routes2.default).forEach(function (key) {
  _test2Routes2.default[rootRoute + key] = _test2Routes2.default[key];
  delete _test2Routes2.default[key];
});
console.log(_test2Routes2.default);
window.STARTAPP(_test2.default, STORE, _test2Routes2.default);