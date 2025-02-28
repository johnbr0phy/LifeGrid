let grid;
let nextGrid;
let colors;
let nextColors;
let gridSize = 100;
let cellSize = 10;
let playerFaction = null;
let selectedPattern = null;
let patterns = {
    glider: [[0,1], [1,0], [1,1], [1,2]],
    oscillator: [[0,0], [0,1], [1,0], [1,1]]
};
let cooldown = 0;
let cooldownTime = 5; // seconds
let panX = 0;
let panY = 0;
let zoom = 1;

function setup() {
    createCanvas(800, 600);
    grid = createGrid(gridSize, gridSize);
    nextGrid = createGrid(gridSize, gridSize);
    colors = createGrid(gridSize, gridSize, 'neutral');
    nextColors = createGrid(gridSize, gridSize, 'neutral');
    initializeGrid();
    frameRate(1); // Evolve every second
}

function draw() {
    background(255);
    translate(panX, panY);
    scale(zoom);
    drawGrid();
    updateCooldown();
    updateScore();
}

function mousePressed() {
    if (playerFaction && selectedPattern && cooldown <= 0) {
        let gridX = Math.floor((mouseX - panX) / (cellSize * zoom));
        let gridY = Math.floor((mouseY - panY) / (cellSize * zoom));
        placePattern(gridX, gridY);
        cooldown = cooldownTime;
    }
}

function mouseWheel(event) {
    zoom += event.delta > 0 ? -0.1 : 0.1;
    zoom = constrain(zoom, 0.5, 2);
}

function mouseDragged() {
    panX += mouseX - pmouseX;
    panY += mouseY - pmouseY;
}

function createGrid(rows, cols, defaultValue = false) {
    let grid = new Array(rows);
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols).fill(defaultValue);
    }
    return grid;
}

function initializeGrid() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = Math.random() < 0.2;
            colors[i][j] = grid[i][j] ? (Math.random() < 0.5 ? 'red' : 'blue') : 'neutral';
        }
    }
}

function drawGrid() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let x = i * cellSize;
            let y = j * cellSize;
            if (grid[i][j]) {
                fill(colors[i][j] === 'red' ? color(255, 0, 0) : color(0, 0, 255));
            } else {
                fill(200);
            }
            rect(x, y, cellSize, cellSize);
        }
    }
}

function placePattern(x, y) {
    let pattern = patterns[selectedPattern];
    for (let [dx, dy] of pattern) {
        let px = x + dx;
        let py = y + dy;
        if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
            grid[px][py] = true;
            colors[px][py] = playerFaction;
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
            if (grid[i][j]) {
                if (colors[i][j] === 'red') redCount++;
                else if (colors[i][j] === 'blue') blueCount++;
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
            let liveNeighbors = countLiveNeighbors(i, j);
            if (grid[i][j]) {
                nextGrid[i][j] = liveNeighbors === 2 || liveNeighbors === 3;
            } else {
                nextGrid[i][j] = liveNeighbors === 3;
            }
            if (nextGrid[i][j]) {
                nextColors[i][j] = getMajorityColor(i, j);
            } else {
                nextColors[i][j] = 'neutral';
            }
        }
    }
    [grid, nextGrid] = [nextGrid, grid];
    [colors, nextColors] = [nextColors, colors];
}

function countLiveNeighbors(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let nx = x + i;
            let ny = y + j;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny]) {
                count++;
            }
        }
    }
    return count;
}

function getMajorityColor(x, y) {
    let colorCount = { red: 0, blue: 0 };
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let nx = x + i;
            let ny = y + j;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny]) {
                if (colors[nx][ny] === 'red') colorCount.red++;
                else if (colors[nx][ny] === 'blue') colorCount.blue++;
            }
        }
    }
    if (colorCount.red > colorCount.blue) return 'red';
    else if (colorCount.blue > colorCount.red) return 'blue';
    else return 'neutral';
}

setInterval(evolve, 1000); // Evolve every second
