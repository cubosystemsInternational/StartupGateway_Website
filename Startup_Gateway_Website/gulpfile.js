const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');

gulp.task('minify-css', () => {
    return gulp.src('wwwroot/css/styles.css')
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('wwwroot/css'));
});

gulp.task('default', gulp.series('minify-css'));