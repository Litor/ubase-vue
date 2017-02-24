import {setItem, getItem} from './localStorage'

export default function (userConfig) {
  setItem('userConfig', JSON.stringify(userConfig))
  require('require-dir')('./tasks', { recurse: true })
}