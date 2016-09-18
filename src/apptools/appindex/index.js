import * as app from '{{entry}}'
import routes from '{{routes}}'
import '{{config}}'

// 初始化（获取config.json信息）
window.UBASE_INIT()

// 初始化国际化信息
'{{i18nimportTpl}}'
'{{i18nsetValueTpl}}'

// 全局注册src/components及app下的vue组件
'{{importTpl}}'
'{{vueCompnentimportTpl}}'

import '{{indexHtml}}'
let rootRoute = '{{rootRoute}}'

const STORE = {
  state: {},
  actions: [],
  mutations: [],
  modules: {},
}

'{{setValueTpl}}'
'{{vueCompnentsetValueTpl}}'

Object.keys(routes).forEach(function(key) {
  routes[rootRoute + key] = routes[key]
  delete routes[key]
})

window.UBASE_STARTAPP(app, STORE, routes)
