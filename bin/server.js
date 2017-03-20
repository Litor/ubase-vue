var express = require('express')
var bodyParser = require('body-parser');
var glob  = require('glob')
var fs = require('fs')

var app = express()
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/saveConfig', function (req, res) {
  var newInfo = JSON.parse(req.body)
  var path = newInfo.path.replace(/\/([^\/]*).vue$/, '/layout.js')
  var config = newInfo.config

  fs.writeFileSync(path, 'export default '+ JSON.stringify(config, null, 2))

})

app.post('/getComponentList', function (req, res) {
  var newInfo = req.body
  var appPath = newInfo.path
  var result = []

  if(appPath){
    var appVueFilesPath = glob.sync(appPath+`/**/*Section.vue`)

    appVueFilesPath.forEach(function (vueFile) {
      var filename = vueFile.replace(/.*\/([^\/]*)\.vue/, '$1')
      result.push({id:filename, name:filename})
    })
  }

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "Content-Type");

  res.contentType('json');//返回的数据类型
  res.send(JSON.stringify(result));//给客户端返回一个json格式的数据
  res.end()
})

app.all('*', function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type")
  res.end()
})
app.listen(34398)
