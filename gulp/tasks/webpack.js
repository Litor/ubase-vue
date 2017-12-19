import gulp from 'gulp'
import errorHandler from '../helpers/errorHandler'

import webpackGulp from 'webpack-stream'
import named from 'vinyl-named'
import connect from 'gulp-connect'

import config from '../config'
import configWebpack from '../webpack'
import env from 'gulp-env'

var envs = {NODE_ENV: config.NODE_ENV}

gulp.task('webpack', function () {
    return gulp
      .src([])
      .pipe(env.set(envs))
      .pipe(errorHandler())
      .pipe(named())
      .pipe(webpackGulp(configWebpack))
      .pipe(gulp.dest(config.argDist || config.dest))
      .pipe(connect.reload())
      .on('end', function(){
        if(config.isProduction){
          process.exit()
        }
      })
})
