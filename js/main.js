const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Ruutujen määrä  esim. 10x10
const GRID_SIZE = 10;

// Ruudukon tila tallennetaan 2D-taulukkoon.
// Jokainen soli on joku seuraavista: 'empty', 'wall', 'start', 'end', 'visited', 'path'
// Tämä pitää datan (mitä solussa on) erillään piirtämisestä
// jolloin ruudukon tilaa voi muokata ja sen mukaan vain piirtää uudelleen
let grid = [];

// Pelinäkymän buttoneiden tila
let currentMode = 'start';

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
                case 'start':
                    ctx.fillStyle = '#00FF00';
                    break;
                case 'end':
                    ctx.fillStyle = '#0000FF';
                    break;
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

// Kuuntelija soluille
canvas.addEventListener('click', function(event) {

    // Selvitetään mitä solua klikattiin canvasin sisällä
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Muutetaan pikselikordinaatit ruudukon rivi/sarake indeksiksi
    const cellSize = canvas.width / GRID_SIZE;
    const col = Math.floor(clickX / cellSize);
    const row = Math.floor(clickY / cellSize);

    // Lähtopisteen asetus
    if (currentMode === 'start') {

        // Estetään ettei voi lähtöpistettä asettaa maalin päälle
        if (grid[row][col] === 'end') {
            return;
        }

        // Poistetaan vanha lähtöpiste ensin (vain yksi kerrallaan)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 'start') {
                    grid[r][c] = 'empty';
                }
            }
        }

        // Asetetaan uusi lähtöpiste
        grid[row][col] = 'start';
        drawGrid();
        updateRunButton();
    }

    // Maalin asetus
    if (currentMode === 'end') {

        // Estetään ettei voi maalia asettaa lähtöpisteen päälle
        if (grid[row][col] === 'start') {
            return;
        }

        // Poistetaan vanha maali ensin (vain yksi kerrallaan)
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 'end') {
                    grid[r][c] = 'empty';
                }
            }
        }

        // Asetetaan uusi maali
        grid[row][col] = 'end';
        drawGrid();
        updateRunButton();
    }

    // Seinän asetus
    if (currentMode === 'wall') {

        // Estetään ettei voi seinää asettaa lähtöpisteen tai maalin päälle
        if (grid[row][col] === 'start' || grid[row][col] === 'end') {
            return;
        }

        // Toggle - jos solu on jo seinä, poistetaan se, muuten lisätään
        if (grid[row][col] === 'wall') {
            grid[row][col] = 'empty';
        } else {
            grid[row][col] = 'wall';
        }

        drawGrid();
        updateRunButton();
    }
});

// Tyhjennetään ruudukko tyhjennä buttonilla - kaikki solut takaisin 'empty' tilaan
function resetGame() {
    grid = createEmptyGrid();
    drawGrid();
    updateRunButton();
}

// Vaihdetaan active tilaa sen mukaan mitä buttonia painettu pelinäkymässä
function setMode(mode) {
    currentMode = mode;

    // Poistetaan active kaikilta kontrolli buttoneilta
    document.getElementById('btn-start-point').classList.remove('active');
    document.getElementById('btn-end-point').classList.remove('active');
    document.getElementById('btn-wall').classList.remove('active');

    // Lisätään active valitulle napille
    if (mode === 'start') document.getElementById('btn-start-point').classList.add('active');
    if (mode === 'end') document.getElementById('btn-end-point').classList.add('active');
    if (mode === 'wall') document.getElementById('btn-wall').classList.add('active');

    // Päivitetään ohjeteksti tilan mukaan
    const instruction = document.getElementById('game-instruction');
    if (mode === 'start') instruction.textContent = 'Aseta lähtöpiste';
    if (mode === 'end') instruction.textContent = 'Aseta maali';
    if (mode === 'wall') instruction.textContent = 'Aseta seinät (valinnainen)';
}

// Käynnistä buttonin disabled tila
// Tarkistetaan onko lähtöpiste ja maali asetettu
function updateRunButton() {
    let hasStart = false;
    let hasEnd = false;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 'start') hasStart = true;
            if (grid[r][c] === 'end') hasEnd = true;
        }
    }

    const btnRun = document.getElementById('btn-run');
    btnRun.disabled = !(hasStart && hasEnd);
}