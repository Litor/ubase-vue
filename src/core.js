import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'
import app from './app'
import { browserDefine, browserRequire } from './require'

window.browserDefine = browserDefine
window.browserRequire = browserRequire

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

const router = new VueRouter({
  root: '',
  linkActiveClass: 'active',
  hashbang: true
})

window.STARTAPP = function(store, routes) {
  store = new Vuex.Store(store)
  router.map(routes)

  browserRequire(['text!./config.json'], function(config) {
    var configObj = null
    eval('configObj = ' + config)
    router.start(Vue.extend({
      components: {
        app
      },
      data: () => ({
        config: configObj
      }),
      store: store
    }), document.body)
  })

}
