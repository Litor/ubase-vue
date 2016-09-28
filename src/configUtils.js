function getConfig() {
  let config = window.APP_CONFIG
  let serverConfig = {}

  if (config.SERVER_CONFIG_API) {
    ajax({
      url: config.SERVER_CONFIG_API,
      async: false,
      success: function(response) {
        serverConfig = JSON.parse(response)
      },
      fail: function(status) {
        console.error('AJAX SERVER_CONFIG_API ERROR')
      }
    })
  }

  config = $.extend(true, {}, config, serverConfig)

  function ajax(options) {
    options = options || {}
    options.type = (options.type || 'GET').toUpperCase()
    options.dataType = options.dataType || 'json'
    let params = formatParams(options.url, options.data)
    let xhr = null

    // 创建 - 非IE6 - 第一步
    if (window.XMLHttpRequest) {
      xhr = new XMLHttpRequest()
    } else { // IE6及其以下版本浏览器
      xhr = new ActiveXObject('Microsoft.XMLHTTP')
    }

    // 接收 - 第三步
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        let status = xhr.status
        if (status >= 200 && status < 300) {
          options.success && options.success(xhr.responseText, xhr.responseXML)
        } else {
          options.fail && options.fail(status)
        }
      }
    }

    if (options.url.indexOf('?') >= 0) {
      options.url = options.url.substring(0, options.url.indexOf('?'))
    }

    // 连接 和 发送 - 第二步
    if (options.type === 'GET') {
      xhr.open('GET', options.url + '?' + params, options.async)
      xhr.send(null)
    } else if (options.type === 'POST') {
      xhr.open('POST', options.url, options.async)
        // 设置表单提交时的内容类型
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.send(params)
    }
  }
  // 格式化参数
  function formatParams(url, data) {
    let arr = []
    if (url.indexOf('?') >= 0) {
      arr = url.substr(url.indexOf('?') + 1).split('&')
    }

    for (let name in data) {
      arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]))
    }
    arr.push(('v=' + Math.random()).replace('.', ''))
    return arr.join('&')
  }

  return config
}

export default getConfig
