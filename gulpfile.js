const gulp = require('gulp');
const terser = require("gulp-terser");
const rename = require('gulp-rename');
const include = require("gulp-include");

exports.default = function(done) {
    gulp.src('src/*.js')
        .pipe(include())
        .pipe(gulp.dest('./dist/'))
        .pipe(terser({
            output: {
                comments: true
            }
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
            return path;
        }))
        .pipe(gulp.dest('./dist/'));

    gulp.src('src/css/*.css')
        .pipe(gulp.dest('./dist/'));
    done()
};
