import gulp from 'gulp'
import del from 'del'
import config from '../config'
import connect from 'gulp-connect'
import proxy from 'http-proxy-middleware'

import errorHandler from '../helpers/errorHandler'

import webpackGulp from 'webpack-stream'
import named from 'vinyl-named'

import configWebpack from '../webpack'
import env from 'gulp-env'

var envs = {NODE_ENV: config.NODE_ENV}

gulp.task('webpack', gulp.series(function (cb) {
    return gulp
        .src([__dirname+'/index.js'])
        .pipe(env.set(envs))
        .pipe(errorHandler())
        .pipe(named())
        .pipe(webpackGulp(configWebpack))
        .pipe(gulp.dest(config.argDist || config.dest))
        .pipe(connect.reload())
        .on('end', function(){
            cb()
            if(config.isProduction){
                process.exit()
            }
        })
}))


gulp.task('connect', function(){
    connect.server({
        root: config.dest,
        port: config.server.port || '8081',
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
})

gulp.task('clean', function(){
    var dest = config.dest
    try {
        del.sync([dest + '/**/*', '!' + dest + '/WEB-INF/**', '!' + dest + '/APP_INFO/**'], {force: true})
    } catch (e) {
        console.log('%s do not clean', dest)
    }
})

gulp.task('build', gulp.series(gulp.parallel('clean', 'webpack'),function(){

}))

gulp.task('default', gulp.series(gulp.parallel('clean', 'webpack', 'connect'),function(){

}))
