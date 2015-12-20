var globalConfig  = require('./config');

var gulp          = require('gulp');
var sass          = require('gulp-sass');
var notify        = require('gulp-notify');
var browserSync   = require('browser-sync').create();

/*================================================================
 # HELPER
 ================================================================*/

function handleError(err) {
  var msg = 'Error: ' + err.message;

  console.error('Error', err.message);
  browserSync.notify('Error: ' + err.message);

  var args = Array.prototype.slice.call(arguments);
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  if (typeof this.emit === 'function') this.emit('end')
}

/*================================================================
 # TASK
 ================================================================*/

gulp.task('sass', function() {
  var config = globalConfig.tasks.sass;

  return gulp.src(config.src)
    .pipe(sass(config.opt))
    .on('error', handleError)
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream(config.browserSyncOpt));
});

gulp.task('serve', ['sass'], function() {
  var config = globalConfig.tasks.serve;

  browserSync.init(config.browserSyncInit);
  gulp.watch(config.watch.html).on('change', browserSync.reload);
  gulp.watch(config.watch.js).on('change', browserSync.reload);
  gulp.watch(config.watch.sass, ['sass']);
});

var allTasks = [
  'sass',
  'serve'
];

gulp.task('all', allTasks); // for testing
gulp.task('default', ['serve']);
