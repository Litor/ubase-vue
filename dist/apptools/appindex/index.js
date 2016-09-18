'use strict';

var _entry = require('{{entry}}');

var app = _interopRequireWildcard(_entry);

var _routes = require('{{routes}}');

var _routes2 = _interopRequireDefault(_routes);

require('{{config}}');

require('{{indexHtml}}');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// 初始化（获取config.json信息）
window.UBASE_INIT();

// 初始化国际化信息
'{{i18nimportTpl}}';
'{{i18nsetValueTpl}}';

// 全局注册src/components及app下的vue组件
'{{importTpl}}';
'{{vueCompnentimportTpl}}';

var rootRoute = '{{rootRoute}}';

var STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: {}
};

'{{setValueTpl}}';
'{{vueCompnentsetValueTpl}}';

Object.keys(_routes2.default).forEach(function (key) {
  _routes2.default[rootRoute + key] = _routes2.default[key];
  delete _routes2.default[key];
});

window.UBASE_STARTAPP(app, STORE, _routes2.default);