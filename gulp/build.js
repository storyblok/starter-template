var gulp = require('gulp');

gulp.task('build', ['fonts', 'scripts:prod', 'styles:prod', 'images']);
