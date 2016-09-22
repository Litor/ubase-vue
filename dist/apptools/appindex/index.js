'use strict';

// 初始化（获取config.json信息）
window.UBASE_INIT();
// 初始化国际化信息
'{{i18nimportTpl}}';
'{{i18nsetValueTpl}}';

var app = require('{{entry}}');
var routes = require('{{routes}}').default;
require('{{config}}');
require('{{indexHtml}}');

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

Object.keys(routes).forEach(function (key) {
  routes[rootRoute + key] = routes[key];
  delete routes[key];
});

window.UBASE_STARTAPP(app, STORE, routes);