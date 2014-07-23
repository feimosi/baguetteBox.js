var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    browserSync = require('browser-sync');
var src = {
        css: ['./src/*.scss', './src/*.css'],
        js: './src/*.js',
        html: './src/*.html'
    },
    dst = {
        css: './build/css/',
        js: './build/js/',
        html: './build/'
    };

// CSS tasks
gulp.task('css', function() {
    return gulp.src(src.css)
        // Compile Sass
        .pipe(plugins.if(/.scss/, plugins.sass({ style: 'compressed', noCache: true })))
        // Combine media queries
        .pipe(plugins.combineMediaQueries())
        // parse CSS and add vendor-prefixed CSS properties
        .pipe(plugins.autoprefixer())
        // Minify CSS
        .pipe(plugins.cssmin())
        // Concatenate all styles
        .pipe(plugins.concat('baguetteBox.min.css'))
        // Where to store the finalized CSS
        .pipe(gulp.dest(dst.css));
});

// JS tasks
gulp.task('js', function () {
    return gulp.src(src.js)
        // Run JSHint for syntax errors
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        // Concatenate all JS files into one
        .pipe(plugins.concat('baguetteBox.min.js'))
        // Minify JS
        .pipe(plugins.uglify())
        // Where to store the finalized JS
        .pipe(gulp.dest(dst.js));
});

// HTML tasks
gulp.task('html', function() {
    return gulp.src(src.html).
        pipe(gulp.dest(dst.html));
});

// Watch files for changes
gulp.task('watch', ['browser-sync'], function() {
    // Watch Sass files
    gulp.watch(src.css, ['css']);
    // Watch JS files
    gulp.watch(src.js, ['js']);
    // Watch HTML files
    gulp.watch(src.html, ['html']);
});

// Live browser reload
gulp.task('browser-sync', ['js', 'css', 'html'], function () {
   var files = [
      dst.html + '*.html',
      dst.css + '*.css',
      dst.js + '*.js'
   ];

    browserSync.init(files, {
        server: {
            baseDir: "./build/"
        }
    });
});

// Default task
gulp.task('default', ['css', 'js', 'html', 'watch', 'browser-sync']);
