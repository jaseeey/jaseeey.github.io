'use strict';

const path = require('path');
const gulp = require('gulp');
const cleanCss = require('gulp-clean-css');
const clearDir = require('gulp-clean-dir');
const composer = require('gulp-uglify/composer');
const copy = require('gulp-copy');
const htmlMin = require('gulp-htmlmin');
const uglify = composer(require('uglify-es'), console);
const pipeline = require('readable-stream').pipeline;

const source = path.resolve('public');
const target = path.resolve('build');

gulp.task('copy', () => pipeline(
    gulp.src(path.join(source, '**', '*')),
    clearDir(target),
    copy(target, {prefix: 1}),
    gulp.dest(target)
));

gulp.task('minify-css', () => pipeline(
    gulp.src(path.join(target, '**', '*.css')),
    cleanCss(),
    gulp.dest(target)
));

gulp.task('minify-html', () => pipeline(
    gulp.src(path.join(target, '**', '*.html')),
    htmlMin({collapseWhitespace: true}),
    gulp.dest(target)
));

gulp.task('compress-js', () => pipeline(
    gulp.src(path.join(target, '**', '*.js')),
    uglify({mangle: {toplevel: true}}),
    gulp.dest(target)
));

gulp.task('build', gulp.series('copy', 'minify-html', 'minify-css', 'compress-js'));
