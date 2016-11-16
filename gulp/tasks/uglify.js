import gulp from 'gulp'
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
import config from '../config'

var envs = { NODE_ENV: config.NODE_ENV }

gulp.task('min',() =>
  gulp
  .src("dist/ubase-vue.js")
  .pipe(concat("ubase-vue.min.js"))
  .pipe(uglify())
  .pipe(gulp.dest("dist/"))
)
