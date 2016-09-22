import gResource from './resource'
import $script from 'scriptjs'

let gConfig = null
let gRoutes = []
let gCurrentRoute = null
let gRouter = null

// resouce中的内容在浏览器中可配置 方便emap或bh等的本地调试
let resource = sessionStorage.getItem('resource') ? JSON.parse(sessionStorage.getItem('resource')) : gResource

function preLoadResouce(callback, routes) {
  showLoading()
  loadPublicCss()
  setModules(routes)
  let publicBaseJs = getPublicBaseJs()
  let publicNormalJs = getPublicNormalJs()

  $script(publicBaseJs, function() {
    $script(publicNormalJs, function() {
      getFixedMainLayout()
      renderHeader()
      initFooter()
      callback()
      hideLoading()
      setContentMinHeight($('body').children('main').children('article'))
      $('body').css('overflow-y', 'scroll')
      $(window).resize(function() {
        // 给外层的container添加最小高度
        setContentMinHeight($('body').children('main').children('article'))
      })
    })
  })
}

function getFixedMainLayout() {
  var layout = '<header></header><main><app></app></main><footer></footer>'
  $('body').prepend(layout)
}

function reselectHeaderNav() {
  var currentIndex = 0

  for (var i = 0; i < gRoutes.length; i++) {
    if (gRoutes[i].route === gCurrentRoute) {
      currentIndex = i + 1
      break
    }
  }

  $('header').bhHeader('resetNavActive', {
    'activeIndex': currentIndex
  })
}

function setContentMinHeight($setContainer) {
  if (!$setContainer) {
    return
  }
  if ($setContainer && $setContainer.length > 0) {
    var $window = $(window)
    var windowHeight = $window.height()
    var footerHeight = $('[bh-footer-role=footer]').outerHeight()
    var headerHeight = $('[bh-header-role=bhHeader]').outerHeight()
    var minHeight = windowHeight - headerHeight - footerHeight - 1
    $setContainer.css('min-height', minHeight + 'px')
  }
}

function setModules(routes) {
  var routers = _.keys(routes)

  _.each(routers, function(router) {
    if (!routes[router].title) {
      return
    }
    gRoutes.push({
      title: routes[router].title,
      route: router.substr(1)
    })
  })
}

function initFooter() {
  var text = gConfig['FOOTER_TEXT']
  $('body').children('footer').bhFooter({
    text: text || '版权信息：© 2015 江苏金智教育信息股份有限公司 苏ICP备10204514号'
  })
}

function renderHeader() {
  var headerData = gConfig['HEADER'] || {}
  var appEntry = gRoutes.length > 0 && gRoutes[0].route
  var appTitle = gConfig['APP_NAME']

  var hash = window.location.hash
  hash = hash.replace('\#\!\/', '')

  if (hash.indexOf('/') !== -1) {
    hash = hash.substring(0, hash.indexOf('/'))
  }

  if (!hash && appEntry ) {
    gRouter.go('/' + appEntry)
  }
  var nav = []

  for (let i = 0; i < gRoutes.length; i++) {
    (function() {
      var navItem = {
        title: gRoutes[i].title,
        route: gRoutes[i].route,
        hide: gRoutes[i].hide,
        href: '#/' + gRoutes[i].route
      }

      nav.push(navItem)
    })()
  }

  for (let i = 0; i < nav.length; i++) {
    if (nav[i].route === (hash || appEntry)) {
      nav[i].active = true
    }
  }

  headerData['title'] = appTitle
  headerData['nav'] = nav

  $('body').children('header').bhHeader(headerData)
}

function getConfig() {
  return gConfig
}

function setConfig(config) {
  gConfig = config
}

function getCurrentRoute() {
  return gCurrentRoute
}

function setCurrentRoute(currentRoute) {
  gCurrentRoute = currentRoute
}

function getRouter() {
  return gRouter
}

function setRouter(router) {
  gRouter = router
}

function loadPublicCss() {
  let cdn = getCdn()
  let publicCss = resource['PUBLIC_CSS']
  let bhVersion = gConfig['BH_VERSION']
  let version = bhVersion ? ('-' + bhVersion) : ''
  let theme = gConfig['THEME'] || 'blue'

  let regEx = /fe_components|bower_components/

  for (let i = 0; i < publicCss.length; i++) {
    let url = addTimestamp(publicCss[i])
    if (regEx.test(publicCss[i])) {
      loadCss(cdn + url.replace(/\{\{theme\}\}/, theme).replace(/\{\{version\}\}/, version))
    } else {
      loadCss(url)
    }
  }
}

function loadCss(url) {
  var link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.href = url
  document.getElementsByTagName('head')[0].appendChild(link)
}

