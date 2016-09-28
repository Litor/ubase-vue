import {
  Vue,
  VueRouter,
  VueResource,
  Vuex
} from './lib'
import app from './app'
import {
  preLoadResource,
  setContentMinHeight,
  setCurrentRoute,
  reselectHeaderNav,
  setRouter
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

function boot(store, routes, config) {
  store = new Vuex.Store(store)
  router.map(routes)

  preLoadResource(function() {
    router.start(Vue.extend({
      components: {
        app
      },
      data: () => ({
        config: config
      }),
      store: store
    }), document.getElementsByTagName('main')[0])
  }, routes)
}

router.afterEach(function(transition) {
  setCurrentRoute(transition.to.path.substr(1))

  Vue.nextTick(function() {
    $('.bh-paper-pile-dialog').remove()
    $('.sc-container').removeClass('bh-border-transparent bh-bg-transparent')
    var $body = $('body')
    $body.children('[bh-footer-role=footer]').removeAttr('style')
    setContentMinHeight($body.children('main').children('article'))
    reselectHeaderNav()
    setTimeout(function() {
      $body.children('main').children('article[bh-layout-role=navLeft]').children('section').css('width', 'initial')
    }, 10)
    try {
      $('.jqx-window').jqxWindow('destroy')
    } catch (e) {
      //
    }
  })

})

export default boot
