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

// Ladataan spritet etukäteen jotta ne ovat valmiina kun canvas piirtää
const startSprite = new Image();
startSprite.src = 'images/monsteri.png'; // Monsteri-sprite

const endSprite = new Image();
endSprite.src = 'images/pelaaja.png'; // Maali-sprite

// Muistaa kumpi algoritmi valittiin alkuvalikosta
let currentAlgorithm = 'bfs';

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
                    ctx.fillStyle = '#0A0A0A';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.drawImage(startSprite, x, y, cellSize, cellSize);
                    break;
                case 'end':
                    ctx.fillStyle = '#0A0A0A';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    ctx.drawImage(endSprite, x, y, cellSize, cellSize);
                    break;
                case 'wall':
                    ctx.fillStyle = '#333333';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    break;
                case 'visited':
                    ctx.fillStyle = '#660000';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    break;
                case 'path':
                    ctx.fillStyle = '#FF8C00';
                    ctx.fillRect(x, y, cellSize, cellSize);
                    break;
                default:
                    ctx.fillStyle = '#0A0A0A';
                    ctx.fillRect(x, y, cellSize, cellSize);
            }

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

    // Tallennetaan valittu algoritmi
    currentAlgorithm = algorithm;

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
            flashCell(row, col);
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
            flashCell(row, col);
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
            flashCell(row, col);
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

// Solu vilkkuu jos yritetään asettaa päällekkäin lähtöpiste ja maali
function flashCell(row, col) {
    const cellSize = canvas.width / GRID_SIZE;
    const x = col * cellSize;
    const y = row * cellSize;

    let count = 0;
    const maxFlashes = 3;

    const interval = setInterval(() => {

        // Vilkku päälle - punainen
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(x, y, cellSize, cellSize);

        setTimeout(() => {

            // Vilkku pois - piirretään solu normaalisti takaisin
            drawGrid();
        }, 150);

        count++;
        if (count >= maxFlashes) {
            clearInterval(interval);
        }
    }, 300);
}

// BFS algoritmi - laskee kaikki askeleet valmiiksi listaan animointia varten
function bfs(startRow, startCol) {

    // Jono johon lisätään solut käsiteltäväksi
    const queue = [];

    // Lista kaikista askeleista animointia varten
    const steps = [];

    // Muistirakenne mistä soluun tultiin, jotta voidaan piirtää polku
    // Avain on 'rivi, sarake' merkkijono, arvo on edellinen solu
    const cameFrom = {};

    // Aloitetaan lähtöpisteestä
    queue.push({ row: startRow, col: startCol});
    cameFrom[`${startRow},${startCol}`] = null;

    // Käydään soluja läpi kunnes jono on tyhjä tai maali löytyi
    while (queue.length > 0) {

        // Otetaan jonon ensimmäinen solu käsittelyyn
        const current = queue.shift();
        const { row, col } = current;

        // Jos löydettiin maali, lopetetaan
        if (grid[row][col] === 'end') {

            // Rakennetaan path takaperin cameFrom rakenteen avulla
            const path = [];
            let key = `${row},${col}`;

            while (cameFrom[key] !== null) {
                const prev = cameFrom[key];
                path.unshift({ row: prev.row, col: prev.col });
                key = `${prev.row},${prev.col}`;
            }

            return { steps, path, found: true };
        }

        // Käydään läpi naapurisolut (ylös, alas, vasen, oikea)
        const neighbors = [
            { row: row - 1, col: col },
            { row: row + 1, col: col },
            { row: row, col: col - 1 },
            { row: row, col: col + 1 }
        ];

        for (const neighbor of neighbors) {
            const key = `${neighbor.row},${neighbor.col}`;

            // Tarkistetaan että solu on ruudukon sisällä
            const inBounds = neighbor.row >= 0 && neighbor.row < GRID_SIZE && neighbor.col >= 0 && neighbor.col < GRID_SIZE;

            // Lisätään jonoon jos solu on käymätön eikä ole seinä
            if (inBounds && !(key in cameFrom) && grid[neighbor.row][neighbor.col] !== 'wall') {
                queue.push(neighbor);
                cameFrom[key] = current;

                // Tallennetaan askel animaatiota varten (ei tallenneta start/end soluja)
                if (grid[neighbor.row][neighbor.col] === 'empty') {
                    steps.push({ row: neighbor.row, col: neighbor.col });
                }
            }
        }
    }

    // Jono tyhjeni ilman että maali löytyi
    return { steps, path: [], found: false };
}

// Animoi BFS askel kerrallaan käyttäen steps-listaa
function animateBFS(steps, path, startRow, startCol) {

    // Lasketaan viive nopeussäätimen arvosta
    // Arvo 1 = hidas (500ms), arvo 10 = nopea (50ms)
    const speed = document.getElementById('speed-slider').value;
    const delay = 550 - (speed * 50);

    let stepIndex = 0;

    // Käydään steps-lista läpi askel kerrallaan
    function nextStep() {
        if (stepIndex >= steps.length) {

            // Puhdistetaan viimeinen hakuruutu visited-tilaan, jos hakuja tehtiin
            if (steps.length > 0) {
                const lastStep = steps[steps.length - 1];
                grid[lastStep.row][lastStep.col] = 'visited';
            }

            // Asetetaan monsteri takaisin lähtöruutuun ennen polun alkua
            grid[startRow][startCol] = 'start';
            drawGrid();

            // Kutsutaan polkuanimaatiota ja annetaan sille lähtöpiste mukaan
            animatePath(path, startRow, startCol);
            return;
        }

        const { row, col } = steps[stepIndex];

        // Merkitään edellinen monsteri-solu visited-tilaan
        if (stepIndex > 0) {
            const prev = steps[stepIndex - 1];
            grid[prev.row][prev.col] = 'visited';
        } else {
            grid[startRow][startCol] = 'visited';
        }

        // Siirretään monsteri uuteen soluun
        grid[row][col] = 'start';
        drawGrid();

        stepIndex++;
        setTimeout(nextStep, delay);
    }

    nextStep();
}

