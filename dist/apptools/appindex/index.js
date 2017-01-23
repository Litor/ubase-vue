'use strict';

require('{{ubase_vue}}');

// 等app定制文件加载完成后进行初始化
window.onload = function () {
  // 初始化（获取config.json信息）
  '{{configInitStatement}}'.then(function () {
    // 初始化国际化信息
    '{{i18nInitStatement}}'.then(function () {
      require('{{indexHtml}}');
      '{{configRequireStatement}}';

      // 国际化文件导入
      '{{i18nRequireStatements}}';

      '{{routes}}';

      '{{stateImportStatements}}';
      '{{vueComponentImportStatements}}';

      var STORE = {
        modules: {}
      };

      '{{stateSetValueStatements}}';

      // 全局注册src/components及app下的vue组件
      '{{vueComponentSetValueStatements}}';

      window._UBASE_PRIVATE.startApp(null, STORE, routes);
    });
  });
};