// 初始化（获取config.json信息）
window.UBASE_INIT()
// 初始化国际化信息
'{{i18nimportTpl}}'
'{{i18nsetValueTpl}}'

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

window.UBASE_STARTAPP(null, STORE, routes)
