var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('stylus', function() {
    gulp.src('stylus/*.styl')
        .pipe(stylus())
        .pipe(gulp.dest('static/css/'));
});

gulp.task('babel', function() {
    gulp.src('src/js/*.js')
        .pipe(gulp.dest('static/js/'));
});


gulp.task('build', ['stylus']);
