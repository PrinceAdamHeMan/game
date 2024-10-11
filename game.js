const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const hemanImg = new Image();
const bearImg = new Image();
const swordImg = new Image();
const lightningImg = new Image();
const backgroundImg = new Image();

hemanImg.src = 'heman.png';
bearImg.src = 'bear.png';
swordImg.src = 'sword.png';
lightningImg.src = 'lightning.png';
backgroundImg.src = 'background.png';

let imagesLoaded = false;

// Error handling for images
hemanImg.onerror = () => console.log('Error loading He-Man image');
bearImg.onerror = () => console.log('Error loading Bear image');
swordImg.onerror = () => console.log('Error loading Sword image');
lightningImg.onerror = () => console.log('Error loading Lightning image');
backgroundImg.onerror = () => console.log('Error loading Background image');

// Ensure images are loaded before starting the game
const checkImagesLoaded = () => {
    if (hemanImg.complete && bearImg.complete && swordImg.complete && lightningImg.complete && backgroundImg.complete) {
        imagesLoaded = true;
        startGame(); // Start game loop after images are loaded
    }
};

hemanImg.onload = checkImagesLoaded;
bearImg.onload = checkImagesLoaded;
swordImg.onload = checkImagesLoaded;
lightningImg.onload = checkImagesLoaded;
backgroundImg.onload = checkImagesLoaded;

// Game variables
const baseLightningSpeed = 1; // Initial lightning speed
const speedScaleFactor = 0.5; // Increase in speed based on score
const lightningScaleFactor = 0.25; // Reduce size by a factor of 4

let heman = { x: canvas.width / 2 - 50, y: canvas.height - 120, width: 100, height: 100, speed: 5 };
let bear = { x: Math.random() * (canvas.width - 200), y: 50, width: 200, height: 200 }; // Bear scaled to twice its original size
let sword = { x: heman.x + heman.width / 2 - 20, y: heman.y, width: 40, height: 100, speed: 2, active: false };
let lightningBolt = null;
let score = 0;
let gameDuration = 300000; // 5 minutes in milliseconds
let startTime = Date.now();
let swordThrown = false;
let gameEnded = false;
let lightningSpeed = baseLightningSpeed;
let lastHeManPosition = { x: heman.x, y: heman.y };
let firstSwordThrown = false; // Track if the first sword has been thrown

// Audio elements
const hitSound = document.getElementById('hitSound');
const hemanSounds = [
    document.getElementById('heman1'),
    document.getElementById('heman2'),
    document.getElementById('heman3'),
    document.getElementById('heman4')
];

// Add audio element for background music
const backgroundMusic = new Audio('background.mp3');
backgroundMusic.loop = true; // Loop the music

// Keyboard input
let keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Game loop
function startGame() {
    if (imagesLoaded) {
        backgroundMusic.play(); // Start playing background music
        requestAnimationFrame(gameLoop);
    } else {
        console.log('Images not fully loaded');
    }
}

function updateLightningSpeed() {
    lightningSpeed = baseLightningSpeed + (score * speedScaleFactor);
}

