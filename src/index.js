import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'
import { browserDefine, browserRequire } from './require'
import jquery from 'jquery'
import lodash from 'lodash'
import boot from './boot'
import { setConfig, renderDebugAppListMenu, getCurrentApp,setLoadingStyle } from './utils'

/* ================start window全局变量=================== */

window.browserDefine = browserDefine
window.browserRequire = browserRequire
window.$ = jquery
window.jQuery = jquery
window._ = lodash
window.UBASE_STARTAPP = startApp
window.Vue = Vue

/* ================end window全局变量=================== */

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

// 应用启动入口
function startApp(app, store, routes, locales) {
  renderDebugAppListMenu()
  setLoadingStyle()
  browserRequire(['text!./config.json'], function(config) {
    var configObj = null
    eval('configObj = ' + config)
    setConfig(configObj)
    boot(store, routes, configObj)
  })
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
