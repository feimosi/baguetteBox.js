// @ts-nocheck

'use strict';

const childProcess = require('child_process');
const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const jsonfile = require('jsonfile');

const paths = {
    css: './src/*.css',
    ts: './src/*.ts',
    js: './.tmp-build/*.js'
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
const autoprefixerOptions = { overrideBrowserslist: autoprefixerBrowsers };

function runCssBuild(buildStream, done) {
    import('gulp-autoprefixer')
        .then(({ default: autoprefixer }) => {
            buildStream(autoprefixer)
                .on('end', done)
                .on('error', done);
        })
        .catch(done);
}

function buildDemoCss(done) {
    runCssBuild(function(autoprefixer) {
        return gulp.src(paths.css)
            .pipe(autoprefixer(autoprefixerOptions))
            .pipe(plugins.concat('baguetteBox.css'))
            .pipe(gulp.dest(demo.css));
    }, done);
}

function buildDemoJs() {
    return gulp.src(paths.js)
        .pipe(plugins.concat('baguetteBox.js'))
        .pipe(gulp.dest(demo.js));
}

function buildDistCss(done) {
    runCssBuild(function(autoprefixer) {
        return gulp.src(paths.css)
            .pipe(autoprefixer(autoprefixerOptions))
            .pipe(plugins.concat('baguetteBox.css'))
            .pipe(gulp.dest(dist.css))
            .pipe(plugins.concat('baguetteBox.min.css'))
            .pipe(plugins.cleanCss({ compatibility: 'ie8' }))
            .pipe(gulp.dest(dist.css));
    }, done);
}

function buildDistJs() {
    return gulp.src(paths.js)
        .pipe(plugins.concat('baguetteBox.js'))
        .pipe(gulp.dest(dist.js))
        .pipe(plugins.concat('baguetteBox.min.js'))
        .pipe(plugins.uglify({ output: { comments: /^!/ }, ie8: true }))
        .pipe(gulp.dest(dist.js));
}

function transpileTs(done) {
    childProcess.execFileSync(process.execPath, [
        require.resolve('typescript/bin/tsc'),
        '--project',
        'tsconfig.build.json'
    ], {
        stdio: 'inherit'
    });
    done();
}

const buildDemo = gulp.parallel(buildDemoCss, buildDemoJs);
const buildDist = gulp.parallel(buildDistCss, buildDistJs);

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
    gulp.watch(paths.ts, gulp.series(transpileTs, buildDemoJs));
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

const build = gulp.series(transpileTs, gulp.parallel(buildDemo, buildDist), updateVersion);
const watch = gulp.series(transpileTs, buildDemo, watchBrowserSync, watchFiles);
const release = gulp.series(bumpMinor, build);
const patch = gulp.series(bumpPatch, build);

exports['build.demo-css'] = buildDemoCss;
exports['build.demo-js'] = buildDemoJs;
exports['build.dist-css'] = buildDistCss;
exports['build.dist-js'] = buildDistJs;
exports['build.demo'] = buildDemo;
exports['build.dist'] = buildDist;
exports['bump-minor'] = bumpMinor;
exports['bump-patch'] = bumpPatch;
exports['update-version'] = updateVersion;
exports['watch.browser-sync'] = gulp.series(buildDemo, watchBrowserSync);
exports.watch = watch;
exports.deploy = deploy;
exports.release = release;
exports.patch = patch;
exports.build = build;
exports.default = watch;
