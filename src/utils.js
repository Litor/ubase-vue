import jquery from './jquery'
import {
  Vue
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

/* =================APP loading动画===================== */
let loadingCss = '.app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:fixed;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:9999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s;opacity:1;}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}'

function initLoadingAnimation() {
  var style = document.createElement('style')
  style.innerText = loadingCss
  document.getElementsByTagName('head')[0].appendChild(style)
  $('body').append('  <div class="app-ajax-loading" style="position:fixed;z-index:30000;background-color:rgba(0,0,0,0);"></div><div class="app-loading"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>')
}

function showLoading() {
  $('.app-loading').addClass('app-loading-show')
}

function hideLoading() {
  $('.app-loading').removeClass('app-loading-show')
}

/* =================/APP loading动画===================== */

function setRequestAnimation() {
  jquery.ajaxSetup({
    beforeSend(xhr, request) {
      xhr.setRequestHeader('Content-Type', 'application/json')
      showLoading()
    },

    complete() {
      hideLoading()
    }
  })

  var originParamMethod = jquery.param

  // 如果是get请求 则按原来方式处理 如果是post请求 则序列化为json字符串
  jquery.param = function (data, traditinal, source) {
    if(source && source.type == 'GET'){
      return originParamMethod(data)
    }
    if (typeof(data) == 'object') {
      return JSON.stringify(data)
    } else {
      return data
    }
  }

  Vue.http.interceptors.push({
    request(request) {
      showLoading()
      return request
    },
    response(reponse) {
      hideLoading()
      return reponse
    }
  })
}

export {
  initLoadingAnimation,
  getConfig,
  setConfig,
  setRouter,
  getRouter,
  setAppRoot,
  getAppRoot,
  setStore,
  getStore,
  preLoadResource,
  showLoading,
  hideLoading,
  setRequestAnimation,
  updateState
}
