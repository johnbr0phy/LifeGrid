let grid;
let nextGrid;
let colors;
let nextColors;
let gridSize = 100; // 100x100 grid
let cellSize = 10; // Each cell is 10x10 pixels
let playerFaction = null;
let selectedPattern = null;
let patterns = {
    glider: [[0,1], [1,0], [1,1], [1,2]], // Relative positions for a glider
    oscillator: [[0,0], [0,1], [1,0], [1,1]] // Relative positions for an oscillator
};
let cooldown = 0;
let cooldownTime = 5; // 5 seconds cooldown for pattern placement
let panX = 0; // Panning offset in x-direction
let panY = 0; // Panning offset in y-direction
let zoom = 1; // Zoom level (1 = normal, >1 = zoomed in, <1 = zoomed out)

function setup() {
    createCanvas(800, 600); // Create an 800x600 canvas
    grid = createGrid(gridSize, gridSize);
    nextGrid = createGrid(gridSize, gridSize);
    colors = createGrid(gridSize, gridSize, 'neutral');
    nextColors = createGrid(gridSize, gridSize, 'neutral');
    initializeGrid();
    frameRate(1); // Evolve the grid once per second
}

function draw() {
    background(255); // Clear the background
    // Apply panning and zooming transformations
    translate(panX, panY);
    scale(zoom);
    drawGrid(); // Draw the current state of the grid
    updateCooldown(); // Update the cooldown timer
    updateScore(); // Update the score display
}

function mousePressed() {
    if (playerFaction && selectedPattern && cooldown <= 0) {
        // Calculate the grid coordinates from mouse position, accounting for zoom and pan
        let originalX = (mouseX / zoom) - panX;
        let originalY = (mouseY / zoom) - panY;
        let gridX = Math.floor(originalX / cellSize);
        let gridY = Math.floor(originalY / cellSize);
        // Ensure the click is within the grid boundaries
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
            placePattern(gridX, gridY);
            cooldown = cooldownTime; // Reset cooldown
        }
    }
}

function mouseWheel(event) {
    // Adjust zoom level based on mouse wheel scroll
    zoom += event.delta > 0 ? -0.1 : 0.1;
    zoom = constrain(zoom, 0.5, 2); // Limit zoom between 0.5 and 2
}

function mouseDragged() {
    // Update panning based on mouse drag, adjusted for zoom level
    panX += (mouseX - pmouseX) / zoom;
    panY += (mouseY - pmouseY) / zoom;
}

function createGrid(rows, cols, defaultValue = false) {
    // Create a 2D array with the specified dimensions and default value
    let grid = new Array(rows);
    for (let i = 0; i < rows; i++) {
        grid[i] = new Array(cols).fill(defaultValue);
    }
    return grid;
}

function initializeGrid() {
    // Randomly initialize the grid with 20% of cells alive and random colors
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = Math.random() < 0.2;
            colors[i][j] = grid[i][j] ? (Math.random() < 0.5 ? 'red' : 'blue') : 'neutral';
        }
    }
}

function drawGrid() {
    // Draw each cell based on its state and color
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let x = i * cellSize;
            let y = j * cellSize;
            if (grid[i][j]) {
                if (colors[i][j] === 'red') {
                    fill(255, 0, 0);
                } else if (colors[i][j] === 'blue') {
                    fill(0, 0, 255);
                } else {
                    fill(0); // Should not happen, but default to black
                }
            } else {
                fill(200); // Dead cells are gray
            }
            rect(x, y, cellSize, cellSize);
        }
    }
}

function placePattern(x, y) {
    // Place the selected pattern at the specified grid position
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
        cooldown -= 1 / frameRate(); // Decrease cooldown based on frame rate
        document.getElementById('cooldown').innerText = Math.ceil(cooldown);
    }
}

function updateScore() {
    // Calculate and display the number of live cells for each faction
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
    // Evolve the grid based on Conway's Game of Life rules
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
    // Swap the grids
    [grid, nextGrid] = [nextGrid, grid];
    [colors, nextColors] = [nextColors, colors];
}

function countLiveNeighbors(x, y) {
    // Count the number of live neighbors around a cell
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
    // Determine the majority color among live neighbors
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
    else return 'neutral'; // In case of a tie
}

// Evolve the grid every second
setInterval(evolve, 1000);
