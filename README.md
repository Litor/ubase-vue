# Ubase

适用于vue2, 基于vue-entry的前端快速开发框架， 让您更专注于业务代码。

## 使用方式 

``` sh
$ vue init litjs/ubase2-template project1
$ cd project1
$ npm install
$ npm run dev
$ browser http://localhost:8082
```

## 编译环境配置
gulpfile.babel.js配置参数说明
``` js
{
    // 输出路径 相对于项目根目录
    dist:'./www/', 

    // 别名 项目可以使用import('statics/...') 方便多级目录下的import
    alias: {  
        'components': path.resolve(__dirname, './src/components'),
        'statics': path.resolve(__dirname, './src/statics')
    },
    
    // 端口
    'port':8081, 
    
    // 设置的变量在项目代码可以通过 process.env.a 使用,
    'process.env':{a: 1},  
    
    // 配置请求代理
    'proxy': [{ source: '/api/admin', target: 'http://172.16.6.150:8888' }],
    
    // 移动端使用 值为设计稿像素宽度 设置该参数后 项目中的px会编译成rem
    'rootFontSize': 375,
    
    // 是否自动加载vue组件（应用目录及components目录）
    'autoImportVueComponent':true
}
```

## vuex使用
在应用下新建后缀为".vuex.js"的文件，Ubase会自动识别并做vuex的相关配置(这些配置是在底层实现的，不掺合开发者对业务代码，并对开发者不可见)。

### 在vue中如何使用？
``` js
computed: {
    ...Vuex.mapState({
      index: state => state.index
    }),
  }
```
注：此处"..."为解构赋值语法, Ubase2-template生成的项目可以直接使用。

## 单工程多APP使用
在src目录下新建apps目录，在apps目录下面可以新建多个app目录，app之间相互独立，各自都有自己单独的index.html入口。

```
    src/
    ├── components/
    ├── apps/
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

## 单独请求的配置文件
在应用index.html同级目录下，新建config.json文件即可。该文件不会被编译到项目代码中，浏览器访问应用时，会单独请求该文件。方便打包完成后依然需要修改配置的情况。

### 在vue中如何使用config.json中的配置？
在vue中通过this.$root.config即可访问到config.json中到内容。

## 国际化使用
在应用下新建后缀为".i18n.js"的文件，Ubase会自动识别并做国际化的相关配置

#### Sample `index.i18n.js`
``` js
var zh_CN = {
  title: 'demo title',
};

var en_US = {
  title: 'demo title2',
};

export default { zh_CN ,  en_US};

```

在vue文件template中的使用方式：
``` html
    <div>{{$t('index.title')}}</div>
```

在vue文件script中的使用方式：
``` js
    this.$t('index.title')
```

注：当app有多个语言时，在config.json中有一项特殊的配置项"LANG", 可以配置当前需要使用的语言


## 自动导入app下的vue文件（应用下自己写的vue文件可以在template里直接使用，无需再import）
app下vue自动导入并全局注册（此时需要保证单个app下vue的文件名不能重名），多app模式下，app之间时相互独立的（app之间vue文件可以同名）。
    注：自动导入默认开启，如需关闭可在gulpfile.babel.js中配置autoImportVueComponent为false
    
## 代理配置
在gulpfile.babel.js中配置proxy项即可
``` js
'proxy': [{ source: '/api/', target: 'http://172.16.6.150:8888' }] // 其中/api为需要代理的接口前缀，target是需要代理到的真实服务地址
```
    
## 开发接口

### window.Ubase.beforeInit
在整个应用挂载开始之前被调用

#### 参数
``` js
    {
        config // config.json中的对象
        router // routes.js的内容
        next // 函数 继续往下执行
    }
```

## LICENSE

[MIT](https://zh.wikipedia.org/wiki/MIT%E8%A8%B1%E5%8F%AF%E8%AD%89)