function gameLoop() {
    if (gameEnded) {
        return; // Stop the game loop if the game has ended
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max((gameDuration - elapsedTime) / 1000, 0).toFixed(0);

    if (remainingTime <= 0 || gameEnded) {
        endGame();
        return;
    }

    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('time').textContent = `Time: ${remainingTime} seconds`;

    // Clear the canvas and set background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

    // Move He-Man
    if (keys['ArrowLeft'] && heman.x > 0) heman.x -= heman.speed;
    if (keys['ArrowRight'] && heman.x < canvas.width - heman.width * 2) heman.x += heman.speed;

    // Ensure He-Man is within the canvas
    heman.x = Math.max(0, Math.min(canvas.width - heman.width * 2, heman.x));
    heman.y = Math.max(0, Math.min(canvas.height - heman.height * 2, heman.y));

    // Update last He-Man position if sword is thrown
    if (swordThrown) {
        lastHeManPosition = { x: heman.x, y: heman.y };
    }

    // Draw He-Man
    ctx.drawImage(hemanImg, heman.x, heman.y, heman.width * 2, heman.height * 2); // Scale He-Man image

    // Draw Bear
    ctx.drawImage(bearImg, bear.x, bear.y, bear.width, bear.height); // Bear scaled to twice its original size

    // Sword Logic
    if (keys[' '] && !sword.active) {
        sword.active = true;
        sword.x = heman.x + heman.width / 2 - sword.width / 2;
        sword.y = heman.y;
        swordThrown = true;

        // Play background music after the first sword is thrown
        if (!firstSwordThrown) {
            backgroundMusic.play();
            firstSwordThrown = true;
        }

        createLightningBolt(); // Start a new lightning bolt when the sword is thrown
    }

    if (sword.active) {
        sword.y -= sword.speed;
        ctx.drawImage(swordImg, sword.x, sword.y, sword.width, sword.height);

        // Check for hit with the bear (any part of the bear)
        if (sword.y < bear.y + bear.height && sword.y + sword.height > bear.y && sword.x < bear.x + bear.width && sword.x + sword.width > bear.x) {
            score++;
            sword.active = false;
            sword.x = heman.x + heman.width / 2 - sword.width / 2; // Reset sword position
            sword.y = heman.y;
            bear.x = Math.random() * (canvas.width - bear.width);
            hitSound.play();
        }

        if (sword.y < 0) {
            sword.active = false;
            sword.x = heman.x + heman.width / 2 - sword.width / 2; // Reset sword position
            sword.y = heman.y;
        }
    }

    // Lightning Bolt Logic
    if (lightningBolt) {
        lightningBolt.y += lightningBolt.speed;
        ctx.drawImage(lightningImg, lightningBolt.x, lightningBolt.y, lightningBolt.width, lightningBolt.height);

        // Calculate the middle of He-Man's asset
        const hemanMiddleX = heman.x + heman.width * 2 / 2;
        const hemanMiddleY = heman.y + heman.height * 2 / 2;

        // Check if lightning hits the middle of He-Man's asset
        if (lightningBolt.x + lightningBolt.width > hemanMiddleX - 10 &&
            lightningBolt.x < hemanMiddleX + 10 &&
            lightningBolt.y + lightningBolt.height > hemanMiddleY - 10 &&
            lightningBolt.y < hemanMiddleY + 10) {
            endGame();
            document.getElementById('gameOverMessage').style.display = 'block'; // Show the end game message
            return;
        }

        // Remove lightning bolt if it goes off the screen
        if (lightningBolt.y > canvas.height) {
            lightningBolt = null; // Reset lightning bolt
        }
    }

    // Update lightning speed
    updateLightningSpeed();

    if (Math.random() < 0.002) {
        hemanSounds[Math.floor(Math.random() * hemanSounds.length)].play();
    }

    requestAnimationFrame(gameLoop);
}

function createLightningBolt() {
    lightningBolt = {
        x: lastHeManPosition.x + Math.random() * (heman.width * 2 - lightningImg.width * lightningScaleFactor),
        y: 0,
        width: lightningImg.width * lightningScaleFactor,
        height: lightningImg.height * lightningScaleFactor,
        speed: lightningSpeed * 0.2 // Slower speed
    };
}

function endGame() {
    if (gameEnded) return; // Prevent multiple calls to endGame

    gameEnded = true;
    backgroundMusic.pause(); // Stop the background music
    document.getElementById('finalScore').textContent = `Final Score: ${score}`;
    document.getElementById('gameOverMessage').style.display = 'block'; // Show the end game message
    stopAllSounds();
}

function resetGame() {
    gameEnded = false;
    score = 0;
    startTime = Date.now();
    swordThrown = false;
    sword.active = false;
    lightningBolt = null; // Reset lightning bolt
    firstSwordThrown = false; // Reset the first sword thrown flag
    heman.x = canvas.width / 2 - 50; // Reset He-Man position
    bear.x = Math.random() * (canvas.width - bear.width); // Reset Bear position
    document.getElementById('finalScore').textContent = ''; // Clear final score display
    document.getElementById('gameOverMessage').style.display = 'none'; // Hide the end game message
    startGame(); // Restart the game
}

function stopAllSounds() {
    // Stop all sound effects if necessary
    hitSound.pause();
    hemanSounds.forEach(sound => sound.pause());
}

document.getElementById('resetButton').addEventListener('click', resetGame);

// Initial call to check for loaded images
checkImagesLoaded();

