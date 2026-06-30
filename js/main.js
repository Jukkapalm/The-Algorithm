const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Ruutujen määrä  esim. 10x10
const GRID_SIZE = 10;

// Ruudukon tila tallennetaan 2D-taulukkoon.
// Jokainen soli on joku seuraavista: 'empty', 'wall', 'start', 'end', 'visited', 'path'
// Tämä pitää datan (mitä solussa on) erillään piirtämisestä
// jolloin ruudukon tilaa voi muokata ja sen mukaan vain piirtää uudelleen
let grid = [];

// Luodaan tyhjä ruudukko, jossa jokainen solu on aina alussa 'empty'
function createEmptyGrid() {
    const newGrid = [];

    for (let row = 0; row < GRID_SIZE; row++) {
        const currentRow = [];

        for (let col = 0; col < GRID_SIZE; col++) {
            currentRow.push('empty');
        }

        newGrid.push(currentRow);
    }

    return newGrid;
}

// Alustetaan grid heti kun sivu latautuu
grid = createEmptyGrid();

function initGame() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    drawGrid();
}

// Piirtää ruudukon
function drawGrid() {
    const cellSize = canvas.width / GRID_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const x = col * cellSize;
            const y = row * cellSize;

            // Valitaan solun väri sen tilan mukaan (grid[row][col]).
            switch (grid[row][col]) {
                case 'wall':
                    ctx.fillStyle = '#333333';
                    break;
                case 'visited':
                    ctx.fillStyle = '#660000';
                    break;
                case 'path':
                    ctx.fillStyle = '#FF8C00';
                    break;
                default:
                    ctx.fillStyle = '#0A0A0A';
            }

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

// Vaihdetaan näkymä alkuvalikon valitun pelin mukaan
function startGame(algorithm) {
    const selection = document.getElementById('view-selection');
    const game = document.getElementById('view-game');

    document.getElementById('game-title').textContent = algorithm.toUpperCase();

    selection.classList.remove('fade-in');
    selection.classList.add('fade-out');

    setTimeout(() => {
        selection.style.display = 'none';
        selection.classList.remove('fade-out');

        game.style.display = 'flex';
        game.classList.add('fade-in');
        initGame();
    }, 2000);
}

function showSelection() {
    const selection = document.getElementById('view-selection');
    const game = document.getElementById('view-game');

    game.classList.remove('fade-in');
    game.classList.add('fade-out');

    setTimeout(() => {
        game.style.display = 'none';
        game.classList.remove('fade-out');

        selection.style.display = 'flex';
        selection.classList.remove('fade-in');
        selection.classList.add('fade-in');
    }, 2000);
}