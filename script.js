const board = document.getElementById('board');
const btnStart = document.querySelector('.start');
const btnReset = document.querySelector('.reset');
let ctx = board.getContext('2d');
let settings = {theme: 'white', bestScore: 0};
const scoreBlock = document.querySelector('.score'),
    score = scoreBlock.children[1],
    bestScore = scoreBlock.children[3];

loadLocalData();

const img = new Image();
img.src = './image/snake-graphics.png';
const backgroundImg = new Image();
backgroundImg.src = './image/field.png';
const cellSize = 30;

let posX = 0, posY = 60;
let posFoodX = 0, posFoodY = 0;
let snake = [{posX: 60, posY: 60}, {posX: 30, posY: 60}, {posX: 0, posY: 60}];
let direction = 'ArrowRight';
let timerId = undefined;
const oppositeKey = {
    'ArrowRight': 'ArrowLeft',
    'ArrowLeft': 'ArrowRight',
    'ArrowUp': 'ArrowDown',
    'ArrowDown': 'ArrowUp'
};
const gameplayKey = Object.keys(oppositeKey);
let food = createFood(snake);

bestScore.textContent = settings.bestScore;

btnStart.addEventListener('click', () => {
    snakeGame();
}, {once: true});

function snakeGame() {
    timerId = setInterval(() => changePosSnake(direction), 80);
    window.addEventListener('keydown', mainFunction);
}

function mainFunction(event) {
    if (gameplayKey.includes(event.key) && event.key !== direction && event.key !== oppositeKey[direction]) {
        clearInterval(timerId);
        direction = event.key;
        changePosSnake(direction);
        timerId = setInterval(() => changePosSnake(direction), 80);
    }
}

function changePosSnake (direction) {
    switch (direction) {
        case 'ArrowRight':
            posX = snake[0].posX + cellSize;
            break;
        case 'ArrowLeft':
            posX = snake[0].posX - cellSize;
            break;
        case 'ArrowDown':
            posY = snake[0].posY + cellSize;
            break;
        case 'ArrowUp':
            posY = snake[0].posY - cellSize;
            break;
    }
    if (snakeCollision(snake, posX, posY)) {
        return;
    }
    if (posX === food.posFoodX && posY === food.posFoodY) {
        renderScore();
        snake = renderSnake(snake, {posX, posY}, 0);
        food = createFood(snake);
    } else {
        snake = renderSnake(snake, {posX, posY});
    }
    drawFrame(snake, food);
}

function drawFrame (snake, food) {
    ctx.clearRect(0, 0, board.width, board.height);
    ctx.drawImage(img, 0, 64*3, 64, 64, food.posFoodX, food.posFoodY, cellSize, cellSize);
    snake.forEach((cell, i) => {
        if (i === 0) {
            switch (direction) {
                case 'ArrowRight':
                    ctx.drawImage(img, 64*4, 0, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
                    break;
                case 'ArrowLeft':
                    ctx.drawImage(img, 64*3, 64, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
                    break;
                case 'ArrowUp':
                    ctx.drawImage(img, 64*3, 0, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
                    break;
                case 'ArrowDown':
                    ctx.drawImage(img, 64*4, 64, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
                    break;
            }
        } else if (i === snake.length - 1) {
            if (snake[i-1].posX - cell.posX > 0) {
                ctx.drawImage(img, 64*4, 64*2, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (snake[i-1].posX - cell.posX < 0) {
                ctx.drawImage(img, 64*3, 64*3, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (snake[i-1].posY - cell.posY > 0) {
                ctx.drawImage(img, 64*4, 64*3, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (snake[i-1].posY - cell.posY < 0) {
                ctx.drawImage(img, 64*3, 64*2, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            }
        } else {
            const dif = {
                difX: 2 * cell.posX - snake[i+1].posX - snake[i-1].posX,
                difY: 2 * cell.posY - snake[i+1].posY - snake[i-1].posY
            }
            if (dif.difX === cellSize && dif.difY === cellSize) {
                ctx.drawImage(img, 64*2, 64*2, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (dif.difX === cellSize && dif.difY === -cellSize) {
                ctx.drawImage(img, 64*2, 0, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (dif.difX === -cellSize && dif.difY === cellSize) {
                ctx.drawImage(img, 0, 64, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (dif.difX === -cellSize && dif.difY === -cellSize) {
                ctx.drawImage(img, 0, 0, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (cell.posX === snake[i+1].posX && cell.posX === snake[i-1].posX) {
                ctx.drawImage(img, 64*2, 64, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            } else if (cell.posY === snake[i+1].posY && cell.posY === snake[i-1].posY) {
                ctx.drawImage(img, 64, 0, 64, 64, cell.posX, cell.posY, cellSize, cellSize);
            }
        }
    });
}

function renderSnake (snake, pos, incSnake = 1) {
    return [pos, ...snake.slice(0, snake.length-incSnake)];
}

function snakeCollision(snake, posX, posY) {
    if (posX === board.width || posY === board.height || posX < 0 || posY < 0 || !checkCollision(snake, posX, posY)) {
        clearInterval(timerId);
        window.removeEventListener('keydown', mainFunction);
        btnReset.addEventListener('click', reset, {once: true});
        return true;
    }
}

function createFood(snake) {
    do {
        posFoodX = Math.floor(Math.random() * (board.width - cellSize + 1) / cellSize) * cellSize;
        posFoodY = Math.floor(Math.random() * (board.height - cellSize + 1) / cellSize) * cellSize;
    } while (!checkCollision(snake, posFoodX, posFoodY));
    return {posFoodX, posFoodY};
}

function checkCollision (snake, posX, posY) {
    for (let cell of snake) {
        if (cell.posX === posX && cell.posY === posY) {
            return false;
        }
    }
    return true;
}

function loadLocalData() {
    if (localStorage.getItem('theme')) {
        settings.theme = localStorage.getItem('theme');
    }

    if (localStorage.getItem('bestScore')) {
        settings.bestScore = +localStorage.getItem('bestScore');
    }
}

function reset() {
    score.textContent = 0;
    snake = [{posX: 60, posY: 60}, {posX: 30, posY: 60}, {posX: 0, posY: 60}];
    direction = 'ArrowRight';
    food = createFood(snake);
    posX = 0;
    posY = 60;

    ctx.clearRect(0, 0, board.width, board.height);
    btnStart.addEventListener('click', () => {
        snakeGame();
    }, {once: true});
}

function renderScore() {
    score.textContent = +score.textContent + 1;
    if (settings.bestScore < +score.textContent) {
        settings.bestScore = +score.textContent;
        bestScore.textContent = settings.bestScore;
        localStorage.setItem('bestScore', settings.bestScore);
    }
}


const btnTheme = document.querySelector('.theme');
const imgTheme = btnTheme.querySelector('img');

if (settings.theme === 'dark') {
    imgTheme.src = "./image/white_theme.svg";
    document.body.classList.add('dark_theme');
    btnTheme.classList.add('dark_theme');
} else {
    imgTheme.src = "./image/dark_theme.svg";
    document.body.classList.remove('dark_theme');
    btnTheme.classList.remove('dark_theme');
}

btnTheme.addEventListener('click', () => {
    if (settings.theme === 'white') {
        settings.theme = 'dark';
        imgTheme.src = "./image/white_theme.svg";
        document.body.classList.add('dark_theme');
        btnTheme.classList.add('dark_theme')
    } else {
        settings.theme = 'white';
        imgTheme.src = "./image/dark_theme.svg";
        document.body.classList.remove('dark_theme');
        btnTheme.classList.remove('dark_theme');
    }
    localStorage.setItem('theme', settings.theme);
});
