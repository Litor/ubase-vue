import path from 'path'
import config from '../config'

var loaders = {}

loaders.js = {
  test: /\.js$/i,
  include: path.resolve(config.src),
  exclude: [/\/node_modules\//, /\/bower_components\//],
  loader: 'babel',
}

loaders.template = {
  test: /index\.html$/i,
  exclude: [/\/pages\//],
  loader: 'file?name=[name].html'
}

loaders.html = {
  test: /\.html$/i,
  loader: 'html',
}

export default [
  loaders.js,
  loaders.html,
  loaders.template
]
