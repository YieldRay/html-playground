export interface Template {
  name: string;
  description: string;
  code: string;
}

export const HTML_TEMPLATES: Template[] = [
  {
    name: "Basic HTML",
    description: "A simple HTML5 template with basic structure",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My HTML Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, World!</h1>
        <p>This is a basic HTML template.</p>
    </div>
</body>
</html>`
  },
  {
    name: "Interactive Form",
    description: "A form with various input types and JavaScript validation",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .form-container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }
        input, select, textarea {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5a67d8;
        }
        .error {
            color: #e53e3e;
            font-size: 14px;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Contact Form</h2>
        <form id="contactForm">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
                <div class="error" id="nameError"></div>
            </div>
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                <div class="error" id="emailError"></div>
            </div>
            <div class="form-group">
                <label for="age">Age:</label>
                <input type="number" id="age" name="age" min="1" max="120">
            </div>
            <div class="form-group">
                <label for="country">Country:</label>
                <select id="country" name="country">
                    <option value="">Select a country</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                    <option value="au">Australia</option>
                </select>
            </div>
            <div class="form-group">
                <label for="message">Message:</label>
                <textarea id="message" name="message" rows="4"></textarea>
            </div>
            <button type="submit">Submit</button>
        </form>
    </div>

    <script>
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error').forEach(el => el.textContent = '');
            
            let isValid = true;
            
            const name = document.getElementById('name').value.trim();
            if (name.length < 2) {
                document.getElementById('nameError').textContent = 'Name must be at least 2 characters long';
                isValid = false;
            }
            
            const email = document.getElementById('email').value.trim();
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('emailError').textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            if (isValid) {
                alert('Form submitted successfully!');
                console.log('Form data:', {
                    name: name,
                    email: email,
                    age: document.getElementById('age').value,
                    country: document.getElementById('country').value,
                    message: document.getElementById('message').value
                });
            }
        });
    </script>
</body>
</html>`
  },
  {
    name: "CSS Animation Demo",
    description: "Showcase of CSS animations and transitions",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Animation Demo</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            min-height: 100vh;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 50px;
            animation: fadeInDown 1s ease-out;
        }
        
        .animation-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            max-width: 1000px;
            width: 100%;
        }
        
        .demo-box {
            background: white;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: transform 0.3s ease;
        }
        
        .demo-box:hover {
            transform: translateY(-10px);
        }
        
        .bouncing-ball {
            width: 50px;
            height: 50px;
            background: #ff6b6b;
            border-radius: 50%;
            margin: 20px auto;
            animation: bounce 2s infinite;
        }
        
        .rotating-square {
            width: 50px;
            height: 50px;
            background: #4ecdc4;
            margin: 20px auto;
            animation: rotate 3s linear infinite;
        }
        
        .pulsing-circle {
            width: 50px;
            height: 50px;
            background: #45b7d1;
            border-radius: 50%;
            margin: 20px auto;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .sliding-bar {
            width: 200px;
            height: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            margin: 20px auto;
            overflow: hidden;
        }
        
        .sliding-bar::after {
            content: '';
            display: block;
            width: 50px;
            height: 100%;
            background: #96ceb4;
            border-radius: 10px;
            animation: slide 3s ease-in-out infinite;
        }
        
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-30px);
            }
            60% {
                transform: translateY(-15px);
            }
        }
        
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.3);
                opacity: 0.7;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        @keyframes slide {
            0% {
                transform: translateX(-50px);
            }
            50% {
                transform: translateX(200px);
            }
            100% {
                transform: translateX(-50px);
            }
        }
        
        .interactive-button {
            background: #ff9ff3;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin: 20px auto;
            display: block;
        }
        
        .interactive-button:hover {
            background: #f368e0;
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(243, 104, 224, 0.4);
        }
        
        .interactive-button:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body>
    <h1>CSS Animation Showcase</h1>
    
    <div class="animation-container">
        <div class="demo-box">
            <h3>Bouncing Ball</h3>
            <div class="bouncing-ball"></div>
            <p>Infinite bounce animation</p>
        </div>
        
        <div class="demo-box">
            <h3>Rotating Square</h3>
            <div class="rotating-square"></div>
            <p>Continuous rotation</p>
        </div>
        
        <div class="demo-box">
            <h3>Pulsing Circle</h3>
            <div class="pulsing-circle"></div>
            <p>Scale and opacity animation</p>
        </div>
        
        <div class="demo-box">
            <h3>Sliding Progress</h3>
            <div class="sliding-bar"></div>
            <p>Moving element with easing</p>
        </div>
    </div>
    
    <button class="interactive-button" onclick="celebrate()">
        Click me for surprise!
    </button>
    
    <script>
        function celebrate() {
            // Create confetti effect
            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
            
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const confetti = document.createElement('div');
                    confetti.style.position = 'fixed';
                    confetti.style.left = Math.random() * 100 + 'vw';
                    confetti.style.top = '-10px';
                    confetti.style.width = '10px';
                    confetti.style.height = '10px';
                    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    confetti.style.borderRadius = '50%';
                    confetti.style.pointerEvents = 'none';
                    confetti.style.animation = 'fall 3s linear forwards';
                    
                    document.body.appendChild(confetti);
                    
                    setTimeout(() => {
                        confetti.remove();
                    }, 3000);
                }, i * 100);
            }
        }
        
        // Add falling animation for confetti
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes fall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>`
  },
  {
    name: "Canvas Game",
    description: "Simple HTML5 Canvas game with JavaScript",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canvas Snake Game</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #2c3e50;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: white;
        }
        
        h1 {
            margin-bottom: 20px;
            color: #ecf0f1;
        }
        
        #gameCanvas {
            border: 3px solid #34495e;
            background: #1a252f;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        }
        
        .game-info {
            display: flex;
            gap: 30px;
            margin: 20px 0;
            font-size: 18px;
        }
        
        .controls {
            text-align: center;
            margin-top: 20px;
            color: #bdc3c7;
        }
        
        button {
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin: 0 5px;
            transition: background 0.3s;
        }
        
        button:hover {
            background: #2980b9;
        }
        
        .game-over {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            display: none;
        }
    </style>
</head>
<body>
    <h1>Snake Game</h1>
    
    <div class="game-info">
        <div>Score: <span id="score">0</span></div>
        <div>High Score: <span id="highScore">0</span></div>
    </div>
    
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    
    <div class="controls">
        <p>Use arrow keys to move the snake</p>
        <button onclick="startGame()">Start Game</button>
        <button onclick="pauseGame()">Pause</button>
        <button onclick="resetGame()">Reset</button>
    </div>
    
    <div class="game-over" id="gameOver">
        <h2>Game Over!</h2>
        <p>Final Score: <span id="finalScore">0</span></p>
        <button onclick="resetGame()">Play Again</button>
    </div>
    
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        
        const gridSize = 20;
        const tileCount = canvas.width / gridSize;
        
        let snake = [
            {x: 10, y: 10}
        ];
        let food = {};
        let dx = 0;
        let dy = 0;
        let score = 0;
        let highScore = localStorage.getItem('snakeHighScore') || 0;
        let gameRunning = false;
        let gameLoop;
        
        highScoreElement.textContent = highScore;
        
        function randomTile() {
            return Math.floor(Math.random() * tileCount);
        }
        
        function generateFood() {
            food = {
                x: randomTile(),
                y: randomTile()
            };
            
            // Make sure food doesn't spawn on snake
            for (let segment of snake) {
                if (segment.x === food.x && segment.y === food.y) {
                    generateFood();
                    return;
                }
            }
        }
        
        function drawGame() {
            // Clear canvas
            ctx.fillStyle = '#1a252f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw food
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
            
            // Draw snake
            ctx.fillStyle = '#2ecc71';
            for (let segment of snake) {
                ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
            }
            
            // Draw snake head differently
            if (snake.length > 0) {
                ctx.fillStyle = '#27ae60';
                ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize - 2, gridSize - 2);
            }
        }
        
        function moveSnake() {
            const head = {x: snake[0].x + dx, y: snake[0].y + dy};
            
            snake.unshift(head);
            
            // Check if food is eaten
            if (head.x === food.x && head.y === food.y) {
                score += 10;
                scoreElement.textContent = score;
                generateFood();
            } else {
                snake.pop();
            }
        }
        
        function checkCollision() {
            const head = snake[0];
            
            // Wall collision
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                return true;
            }
            
            // Self collision
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
            
            return false;
        }
        
        function gameStep() {
            if (!gameRunning) return;
            
            moveSnake();
            
            if (checkCollision()) {
                gameOver();
                return;
            }
            
            drawGame();
        }
        
        function gameOver() {
            gameRunning = false;
            clearInterval(gameLoop);
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            finalScoreElement.textContent = score;
            gameOverElement.style.display = 'block';
        }
        
        function startGame() {
            if (gameRunning) return;
            
            gameRunning = true;
            gameOverElement.style.display = 'none';
            generateFood();
            gameLoop = setInterval(gameStep, 100);
        }
        
        function pauseGame() {
            gameRunning = !gameRunning;
            if (gameRunning) {
                gameLoop = setInterval(gameStep, 100);
            } else {
                clearInterval(gameLoop);
            }
        }
        
        function resetGame() {
            gameRunning = false;
            clearInterval(gameLoop);
            gameOverElement.style.display = 'none';
            
            snake = [{x: 10, y: 10}];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            
            generateFood();
            drawGame();
        }
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!gameRunning) return;
            
            const LEFT_KEY = 37;
            const RIGHT_KEY = 39;
            const UP_KEY = 38;
            const DOWN_KEY = 40;
            
            const keyPressed = e.keyCode;
            const goingUp = dy === -1;
            const goingDown = dy === 1;
            const goingRight = dx === 1;
            const goingLeft = dx === -1;
            
            if (keyPressed === LEFT_KEY && !goingRight) {
                dx = -1;
                dy = 0;
            }
            if (keyPressed === UP_KEY && !goingDown) {
                dx = 0;
                dy = -1;
            }
            if (keyPressed === RIGHT_KEY && !goingLeft) {
                dx = 1;
                dy = 0;
            }
            if (keyPressed === DOWN_KEY && !goingUp) {
                dx = 0;
                dy = 1;
            }
        });
        
        // Initialize game
        generateFood();
        drawGame();
    </script>
</body>
</html>`
  },
  {
    name: "API Data Viewer",
    description: "Fetch and display data from a public API",
    code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Data Viewer</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        
        .controls {
            padding: 30px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        button:hover {
            background: #0056b3;
            transform: translateY(-2px);
        }
        
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
        }
        
        .loading {
            text-align: center;
            padding: 50px;
            font-size: 18px;
            color: #6c757d;
        }
        
        .loading::after {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #6c757d;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
            margin-left: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        
        .data-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .data-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .card-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2a5298;
        }
        
        .card-content {
            color: #666;
            line-height: 1.6;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            margin: 20px;
            border-radius: 5px;
            border: 1px solid #f5c6cb;
        }
        
        .stats {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8f9fa;
            margin: 20px;
            border-radius: 10px;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2a5298;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>API Data Viewer</h1>
            <p>Explore data from various public APIs</p>
        </div>
        
        <div class="controls">
            <button onclick="fetchUsers()">Load Users</button>
            <button onclick="fetchPosts()">Load Posts</button>
            <button onclick="fetchPhotos()">Load Photos</button>
            <button onclick="fetchQuote()">Random Quote</button>
            <button onclick="clearData()">Clear</button>
        </div>
        
        <div id="stats" class="stats" style="display: none;">
            <div class="stat">
                <div class="stat-number" id="totalItems">0</div>
                <div class="stat-label">Total Items</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="loadTime">0ms</div>
                <div class="stat-label">Load Time</div>
            </div>
            <div class="stat">
                <div class="stat-number" id="dataSource">-</div>
                <div class="stat-label">Data Source</div>
            </div>
        </div>
        
        <div id="content"></div>
    </div>
    
    <script>
        const content = document.getElementById('content');
        const statsDiv = document.getElementById('stats');
        const totalItemsSpan = document.getElementById('totalItems');
        const loadTimeSpan = document.getElementById('loadTime');
        const dataSourceSpan = document.getElementById('dataSource');
        
        function showLoading() {
            content.innerHTML = '<div class="loading">Loading data...</div>';
            statsDiv.style.display = 'none';
        }
        
        function showError(message) {
            content.innerHTML = \`<div class="error">Error: \${message}</div>\`;
            statsDiv.style.display = 'none';
        }
        
        function updateStats(count, loadTime, source) {
            totalItemsSpan.textContent = count;
            loadTimeSpan.textContent = loadTime + 'ms';
            dataSourceSpan.textContent = source;
            statsDiv.style.display = 'flex';
        }
        
        async function fetchData(url, source) {
            const startTime = Date.now();
            showLoading();
            
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                const data = await response.json();
                const loadTime = Date.now() - startTime;
                
                updateStats(Array.isArray(data) ? data.length : 1, loadTime, source);
                return data;
            } catch (error) {
                showError(\`Failed to fetch data: \${error.message}\`);
                return null;
            }
        }
        
        async function fetchUsers() {
            const users = await fetchData('https://jsonplaceholder.typicode.com/users', 'JSONPlaceholder');
            if (!users) return;
            
            content.innerHTML = '<div class="data-grid">' + 
                users.map(user => \`
                    <div class="data-card">
                        <div class="card-title">\${user.name}</div>
                        <div class="card-content">
                            <strong>Username:</strong> \${user.username}<br>
                            <strong>Email:</strong> \${user.email}<br>
                            <strong>Phone:</strong> \${user.phone}<br>
                            <strong>Website:</strong> \${user.website}<br>
                            <strong>Company:</strong> \${user.company.name}<br>
                            <strong>City:</strong> \${user.address.city}
                        </div>
                    </div>
                \`).join('') + 
            '</div>';
        }
        
        async function fetchPosts() {
            const posts = await fetchData('https://jsonplaceholder.typicode.com/posts?_limit=12', 'JSONPlaceholder');
            if (!posts) return;
            
            content.innerHTML = '<div class="data-grid">' + 
                posts.map(post => \`
                    <div class="data-card">
                        <div class="card-title">\${post.title}</div>
                        <div class="card-content">
                            <strong>User ID:</strong> \${post.userId}<br>
                            <strong>Post ID:</strong> \${post.id}<br><br>
                            \${post.body}
                        </div>
                    </div>
                \`).join('') + 
            '</div>';
        }
        
        async function fetchPhotos() {
            const photos = await fetchData('https://jsonplaceholder.typicode.com/photos?_limit=12', 'JSONPlaceholder');
            if (!photos) return;
            
            content.innerHTML = '<div class="data-grid">' + 
                photos.map(photo => \`
                    <div class="data-card">
                        <div class="card-title">\${photo.title}</div>
                        <div class="card-content">
                            <img src="\${photo.thumbnailUrl}" alt="\${photo.title}" style="width: 100%; border-radius: 5px; margin-bottom: 10px;"><br>
                            <strong>Album ID:</strong> \${photo.albumId}<br>
                            <strong>Photo ID:</strong> \${photo.id}
                        </div>
                    </div>
                \`).join('') + 
            '</div>';
        }
        
        async function fetchQuote() {
            const quote = await fetchData('https://api.quotable.io/random', 'Quotable API');
            if (!quote) return;
            
            content.innerHTML = \`
                <div style="padding: 50px; text-align: center;">
                    <div style="font-size: 2em; font-style: italic; color: #2a5298; margin-bottom: 20px;">
                        "\${quote.content}"
                    </div>
                    <div style="font-size: 1.2em; color: #666;">
                        — \${quote.author}
                    </div>
                    <div style="margin-top: 20px; color: #999;">
                        Tags: \${quote.tags.join(', ')}
                    </div>
                </div>
            \`;
        }
        
        function clearData() {
            content.innerHTML = '<div style="padding: 50px; text-align: center; color: #666;">Select a data source to begin exploring!</div>';
            statsDiv.style.display = 'none';
        }
        
        // Initialize with welcome message
        clearData();
    </script>
</body>
</html>`
  }
];
