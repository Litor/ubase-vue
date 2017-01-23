import {
  Vue,
  i18n,
} from './lib'

import {boot} from './boot'
import {invoke, getData} from './eventManager'

import {
  setConfig,
  getConfig,
  setStore,
  getState
} from './utils'

import {
  setConfig as setConfigForLog,
  debug,
  error,
  initLog
} from './log'

// Ubase对应用开发暴露的接口
window.Ubase = {}
window.Ubase.getState = getState // 更新state
window.Ubase.invoke = invoke // 跨组件触发方法
window.Ubase.getData = getData // 获取页面私有state方法
window.Ubase.beforeInit = null // 定制应用启动前处理钩子 params {config，router, routes，rootApp, next}

Vue.prototype.$debug = debug
Vue.prototype.$error = error

window._UBASE_PRIVATE = {}
// ubase 生成app入口文件时用的私有方法
window._UBASE_PRIVATE.startApp = startApp
window._UBASE_PRIVATE.init = appInit
window._UBASE_PRIVATE.initI18n = initI18n

/* ================start window全局变量=================== */
window.Vue = Vue

/* ================end window全局变量=================== */

// 同步获取app的config信息, 在app启动时第一步执行
function appInit() {
  return Vue.http.get('./config.json').then((res) => {
    var debugStatus = localStorage && typeof localStorage.getItem == 'function' && localStorage.getItem('debug')

    if (debugStatus) {
      res['DEBUG'] = true
    }

    setConfig(res)
    setConfigForLog(res)
  })
}

// 初始化国际化 获取config信息后第二步执行
function initI18n() {
  var langUrl = './' + (getConfig()['LANG'] || 'cn') + '.lang.json'
  return Vue.http.get(langUrl).then((res) => {
    var lang = getConfig()['LANG'] || 'cn'
    var locales = {}
    locales[lang] = res
    Vue.use(i18n, {
      lang: lang,
      locales: locales
    })
  })
}

// 应用启动入口
function startApp(unused, store, routes) {
  setStore(store)
  initLog()
  boot(store, routes)
}
