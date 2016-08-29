let resourceConfig = {
  'RESOURCE_VERSION': '100003',
  'PUBLIC_CSS': [
    '/fe_components/iconfont/iconfont.css',
    '/fe_components/jqwidget/{{theme}}/bh{{version}}.min.css',
    '/fe_components/jqwidget/{{theme}}/bh-scenes{{version}}.min.css',
    '/bower_components/animate.css/animate.min.css',
    '/bower_components/sentsinLayer/skin/layer.css',
    '/fe_components/bhtc/bhtc-datetimepicker/css/blue/bhtc-datetimepicker.min.css'
  ],

  'PUBLIC_BASE_JS': [
    '/fe_components/bh_utils.js',
    '/fe_components/emap{{version}}.js',
    '/fe_components/amp/ampPlugins.min.js',
    '/fe_components/jqwidget/globalize.js',
    '/bower_components/jquery.nicescroll/jquery.nicescroll.min.js',
    '/fe_components/bhtc/moment/min/moment-with-locales.min.js',

  ],

  'PUBLIC_NORMAL_JS': [
    '/fe_components/bh{{version}}.min.js',
    '/fe_components/jqwidget/jqxwidget.min.js',
    '/fe_components/bhtc/bhtc-datetimepicker/js/bhtc-datetimepicker.js',
    '/fe_components/mock/getmock.js'
  ]
}

export default resourceConfig
