import resource from './resource'
import $script from 'scriptjs'

let gConfig = null
let gRoutes = []
let gCurrentRoute = null
let gRouter = null

function preLoadResouce(callback, routes) {
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
      setContentMinHeight($('body').children('main').children('article'))
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
  var appTitle = gConfig['APP_TITLE']

  var hash = window.location.hash
  hash = hash.replace('\#\!\/', '')

  if (hash.indexOf('/') !== -1) {
    hash = hash.substring(0, hash.indexOf('/'))
  }

  if (!hash) {
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
  let resourceVersion = gConfig['RESOURCE_VERSION'] || (+new Date())

  return url + '?rv=' + resourceVersion
}

function getPublicNormalJs() {
  let cdn = getCdn()
  let publicNormalJs = resource['PUBLIC_NORMAL_JS']
  let bhVersion = gConfig['BH_VERSION']
  let version = bhVersion ? ('-' + bhVersion) : ''
  let deps = []

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

function getCdn() {
  return 'http://res.wisedu.com'
}

export {
  getConfig,
  setConfig,
  setRouter,
  preLoadResouce,
  setContentMinHeight,
  setCurrentRoute,
  reselectHeaderNav
}
