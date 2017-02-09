var
  gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  uglifyjs = require('gulp-uglify'),
  sass = require('gulp-sass'),
  concat = require('gulp-concat')

// makes a new task called nodemon
gulp.task('nodemon', ['minify-js'], function() {
  nodemon({
    ext: 'js html css', // listening to these extentions
    env: {'NODE_ENV' : 'development'}
  })
})

gulp.task('minify-js', function() {
  gulp.src(['client/js-dev/*.js', 'client/js-dev/*/*.js'])
    .pipe(concat('application.min.js'))
    .pipe(uglifyjs())
    .pipe(gulp.dest('client/js'))
})

gulp.watch('client/js-dev/*/*.js', ['minify-js']);

gulp.task('sass', function () {
  return gulp.src('client/sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('client/css'));
});

  gulp.watch('client/sass/styles.scss', ['sass'])
  
// when we run gulp, run nodemon as we defined it
gulp.task('default', ['nodemon', 'sass'])
