let resourceConfig = {
  'RESOURCE_VERSION': '100003',
  'PUBLIC_CSS': [
    '/fe_components/iconfont/iconfont.css',
    '/fe_components/jqwidget/{{theme}}/bh{{version}}.min.css',
    '/fe_components/jqwidget/{{theme}}/bh-scenes{{version}}.min.css',
    '/bower_components/animate.css/animate.min.css',
    '/bower_components/sentsinLayer/skin/layer.css',
  ],

  'PUBLIC_BASE_JS': [
    '/fe_components/bh_utils.js',
    '/fe_components/emap{{version}}.js',
    '/fe_components/amp/ampPlugins.min.js',
    '/fe_components/jqwidget/globalize.js',
  ],

  'MOCK_JS': [
    '/fe_components/mock/mock.js'
  ],

  'PUBLIC_NORMAL_JS': [
    '/fe_components/bh{{version}}.min.js',
    '/fe_components/jqwidget/jqxwidget.min.js',
    '/fe_components/mock/getmock.js'
  ]
}

export default resourceConfig
