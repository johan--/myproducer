var
  gulp = require('gulp'),
  nodemon = require('gulp-nodemon')
  browserSync = require('browser-sync')

// makes a new task called nodemon
gulp.task('nodemon', function() {
  nodemon({
    ext: 'js html css', // listening to these extentions
    env: {'NODE_ENV' : 'development'}
  })
})

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    files: ['public-dev/**/*.*'],
    browser: 'google-chrome',
    port: 7000
  })
})

// when we run gulp, run nodemon as we defined it
gulp.task('default', ['browser-sync'])
