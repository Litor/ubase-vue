import {
  Vue,
  Vuex,
  i18n
} from './lib'

import locales from './locales.js'
import jquery from 'jquery'
import lodash from 'lodash'
import {boot, router} from './boot'
import {invoke} from './eventManager'
import $script from 'scriptjs'

import {
  setConfig,
  getConfig,
  initLoadingAnimation,
  showLoading,
  hideLoading,
  setStore,
  updateState
} from './utils'

// Ubase对应用开发暴露的接口
window.Ubase = {}
window.Ubase.showLoading = showLoading // 异步动画显示
window.Ubase.hideLoading = hideLoading // 异步动画关闭
window.Ubase.updateState = updateState // 更新state
window.Ubase.invoke = invoke // 跨组件触发方法
window.Ubase.beforeInit = null // 定制应用启动前处理钩子 params {config，router, routes，rootApp, next}

// deprecated
Vue.updateState = updateState

window.UBASE = {}
// ubase 生成app入口文件时用的私有方法
window.UBASE.startApp = startApp
window.UBASE.init = appInit
window.UBASE.initI18n = initI18n

require('./vue.polyfill')

/* ================start window全局变量=================== */
window.$ = jquery
window.jQuery = jquery
window._ = lodash
window.$script = $script
window.Vue = Vue

/* ================end window全局变量=================== */

// 同步获取app的config信息, 在app启动时第一步执行
function appInit(next) {
  $.ajax({
    async: false,
    url: './config.json'
  }).done(function (res) {
    setConfig(res)
    next && next()
  })
}

// 初始化国际化 获取config信息后第二步执行
function initI18n(i18nData) {
  var i18nSTORE = {
    state: {},
    actions: [],
    mutations: [],
    modules: {},
  }
  i18nSTORE.modules.locales = locales(i18nData)
  i18nSTORE = new Vuex.Store(i18nSTORE)
  Vue.use(i18n, {
    lang: getConfig()['LANG'] || 'cn', // 如果config中没有配置LANG，默认使用cn
    locales: i18nSTORE.state.locales,
  })
}

// 应用启动入口
function startApp(unused, store, routes) {
  setStore(store)
  initLoadingAnimation()
  boot(store, routes)
}
