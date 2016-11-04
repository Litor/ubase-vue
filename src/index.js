import {
  Vue,
  Vuex,
  i18n
} from './lib'

import locales from './locales.js'
import jquery from 'jquery'
import lodash from 'lodash'
import {boot, router} from './boot'
import {
  setConfig,
  initLoadingAnimation,
  showLoading,
  hideLoading,
} from './utils'

window.UBASE = {}
window.UBASE.showLoading = showLoading
window.UBASE.hideLoading = hideLoading
window.UBASE.router = router
window.UBASE.startApp = startApp
window.UBASE.init = appInit
window.UBASE.initI18n = initI18n

require('jquery.nicescroll')
require('./vue.polyfill')

/* ================start window全局变量=================== */
window.$ = jquery
window.jQuery = jquery
window._ = lodash

// deprecated
window.UBASE_STARTAPP = startApp
window.UBASE_INIT = appInit
window.UBASE_INITI18N = initI18n

window.Vue = Vue

/* ================end window全局变量=================== */

// 同步获取app的config信息, 在app启动时第一步执行
function appInit(next) {
  $.ajax({
    async: false,
    url: './config.json'
  }).done(function (res) {
    window.UBASE.config = res
    setConfig(res)
    window.APP_CONFIG.afterGetConfig && window.APP_CONFIG.afterGetConfig(res)
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
    lang: window.UBASE.config['LANG'] || 'cn', // 如果config中没有配置LANG，默认使用cn
    locales: i18nSTORE.state.locales,
  })
}

// 应用启动入口
function startApp(unused, store, routes) {
  addUpdateStateMethod(store)
  initLoadingAnimation()
  boot(store, routes)
}

function addUpdateStateMethod(store) {
  Vue.updateState = function (vuexName, stateOptions) {
    var vuex = store.modules[vuexName]
    _.each(_.keys(stateOptions), function (item) {
      _.set(vuex.state, item, stateOptions[item])
    })
  }
}
