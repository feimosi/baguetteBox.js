/* eslint-env node */
// @ts-nocheck

'use strict';

const sass = require('gulp-sass')(require('sass'));
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const jsonfile = require('jsonfile');

const paths = {
    css: ['./src/*.scss', './src/*.css'],
    js: './src/*.js'
};
const demo = {
    allFiles: './demo/**/*',
    css: './demo/css/',
    js: './demo/js/',
    html: './demo/',
    base: './demo/'
};
const dist = {
    css: './dist/',
    js: './dist/'
};

const autoprefixerBrowsers = [
    'last 2 version',
    '> 1%',
    'Edge >= 12',
    'Explorer >= 8',
    'Firefox 3.6',
    'Firefox ESR',
    'Opera 12.1'
];

function buildDemoCss() {
    return gulp.src(paths.css)
        .pipe(plugins.if(/.scss/, sass({ style: 'compressed', noCache: true })))
        .pipe(plugins.autoprefixer({ overrideBrowserslist: autoprefixerBrowsers }))
        .pipe(plugins.concat('baguetteBox.css'))
        .pipe(gulp.dest(demo.css));
}

function buildDemoJs() {
    return gulp.src(paths.js)
        .pipe(plugins.concat('baguetteBox.js'))
        .pipe(gulp.dest(demo.js));
}

function buildDistCss() {
    return gulp.src(paths.css)
        .pipe(plugins.if(/.scss/, sass({ style: 'compressed', noCache: true })))
        .pipe(plugins.autoprefixer({ overrideBrowserslist: autoprefixerBrowsers }))
        .pipe(plugins.concat('baguetteBox.css'))
        .pipe(gulp.dest(dist.css))
        .pipe(plugins.concat('baguetteBox.min.css'))
        .pipe(plugins.cleanCss({ compatibility: 'ie8' }))
        .pipe(gulp.dest(dist.css));
}

function buildDistJs() {
    return gulp.src(paths.js)
        .pipe(plugins.concat('baguetteBox.js'))
        .pipe(gulp.dest(dist.js))
        .pipe(plugins.concat('baguetteBox.min.js'))
        .pipe(plugins.uglify({ output: { comments: /^!/ }, ie8: true }))
        .pipe(gulp.dest(dist.js));
}

const buildDemo = gulp.parallel(buildDemoCss, buildDemoJs);
const buildDist = gulp.parallel(buildDistCss, buildDistJs);

function lint() {
    return gulp.src([paths.js, 'gulpfile.js', '.eslintrc.js'])
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
}

function bumpMinor() {
    return gulp.src(['./bower.json', './package.json'])
        .pipe(plugins.bump({ type: 'minor' }))
        .pipe(gulp.dest('./'));
}

function bumpPatch() {
    return gulp.src(['./bower.json', './package.json'])
        .pipe(plugins.bump({ type: 'patch' }))
        .pipe(gulp.dest('./'));
}

function updateVersion() {
    return gulp
        .src([demo.css + '*.css',
            demo.js + '*.js',
            dist.css + '*.css',
            dist.js + '*.js'
        ], {
            base: './'
        })
        .pipe(plugins.injectVersion({
            replace: '%%INJECT_VERSION%%',
            prepend: ''
        }))
        .pipe(gulp.dest('./'));
}

function watchFiles() {
    gulp.watch(paths.css, buildDemoCss);
    gulp.watch(paths.js, gulp.series(buildDemoJs, lint));
}

function watchBrowserSync(done) {
    const files = [
        demo.html + '*.html',
        demo.css + '*.css',
        demo.js + '*.js'
    ];

    browserSync.init(files, {
        server: {
            baseDir: demo.base
        }
    });
    done();
}

function deploy() {
    const packageJson = jsonfile.readFileSync('./package.json');

    return gulp.src(demo.allFiles)
        .pipe(plugins.ghPages({
            push: false,
            message: 'v' + packageJson.version
        }));
}

const build = gulp.series(gulp.parallel(buildDemo, buildDist), updateVersion);
const watch = gulp.series(buildDemo, watchBrowserSync, watchFiles);
const release = gulp.series(bumpMinor, build);
const patch = gulp.series(bumpPatch, build);
const test = gulp.series(build, lint);

exports['build.demo-css'] = buildDemoCss;
exports['build.demo-js'] = buildDemoJs;
exports['build.dist-css'] = buildDistCss;
exports['build.dist-js'] = buildDistJs;
exports['build.demo'] = buildDemo;
exports['build.dist'] = buildDist;
exports.lint = lint;
exports['bump-minor'] = bumpMinor;
exports['bump-patch'] = bumpPatch;
exports['update-version'] = updateVersion;
exports['watch.browser-sync'] = gulp.series(buildDemo, watchBrowserSync);
exports.watch = watch;
exports.deploy = deploy;
exports.release = release;
exports.patch = patch;
exports.build = build;
exports.test = test;
exports.default = watch;
