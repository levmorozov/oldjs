const gulp = require('gulp');
const terser = require("gulp-terser");
const rename = require('gulp-rename');
const include = require("gulp-include");
const babel = require('gulp-babel');


exports.default = function(done) {
    gulp.src('src/*.js')
        .pipe(include())
        .pipe(babel({
            plugins: [
                "@babel/plugin-transform-arrow-functions",
                "@babel/plugin-transform-block-scoping",
            ]
        }))
        .pipe(terser({
            output: {
                comments: true
            },
            mangle: {
                keep_fnames: true
            }
        }))
        .pipe(rename(function (path) {
            path.basename += '.min';
            return path;
        }))
        .pipe(gulp.dest('./dist/'));

    gulp.src('src/css/*.css')
        .pipe(gulp.dest('./dist/'));

    gulp.src('src/*.css')
        .pipe(gulp.dest('./dist/'));


    done()
};
