import {
  Vue,
  VueRouter,
  VueResource,
  Vuex,
  i18n
} from './lib'

import locales from './locales.js'
import jquery from 'jquery'
import lodash from 'lodash'
import boot from './boot'
require('jquery.nicescroll')
import {
  setConfig,
  renderDebugAppListMenu,
  setLoadingStyle,
  tipPop,
  dialog,
  tipDialog,
  propertyDialog,
  paperDialog
} from './utils'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

/* ================start window全局变量=================== */
window.$ = jquery
window.jQuery = jquery
window._ = lodash
window.UBASE_STARTAPP = startApp
window.UBASE_INIT = appInit
window.UBASE_INITI18N = initI18n
window.Vue = Vue

/* ================end window全局变量=================== */

/* ================定义弹框类组件=================== */
Vue.paperDialog = paperDialog
Vue.propertyDialog = propertyDialog
Vue.tipDialog = tipDialog
Vue.tipPop = tipPop
Vue.dialog = dialog

/* ================end 定义弹框类组件=================== */

// 应用启动入口
function startApp(app, store, routes) {
  renderDebugAppListMenu()
  setLoadingStyle()
  var configObj = window.APP_CONFIG
  setConfig(configObj)
  boot(store, routes, configObj)
}

// 同步获取app的config信息, 在app启动时第一步执行
function appInit() {
  $.ajax({
    async: false,
    url: './config.json'
  }).done(function(res) {
    window.APP_CONFIG = res
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
    lang: window.APP_CONFIG['LANG'] || 'cn',
    locales: i18nSTORE.state.locales,
  })
}
