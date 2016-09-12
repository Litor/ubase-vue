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
      /*methods: {
        paperdialog(parentVm) {
          var ppp = $('<div id="ubase-vue-temp-paperdialog-content"><component v-ref:ddddd :is="pageopt.paperdialog.currentView"></component></div>')
          parentVm.$compile(ppp[0])

          $.bhPaperPileDialog.show({
            content: parentVm.$refs.ddddd.$options.template,
            ready: function($header, $section, $footer, $aside) {
              parentVm.$refs.ddddd.$compile($section[0].parentElement.parentElement)
            }
          })

        },

        propertydialog(parentVm) {
          if (parentVm === 'hide') {
            $.bhPropertyDialog.hide()
            return
          }
          $.bhPropertyDialog.show({
            title: '<span v-html="pageopt.propertydialog.title"></span>',
            content: '<component :is="pageopt.propertydialog.currentView" v-ref:ubase_propertydialog></component>',
            footer: 'default',
            compile: function($header, $section, $footer, $aside) {
              parentVm.$compile($section[0].parentElement.parentElement)
            },
            ready: function($header, $section, $footer, $aside) {

            },
            ok: function() {
              parentVm.$broadcast(parentVm.pageopt.propertydialog.okEvent)

              parentVm.$nextTick(function() {
                parentVm.$refs.ubase_propertydialog && parentVm.$refs.ubase_propertydialog.$destroy()
              })
              return false
            },
            hide: function() {
              parentVm.$refs.ubase_propertydialog && parentVm.$refs.ubase_propertydialog.$destroy()
            },
            cancel: function() {
              parentVm.$refs.ubase_propertydialog && parentVm.$refs.ubase_propertydialog.$destroy()
            }
          })
          $.bhPropertyDialog.footerShow()
        },

        tipDialog(parentVm, type) {
          $.bhDialog({
            type: parentVm.pageopt.tipDialog[type].type,
            title: parentVm.pageopt.tipDialog[type].title,
            buttons: [{
              text: '确认',
              callback: function(e) {
                parentVm.pageopt.tipDialog[type].okEvent && parentVm.$emit(parentVm.pageopt.tipDialog[type].okEvent)
              }
            }, {
              text: '取消',
              callback: function(e) {
                parentVm.pageopt.tipDialog[type].cancelEvent && parentVm.$emit(parentVm.pageopt.tipDialog[type].cancelEvent)
              }
            }]
          })
        },

        tipPop(parentVm, type) {
          $.bhTip({
            state: parentVm.pageopt.tipPop[type].state,
            content: parentVm.pageopt.tipPop[type].content,
          })
        }
      },*/
      store: store
    }), document.getElementsByTagName('main')[0])
  }, routes)
}



Vue.paperdialog = function(parentVm) {
  var ppp = $('<div id="ubase-vue-temp-paperdialog-content"><component v-ref:ddddd :is="pageopt.paperdialog.currentView"></component></div>')
  parentVm.$compile(ppp[0])

  $.bhPaperPileDialog.show({
    content: parentVm.$refs.ddddd.$options.template,
    ready: function($header, $section, $footer, $aside) {
      parentVm.$refs.ddddd.$compile($section[0].parentElement.parentElement)
    }
  })

}

Vue.propertydialog = function(parentVm) {
  if (parentVm === 'hide') {
    $.bhPropertyDialog.hide()
    return
  }
  $.bhPropertyDialog.show({
    title: '<span v-html="pageopt.propertydialog.title"></span>',
    content: '<component :is="pageopt.propertydialog.currentView" v-ref:ubase_propertydialog></component>',
    footer: 'default',
    compile: function($header, $section, $footer, $aside) {
      parentVm.$compile($section[0].parentElement.parentElement)
    },
    ready: function($header, $section, $footer, $aside) {

    },
    ok: function() {
      parentVm.$broadcast(parentVm.pageopt.propertydialog.okEvent)
      parentVm.$refs.ubase_propertydialog && parentVm.$refs.ubase_propertydialog.$destroy()
      return false
    },
    hide: function() {
      parentVm.$refs.ubase_propertydialog && parentVm.$refs.ubase_propertydialog.$destroy()
    },
    cancel: function() {
      parentVm.$refs.ubase_propertydialog && parentVm.$refs.ubase_propertydialog.$destroy()
    }
  })
  $.bhPropertyDialog.footerShow()
}

Vue.tipDialog = function(parentVm, type) {
  $.bhDialog({
    type: parentVm.pageopt.tipDialog[type].type,
    title: parentVm.pageopt.tipDialog[type].title,
    buttons: [{
      text: '确认',
      callback: function(e) {
        parentVm.pageopt.tipDialog[type].okEvent && parentVm.$emit(parentVm.pageopt.tipDialog[type].okEvent)
      }
    }, {
      text: '取消',
      callback: function(e) {
        parentVm.pageopt.tipDialog[type].cancelEvent && parentVm.$emit(parentVm.pageopt.tipDialog[type].cancelEvent)
      }
    }]
  })
}

Vue.tipPop = function(parentVm, type) {
  $.bhTip({
    state: parentVm.pageopt.tipPop[type].state,
    content: parentVm.pageopt.tipPop[type].content,
  })
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
