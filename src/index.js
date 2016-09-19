import {
  Vue,
  VueRouter,
  VueResource,
  Vuex,
  i18n
} from './lib'

import locales from './apptools/appindex/locales.js'
import jquery from 'jquery'
import lodash from 'lodash'
import boot from './boot'
require('jquery.nicescroll')
import { setConfig, renderDebugAppListMenu, getCurrentApp, setLoadingStyle } from './utils'

/* ================start window全局变量=================== */

window.$ = jquery
window.jQuery = jquery
window._ = lodash
window.UBASE_STARTAPP = startApp
window.UBASE_INITI18N = initI18n
window.UBASE_INIT = appInit
window.Vue = Vue

/* ================end window全局变量=================== */

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

// 应用启动入口
function startApp(app, store, routes) {
  renderDebugAppListMenu()
  setLoadingStyle()
  var configObj = window.APP_CONFIG
  setConfig(configObj)
  boot(store, routes, configObj)
}

// 加载app对应的js
function switchApp(apppath) {
  document.getElementById('current-app') && document.getElementById('current-app').remove()
  var head = document.getElementsByTagName('head')[0]
  var script = document.createElement('script')
  script.src = './' + apppath + '.js'
  script.type = 'text/javascript'
  script.id = 'current-app'
  head.appendChild(script)
}

function initI18n(i18nData) {
  var i18nSTORE = {
    state: {},
    actions: [],
    mutations: [],
    modules: {},
  }
  i18nSTORE.modules.locales = locales(i18nData)
  window.UBASE_CHANGELANG = i18nSTORE.modules.locales.actions.changeLang
  i18nSTORE = new Vuex.Store(i18nSTORE)
  Vue.use(i18n, {
    lang: window.APP_CONFIG['LANG'] || 'cn',
    locales: i18nSTORE.state.locales,
  })

}

function appInit() {
  $.ajax({
    async: false,
    url: './config.json'
  }).done(function(res) {
    window.APP_CONFIG = res
  })
}

// 初始化
var initRoute = getCurrentApp()
if (initRoute) {
  switchApp(initRoute)
} else {
  // 该分支只会在开发模式进入，没有指定app时 默认取applist中的第一个app进入
  let appList = window.UBASE_APPLIST
  if (appList) {
    location.hash = '#!/' + appList[0]
    switchApp(appList[0])
  }
}
