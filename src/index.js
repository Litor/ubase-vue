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
  setStore,
  updateState,
  getState
} from './utils'

import {
  setConfig as setConfigForLog,
  debugLog,
  initLog
} from './log'

// Ubase对应用开发暴露的接口
window.Ubase = {}
window.Ubase.updateState = updateState // 更新state
window.Ubase.getState = getState // 更新state
window.Ubase.invoke = invoke // 跨组件触发方法
window.Ubase.beforeInit = null // 定制应用启动前处理钩子 params {config，router, routes，rootApp, next}
window.Ubase.log = debugLog // 输出日志

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
    var debugStatus = localStorage && typeof localStorage.getItem == 'function' && localStorage.getItem('debug')

    if(debugStatus){
      res['DEBUG'] = true
    }

    setConfig(res)
    setConfigForLog(res)
  })
}

// 初始化国际化 获取config信息后第二步执行
function initI18n() {
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
  initLog()
  boot(store, routes)
}
