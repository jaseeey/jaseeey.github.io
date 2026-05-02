(() => {
    const canvas = document.getElementById('c'),
        context = canvas.getContext('2d'),
        particles = [],
        particleCount = 70,
        particleDirections = ['u', 'r', 'd', 'l'];
    let width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight;

    function initTiles() {
        window.addEventListener('resize', stageCanvas);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new TileParticle());
        }
        stageCanvas();
        loopTiles();
    }

    function TileParticle() {
        this.size = 2;
        this.length = 18;
        this.location = {
            x: getRandomTileCoordinate(width, this.size, this.length),
            y: getRandomTileCoordinate(height, this.size, this.length)
        };
    }

    function stageCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        context.fillStyle = 'rgba(5, 5, 5, 1)';
        context.fillRect(0, 0, width, height);
    }

    function loopTiles() {
        requestAnimationFrame(loopTiles);
        drawTiles();
    }

    function drawTiles() {
        context.fillStyle = 'rgba(5, 5, 5, 0.07)';
        context.fillRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i],
                direction = particleDirections[Math.floor(Math.random() * particleDirections.length)];
            context.fillStyle = i % 5 === 0 ? 'rgba(255,106,61,0.16)' : 'rgba(255,255,255,0.08)';
            context.beginPath();
            context.fillRect(particle.location.x, particle.location.y, particle.size, particle.size);
            moveParticle(particle, direction);
            context.fillRect(particle.location.x, particle.location.y, particle.size, particle.size);
            resetParticleIfNeeded(particle);
        }
    }

    function moveParticle(particle, direction) {
        switch (direction) {
            case 'u':
                particle.location.y -= particle.length;
                break;
            case 'r':
                particle.location.x += particle.length;
                break;
            case 'd':
                particle.location.y += particle.length;
                break;
            case 'l':
                particle.location.x -= particle.length;
                break;
            default:
                break;
        }
    }

    function resetParticleIfNeeded(particle) {
        if (particle.location.x < 0 || particle.location.x > width) {
            particle.location.x = getRandomTileCoordinate(width, particle.size, particle.length);
        }
        if (particle.location.y < 0 || particle.location.y > height) {
            particle.location.y = getRandomTileCoordinate(height, particle.size, particle.length);
        }
    }

    function getRandomTileCoordinate(max, size, length) {
        return Math.floor(Math.floor(Math.random() * max) / size) * length;
    }

    initTiles();
})();
