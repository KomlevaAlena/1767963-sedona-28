import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin'; // Замена для squoosh
import mozjpeg from 'imagemin-mozjpeg'; // Для jpg
import pngquant from 'imagemin-pngquant'; // Для png
import webp from 'imagemin-webp'; // Для создания webp
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';

// Styles

export const styles = () => {
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
}

//html

export const html = () => {
  return gulp.src('source/*.html')
  .pipe(htmlmin({ collapseWhitespace: true }))
  .pipe(gulp.dest('build'));
}

//script

const scripts = () => {
  return gulp.src('source/js/*.js')
  .pipe(terser())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest('build/js'))
  .pipe(browser.stream());
  }

//images

export const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(imagemin([
    mozjpeg({ quality: 80, progressive: true }),
    pngquant({ quality: [0.6, 0.8] })
  ]))
  .pipe(gulp.dest('build/img'));
}

export const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png,webp}')
  .pipe(gulp.dest('build/img'));
}

//webp

const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
  .pipe(imagemin([
    webp({ quality: 80 })
  ]))
  .pipe(gulp.dest('build/img'));
}

//svg

export const svg = () =>
  gulp.src(['source/img/**/*.svg', '!source/img/icon/*.svg'])
    .pipe(svgo())
    .pipe(gulp.dest('build/img'));

const sprite = () => {
  return gulp.src('source/img/icon/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

//copy

export const copy = (done) => {
  gulp.src(['source/fonts/*.{woff2,woff}',
  'source/*.ico',], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//clean

export const clean = () => {
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
}

//reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
  }

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp
  ),
  );

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
  styles,
  html,
  scripts,
  svg,
  sprite,
  createWebp
  ),
  gulp.series(
  server,
  watcher
  ));
