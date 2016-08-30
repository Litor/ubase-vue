import {
  Vue,
  VueRouter,
  VueResource,
  Vuex,
  i18n
} from './lib'
import app from './app'
import { preLoadResouce, setContentMinHeight, setCurrentRoute, reselectHeaderNav, setRouter } from './utils'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(Vuex)
window.Vue = Vue

const router = new VueRouter({
  root: '',
  linkActiveClass: 'active',
  hashbang: true
})
setRouter(router)

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

function boot(store, routes, config) {
  store = new Vuex.Store(store)
  router.map(routes)
  Vue.use(i18n, {
    lang: config['LANG'] || 'cn',
    locales: store.state.locales,
  })
  addRouteActiveEvent(routes)
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

// 对传过来的路由配置信息做进一步处理 咱不使用
function addRouteActiveEvent(routes) {
  return
  _.each(_.keys(routes), function(key) {
    let route = routes[key]
    let isAsync = typeof(route.component) === 'function'
    console.log(isAsync)
    if (isAsync) {
      let oldCompnent = route.component
      route.component = function(resolve) {
        oldCompnent(resolve)
        resolve.done(function() {
          alert(11)
        })
      }
    }

  })
}

export default boot
