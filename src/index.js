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
import { setConfig } from './utils'

window.browserDefine = browserDefine
window.browserRequire = browserRequire
window.$ = jquery
window.jQuery = jquery
window._ = lodash

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

//let router = null

window.STARTAPP = function(app, store, routes) {
  document.getElementById('app-container').innerHTML = '<router-view></router-view>'
    /*router && router.stop()
    router = new VueRouter({
      root: '',
      linkActiveClass: 'active',
      hashbang: true
    })*/
    //router.map(routes)
  browserRequire(['text!./config.json'], function(config) {
    var configObj = null
    eval('configObj = ' + config)
    setConfig(configObj)
    boot(store, routes, configObj)
  })

}

window.SWITCHAPP = function(apppath) {
  document.getElementById('current-app') && document.getElementById('current-app').remove()
  var head = document.getElementsByTagName('head')[0]
  var script = document.createElement('script')
  script.src = './' + apppath + '.js'
  script.type = 'text/javascript'
  script.id = 'current-app'
  head.appendChild(script)
  location.hash = '#!/' + apppath
}

var initRoute = location.hash && location.hash.substr(location.hash.indexOf('/') + 1)
if (initRoute) {
  window.SWITCHAPP(initRoute)
} else {
  $('#app-container').html('<span style="color:red;">' + initRoute + '</span> app不存在！')
}
