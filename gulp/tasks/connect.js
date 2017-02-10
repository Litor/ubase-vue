import gulp from 'gulp'
import connect from 'gulp-connect'
import config from '../config'

gulp.task('connect', () =>
  connect.server({
    root: config.dest,
    port: config.port || '8081',
    livereload: true,
    middleware: function (connect, opt) {
      let proxys = []

      if (config.proxy) {
        for (let i = 0; i < config.proxy.length; i++) {
          proxys.push(proxy(config.proxy[i].source, {
            target: config.proxy[i].target,
            changeOrigin: true,
            secure: false,
            headers: {
              Connection: 'keep-alive'
            }
          }))
        }
      }

      return proxys
    }
  })
)

export default connect
