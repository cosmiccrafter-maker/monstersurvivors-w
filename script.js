const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const restartButton = document.getElementById('restartButton');

let player = { x: canvas.width / 2, y: canvas.height / 2, size: 20, color: 'blue' };
let monsters = [];
let score = 0;
let gameRunning = false;
let monsterSpawnInterval;
let gameLoopInterval;

function startGame() {
    player = { x: canvas.width / 2, y: canvas.height / 2, size: 20, color: 'blue' };
    monsters = [];
    score = 0;
    scoreDisplay.textContent = `得分: ${score}`;
    restartButton.style.display = 'none';
    gameRunning = true;
    canvas.style.cursor = 'none'; // Hide cursor during game

    // Clear any existing intervals
    clearInterval(monsterSpawnInterval);
    clearInterval(gameLoopInterval);

    monsterSpawnInterval = setInterval(spawnMonster, 1000); // Spawn monster every 1 second
    gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS game loop
}

function endGame() {
    gameRunning = false;
    clearInterval(monsterSpawnInterval);
    clearInterval(gameLoopInterval);
    restartButton.style.display = 'block';
    canvas.style.cursor = 'default'; // Show cursor
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.size / 2, player.y - player.size / 2, player.size, player.size);
}

function drawMonsters() {
    monsters.forEach(monster => {
        ctx.fillStyle = monster.color;
        ctx.fillRect(monster.x - monster.size / 2, monster.y - monster.size / 2, monster.size, monster.size);
    });
}

function spawnMonster() {
    const size = 15;
    const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (edge) {
        case 0: x = Math.random() * canvas.width; y = -size; break; // Top
        case 1: x = canvas.width + size; y = Math.random() * canvas.height; break; // Right
        case 2: x = Math.random() * canvas.width; y = canvas.height + size; break; // Bottom
        case 3: x = -size; y = Math.random() * canvas.height; break; // Left
    }
    monsters.push({ x, y, size, color: 'red', speed: 1 + Math.random() * 2 }); // Random speed
}

function updateGame() {
    // Update monster positions
    monsters.forEach((monster, index) => {
        const angle = Math.atan2(player.y - monster.y, player.x - monster.x);
        monster.x += Math.cos(angle) * monster.speed;
        monster.y += Math.sin(angle) * monster.speed;

        // Check collision with player
        const distance = Math.sqrt(
            Math.pow(player.x - monster.x, 2) + Math.pow(player.y - monster.y, 2)
        );
        if (distance < (player.size / 2 + monster.size / 2)) {
            endGame(); // Game Over
        }

        // Remove monsters that are far off-screen (optimization)
        if (monster.x < -100 || monster.x > canvas.width + 100 || monster.y < -100 || monster.y > canvas.height + 100) {
            // This monster didn't hit the player but moved off screen
            // In this simple game, all monsters pursue the player, so this condition
            // might mean they missed the player and flew past.
            // For more complex games, you'd manage removal differently.
        }
    });

    // Filter out monsters that were removed (e.g., hit player)
    monsters = monsters.filter(monster => {
        // Keep monsters unless they've caused game over (handled by endGame)
        // For now, only remove if they somehow go way off screen after missing player
        return monster.x > -150 && monster.x < canvas.width + 150 &&
               monster.y > -150 && monster.y < canvas.height + 150;
    });

    // Update score (simple: increase over time)
    score++;
    scoreDisplay.textContent = `得分: ${score}`;
}


function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
    updateGame();
    drawPlayer();
    drawMonsters();
}

// Event Listeners
canvas.addEventListener('mousemove', (e) => {
    if (gameRunning) {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left;
        player.y = e.clientY - rect.top;
    }
});

document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.key) { // Any key press starts the game
        startGame();
    }
});

restartButton.addEventListener('click', startGame);

// Initial setup
ctx.font = "30px Arial";
ctx.fillStyle = "white";
ctx.textAlign = "center";
ctx.fillText("点击屏幕或按任意键开始游戏", canvas.width / 2, canvas.height / 2);