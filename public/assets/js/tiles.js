let c = document.getElementById('c'),
    ctx = c.getContext('2d'),
    w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    particles = [],
    particleCount = 70;

const contactRevealDelay = 3200,
    contactEntries = {
        email: {
            display: [109, 101, 64, 106, 97, 115, 101, 121, 46, 105, 111],
            href: [109, 101, 64, 106, 97, 115, 101, 121, 46, 105, 111],
            hrefPrefix: [109, 97, 105, 108, 116, 111, 58],
            ariaLabel: [69, 109, 97, 105, 108, 32, 74, 73, 32, 68, 69, 86]
        },
        github: {
            display: [103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47, 106, 97, 115, 101, 101, 101, 121],
            href: [104, 116, 116, 112, 115, 58, 47, 47, 103, 105, 116, 104, 117, 98, 46, 99, 111, 109, 47, 106, 97, 115, 101, 101, 101, 121],
            ariaLabel: [79, 112, 101, 110, 32, 71, 105, 116, 72, 117, 98],
            external: true
        },
        blog: {
            display: [106, 97, 115, 101, 121, 46, 98, 108, 111, 103],
            href: [104, 116, 116, 112, 115, 58, 47, 47, 106, 97, 115, 101, 121, 46, 98, 108, 111, 103],
            ariaLabel: [79, 112, 101, 110, 32, 98, 108, 111, 103],
            external: true
        },
        linkedin: {
            display: [47, 105, 110, 47, 106, 97, 115, 101, 101, 101, 121],
            href: [104, 116, 116, 112, 115, 58, 47, 47, 119, 119, 119, 46, 108, 105, 110, 107, 101, 100, 105, 110, 46, 99, 111, 109, 47, 105, 110, 47, 106, 97, 115, 101, 101, 101, 121, 47],
            ariaLabel: [79, 112, 101, 110, 32, 76, 105, 110, 107, 101, 100, 73, 110],
            external: true
        },
        stack: {
            display: [115, 116, 97, 99, 107, 111, 118, 101, 114, 102, 108, 111, 119, 47, 50, 49, 51, 48, 50, 53, 54],
            href: [104, 116, 116, 112, 115, 58, 47, 47, 115, 116, 97, 99, 107, 111, 118, 101, 114, 102, 108, 111, 119, 46, 99, 111, 109, 47, 117, 115, 101, 114, 115, 47, 50, 49, 51, 48, 50, 53, 54],
            ariaLabel: [79, 112, 101, 110, 32, 83, 116, 97, 99, 107, 32, 79, 118, 101, 114, 102, 108, 111, 119],
            external: true
        }
    };

window.addEventListener('resize', stage);

function init() {
    scheduleContactHydration();
    for (let i = 0; i < particleCount; i++)
        particles.push(new Particle());
    stage();
    loop();
}

function scheduleContactHydration() {
    window.setTimeout(hydrateContactLinks, contactRevealDelay);
}

function decodeContact(codes) {
    return String.fromCharCode(...codes);
}

function hydrateContactLinks() {
    const links = document.querySelectorAll('[data-contact-link]');

    links.forEach((link) => {
        const entry = contactEntries[link.dataset.contactLink],
            value = link.querySelector('[data-contact-value]');

        if (!entry || !value) return;

        link.href = `${decodeContact(entry.hrefPrefix || [])}${decodeContact(entry.href)}`;
        link.setAttribute('aria-label', decodeContact(entry.ariaLabel));
        value.textContent = decodeContact(entry.display);

        if (entry.external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
    });
}

function stage() {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    ctx.fillStyle = 'rgba(5, 5, 5, 1)';
    ctx.fillRect(0, 0, w, h);
}

function Particle() {
    this.size = 2;
    this.length = 18;
    this.location = {
        x: ~~(~~(Math.random() * w) / this.size) * this.length,
        y: ~~(~~(Math.random() * h) / this.size) * this.length
    };
}

function draw() {
    ctx.fillStyle = 'rgba(5, 5, 5, 0.07)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i],
            directions = ['u', 'r', 'd', 'l'],
            direction = directions[~~(Math.random() * directions.length)];
        ctx.fillStyle = i % 5 === 0 ? 'rgba(255,106,61,0.16)' : 'rgba(255,255,255,0.08)';
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
        if (p.location.x < 0 || p.location.x > w) p.location.x = ~~(~~(Math.random() * w) / p.size) * p.length;
        if (p.location.y < 0 || p.location.y > h) p.location.y = ~~(~~(Math.random() * h) / p.size) * p.length;
    }
}

function loop() {
    requestAnimationFrame(loop);
    draw();
}

init();
