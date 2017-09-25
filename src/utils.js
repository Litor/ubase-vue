import app from './app'
import keepAliveApp from './keepAliveApp'
import {
  Vuex
} from './lib'

let gConfig = {}
let gRouter = null
let gAppRoot = null
let gStore = null

function preLoadResource(next, routes) {
  var beforeInit = getUserConfig('beforeInit')

  getFixedMainLayout()
  setTitle()

  if (beforeInit) {
    beforeInit({
      config: gConfig,
      router: gRouter,
      routes: routes,
      next: next
    })
  } else {
    next()
  }

}

function getUserConfig(key) {
  return window.Ubase[key]
}

// 设置网页标题
function setTitle() {
  $('head>title').html(gConfig['APP_NAME'])
}

function getFixedMainLayout() {
  var layout = '<header></header><main><app></app></main><footer></footer>'
  $('body').prepend(layout)
}

function updateState(vuexName, stateOptions) {
  var vuex = gStore.modules[vuexName]
  _.each(_.keys(stateOptions), (item) => {
    _.set(vuex.state, item, stateOptions[item])
  })
}

function getState(vuexName) {
  var vuex = gStore.modules[vuexName]
  var copyState = _.cloneDeep(vuex)
  return copyState && copyState.state
}

function manualStartApp(){
  Vue.prototype.$nextTick(function () {
    var rootApp = gConfig['CACHE'] === true ? keepAliveApp : app
    var store = new Vuex.Store(gStore)
    gRouter.start(Vue.extend({
      components: {
        app: rootApp
      },
      data: () => ({
        config: gConfig
      }),
      ready() {
        Vue.nextTick(() => {
          Vue.broadcast = gRouter.app.$broadcast.bind(gRouter.app)
          setAppRoot(gRouter.app.$children[0])
        })
      },
      store: store
    }), document.getElementsByTagName('main')[0])
  })
}


function getConfig() {
  return gConfig || {}
}

function setConfig(config) {
  gConfig = config
}

function getAppRoot() {
  return gAppRoot
}

function setAppRoot(appRoot) {
  gAppRoot = appRoot
}

function getRouter() {
  return gRouter
}

function setRouter(router) {
  gRouter = router
}

function getStore() {
  return gStore
}

function setStore(store) {
  gStore = store
}

export {
  getConfig,
  setConfig,
  setRouter,
  getRouter,
  setAppRoot,
  getAppRoot,
  setStore,
  getStore,
  preLoadResource,
  updateState,
  getState,
  manualStartApp
}
