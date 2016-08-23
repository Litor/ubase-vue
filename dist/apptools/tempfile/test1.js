'use strict';

var _test = require('../../src/apps/test1/test1.vue');

var _test2 = _interopRequireDefault(_test);

var _test1Routes = require('../../src/apps/test1/test1.routes.js');

var _test1Routes2 = _interopRequireDefault(_test1Routes);

var _test1Vuex = require('../../src/apps/test1/test1.vuex.js');

var store = _interopRequireWildcard(_test1Vuex);

require('../appindex/index.html');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootRoute = '/ubase-vue-example/test1';
var STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: { app: store }
};

Object.keys(_test1Routes2.default).forEach(function (key) {
  _test1Routes2.default[rootRoute + key] = _test1Routes2.default[key];
  delete _test1Routes2.default[key];
});
console.log(_test1Routes2.default);
window.STARTAPP(_test2.default, STORE, _test1Routes2.default);