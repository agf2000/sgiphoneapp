var gulp = require('gulp');

var src = './node_modules',
    app = './www';

gulp.task('vendors', function () {
    gulp.src(src + '/jquery/dist/jquery.min.js')
        .pipe(gulp.dest(app + '/vendors/jquery'));
    gulp.src(src + '/jquery/dist/jquery.min.map')
        .pipe(gulp.dest(app + '/vendors/jquery'));
    gulp.src(src + '/jquery-migrate/dist/jquery-migrate.min.js')
        .pipe(gulp.dest(app + '/vendors/jquery-migrate'));
    gulp.src(src + '/jquery-mobile/dist/jquery.mobile.min.css')
        .pipe(gulp.dest(app + '/vendors/jquery-mobile'));
    gulp.src(src + '/jquery-mobile/dist/jquery.mobile.theme.min.css')
        .pipe(gulp.dest(app + '/vendors/jquery-mobile'));
    gulp.src(src + '/jquery-mobile/dist/jquery.mobile.min.map')
        .pipe(gulp.dest(app + '/vendors/jquery-mobile'));
    gulp.src(src + '/jquery-mobile/dist/jquery.mobile.min.js')
        .pipe(gulp.dest(app + '/vendors/jquery-mobile'));
    gulp.src(src + '/jquery-mobile/dist/images/**')
        .pipe(gulp.dest(app + '/vendors/jquery-mobile/images'));
    gulp.src(src + '/knockout/build/output/knockout-latest.js')
        .pipe(gulp.dest(app + '/vendors/knockout'));
});

gulp.task('default', ['vendors']);