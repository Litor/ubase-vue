# ubase-vue [![Build Status](https://img.shields.io/circleci/project/Litor/ubase-vue/master.svg)](https://circleci.com/gh/Litor/ubase-vue) [![npm package](https://img.shields.io/npm/v/ubase-vue.svg)](https://www.npmjs.com/package/ubase-vue)

基于vue的前端集成开发框架

## 使用

```
$ npm install -g vue-cli
$ vue init litor/ubase-template my-project
$ cd my-project
$ npm install
$ npm run dev
```

## 项目目录结构
单app模式
```
src/
├── components/
├── pages/
│   ├── page1
│   │   ├── page1.i18n.js // 国际化文件
│   │   ├── pag1.vue // 主文件
│   │   ├── page1.service.js //service
│   │   └──page1.state.js // 状态文件
│   ├── index.html  // 必须
│   ├── routes.js  // 必须
│   ├── config.json  // 可选
│   └── ...
└── statics/
    ├── images/
    └── ...
```
多app模式
```
src/
├── components/
├── pages/
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

## gulpfile中ubase的配置项

| 名称  | 描述 | 类型 | 默认值 | 备注 |
| ---    | ---   | ---   | ---     | ---   |
| autoImportVueComponent | 是否自动加载vue组件（应用目录及components目录） | Boolean | true | |
| alias | 配置别名 | Object | -- |  |
| langs | 支持的语言列表 | Array | ['cn'] | 此处列出的语言，需要在各个.i18n.js文件中export出来 |
| dest | 输出路径 | String | './www' |  |
| port | 端口 | string | '8081' |  |
| proxy | 代理 | Array | -- | { source: '/jcsj-apps-web', target: 'http://res.wisedu.com:8000' } |


## 内置能力

#### 1、国际化

自动识别， 如果有.i18n.js文件，则添加国际化功能
```
// test.i18n.js

var cn = {
    title: 'helloworld'
};

export default { cn };
```

在js中的使用方式
```
Vue.t('test.title')
```
在template中的使用方式
```
$t('test.title')
```

#### 2、state（可选）
直接写.state.js文件即可
在.vue文件中通过下面方式引用：
```
computed: {
  ps(){
    return this.$store.state.test // 此处对应获取的是test.state.js文件中的状态
  }
},
```

#### 3、内置less、sass、image(gif|png|jpe?g|svg)、font(ttf|eot|woff|woff2|svg)等的loader
vue中使用sass方式
```
<style lang="sass" rel="stylesheet/scss">
    ...
</style>
```

#### 4、单独配置文件config.json（可选 通过useConfigFile配置是否需要）

配置文件的内容在.vue文件中可以通过this.$root.config获取

## 框架暴露的方法
通过Ubase全局变量管理

#### 1、updateState() 更新state状态
```
Ubase.updateState(arg1, arg2) // 其中arg1为state.js的前缀，arg2为待更新中的状态值 {'title': 'helloworld'}或者 {'info.name': ' xiaoming'}
```
例如：如果要更新page1.state.js中的状态{info:{name:'zhangsan'}}，则Ubase.upateState('page1', {'info.name': 'xiaoming'})

#### 2、getState() 获取state状态
```
Ubase.getState(arg) // arg为state.js的前缀 即要获取状态的文件
```

#### 3、invoke() 跨组件执行方法
```
Ubase.invoke(arg1, arg2) // 其中arg1为（vue文件的前缀.该文件methods下的方法）， arg2为传的参数
```

例如：如果要调用page1.vue的methods配置项中的reload方法，则Ubase.invoke('page1.reload', '3')

#### 6、log 输入日志
注：仅当config.json中"DEBUG"配置项为true时才输出日志
