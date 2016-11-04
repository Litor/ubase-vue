(function () {
  var gCurrentRoute = null
  var gRouter = null
  var showLoading = window.UBASE.showLoading
  var hideLoading = window.UBASE.hideLoading
  var gConfig = null
  var gRoutes = []

  window.APP_CONFIG.beforeInit = function (config, router, routes) {
    gConfig = config
    gRouter = router
    setModules(routes)
    window.APP_CONFIG.publicCss = getPublicCss()
    window.APP_CONFIG.publicNormalJs = getPublicNormalJs()
    window.APP_CONFIG.publicBaseJs = getPublicBaseJs()

    setRouterAfterEach()
  }

  window.APP_CONFIG.afterInit = function afterInit() {
    var miniModeConfig = gConfig['MINI_MODE']
    var userParams = getUserParams()

    setContentMinHeight($('body').children('main').children('article'))
    $('body').css('overflow-y', 'scroll')
    $(window).resize(function () {
      // 给外层的container添加最小高度
      setContentMinHeight($('body').children('main').children('article'))
    })
    // 阻止下拉框的事件冒泡  防止点击下拉后 poppver 自动关闭
    $(document).on('click.bhRules.stop', '.jqx-listbox, .jqx-calendar, .jqx-dropdownbutton-popup', function (e) {
      e.stopPropagation();
    })

    initFooter()
    renderHeader()
    setModules()

    if (miniModeConfig || userParams['min'] == '1') {
      miniMode()
    }
  }

  var resource = {
    'RESOURCE_VERSION': '100003',
    'PUBLIC_CSS': [

      '/fe_components/iconfont/iconfont.css',
      '/fe_components/jqwidget/{{theme}}/bh{{version}}.min.css',
      '/fe_components/jqwidget/{{theme}}/bh-scenes{{version}}.min.css'
    ],

    'PUBLIC_BASE_JS': [
      '/fe_components/bh_utils.js',
      '/fe_components/emap{{version}}.js',
      '/fe_components/amp/ampPlugins.min.js',
      '/fe_components/jqwidget/globalize.js'
    ],

    'MOCK_JS': [
      '/fe_components/mock/mock.js'
    ],

    'PUBLIC_NORMAL_JS': [
      '/fe_components/bh{{version}}.js',
      '/fe_components/jqwidget/jqxwidget.min.js',
      '/fe_components/mock/getmock.js'
    ]
  }

  Vue.mixin({
    ready: function () {
      var self = this
      var vuex = this.$options.vuex
      if (vuex && vuex.getters) {
        var $body = $('body')
        setContentMinHeight($body.children('main').children('article'))
        hideLoading()
      }

      // emapcard的事件綁定
      $(this.$el).on('click', '.card-opt-button', function (e) {
        var row = $(this).data('row');
        var event = $(this).attr('data-event');
        if (row && event) {
          self.$emit(event, row);
        }
      })
    }
  })

  function setRouterAfterEach(){
    gRouter.afterEach(function (transition) {
      gCurrentRoute = transition.to.path.substr(1)
      showLoading()

      // 主菜单切换时， 隐藏内容区域，切换后的菜单内容组件渲染完成后会自动显示出来
      $('body>main>article>*').css('display', 'none')
      Vue.nextTick(function () {
        $('.bh-paper-pile-dialog').remove()
        $('.sc-container').removeClass('bh-border-transparent bh-bg-transparent')
        var $body = $('body')
        $body.children('[bh-footer-role=footer]').removeAttr('style')
        setContentMinHeight($body.children('main').children('article'))
        reselectHeaderNav()
        setTimeout(function () {
          $body.children('main').children('article[bh-layout-role=navLeft]').children('section').css('width', 'initial')
        }, 10)
        try {
          $('.jqx-window').jqxWindow('destroy')
        } catch (e) {
          //
        }
      })

    })
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

  /**
   * ubase-vue 配置
   * */

// 框架初始化结束钩子


  // 只留页面主体部分， 用于iframe嵌入到其他页面
  function miniMode() {
    $('header').hide();
    $('footer').remove();
    $('main').css({
      'margin-top': '0',
      'max-width': 'none',
      'width': '100%',
      'padding': '0'
    });

    $(document).trigger('resize');
  }

  function getUserParams() {
    var params = {};
    var search = location.search && location.search.substr(1);

    if (search) {
      var paramsArr = search.split('&');
      _.each(paramsArr, function (item) {
        var kv = item.split('=');
        if (kv.length == 2) {
          params[kv[0]] = kv[1];
        }
      })
    }

    return params;
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

    if (!hash && appEntry) {
      gRouter.go('/' + appEntry)
    }
    var nav = []

    for (var i = 0; i < gRoutes.length; i++) {
      (function () {
        var navItem = {
          title: gRoutes[i].title,
          route: gRoutes[i].route,
          hide: gRoutes[i].hide,
          href: '#/' + gRoutes[i].route
        }

        nav.push(navItem)
      })()
    }

    for (var i = 0; i < nav.length; i++) {
      if (nav[i].route === (hash || appEntry)) {
        nav[i].active = true
      }
    }

    headerData['title'] = appTitle
    headerData['nav'] = nav

    $('body').children('header').bhHeader(headerData)
  }

  function setModules(routes) {
    var routers = _.keys(routes)

    _.each(routers, function (router) {
      if (!routes[router].title) {
        return
      }
      gRoutes.push({
        title: routes[router].title,
        route: router.substr(1)
      })
    })
  }

  function getCdn() {
    return gConfig['RESOURCE_SERVER'] || 'http://res.wisedu.com'
  }

  function getPublicCss() {
    var config = gConfig
    var cdn = getCdn()
    var publicCss = resource['PUBLIC_CSS']
    var bhVersion = config['BH_VERSION']
    var version = bhVersion ? ('-' + bhVersion) : ''
    var theme = config['THEME'] || 'blue'
    var regEx = /fe_components|bower_components/
    var cssUrl = []

    for (var i = 0; i < publicCss.length; i++) {
      var url = addTimestamp(publicCss[i])
      if (regEx.test(publicCss[i])) {
        cssUrl.push(cdn + url.replace(/\{\{theme\}\}/, theme).replace(/\{\{version\}\}/, version))
      } else {
        cssUrl.push(url)
      }
    }

    return cssUrl
  }

  function getPublicNormalJs() {
    var cdn = getCdn()
    var publicNormalJs = resource['PUBLIC_NORMAL_JS']
    var bhVersion = gConfig['BH_VERSION']
    var version = bhVersion ? ('-' + bhVersion) : ''
    var deps = []

    var regEx = /fe_components|bower_components/
    for (var i = 0; i < publicNormalJs.length; i++) {
      var url = addTimestamp(publicNormalJs[i])
      if (regEx.test(publicNormalJs[i])) {
        deps.push(cdn + url.replace(/\{\{version\}\}/, version))
      } else {
        deps.push(url)
      }
    }

    return deps
  }

  function getPublicBaseJs() {
    var cdn = getCdn()
    var publicBaseJs = resource['PUBLIC_BASE_JS']

    var bhVersion = gConfig['BH_VERSION']
    var version = bhVersion ? ('-' + bhVersion) : ''

    var deps = []
    var regEx = /fe_components|bower_components/

    for (var i = 0; i < publicBaseJs.length; i++) {
      var url = addTimestamp(publicBaseJs[i])
      if (regEx.test(publicBaseJs[i])) {
        deps.push(cdn + url.replace(/\{\{version\}\}/, version))
      } else {
        deps.push(url)
      }
    }

    return deps
  }

  function addTimestamp(url) {
    var resourceVersion = resource['RESOURCE_VERSION'] || (+new Date())

    return url + '?rv=' + resourceVersion
  }


  /* =================弹框类组件vue全局封装===================== */
  function tip(parentVmOrOptions, type) {
    if (!parentVmOrOptions._uid && !parentVmOrOptions._unlinkFn) {
      $.bhTip(parentVmOrOptions)
    } else {
      // deprecated
      $.bhTip(parentVmOrOptions.pageopt.tip[type])
    }
  }

  function toast(parentVmOrOptions, type) {
    var options = parentVmOrOptions

    // deprecated
    if (parentVmOrOptions._uid && parentVmOrOptions._unlinkFn) {
      options = parentVmOrOptions.pageopt.toast[type]
    }

    // 如果没有指定buttons则设置默认
    if (!options.buttons && (options.okText || options.okEvent || options.cancelText || options.cancelEvent)) {
      options.buttons = [{
        text: options.okText || '确认',
        callback: function (e) {
          options.okEvent && gRouter.app.$broadcast(options.okEvent)
        }
      }, {
        text: options.cancelText || '取消',
        callback: function (e) {
          options.cancelEvent && gRouter.app.$broadcast(options.cancelEvent)
        }
      }]
    }
    $.bhDialog(options)
  }

  function propertyDialog(parentVmOrOptions) {
    if (parentVmOrOptions === 'hide') {
      $.bhPropertyDialog.hide({
        destroy: true
      })
      gRouter.app.$refs.ubase_propertydialog && gRouter.app.$refs.ubase_propertydialog.$destroy(false, true)
      return
    }

    gRouter.app.ubasePropertyDialog = parentVmOrOptions

    $.bhPropertyDialog.show({
      title: '<span v-html="ubasePropertyDialog.title"></span>',
      content: '<component :is="ubasePropertyDialog.currentView" v-ref:ubase_propertydialog></component>',
      footer: 'default',
      compile: function ($header, $section, $footer, $aside) {
        gRouter.app.$compile($section[0].parentElement.parentElement)
      },
      ready: function ($header, $section, $footer, $aside) {

      },
      ok: function () {
        gRouter.app.$broadcast(gRouter.app.ubasePropertyDialog.okEvent)
        return false
      },
      hide: function () {
        gRouter.app.$refs.ubase_propertydialog && gRouter.app.$refs.ubase_propertydialog.$destroy(false, true)
      },
      close: function () {
        gRouter.app.$refs.ubase_propertydialog && gRouter.app.$refs.ubase_propertydialog.$destroy(false, true)
      },
      cancel: function () {
        gRouter.app.$refs.ubase_propertydialog && gRouter.app.$refs.ubase_propertydialog.$destroy(false, true)
      }
    })

    if (gRouter.app.ubasePropertyDialog.footerShow === undefined || gRouter.app.ubasePropertyDialog.footerShow === true) {
      $.bhPropertyDialog.footerShow()
    }

  }

  function paperDialog(parentVmOrOptions) {
    if (parentVmOrOptions === 'hide') {
      $.bhPaperPileDialog.hide()
      gRouter.app.$refs.ubase_paperdialog && gRouter.app.$refs.ubase_paperdialog.$destroy(false, true)
      return
    }

      var paperdialogElem = $('<div id="ubase-vue-temp-paperdialog-content"><component v-ref:ubase_paperdialog :is="ubasePaperDialog.currentView"></component></div>')
      gRouter.app.ubasePaperDialog = parentVmOrOptions
      gRouter.app.$compile(paperdialogElem[0])

      $.bhPaperPileDialog.show({
        title: parentVmOrOptions.title,
        content: gRouter.app.$refs.ubase_paperdialog.$options.template,
        compile: function ($header, $section, $footer, $aside) {

          var ubase_paperdialog = gRouter.app.$refs.ubase_paperdialog
          ubase_paperdialog.$el = $section[0].parentElement.parentElement
          ubase_paperdialog.$compile($section[0].parentElement.parentElement)
          // 在该场景下 vue判断ready执行时机失效 需手动执行ready方法
          ubase_paperdialog.$options.ready && ubase_paperdialog.$options.ready.forEach(function (item) {
            item.bind(gRouter.app.$refs.ubase_paperdialog)()
          })
        },
        close: function () {
          gRouter.app.$refs.ubase_paperdialog && gRouter.app.$refs.ubase_paperdialog.$destroy(false, true)
        }
      })
  }

  function dialog(parentVmOrOptions) {
    if (parentVmOrOptions === 'hide') {
      BH_UTILS.bhWindow.close && BH_UTILS.bhWindow.close()
      gRouter.app.$refs.ubase_dialog && gRouter.app.$refs.ubase_dialog.$destroy(false, true)
      return
    }
    gRouter.app.ubaseDialog = parentVmOrOptions
    var options = parentVmOrOptions
    var params = options.params || {}
    var title = options.title,
      content = '<component :is="ubaseDialog.currentView" v-ref:ubase_dialog></component>',
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
    params.userClose = params.close
    params.close = function () {
      params.userClose && params.userClose()
      gRouter.app.$refs.ubase_dialog && gRouter.app.$refs.ubase_dialog.$destroy(false, true)
    }

    var callback = function () {
      gRouter.app.$broadcast(options.okEvent)
      return false
    }
    var win = BH_UTILS.bhWindow(content, title, btns, params, callback)
    Vue.nextTick(function () {
      gRouter.app.$compile(win[0])
    })
    return win
  }

  function pop(options) {
    if (options === 'hide') {
      $.bhPopOver.close()
      gRouter.app.$refs.pop_dialog && gRouter.app.$refs.pop_dialog.$destroy(false, true)
      return
    }

    gRouter.app.popDialog = options
    var userClose = options.close
    options.content = '<component :is="popDialog.currentView" v-ref:pop_dialog></component>'
    options.close = function (a, b, c) {
      gRouter.app.$refs.pop_dialog && gRouter.app.$refs.pop_dialog.$destroy(false, true)
      userClose && userClose(a, b, c)
    }

    $.bhPopOver(options)

    gRouter.app.$compile($('#bhPopover')[0])
  }

  function resetFooter() {
    $.bhPaperPileDialog.resetPageFooter()
    $.bhPaperPileDialog.resetDialogFooter()
  }

  Vue.paperDialog = paperDialog
  Vue.propertyDialog = propertyDialog
  Vue.tip = tip
  Vue.toast = toast
  Vue.dialog = dialog
  Vue.pop = pop
  Vue.resetFooter = resetFooter

  /* =================/弹框类组件vue全局封装===================== */
})()