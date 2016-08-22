var gulp = require('gulp'),
    exit = require('gulp-exit'),
    del = require('del'),
    open = require('gulp-open'),
    browserSync = require('browser-sync').create(),
    ngrok = require('ngrok'),
    psi = require('psi'),
    gulpSequence = require('gulp-sequence'),
    htmlmin = require('gulp-htmlmin'),
    cleanCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    imageop = require('gulp-image-optimization');

var site = '',
    portVal = 8000;

// Copy files that should not be minified
gulp.task('copy', function() {
   return gulp.src('src/css/**/fonts/**/*.{ttf,woff,woff2,eot,svg}')
   .pipe(gulp.dest('dist/css'));
});

// Minification tasks
gulp.task('contents', function() {
    return gulp.src('src/**/*.html')
        .pipe(htmlmin())
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
    return gulp.src(['src/css/*.css', 'src/css/bootstrap/css/*.css'])
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('scripts', function() {
    return gulp.src('src/**/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('img', function() {
    return gulp.src('src/**/*.png')
        .pipe(imageop())
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {
    return del('dist');
});

// Build the distribution version
gulp.task('build', function(cb) {
    return gulpSequence('clean', 'copy', ['contents', 'styles', 'scripts', 'img'], cb);
});

// Browser-sync configs
gulp.task('browser-sync-serve', ['build'], function(cb) {
    browserSync.init({
        port: portVal,
        open: false,
        server: {
            baseDir: 'dist/'
        }
    }, cb);
});

// All subtasks for printing Google PageSpeed Index scores
gulp.task('ngrok-serve', ['browser-sync-serve'], function(cb) {
    return ngrok.connect(portVal, function(err, url) {
        site = url;
        console.log('Serving your tunnel from: ' + site);
        cb();
    });
});

gulp.task('psi-mobile', function(cb) {
    psi.output(site, {
        nokey: 'true',
        strategy: 'mobile',
        threshold: '0'
    }).then(() => { cb(); });
});

gulp.task('psi-desktop', function(cb) {
    psi.output(site, {
        nokey: 'true',
        strategy: 'desktop',
        threshold: '0'
    }).then(() => { cb(); });
});

// Print PSI
gulp.task('psi-seq', ['ngrok-serve'], function(cb) {
    console.log('It will take 1.5 mins to run Google Speed Test!');
    return gulpSequence(
        'psi-mobile',
        'psi-desktop',
        cb
    );
});

// Print PSI and then exit
gulp.task('psi', ['psi-seq'], function() {
    return process.exit();
});

// Open the site in browsers
gulp.task('open-local', function() {
    return gulp.src('')
        .pipe(open({
            uri: 'http://localhost:' + portVal
        }));
});

gulp.task('open-external', function() {
    return gulp.src('')
        .pipe(open({
            uri: site
        }));
});

// Serve the minimized version
gulp.task('serve', function(cb) {
    return gulpSequence('ngrok-serve', ['open-local', 'open-external'], cb);
});

// Testing mode
gulp.task('test', function() {
    browserSync.init({
        port: portVal,
        open: 'local',
        browser: 'Google Chrome Canary',
        server: {
            baseDir: 'src/',
        }
    });
});
