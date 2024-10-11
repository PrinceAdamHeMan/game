const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const hemanImg = new Image();
hemanImg.src = 'heman.png';
const bearImg = new Image();
bearImg.src = 'bear.png';
const lightningImg = new Image();
lightningImg.src = 'lightning.png';

// Game variables
let heman = { x: canvas.width / 2 - 50, y: canvas.height - 100, width: 100, height: 100, speed: 5 };
let bear = { x: Math.random() * (canvas.width - 100), y: 50, width: 100, height: 100 };
let sword = { x: heman.x, y: heman.y, width: 20, height: 50, speed: 5, active: false };
let lightning = { x: -100, y: -100, width: 50, height: 100, speed: 10, active: false };
let score = 0;
let gameDuration = 300; // 5 minutes in seconds
let startTime = Date.now();

// Audio
const hitSound = document.getElementById('hitSound');
const hemanSounds = [
    document.getElementById('heman1'),
    document.getElementById('heman2'),
    document.getElementById('heman3'),
    document.getElementById('heman4')
];

// Keyboard inputs
let keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Main game loop
function gameLoop() {
    const currentTime = Date.now();
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    const remainingTime = gameDuration - elapsed;

    if (remainingTime <= 0) {
        alert(`Game over! Your score: ${score}`);
        document.location.reload();
    }

    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('time').textContent = `Time: ${remainingTime}`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Move He-Man
    if (keys['ArrowLeft'] && heman.x > 0) heman.x -= heman.speed;
    if (keys['ArrowRight'] && heman.x < canvas.width - heman.width) heman.x += heman.speed;

    // Draw He-Man
    ctx.drawImage(hemanImg, heman.x, heman.y, heman.width, heman.height);

    // Draw bear
    ctx.drawImage(bearImg, bear.x, bear.y, bear.width, bear.height);

    // Sword logic
    if (keys[' '] && !sword.active) {
        sword.active = true;
        sword.x = heman.x + heman.width / 2 - sword.width / 2;
        sword.y = heman.y;
    }

    if (sword.active) {
        sword.y -= sword.speed;
        ctx.fillStyle = 'gray';
        ctx.fillRect(sword.x, sword.y, sword.width, sword.height);

        // Check for hit
        if (sword.y < bear.y + bear.height && sword.y + sword.height > bear.y && sword.x < bear.x + bear.width && sword.x + sword.width > bear.x) {
            score++;
            sword.active = false;
            bear.x = Math.random() * (canvas.width - bear.width); // Move bear to a new location
            hitSound.play();
        }

        if (sword.y < 0) {
            sword.active = false;
        }
    }

    // Lightning logic
    if (!lightning.active && !sword.active) {
        lightning.active = true;
        lightning.x = sword.x;
        lightning.y = 0;
    }

    if (lightning.active) {
        lightning.y += lightning.speed;
        ctx.drawImage(lightningImg, lightning.x, lightning.y, lightning.width, lightning.height);

        // Check if lightning hits He-Man
        if (lightning.y > heman.y && lightning.x < heman.x + heman.width && lightning.x + lightning.width > heman.x) {
            alert('You got hit by lightning! Game over.');
            document.location.reload();
        }

        if (lightning.y > canvas.height) {
            lightning.active = false;
        }
    }

    // Random He-Man comments
    if (Math.random() < 0.002) { // Roughly every few seconds
        hemanSounds[Math.floor(Math.random() * hemanSounds.length)].play();
    }

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
