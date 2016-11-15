# ubase-vue
ubase-vue is the entry point for your vue application, it makes the developer only need focus on the application business logic and let the ubase-vue build and boot it. \


## 使用方式

1、在项目中引入ubase-vue库
```
npm i ubase-vue --save
```

2、gulpfile.babel.js

```
import path from 'path';
import ubaseGulp from 'ubase-vue/dist/apptools/webpack/gulp';

let userConfig = {
  // 配置别名
  alias: {
    'components': path.resolve(__dirname, './src/components'),
    'statics': path.resolve(__dirname, './src/statics')
  },

  // 端口
  port: '8081',

  // mock server代理
  proxy: [{ source: '/yxxzry-apps-web', target: 'http://res.wisedu.com:8000' }]
};

ubaseGulp(path, userConfig);

```


## ubaseGulp配置项

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| autoImportVueComponent | 是否自动加载vue组件（应用目录及components目录） | Boolean | true | |
| alias | 配置别名 | Object | -- |  |
| port | 端口 | string | '8081' |  |
| proxy | 代理 | Array | -- | { source: '/jcsj-apps-web', target: 'http://res.wisedu.com:8000' } |

