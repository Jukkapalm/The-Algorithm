const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const GRID_SIZE = 10;

function initGame() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    drawGrid();
}

function drawGrid() {
    const cellSize = canvas.width / GRID_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const x = col * cellSize;
            const y = row * cellSize;

            // Solun taustaväri
            ctx.fillStyle = '#0A0A0A';
            ctx.fillRect(x, y, cellSize, cellSize);

            // Ruudukon viivat
            ctx.strokeStyle = '#1a0000';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
}

// Piirretään kun sivu latautuu
window.addEventListener('load', initGame);

// Piirretään uudelleen kun ikkuna muuttuu
window.addEventListener('resize', initGame);