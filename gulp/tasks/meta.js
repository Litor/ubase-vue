import gulp from 'gulp'
import del from 'del'
import path from  'path'
import copyRemoteFile from 'copy-remote-file'
import config from '../config'

gulp.task('meta', cb => {
  try {
    del.sync('./src/statics/meta-info/**/*.*')
  } catch (e) {
    console.log('%s do not clean', dest)
  }
  copyRemoteFile(config.metaInfoUrl, path.resolve('./src/statics/meta-info/'))
})