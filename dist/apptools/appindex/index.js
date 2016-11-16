'use strict';

// 初始化（获取config.json信息）
require('{{ubase_vue}}');
$(function () {
  window._UBASE_PRIVATE.init();
  // 初始化国际化信息
  '{{i18nimportTpl}}';
  '{{i18nsetValueTpl}}';

  require('{{indexHtml}}');
  require('{{config}}');
  var routes = require('{{routes}}').default;

  // 全局注册src/components及app下的vue组件
  '{{importTpl}}';
  '{{vueCompnentimportTpl}}';

  var STORE = {
    state: {},
    actions: [],
    mutations: [],
    modules: {}
  };

  '{{setValueTpl}}';
  '{{vueCompnentsetValueTpl}}';

  window._UBASE_PRIVATE.startApp(null, STORE, routes);
});