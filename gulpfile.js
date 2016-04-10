/* jshint node:true */

'use strict';

var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence');

var src = {
        css: ['./src/*.scss', './src/*.css'],
        js: './src/*.js'
    },
    build = {
        css: './build/css/',
        js: './build/js/',
        html: './build/'
    },
    dist = {
        css: './dist/',
        js: './dist/'
    };

var autoprefixerBrowsers = [
    'last 2 version',
    '> 1%',
    'Edge >= 12',
    'Explorer >= 8',
    'Firefox 3.6',
    'Firefox ESR',
    'Opera 12.1'
];

// CSS tasks
gulp.task('css', function() {
    return gulp.src(src.css)
        // Compile Sass
        .pipe(plugins.if(/.scss/, plugins.sass({ style: 'compressed', noCache: true }))) // jshint ignore:line
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(plugins.autoprefixer(autoprefixerBrowsers))
        // Concatenate all styles
        .pipe(plugins.concat('baguetteBox.css'))
        // Where to store the finalized CSS
        .pipe(gulp.dest(build.css));
});

gulp.task('css-min', function() {
    return gulp.src(src.css)
        // Compile Sass
        .pipe(plugins.if(/.scss/, plugins.sass({ style: 'compressed', noCache: true }))) // jshint ignore:line
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(plugins.autoprefixer(autoprefixerBrowsers))
        // Minify CSS
        .pipe(plugins.cssmin())
        // Concatenate all styles
        .pipe(plugins.concat('baguetteBox.min.css'))
        // Where to store the finalized CSS
        .pipe(gulp.dest(dist.css));
});

// JS tasks
gulp.task('js', function () {
    return gulp.src(src.js)
        // Concatenate all JS files into one
        .pipe(plugins.concat('baguetteBox.js'))
        // Where to store the finalized JS
        .pipe(gulp.dest(build.js));
});

gulp.task('js-min', function() {
    return gulp.src(src.js)
        // Concatenate all JS files into one
        .pipe(plugins.concat('baguetteBox.min.js'))
        // Minify JS
        .pipe(plugins.uglify({ preserveComments: 'some' }))
        // Where to store the finalized JS
        .pipe(gulp.dest(dist.js));
});

gulp.task('lint', function() {
    return gulp.src([src.js, 'gulpfile.js'])
        // Run JSHint for syntax errors
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.jshint.reporter('fail'));
});

// Bump to a new version
gulp.task('bump-minor', function () {
    return gulp.src(['./bower.json', './package.json'])
        .pipe(plugins.bump({ type: 'minor' }))
        .pipe(gulp.dest('./'));
});

// Bump to a new version
gulp.task('bump-patch', function () {
    return gulp.src(['./bower.json', './package.json'])
        .pipe(plugins.bump({ type: 'patch' }))
        .pipe(gulp.dest('./'));
});

// Update version number in project files
gulp.task('update-version', function () {
    return gulp.src([build.css + '*.css',
            build.js + '*.js',
            dist.css + '*.css',
            dist.js + '*.js'
            ], {
                base: './'
            })
            .pipe(plugins.injectVersion({
                replace: '%%INJECT_VERSION%%',
                prepend: {
                    toString: function() { return ''; }
                }
            }))
            .pipe(gulp.dest('./'));
});

// Watch files for changes
gulp.task('watch', ['browser-sync'], function() {
    // Watch Sass files
    gulp.watch(src.css, ['css']);
    // Watch JS files
    gulp.watch(src.js, ['js', 'lint']);
});

// Live browser reload
gulp.task('browser-sync', ['js', 'css'], function () {
    var files = [
        build.html + '*.html',
        build.css + '*.css',
        build.js + '*.js'
    ];

    browserSync.init(files, {
        server: {
            baseDir: './build/'
        }
    });
});

// Default task
gulp.task('default', ['watch']);

gulp.task('release', function() {
    runSequence('bump-minor', 'build');
});

gulp.task('patch', function() {
    runSequence('bump-patch', 'build');
});

gulp.task('build', function() {
    runSequence(['css', 'js', 'css-min', 'js-min'], 'update-version');
});

gulp.task('test', ['build', 'lint']);
