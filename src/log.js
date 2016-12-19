let gConfig = {}

function setConfig(config) {
  gConfig = config
}

function debugLog(string) {
  if(gConfig['DEBUG']){
    console && console.log(new Date().toISOString() + ' ' + string)
  }
}

export {debugLog, setConfig}
