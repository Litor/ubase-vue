import gulp from 'gulp'
import errorHandler from '../helpers/errorHandler'

import webpackGulp from 'webpack-stream'
import named from 'vinyl-named'

import config from '../config'
import configWebpack from '../webpack'
import env from 'gulp-env'

var envs = { NODE_ENV: config.NODE_ENV }

gulp.task('webpack', () =>
  gulp
  .src([])
  .pipe(env.set(envs))
  .pipe(errorHandler())
  .pipe(named())
  .pipe(webpackGulp(configWebpack))
  .pipe(gulp.dest(config.dest))
)
