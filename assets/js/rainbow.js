'use strict';

const speed = 5;
const minDist = 20;
const maxDist = 50;
const initWidth = 1;
const initLines = 300;
const maxLines = 2500;
const dirCoordinates = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [.7, .7], [.7, -.7], [-.7, .7], [-.7, -.7],
];

let timeSinceLast = 0;
let lines = [];
let frame = 0;
let lineOpts;
let canvas;
let ctx;

function Line(parent = {}) {
    this.x = parent.x || canvas.width / 4;
    this.y = parent.y || canvas.height / 2;
    this.w = (parent.w || initWidth) / 1.25;
    do {
        [this.vx, this.vy] = dirCoordinates[(Math.random() * dirCoordinates.length) | 0];
        this.vx *= speed;
        this.vy *= speed;
    } while ((this.vx === -parent.vx && this.vy === -parent.vy) || (this.vx === parent.vx && this.vy === parent.vy));
    this.dist = Math.random() * (maxDist - minDist) + minDist;

    this.step = () => {
        let dead = false;
        let prevX = this.x;
        let prevY = this.y;
        this.x += this.vx;
        this.y += this.vy;
        --this.dist;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            dead = true;
        }

        if (this.dist <= 0 && canvas.width > 1) {
            this.dist = (Math.random() * ( maxDist - minDist ) + minDist);
            if (lines.length < maxLines) {
                lines.push(new Line(this));
            }
            if (lines.length < maxLines && Math.random() < 0.5) {
                lines.push(new Line(this));
            }
            if(Math.random() < 0.2) {
                dead = true;
            }
        }

        ctx.strokeStyle = ctx.shadowColor = getColour(this.x);
        ctx.beginPath();
        ctx.lineWidth = this.w;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(prevX, prevY);
        ctx.stroke();
        if (dead) {
            return true
        }
    };
}

function init() {
    [canvas, ctx] = getCanvas();
    resize();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
}

function resize() {
    [canvas.width, canvas.height] = getDimensions();
}

function spawn() {
    for (let i = 0; i < initLines; ++i) {
        lines.push(new Line());
    }
}

function animate() {
    window.requestAnimationFrame(animate);
    ++frame;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0.4;
    for (let i = 0; i < lines.length; ++i) {
        if (lines[i].step()) {
            lines.splice(i, 1);
            --i;
        }
    }
    ++timeSinceLast;
    if (lines.length < maxLines && timeSinceLast > 10 && Math.random() < 0.5) {
        timeSinceLast = 0;
        lines.push(new Line(lineOpts));
    }
}

function getCanvas() {
    const canvas = document.getElementsByTagName('canvas')[0];
    return [canvas, canvas.getContext('2d')];
}

function getDimensions() {
    return [window.innerWidth, window.innerHeight];
}

function getColour(x) {
    return 'hsl(hue, 80%, 20%)'.replace('hue', x / canvas.width * 360 + frame);
}

document.addEventListener("DOMContentLoaded", () => {
    init();
    spawn();
    animate();
    window.addEventListener('resize', () => resize());
});
