import {setItem, getItem} from './localStorage'

process.noDeprecation = true

export default function (userConfig) {
  setItem('userConfig', JSON.stringify(userConfig))
  require('require-dir')('./tasks', { recurse: true })
}