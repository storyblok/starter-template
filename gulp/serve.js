var gulp = require('gulp');
var config = require('./config');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var blok = require('gulp-blok');
var watch = require('gulp-watch');

gulp.task('blok', function() {
  return watch('./dist/**/*')
    .pipe(blok(config.blok));
});

gulp.task('browsersync', function() {
  browserSync({
    port: 3038,
    serveStatic: ['./dist'],
    proxy: {
      target: 'http://' + config.blok.url,
      reqHeaders: function (config) {
        return {
          'accept-encoding': 'identity',
          'agent':           false,
          'proxymode':       true
        }
      }
    },
    reloadDelay: 1000,
    notify: true,
    open: true,
    logLevel: 'silent'
  });

  gulp.watch('dist/**/*.html').on('change', reload);
  gulp.watch([config.src.js + '/**/*.js'], ['scripts:dev']);
  gulp.watch([config.src.scss + '/**/*.scss'], ['styles:dev']);
  gulp.watch([config.src.images + '/**/*.{jpg,jpeg,png,gif,svg}'], ['images']);
  gulp.watch([config.src.fonts + '/**/*.{eot,svg,ttf,woff,woff2}'], ['fonts']);
});

gulp.task('serve', ['scripts:dev', 'styles:dev', 'browsersync', 'blok']);