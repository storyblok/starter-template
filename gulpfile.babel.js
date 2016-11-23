const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const blok = require('gulp-blok');
const watch = require('gulp-watch');
const globbing = require('gulp-css-globbing');
const config = require('./config');
const gulp = require('gulp');
const size = require('gulp-size');
const minify = require('gulp-minify-css');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');

gulp.task('build', ['fonts', 'scripts:prod', 'styles:prod', 'images']);

gulp.task('default', ['serve']);

gulp.task('fonts', function() {
    return gulp.src(config.src.fonts + '/**/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest(config.dest.fonts));
});

gulp.task('images', function() {
    return gulp.src(config.src.images + '/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(config.dest.images))
        .pipe(size({
            title: "images"
        }));
});

function scripts(debug) {
    var pipe = browserify({
        entries: config.src.js + '/main.js',
        debug: debug
    })
    .transform('partialify')
    .transform('babelify')
    .bundle()
        .on("error", notify.onError(function (error) {
            return error.message;
        }))
        .pipe(source('main' + (debug ? '' : '.min') + '.js'))
        .pipe(buffer());
    if (!debug) {
        pipe.pipe(uglify())
    }
    pipe.pipe(gulp.dest(config.dest.js))
        .pipe(browserSync.stream())
        .pipe(size({
            title: 'scripts'
        }));
    return pipe;
}

gulp.task('scripts:prod', function () {
    return scripts(false);
});

gulp.task('scripts:dev', function () {
    return scripts(true);
});

function styles(debug) {
    var debug = debug ? debug : false;
    var pipe = gulp.src(config.src.scss + '/**/*.{sass,scss}')
    .pipe(globbing({
        extensions: ['.scss']
    }))
    .pipe(sass())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))

    pipe.pipe(minify());
    pipe.pipe(gulp.dest(config.dest.css))
    .pipe(browserSync.stream())
    .pipe(size({title: 'styles'}));

    return pipe;
}

gulp.task('styles:prod', function () {
    return styles(false);
});

gulp.task('styles:dev', function () {
    return styles(true);
});


gulp.task('blok', function() {
  return watch('./dist/**/*')
    .pipe(blok(config.blok));
});

gulp.task('browsersync', function() {
  browserSync({
    port: 3038,
    serveStatic: ['./dist'],
    proxy: {
      target: 'https://' + config.blok.url,
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
