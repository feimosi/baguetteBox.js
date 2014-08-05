var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    browserSync = require('browser-sync');
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
        js: './dist/',
    };

// CSS tasks
gulp.task('css', function() {
    return gulp.src(src.css)
        // Compile Sass
        .pipe(plugins.if(/.scss/, plugins.sass({ style: 'compressed', noCache: true })))
        // Combine media queries
        .pipe(plugins.combineMediaQueries())
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(plugins.autoprefixer(["last 2 version", "> 1%", "ie 8", "ie 7", 'ff 3.6', 'Opera 12.1', 'Firefox ESR']))
        // Concatenate all styles
        .pipe(plugins.concat('baguetteBox.css'))
        // Where to store the finalized CSS
        .pipe(gulp.dest(build.css));
});

gulp.task('css-min', function() {
    return gulp.src(src.css)
        // Compile Sass
        .pipe(plugins.if(/.scss/, plugins.sass({ style: 'compressed', noCache: true })))
        // Combine media queries
        .pipe(plugins.combineMediaQueries())
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(plugins.autoprefixer(["last 2 version", "> 1%", "ie 8", "ie 7", 'ff 3.6', 'Opera 12.1', 'Firefox ESR']))
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
        // Run JSHint for syntax errors
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        // Concatenate all JS files into one
        .pipe(plugins.concat('baguetteBox.js'))
        // Where to store the finalized JS
        .pipe(gulp.dest(build.js));
});

gulp.task('js-min', function() {
    return gulp.src(src.js)
        // Run JSHint for syntax errors
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        // Concatenate all JS files into one
        .pipe(plugins.concat('baguetteBox.min.js'))
        // Minify JS
        .pipe(plugins.uglify({preserveComments: 'some'}))
        // Where to store the finalized JS
        .pipe(gulp.dest(dist.js));
});

// Bump to a new version
gulp.task('bump-minor', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(plugins.bump({type:'minor'}))
    .pipe(gulp.dest('./'));
});

// Bump to a new version
gulp.task('bump-patch', function () {
  return gulp.src(['./bower.json', './package.json'])
    .pipe(plugins.bump({type:'patch'}))
    .pipe(gulp.dest('./'));
});

// Watch files for changes
gulp.task('watch', ['browser-sync'], function() {
    // Watch Sass files
    gulp.watch(src.css, ['css']);
    // Watch JS files
    gulp.watch(src.js, ['js']);
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
            baseDir: "./build/"
        }
    });
});

// Default task
gulp.task('default', ['css', 'js', 'watch', 'browser-sync']);

gulp.task('release', ['css-min', 'js-min', 'bump-minor']);

gulp.task('patch', ['css-min', 'js-min', 'bump-patch']);
