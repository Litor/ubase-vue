# ubase-vue

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
│   ├── base.i18n.js // 多app共享国际化文件
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

3、按照项目目录结构编写项目源码
4、命令行执行：gulp



## ubaseGulp配置项

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| autoImportVueComponent | 是否自动加载vue组件（应用目录及components目录） | Boolean | true | |
| alias | 配置别名 | Object | -- |  |
| langs | 支持的语言列表 | Array | ['cn'] | 此处列出的语言，需要在各个.i18n.js文件中export出来 |
| dest | 输出路径 | String | './www' |  |
| port | 端口 | string | '8081' |  |
| proxy | 代理 | Array | -- | { source: '/jcsj-apps-web', target: 'http://res.wisedu.com:8000' } |


## 内置能力

国际化
vuex
less
sass
单独配置文件

## 框架暴露的方法
通过Ubase全局变量管理

#### 1、updateState() 更新vuex状态
```
Ubase.updateState(arg1, arg2) // 其中arg1为vuex.js的前缀，arg2为待更新中的状态值 {'title': 'helloworld'}或者 {'info.name': ' xiaoming'}
```
例如：如果要更新page1.vuex.js中的状态{info:{name:'zhangsan'}}，则Ubase.upateState('page1', {'info.name': 'xiaoming'})

#### 2、getState() 获取vuex状态
```
Ubase.getState(arg) // arg为vuex.js的前缀 即要获取状态的文件
```

#### 3、invoke() 跨组件执行方法
```
Ubase.invoke(arg1, arg2) // 其中arg1为（vue文件的前缀.该文件methods下的方法）， arg2为传的参数
```

例如：如果要调用page1.vue的methods配置项中的reload方法，则Ubase.invoke('page1.reload', '3')

#### 4、showLoading 显示加载动画

#### 5、hideLoading 隐藏加载动画
