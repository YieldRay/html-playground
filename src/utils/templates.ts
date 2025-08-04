export interface Template {
    name: string;
    description: string;
    code: string;
}

export const HTML_TEMPLATES: Template[] = [
    {
        name: "Basic HTML",
        description: "Source code of example.net",
        code: `<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        
    }
    div {
        width: 600px;
        margin: 5em auto;
        padding: 2em;
        background-color: #fdfdff;
        border-radius: 0.5em;
        box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);
    }
    a:link, a:visited {
        color: #38488f;
        text-decoration: none;
    }
    @media (max-width: 700px) {
        div {
            margin: 0 auto;
            width: auto;
        }
    }
    </style>    
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>`
    },
    {
        name: "React",
        description: "React19 with RadixUI",
        code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Demo</title>
    <link rel="stylesheet" href="https://esm.sh/@radix-ui/themes/styles.css" />
    <style>
      body {
        padding: 2rem;
        max-width: 28rem;
        margin: auto;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
  <script type="module">
    import React from "react@19";
    import { createRoot } from "react-dom@19/client";
    import { Theme, Flex, Text, Button } from "@radix-ui/themes?deps=react@19";
    import confetti from "canvas-confetti";

    const showConfetti = () => {
      confetti();
      console.log("Confetti!");
    };

    const App: React.FC = () => (
      <Theme>
        <Flex direction="column" gap="2">
          <Text>Hello from Radix Themes :)</Text>
          <Button onClick={showConfetti}>Let's go</Button>
        </Flex>
      </Theme>
    );
    const root = createRoot(document.getElementById("root"));
    root.render(<App />);
  </script>
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
    }
];
