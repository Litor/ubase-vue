# ubase-vue
适用于vue2, 基于vue-enty的前端快速开发框架

## 使用

```bash
$ vue init litor/ubase2-template project1
$ cd project1
$ npm install
$ npm run dev
$ browser http://localhost:8082
```

## config
gulpfile.babel.js配置参数说明
```
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
    
    // 移动端使用 值为设计稿像素宽度 设置改参数后 项目中的px会编译成rem
    'rootFontSize': 375,
    
    // 是否自动加载vue组件（应用目录及components目录）
    'autoImportVueComponent':true
}
```

## 杂项
### vuex在vue文件中的使用
```
computed: {
    ...Vuex.mapState({
      index: state => state.index
    }),
  }
```