function addTimestamp(url) {
  let resourceVersion = resource['RESOURCE_VERSION'] || (+new Date())

  return url + '?rv=' + resourceVersion
}

function getPublicNormalJs() {
  let cdn = getCdn()
  let publicNormalJs = resource['PUBLIC_NORMAL_JS']
  let bhVersion = gConfig['BH_VERSION']
  let debugMode = gConfig['FE_DEBUG_MODE']
  let version = bhVersion ? ('-' + bhVersion) : ''
  let debugJs = resource['MOCK_JS']
  let deps = []

  if (debugMode) {
    publicNormalJs = publicNormalJs.concat(debugJs)
  }

  let regEx = /fe_components|bower_components/
  for (let i = 0; i < publicNormalJs.length; i++) {
    let url = addTimestamp(publicNormalJs[i])
    if (regEx.test(publicNormalJs[i])) {
      deps.push(cdn + url.replace(/\{\{version\}\}/, version))
    } else {
      deps.push(url)
    }
  }

  return deps
}

function getPublicBaseJs() {
  let cdn = getCdn()
  let publicBaseJs = resource['PUBLIC_BASE_JS']

  let bhVersion = gConfig['BH_VERSION']
  let version = bhVersion ? ('-' + bhVersion) : ''

  let deps = []
  let regEx = /fe_components|bower_components/

  for (let i = 0; i < publicBaseJs.length; i++) {
    let url = addTimestamp(publicBaseJs[i])
    if (regEx.test(publicBaseJs[i])) {
      deps.push(cdn + url.replace(/\{\{version\}\}/, version))
    } else {
      deps.push(url)
    }
  }

  return deps
}

