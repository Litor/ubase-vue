import gulp from 'gulp'
import babel from "gulp-babel"
import config from '../config'

gulp.task("indexhtml", function() {
  return gulp.src(config.src + "/apptools/**/*.html") // ES6 源码存放的路径
    .pipe(gulp.dest("dist/apptools")); //转换成 ES5 存放的路径
});
