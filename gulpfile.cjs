const gulp = require('gulp');
const plumber = require('gulp-plumber');
const less = require('gulp-less');
const postcss = require('gulp-postcss');
const csso = require('postcss-csso');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const browser = require('browser-sync');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const svgo = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const del = require('del');

// Styles
const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
};

// HTML
const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
};

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js')
    .pipe(terser())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(browser.stream());
};

// Images - ПРОСТО КОПИРУЕМ БЕЗ ОПТИМИЗАЦИИ
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg,webp}')
    .pipe(gulp.dest('build/img'));
};

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg,webp}')
    .pipe(gulp.dest('build/img'));
};

// SVG
const svg = () => {
  return gulp.src(['source/img/**/*.svg', '!source/img/icon/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));
};

const sprite = () => {
  return gulp.src('source/img/icon/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
};

// Copy
const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
  done();
};

// Clean
const clean = () => {
  return del('build');
};

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

// Reload
const reload = (done) => {
  browser.reload();
  done();
};

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
};

// Build
const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite
  )
);

// Default
const start = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite
  ),
  gulp.series(
    server,
    watcher
  )
);

// Экспортируем задачи
exports.styles = styles;
exports.html = html;
exports.optimizeImages = optimizeImages;
exports.copyImages = copyImages;
exports.svg = svg;
exports.sprite = sprite;
exports.copy = copy;
exports.clean = clean;
exports.build = build;
exports.default = start;
