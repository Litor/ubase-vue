# ubase-vue
ubase-vue is the entry point for your vue application, it makes the developer only need focus on the application business logic and let the ubase-vue build and boot it. \

## 项目目录结构
单app模式
```
src/
├── components/
├── src/
│   ├── page1
│   │   ├── page1.i18n.js // 国际化文件
│   │   ├── pag1.vue // 主文件
│   │   ├── page1.service.js //service
│   │   └──page1.vuex.js // 状态文件
│   ├── index.html  // 必须
│   ├── routes.js  // 必须
│   ├── config.json  // 必须
│   └── ...
└── statics/
    ├── images/
    └── ...
```
多app模式
```
src/
├── components/
├── src/
│   ├── app1
│   │   ├── index.html
│   │   ├── routes.js
│   │   ├── config.json
│   │   └── ...
│   ├── app2
│   │    ├── index.html
│   │    ├── routes.js
│   │    ├── config.json
│   │    └── ...
│   └── ...
└── statics/
    ├── images/
    └── ...
```

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
| langs | 支持的语言列表 | Array | ['cn'] | 此处列出的语言，需要在各个.i18n.js文件中export出来 |
| dest | 输出路径 | String | './www' |  |
| port | 端口 | string | '8081' |  |
| proxy | 代理 | Array | -- | { source: '/jcsj-apps-web', target: 'http://res.wisedu.com:8000' } |


## 框架暴露的方法
通过Ubase全局变量管理
```
1、showLoading() // 显示加载动画
2、hideLoading() // 隐藏加载动画
3、beforeInit // 应用启动前的钩子方法，默认未空，可根据需要配置， 回调返回的对象包含
   {config，router, routes, next} // config.json内容，router对象, routes.js内容, next
4、updateState // 更新vuex状态，Ubase.updateState(arg1, arg2) 其中arg1为vuex.js的前缀，arg2为待更新中的状态值 {'title': 'helloworld'}或者 {'info.name': ' xiaoming'}
    例如：如果要更新page1.vuex.js中的状态{info:{name:'zhangsan'}}，则Ubase.upateState('page1', {'info.name': 'xiaoming'})
5、invoke // 跨组件执行方法 Ubase.updateState(arg1, arg2) 其中arg1为（vue文件的前缀.该文件methods下的方法）， arg2为传的参数
    例如：如果要调用page1.vue的methods配置项中的reload方法，则Ubase.invoke('page1.reload', '3')
```
