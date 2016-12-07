import {
  Vue,
  i18n
} from './lib'

import jquery from './jquery'
import lodash from 'lodash'
import {boot} from './boot'
import {invoke} from './eventManager'
import $script from 'scriptjs'

import {
  setConfig,
  getConfig,
  initLoadingAnimation,
  showLoading,
  hideLoading,
  setStore,
  updateState,
  getState
} from './utils'

// Ubase对应用开发暴露的接口
window.Ubase = {}
window.Ubase.showLoading = showLoading // 异步动画显示
window.Ubase.hideLoading = hideLoading // 异步动画关闭
window.Ubase.updateState = updateState // 更新state
window.Ubase.getState = getState // 更新state
window.Ubase.invoke = invoke // 跨组件触发方法
window.Ubase.beforeInit = null // 定制应用启动前处理钩子 params {config，router, routes，rootApp, next}

// deprecated
Vue.updateState = updateState
window.UBASE = {}
window.UBASE.startApp = startApp
window.UBASE.init = appInit
window.UBASE.initI18n = initI18n
window.UBASE_INIT = appInit
window.UBASE_STARTAPP = startApp
window.UBASE_INITI18N = initI18n

window._UBASE_PRIVATE = {}
// ubase 生成app入口文件时用的私有方法
window._UBASE_PRIVATE.startApp = startApp
window._UBASE_PRIVATE.init = appInit
window._UBASE_PRIVATE.initI18n = initI18n

require('./vue.polyfill')

/* ================start window全局变量=================== */
window.$ = jquery
window.jQuery = jquery
window._ = lodash
window.$script = $script
window.Vue = Vue

/* ================end window全局变量=================== */

// 同步获取app的config信息, 在app启动时第一步执行
function appInit() {
  $.ajax({
    async: false,
    url: './config.json'
  }).done((res) => {
    setConfig(res)
  })
}

// 初始化国际化 获取config信息后第二步执行
function initI18n(i18nData) {
  var langUrl = './' + (getConfig()['LANG'] || 'cn') + '.lang.json'
  $.ajax({
    async: false,
    url: langUrl
  }).done((res) => {
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
  initLoadingAnimation()
  boot(store, routes)
}
