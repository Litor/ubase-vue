import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'
import app from './app'
import {
  preLoadResource,
  setRouter,
  showLoading,
  hideLoading,
  getConfig,
  setRootApp,
  setRequestAnimation
} from './utils'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)

setRequestAnimation()

const router = new VueRouter({
  root: '',
  linkActiveClass: 'active',
  hashbang: true
})
setRouter(router)

function boot(store, routes) {
  var config = getConfig()
  store = new Vuex.Store(store)
  router.map(routes)

  preLoadResource(function () {
    router.start(Vue.extend({
      components: {
        app
      },
      data: () => ({
        config: config
      }),
      ready(){
        Vue.nextTick(function () {
          Vue.broadcast = router.app.$broadcast.bind(router.app)
          setRootApp(router.app.$children[0])
        });
      },
      store: store
    }), document.getElementsByTagName('main')[0])


  }, routes)
}


export  {boot, router}
