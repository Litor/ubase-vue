import gulp from 'gulp'
import del from 'del'
import config from '../config'

gulp.task('clean', cb => {
  var dest = config.dest
  try {
    del.sync([dest + '/**/*', '!' + dest + '/WEB-INF/**', '!' + dest + '/APP_INFO/**'], {force: true})
  } catch (e) {
    console.log('%s do not clean', dest)
  }
})
