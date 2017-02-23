import gulp from 'gulp'
import connect from 'gulp-connect'
import config from '../config'

gulp.task('connect', () =>
  connect.server({
    root: config.dest,
    port: config.server.port || '8081',
    livereload: true
  })
)

export default connect
