import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'
import app from './app'
import keepAliveApp from './keepAliveApp'
import {
  preLoadResource,
  setRouter,
  getConfig,
  setAppRoot
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
  var rootApp = config['CACHE'] === true ? keepAliveApp : app

  store = new Vuex.Store(store)
  router.map(routes)

  preLoadResource(() => {
    router.start(Vue.extend({
      components: {
        app: rootApp
      },
      data: () => ({
        config: config
      }),
      ready() {
        Vue.nextTick(() => {
          Vue.broadcast = router.app.$broadcast.bind(router.app)
          setAppRoot(router.app.$children[0])
        })
      },
      store: store
    }), document.getElementsByTagName('main')[0])
  }, routes)
}

export {boot, router}
