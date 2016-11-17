require('{{ubase_vue}}')
$(function () {
  // 初始化（获取config.json信息）
  window._UBASE_PRIVATE.init()

  // 初始化国际化信息
  window._UBASE_PRIVATE.initI18n()


  require('{{indexHtml}}');
  require('{{config}}');
  require('{{i18nImport}}')
  var routes = require('{{routes}}').default

  // 全局注册src/components及app下的vue组件
  '{{importTpl}}'
  '{{vueCompnentimportTpl}}'

  const STORE = {
    state: {},
    actions: [],
    mutations: [],
    modules: {},
  }

  '{{setValueTpl}}'
  '{{vueCompnentsetValueTpl}}'

  window._UBASE_PRIVATE.startApp(null, STORE, routes);
})
