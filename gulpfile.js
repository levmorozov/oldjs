const gulp = require('gulp');
const swc = require("gulp-swc");
const rename = require('gulp-rename');
const include = require("gulp-include");


exports.default = function(done) {
    gulp.src('src/*.js')
        .pipe(include())
        .pipe(gulp.dest('./dist/'))
        .pipe(swc({
            minify: true,
            "env": {
                "targets": "> 0.25%, not dead, ie 11",
            },
            jsc: {
                target: "es5",
                loose: true,
                parser: {
                    syntax: "ecmascript",
                    comments: false,
                    script: true,
                },
                minify: {
                    "compress": true,
                    "mangle": true
                }
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
