import path from 'path'
import config from '../config'

var loaders = {}

loaders.js = {
  test: /\.js$/i,
  include: path.resolve(config.src),
  exclude: [/\/node_modules\//, /\/bower_components\//],
  loader: 'babel',
}

loaders.html = {
  test: /\.html$/i,
  loader: 'html',
}

export default [
  loaders.js,
  loaders.html,
]