// Animoidaan löydetty path askel kerrallaan
function animatePath(path, startRow, startCol) {
    const speed = document.getElementById('speed-slider').value;
    const delay = 550 - (speed * 50);

    let pathIndex = 0;

    function nextPathStep() {
        if (pathIndex >= path.length) {

           // Polku loppui (monsteri saavutti maalin)
            unlockButtons();
            return;
        }

        const { row, col } = path[pathIndex];

        // Korvataan edellinen ruutu polku-värillä
        if (pathIndex > 0) {
            const prev = path[pathIndex - 1];
            grid[prev.row][prev.col] = 'path';
        } else {
            // Ensimmäisessä askelessa muutetaan lähtöruutu poluksi, kun monsteri liikkuu eteenpäin
            grid[startRow][startCol] = 'path';
        }

        // Merkitään solu pathiksi
        grid[row][col] = 'start';
        unlockButtons();
        drawGrid();

        pathIndex++;
        setTimeout(nextPathStep, delay);
    }

    nextPathStep();
}

// Lukitaan napit algoritmin ajon ajaksi
function lockButtons() {
    document.getElementById('btn-start-point').disabled = true;
    document.getElementById('btn-end-point').disabled = true;
    document.getElementById('btn-wall').disabled = true;
    document.getElementById('btn-run').disabled = true;
    document.getElementById('btn-back').disabled = true;
    document.getElementById('speed-slider').disabled = true;
}

// Vapautetaan napit algoritmin ajon jälkeen
function unlockButtons() {
    document.getElementById('btn-start-point').disabled = false;
    document.getElementById('btn-end-point').disabled = false;
    document.getElementById('btn-wall').disabled = false;
    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-back').disabled = false;
    document.getElementById('speed-slider').disabled = false;
}

// Käynnistetään valittu algoritmi
function startAlgorithm() {

    // Etsitään lähtöpisteen sijainti gridistä
    let startRow = -1;
    let startCol = -1;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === 'start') {
                startRow = r;
                startCol = c;
            }
        }
    }

    // Lukitaan napit ajon ajaksi
    lockButtons();

    // Valitaan algoritmi sen mukaan kumpi valittiin alkuvalikosta
    const result = currentAlgorithm === 'bfs' ? bfs(startRow, startCol) : dfs(startRow, startCol);

    if (result.found) {
        animateBFS(result.steps, result.path, startRow, startCol);
    } else {
        animateBFS(result.steps, []);
    }
}

// DFS algoritmi - toiminta sama idea kuin BFS mutta käyttää pinoa jonon sijaan
// Tämä tekee etsinnästä syvyyssuuntaisen leveyssuuntaisen sijaan
function dfs(startRow, startCol) {

    // Pino johon lisätään solut käsiteltäväksi
    const stack = [];

    // Lista kaikista askeleista animaatiota varten
    const steps = [];

    // Muistirakenne mistä soluun tultiin, jotta voidaan piirtää polku
    const cameFrom = {};

    // Aloitetaan lähtöpisteestä
    stack.push({ row: startRow, col: startCol });
    cameFrom[`${startRow},${startCol}`] = null;

    // Käydään soluja läpi kunnes pino on tyhjä tai maali löytyy
    while (stack.length > 0) {

        // Otetaan pinon päällimmäinen solu käsittelyyn
        const current = stack.pop();
        const { row, col } = current;

        // Jos löydettiin maali, lopetetaan
        if (grid[row][col] === 'end') {

            // Rakennetaan path taaksepäin cameFrom-rakenteen avulla
            const path = [];
            let key = `${row},${col}`;

            while (cameFrom[key] !== null) {
                const prev = cameFrom[key];
                path.unshift({ row: prev.row, col: prev.col });
                key = `${prev.row},${prev.col}`;
            }

            return { steps, path, found: true };
        }

        // Tallennetaan askel animaatiota varten (ei tallenneta start/end soluja)
        if (grid[row][col] === 'empty') {
            steps.push({ row, col });
        }

        // Käydään läpi naapurisolut (ylös, alas, vasen, oikea)
        const neighbors = [
            { row: row - 1, col: col },
            { row: row + 1, col: col },
            { row: row, col: col - 1 },
            { row: row, col: col + 1 }
        ];

        for (const neighbor of neighbors) {
            const key = `${neighbor.row},${neighbor.col}`;

            // Tarkistetaan että solu on ruudukon sisällä
            const inBounds = neighbor.row >= 0 && neighbor.row < GRID_SIZE && neighbor.col >= 0 && neighbor.col < GRID_SIZE;

            // Lisätään pinoon jos solu on käymätön eikä ole seinä
            if (inBounds && !(key in cameFrom) && grid[neighbor.row][neighbor.col] !== 'wall') {
                stack.push(neighbor);
                cameFrom[key] = current;
            }
        }
    }

    // Pino tyhjeni ilman että maali löytyi
    return { steps, path: [], found: false };
}