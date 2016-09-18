import {
  Vue,
  VueRouter,
  VueResource,
  Vuex,
  i18n
} from './lib'
import app from './app'
import { preLoadResouce, setContentMinHeight, setCurrentRoute, reselectHeaderNav, setRouter, tipPop, dialog, tipDialog, propertyDialog, paperDialog } from './utils'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)
window.Vue = Vue
window.Vuex = Vuex
window.i18n = i18n

const router = new VueRouter({
  root: '',
  linkActiveClass: 'active',
  hashbang: true
})
setRouter(router)

function boot(store, routes, config) {
  store = new Vuex.Store(store)
  router.map(routes)

  preLoadResouce(function() {
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

Vue.paperDialog = paperDialog
Vue.propertyDialog = propertyDialog
Vue.tipDialog = tipDialog
Vue.tipPop = tipPop
Vue.dialog = dialog

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
