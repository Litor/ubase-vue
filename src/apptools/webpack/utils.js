import * as babel from 'babel-core'
import colors from 'colors'
import _ from 'lodash'
import fs from 'fs'
import config from './config'

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'red',
  info: 'green',
  data: 'blue',
  help: 'cyan',
  warn: 'yellow',
  debug: 'magenta',
  error: 'red'
})

var gPath = null

function setPath(path) {
  gPath = path
}

/***
 * 检测fileList中后缀为fileType的file文件是否重复 如果重复则给出提示并退出node
 * @param fileList 文件路径列表
 * @param file 文件名
 * @param fileType 文件后缀
 */
function checkFileDuplicate(fileList, file, fileType) {
  var files = _.filter(fileList, function (item) {
    return _.endsWith(item, '/' + file + '.' + fileType)
  })

  if (files.length > 1) {
    console.error(colors.red(`${file}.${fileType}文件命名重复, 同一个应用下${fileType}类型的文件命名不能重复，命名重复文件：\n${files.join('\n')}`))
    process.exit()
  }
}

/***
 * 检测vue和vuex文件命名是否规范
 * @param filename 文件名
 * @param fileType 文件后缀
 */
function checkFileNameValid(filename, fileType) {
  if (filename.indexOf('-') > 0 || filename.indexOf('.') > 0) {
    console.error(colors.red(`文件名请使用驼峰式命名, 如myNameIsWisedu！命名错误文件：${filename}.${fileType}`))
    process.exit()
  }
}

/***
 * 讲es6写的代码转换成es5
 * @param file
 */
function translateEs6to5(file) {
  var content = fs.readFileSync(file);
  var result = babel.transform(content, {
    presets: ['es2015']
  });
  var exports = {};
  eval(result.code)

  return exports
}

/***
 * 获取绝对文件路径相对于tempfile的相对路径
 * @param filePath 绝对文件路径
 */
function relativePath(filePath) {
  return gPath.relative(__dirname + '/../tempfile', filePath)
}

/**
 * 模板替换方法
 * @param  {[type]} template [模板]
 * @param  {[type]} config   [配置对象]
 * @return {[type]}          [description]
 */
function templateReplace(template, config) {
  Object.keys(config).forEach(function (item) {
    let re = new RegExp('\\{\\{' + item + '\\}\\}', 'g')
    let statementre = new RegExp('\\\'\\{\\{' + item + '\\}\\}\\\'', 'g')

    if (config[item].statement) {
      template = template.replace(statementre, config[item].content)
      return
    }
    if (!config[item].relativePath) {
      template = template.replace(re, config[item].content)
      return
    }

    if (fs.existsSync(config[item].content)) {
      template = template.replace(re, relativePath(config[item].content)).replace(/\\/g, '/')
    } else {
      if (config[item].required) {
        console.error(colors.red(config[item].content + '文件不存在!'))
        process.exit()
      } else {
        template = template.replace(re, config[item].default)
      }
    }

  })

  return template
}

/***
 * 检查项目类型 单app或多app模式
 */
function checkProjectType() {
  var projectType = null
  var indexHtml = gPath.resolve(config.src) + '/pages/index.html'
  var routeJs = gPath.resolve(config.src) + '/pages/routes.js'
  if (fs.existsSync(indexHtml) && fs.existsSync(routeJs)) {
    projectType = 'singleApp'
  }

  return projectType
}

export {
  checkFileDuplicate,
  checkFileNameValid,
  translateEs6to5,
  relativePath,
  templateReplace,
  setPath,
  checkProjectType
}
