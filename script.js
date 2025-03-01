let grid;
let nextGrid;
let colors;
let nextColors;
let gridSize = 20; // 20x20x20 grid for 3D
let cellSize = 10; // Each cell is 10x10x10 pixels
let playerFaction = null;
let selectedPattern = null;
let patterns = {
    glider: [[0,1,0], [1,0,0], [1,1,0], [1,2,0]], // Simple 3D glider pattern
    oscillator: [[0,0,0], [0,1,0], [1,0,0], [1,1,0]] // Simple 3D oscillator pattern
};
let cooldown = 0;
let cooldownTime = 5; // seconds
let cam;

function setup() {
    createCanvas(800, 600, WEBGL); // Use WEBGL for 3D rendering
    grid = createGrid(gridSize, gridSize, gridSize);
    nextGrid = createGrid(gridSize, gridSize, gridSize);
    colors = createGrid(gridSize, gridSize, gridSize, 'neutral');
    nextColors = createGrid(gridSize, gridSize, gridSize, 'neutral');
    initializeGrid();
    frameRate(1); // Evolve every second
    cam = createCamera(); // Create a camera for 3D navigation
    cam.setPosition(0, 0, 800); // Position the camera to see the grid
}

function draw() {
    background(255);
    orbitControl(); // Enable mouse controls for rotation, panning, and zooming
    drawGrid();
    updateCooldown();
    updateScore();
}

function mousePressed() {
    if (playerFaction && selectedPattern && cooldown <= 0) {
        // Place pattern at the center of the grid for simplicity
        let x = Math.floor(gridSize / 2);
        let y = Math.floor(gridSize / 2);
        let z = Math.floor(gridSize / 2);
        placePattern(x, y, z);
        cooldown = cooldownTime;
    }
}

function createGrid(x, y, z, defaultValue = false) {
    let grid = new Array(x);
    for (let i = 0; i < x; i++) {
        grid[i] = new Array(y);
        for (let j = 0; j < y; j++) {
            grid[i][j] = new Array(z).fill(defaultValue);
        }
    }
    return grid;
}

function initializeGrid() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            for (let k = 0; k < gridSize; k++) {
                grid[i][j][k] = Math.random() < 0.2; // 20% chance of being alive
                colors[i][j][k] = grid[i][j][k] ? (Math.random() < 0.5 ? 'red' : 'blue') : 'neutral';
            }
        }
    }
}

function drawGrid() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            for (let k = 0; k < gridSize; k++) {
                if (grid[i][j][k]) {
                    push();
                    translate(i * cellSize - (gridSize * cellSize) / 2, j * cellSize - (gridSize * cellSize) / 2, k * cellSize - (gridSize * cellSize) / 2);
                    if (colors[i][j][k] === 'red') {
                        fill(255, 0, 0);
                    } else if (colors[i][j][k] === 'blue') {
                        fill(0, 0, 255);
                    }
                    box(cellSize); // Draw a 3D cube for each live cell
                    pop();
                }
            }
        }
    }
}

function placePattern(x, y, z) {
    let pattern = patterns[selectedPattern];
    for (let [dx, dy, dz] of pattern) {
        let px = x + dx;
        let py = y + dy;
        let pz = z + dz;
        if (px >= 0 && px < gridSize && py >= 0 && py < gridSize && pz >= 0 && pz < gridSize) {
            grid[px][py][pz] = true;
            colors[px][py][pz] = playerFaction;
        }
    }
}

function updateCooldown() {
    if (cooldown > 0) {
        cooldown -= 1 / frameRate();
        document.getElementById('cooldown').innerText = Math.ceil(cooldown);
    }
}

function updateScore() {
    let redCount = 0;
    let blueCount = 0;
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            for (let k = 0; k < gridSize; k++) {
                if (grid[i][j][k]) {
                    if (colors[i][j][k] === 'red') redCount++;
                    else if (colors[i][j][k] === 'blue') blueCount++;
                }
            }
        }
    }
    document.getElementById('redScore').innerText = redCount;
    document.getElementById('blueScore').innerText = blueCount;
}

function setFaction(faction) {
    playerFaction = faction;
    alert(`You have chosen the ${faction} faction.`);
}

function selectPattern(pattern) {
    selectedPattern = pattern;
    alert(`You have selected the ${pattern} pattern.`);
}

function evolve() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            for (let k = 0; k < gridSize; k++) {
                let liveNeighbors = countLiveNeighbors(i, j, k);
                if (grid[i][j][k]) {
                    nextGrid[i][j][k] = liveNeighbors >= 4 && liveNeighbors <= 6; // Survival rule
                } else {
                    nextGrid[i][j][k] = liveNeighbors === 5; // Birth rule
                }
                if (nextGrid[i][j][k]) {
                    nextColors[i][j][k] = getMajorityColor(i, j, k);
                } else {
                    nextColors[i][j][k] = 'neutral';
                }
            }
        }
    }
    [grid, nextGrid] = [nextGrid, grid];
    [colors, nextColors] = [nextColors, colors];
}

function countLiveNeighbors(x, y, z) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (i === 0 && j === 0 && k === 0) continue;
                let nx = x + i;
                let ny = y + j;
                let nz = z + k;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && nz >= 0 && nz < gridSize && grid[nx][ny][nz]) {
                    count++;
                }
            }
        }
    }
    return count;
}

function getMajorityColor(x, y, z) {
    let colorCount = { red: 0, blue: 0 };
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (i === 0 && j === 0 && k === 0) continue;
                let nx = x + i;
                let ny = y + j;
                let nz = z + k;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && nz >= 0 && nz < gridSize && grid[nx][ny][nz]) {
                    if (colors[nx][ny][nz] === 'red') colorCount.red++;
                    else if (colors[nx][ny][nz] === 'blue') colorCount.blue++;
                }
            }
        }
    }
    return colorCount.red > colorCount.blue ? 'red' : colorCount.blue > colorCount.red ? 'blue' : 'neutral';
}

setInterval(evolve, 1000); // Evolve every second
