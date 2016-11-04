import gResource from './resource'
import $script from 'scriptjs'
import jquery from 'jquery'
import {
  Vue
} from './lib'

let gConfig = null
let gRouter = null
let gRootApp = null

// resouce中的内容在浏览器中可配置 方便emap或bh等的本地调试
let resource = sessionStorage.getItem('resource') ? JSON.parse(sessionStorage.getItem('resource')) : gResource

function preLoadResource(callback, routes) {
  beforeInitHook(gConfig, gRouter, routes)
  showLoading()
  loadCss()
  setTitle()

  loadJs(function(){
    getFixedMainLayout()
    callback()
    hideLoading()
    afterInitHook()
  })
}

function loadJs(callback) {
  let publicBaseJs = getUserConfig('publicBaseJs')
  let publicNormalJs = getUserConfig('publicNormalJs')

  if (publicBaseJs) {
    $script(publicBaseJs, function () {
      if (publicNormalJs) {
        $script(publicNormalJs, function () {
          callback()
        })
      } else {
        callback()
      }

    })
  } else if (publicNormalJs) {
    $script(publicNormalJs, function () {
      callback()
    })
  } else {
    callback()
  }
}

function beforeInitHook(config, router, routes) {
  var beforeInit = getUserConfig('beforeInit')
  beforeInit && beforeInit(config, router, routes)
}

function afterInitHook() {
  var afterInit = getUserConfig('afterInit')
  afterInit && afterInit()
}

function getUserConfig(key) {
  return window.APP_CONFIG && window.APP_CONFIG[key]
}

function init(callback) {

}

// 设置网页标题
function setTitle() {
  $('head>title').html(gConfig['APP_NAME'])
}

function getFixedMainLayout() {
  var layout = '<header></header><main><app></app></main><footer></footer>'
  $('body').prepend(layout)
}


function getConfig() {
  return gConfig
}

function setConfig(config) {
  gConfig = config
}

function getRootApp() {
  return gConfig
}

function setRootApp(rootApp) {
  gRootApp = rootApp
}

function getRouter() {
  return gRouter
}

function setRouter(router) {
  gRouter = router
}

function loadCss() {
  var publicCss = window.APP_CONFIG && window.APP_CONFIG.publicCss
  _.each(publicCss, function (item) {
    var link = document.createElement('link')
    link.type = 'text/css'
    link.rel = 'stylesheet'
    link.href = item
    document.getElementsByTagName('head')[0].appendChild(link)
  })
}

/* =================APP loading动画===================== */
let loadingCss = '.app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:absolute;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:9999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s;opacity:1;}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}'

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
    beforeSend: function () {
      showLoading()
    },

    complete: function () {
      hideLoading()
    }
  })

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
  setRootApp,
  preLoadResource,
  showLoading,
  hideLoading,
  setRequestAnimation
}
