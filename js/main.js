// Canvas ja context muuttujat
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Ruudukon koko 20x20
const GRID_SIZE = 20;

// Solun pikselikoko - lasketaan canvaksen koon mukaan
let cellSize;

// Peliruudukko - 2D taulukko
// 0 = tyhjä, 1 = seinä, 2 = lähtöpiste, 3 = maali
let grid = [];

// Pelaajan tila - lähtopiste / maali {row, col}
let startCell = null;
let endCell = null;

// Kontrolli buttoneiden aktiivinen tila: 'start', 'end', 'wall'
let currentMode = 'start';

// Hiiren raahaus seinien piirtämiseen
let isMouseDown = false;

// Valittu algoritmi: 'bfs' tai 'dfs'
let selectedAlgorithm = null;

// Spritet
const monsterSprite = new Image();
const playerSprite = new Image();
monsterSprite.src = 'images/monsteri.png';
playerSprite.src = 'images/pelaaja.png';

// Sprite lataus
let spritesLoaded = 0;
monsterSprite.onload = () => { spritesLoaded++; if (spritesLoaded === 2) initGame(); };
playerSprite.onload = () => { spritesLoaded++; if (spritesLoaded === 2) initGame(); };