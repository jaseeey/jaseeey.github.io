let c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    particles = [],
    particleCount = 50;

window.addEventListener('resize', stage);

function init() {
    for (let i = 0; i < particleCount; i++)
        particles.push(new Particle());
    stage();
    loop();
}

function stage() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, w, h);
}

function Particle() {
    this.size = 8;
    this.length = 10;
    this.location = {
        x: ~~(~~(Math.random() * w) / this.size) * this.length,
        y: ~~(~~(Math.random() * h) / this.size) * this.length
    };
}

function draw() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i],
            directions = ['u', 'r', 'd', 'l'],
            direction = directions[~~(Math.random() * directions.length)];
        ctx.fillStyle = 'rgba(80,49,135,0.1)';
        ctx.beginPath();
        ctx.fillRect(p.location.x, p.location.y, p.size, p.size);
        switch (direction) {
            case 'u':
                p.location.y -= p.length;
                break;
            case 'r':
                p.location.x += p.length;
                break;
            case 'd':
                p.location.y += p.length;
                break;
            case 'l':
                p.location.x -= p.length;
                break;
            default:
                break;
        }
        ctx.fillRect(p.location.x, p.location.y, p.size, p.size);
        if (p.location.x < 0 || p.location.x > w) p.location.x = ~~(~~(Math.random() * w) / this.size) * this.length;
        if (p.location.y < 0 || p.location.y > h) p.location.y = ~~(~~(Math.random() * h) / this.size) * this.length;
    }
}

function loop() {
    requestAnimationFrame(loop);
    draw();
}

init();