// 渲染开发模式模拟APP切换的菜单
function renderDebugAppListMenu() {
  var appList = window.UBASE_APPLIST
  if (!appList) {
    return
  }

  $('body').prepend('<div id="app-nav" style="font-family:\'Hiragino Sans GB\';font-size:12px;width:100%;border-bottom:2px solid gray;position: fixed;top: 0;z-index: 9999;background-color: #fff;opacity: 0.3;"></div>')
  appList.forEach(function(item) {
    $('body>#app-nav').append('<div style="display:inline-block;padding:0 6px;cursor:pointer;" data-routepath="' + item + '">' + item + '</div>')
  })

  $('body>#app-nav>div').bind('click', function(item) {
    var routePath = $(this).attr('data-routepath')
    $('#app-nav>div').removeClass('app-nav-selected')
    $('#app-nav>div[data-routepath="' + routePath + '"]').addClass('app-nav-selected')
    window.location.href = window.location.href.replace(/\#\!\/(.*)/, '#!/' + routePath)
    location.reload()
  })

  let currentApp = getCurrentApp()

  $('body>#app-nav').find('[data-routepath=' + currentApp + ']').css('background-color', '#ccc')
}

// 获取hash中当前app的名称
function getCurrentApp() {
  let app = location.hash && location.hash.substr(location.hash.indexOf('/') + 1)
  if (app.indexOf('/') > 0) {
    app = app.substring(0, app.indexOf('/'))
  }

  return app
}

/* =================APP loading动画===================== */
let loadingCss = '.app-ajax-loading .bh-loader-icon-line-border{border: 0px solid #ddd;box-shadow:none;}.app-ajax-loading{position:fixed;z-index:30000;}.app-loading{position:absolute;opacity:0;top:150px;left:-75px;margin-left:50%;z-index:-1;text-align:center}.app-loading-show{z-index:9999;animation:fade-in;animation-duration:0.5s;-webkit-animation:fade-in 0.5s;opacity:1;}@keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}@-webkit-keyframes fade-in{0%{opacity:0}50%{opacity:.4}100%{opacity:1}}.spinner>div{width:30px;height:30px;background-color:#4DAAF5;border-radius:100%;display:inline-block;-webkit-animation:bouncedelay 1.4s infinite ease-in-out;animation:bouncedelay 1.4s infinite ease-in-out;-webkit-animation-fill-mode:both;animation-fill-mode:both}.spinner .bounce1{-webkit-animation-delay:-.32s;animation-delay:-.32s}.spinner .bounce2{-webkit-animation-delay:-.16s;animation-delay:-.16s}@-webkit-keyframes bouncedelay{0%,100%,80%{-webkit-transform:scale(0)}40%{-webkit-transform:scale(1)}}@keyframes bouncedelay{0%,100%,80%{transform:scale(0);-webkit-transform:scale(0)}40%{transform:scale(1);-webkit-transform:scale(1)}}'

function setLoadingStyle() {
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

/* =================弹框类组件vue全局封装===================== */
function tipPop(parentVm, type) {
  $.bhTip({
    state: parentVm.pageopt.tipPop[type].state,
    content: parentVm.pageopt.tipPop[type].content,
  })
}

function tipDialog(parentVm, type) {
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

function propertyDialog(parentVm) {
  if (parentVm === 'hide') {
    $.bhPropertyDialog.hide({
      destroy: true
    })
    $.bhPropertyDialog.dynamicVueComp && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog.$destroy()
    return
  }
  $.bhPropertyDialog.dynamicVueComp = parentVm
  $.bhPropertyDialog.show({
    title: '<span v-html="pageopt.propertyDialog.title"></span>',
    content: '<component :is="pageopt.propertyDialog.currentView" v-ref:ubase_propertydialog></component>',
    footer: 'default',
    compile: function($header, $section, $footer, $aside) {
      parentVm.$compile($section[0].parentElement.parentElement)
    },
    ready: function($header, $section, $footer, $aside) {

    },
    ok: function() {
      parentVm.$broadcast(parentVm.pageopt.propertyDialog.okEvent)
      return false
    },
    hide: function() {
      $.bhPropertyDialog.dynamicVueComp && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog.$destroy()
    },
    close: function() {
      $.bhPropertyDialog.dynamicVueComp && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog.$destroy()
    },
    cancel: function() {
      $.bhPropertyDialog.dynamicVueComp && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog && $.bhPropertyDialog.dynamicVueComp.$refs.ubase_propertydialog.$destroy()
    }
  })

  if (parentVm.pageopt.propertyDialog.footerShow === undefined || parentVm.pageopt.propertyDialog.footerShow === true) {
    $.bhPropertyDialog.footerShow()
  }

}

function paperDialog(parentVm) {
  if (parentVm === 'hide') {
    $.bhPaperPileDialog.hide()
    return
  }
  var paperdialogElem = $('<div id="ubase-vue-temp-paperdialog-content"><component v-ref:ubase_paperdialog :is="pageopt.paperDialog.currentView"></component></div>')
  parentVm.$compile(paperdialogElem[0])

  $.bhPaperPileDialog.show({
    title: parentVm.pageopt.paperDialog.title,
    content: parentVm.$refs.ubase_paperdialog.$options.template,
    compile: function($header, $section, $footer, $aside) {
      let ubase_paperdialog = parentVm.$refs.ubase_paperdialog

      ubase_paperdialog.$el = $section[0].parentElement.parentElement
      ubase_paperdialog.$compile($section[0].parentElement.parentElement)
        // 在该场景下 vue判断ready执行时机失效 需手动执行ready方法
      ubase_paperdialog.$options.ready && ubase_paperdialog.$options.ready.forEach(function(item) {
        item.bind(parentVm.$refs.ubase_paperdialog)()
      })
    }
  })
}

function dialog(parentVm) {
  if (parentVm === 'hide') {
    BH_UTILS.bhWindow.close()
    BH_UTILS.bhWindow.dynamicVueComp && BH_UTILS.bhWindow.dynamicVueComp.$refs.ubase_dialog && BH_UTILS.bhWindow.dynamicVueComp.$refs.ubase_dialog.$destroy()
    return
  }
  
  BH_UTILS.bhWindow.dynamicVueComp = parentVm
  var options = parentVm.pageopt.dialog
  var params = options.params || {}
  var title = options.title,
    content = '<component :is="pageopt.dialog.currentView" v-ref:ubase_dialog></component>',
    btns = options.buttons || options.btns

  if (options.width) {
    params.width = options.width
  }
  if (options.height) {
    params.height = options.height
  }
  if (options.inIframe) {
    params.inIframe = options.inIframe
  }
  params.userClose =  params.close
  params.close = function(){
    params.userClose && params.userClose()
    BH_UTILS.bhWindow.dynamicVueComp && BH_UTILS.bhWindow.dynamicVueComp.$refs.ubase_dialog && BH_UTILS.bhWindow.dynamicVueComp.$refs.ubase_dialog.$destroy()
  }

  let callback = function() {
    parentVm.$broadcast(parentVm.pageopt.dialog.okEvent)
    return false
  }
  let win = BH_UTILS.bhWindow(content, title, btns, params, callback)
  parentVm.$compile(win[0])
  return win
}

/* =================/弹框类组件vue全局封装===================== */

function getCdn() {
  return gConfig['RESOURCE_SERVER'] || 'http://res.wisedu.com'
}

export {
  setLoadingStyle,
  getConfig,
  setConfig,
  setRouter,
  preLoadResouce,
  setContentMinHeight,
  setCurrentRoute,
  reselectHeaderNav,
  renderDebugAppListMenu,
  getCurrentApp,
  tipPop,
  tipDialog,
  propertyDialog,
  paperDialog,
  dialog
}
