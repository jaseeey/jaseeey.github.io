'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const cleanCss = require('gulp-clean-css');
const clearDir = require('gulp-clean-dir');
const copy = require('gulp-copy');
const htmlMin = require('gulp-htmlmin');
const terser = require('gulp-terser');
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
    terser({mangle: {toplevel: true}}),
    gulp.dest(target)
));

gulp.task('fingerprint', done => {
    rewriteAssetReferences(hashAssetFilenames());
    done();
});

gulp.task('build', gulp.series('copy', 'minify-html', 'minify-css', 'compress-js', 'fingerprint'));

function hashAssetFilenames() {
    const manifest = {};
    for (const extension of ['css', 'js']) {
        const directory = path.join(target, 'assets', extension);
        if (!fs.existsSync(directory)) continue;
        for (const name of fs.readdirSync(directory)) {
            if (!name.endsWith(`.${extension}`)) continue;
            const hash = hashFile(path.join(directory, name)),
                hashedName = `${path.basename(name, `.${extension}`)}.${hash}.${extension}`;
            fs.renameSync(path.join(directory, name), path.join(directory, hashedName));
            manifest[`assets/${extension}/${name}`] = `assets/${extension}/${hashedName}`;
        }
    }
    return manifest;
}

function hashFile(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex').slice(0, 10);
}

function rewriteAssetReferences(manifest) {
    for (const name of fs.readdirSync(target)) {
        if (!name.endsWith('.html')) continue;
        const filePath = path.join(target, name);
        let html = fs.readFileSync(filePath, 'utf8');
        for (const original of Object.keys(manifest)) {
            html = html.split(original).join(manifest[original]);
        }
        fs.writeFileSync(filePath, html);
    }
}
