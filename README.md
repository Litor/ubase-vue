# ubase-vue
基于vue-enty的前端快速开发框架

## Usage

```bash
$ vue init litor/ubase2-template project1
$ cd project1
$ npm install
$ npm run dev
$ browser http://localhost:8082
```

#jsx语法支持
.babelrc中添加
```
{
  "presets": ["es2015","stage-2"],
  "plugins": ["transform-vue-jsx"]
}
```

#config
```
{
    // 输出路径 相对于项目根目录
    dist:'./www/', 

    // 别名 项目可以可以 import('statics/...')
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
