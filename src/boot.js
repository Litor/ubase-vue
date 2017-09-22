import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'

import {
  preLoadResource,
  setRouter,
  getConfig,
  setAppRoot,
  manualStartApp
} from './utils'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

const router = new VueRouter({
  root: '',
  linkActiveClass: 'active',
  hashbang: true
})
setRouter(router)

function boot(store, routes) {
  var config = getConfig()

  router.map(routes)

  preLoadResource(() => {
    if(!config['MANUAL_START']){
      manualStartApp()
    }
  }, routes)
}

export {boot, router}
