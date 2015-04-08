var FIELD_SIZE = 50;

var CELL_EMPTY = 0;
var CELL_TARGET = 1;
var CELL_WALL = 2;
var CELL_SNAKE_BODY = 3;
var CELL_SNAKE_HEAD = 4;

var gameField = [];

function fillGameField() {
    for (var i = 0; i < FIELD_SIZE; i++) {
        gameField.push([]);
        for (var j = 0; j < FIELD_SIZE; j++) {
            gameField[i].push(CELL_EMPTY);
        }
    }

    for (var i = 0; i < FIELD_SIZE; i++) {
        gameField[i][0] = CELL_WALL;
        gameField[i][FIELD_SIZE - 1] = CELL_WALL;
    }

    for (var j = 0; j < FIELD_SIZE; j++) {
        gameField[0][j] = CELL_WALL;
        gameField[FIELD_SIZE - 1][j] = CELL_WALL;
    }
}

function putTargetOnField() {
    var targetNewX = 0;
    var targetNewY = 0;

    while (gameField[targetNewX][targetNewY] != CELL_EMPTY) {
        targetNewX = getBoundedRandom(0, FIELD_SIZE - 1);
        targetNewY = getBoundedRandom(0, FIELD_SIZE - 1);
    }

    for (var i = 0; i < FIELD_SIZE; i++) {
        for (var j = 0; j < FIELD_SIZE; j++) {
            if (gameField[i][j] == CELL_TARGET) {
                gameField[i][j] = CELL_EMPTY;
            }
        }
    }

    gameField[targetNewX][targetNewY] = CELL_TARGET;
}

function getBoundedRandom(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

var gameFieldView;
var cellSize;

function initializeGameFieldView() {
    var gameFieldHeight = gameFieldView.height();
    var gameFieldWidth = gameFieldView.width();

    var gameFieldMinDimension = gameFieldHeight;
    if (gameFieldMinDimension > gameFieldWidth) {
        gameFieldMinDimension = gameFieldWidth;
    }

    cellSize = gameFieldMinDimension / FIELD_SIZE;
}

function drawScene() {

    gameFieldView.empty();

    for (var i = 0; i < FIELD_SIZE; i++) {
        for (var j = 0; j < FIELD_SIZE; j++) {
            var wallCellDiv = null;

            if (gameField[i][j] == CELL_WALL) {
                wallCellDiv = createDiv("cell-wall");
            }

            if (gameField[i][j] == CELL_TARGET) {
                wallCellDiv = createDiv("cell-target");
            }

            if (gameField[i][j] == CELL_SNAKE_BODY) {
                wallCellDiv = createDiv("cell-snake-body");
            }

            if (gameField[i][j] == CELL_SNAKE_HEAD) {
                wallCellDiv = createDiv("cell-snake-head");
            }

            if (wallCellDiv) {
                wallCellDiv.css("top", j * cellSize);
                wallCellDiv.css("left", i * cellSize);
                gameFieldView.append(wallCellDiv);
            }
        }
    }
}

function createDiv(className) {
    var div = $("<div />");
    div.addClass(className);
    div.css("width", cellSize);
    div.css("height", cellSize);
    return div;
}

function Snake() {

    var growFlag = false;
    var direction = "right";

    var snakeSegments = [{x: 4, y: 1}, {x: 3, y: 1}, {x: 2, y: 1}, {x: 1, y: 1}];

    function removeSnakeFromGameField() {
        for (var i = 0; i < snakeSegments.length; i++) {
            gameField[snakeSegments[i].x][snakeSegments[i].y] = CELL_EMPTY;
        }
    }

    function addSnakeToGameField() {
        gameField[snakeSegments[0].x][snakeSegments[0].y] = CELL_SNAKE_HEAD;

        for (var i = 1; i < snakeSegments.length; i++) {
            gameField[snakeSegments[i].x][snakeSegments[i].y] = CELL_SNAKE_BODY;
        }
    }

    return {
        move: function() {
            removeSnakeFromGameField();

            var snakeHead = snakeSegments[0];
            var snakeNewHead = {x: snakeHead.x, y: snakeHead.y};
            switch (direction) {
                case "right": snakeNewHead.x = (snakeNewHead.x + 1) % FIELD_SIZE;
                    break;
                case "down": snakeNewHead.y = (snakeNewHead.y + 1) % FIELD_SIZE;
                    break;
                case "left":
                    if (snakeNewHead.x == 0) {
                        snakeNewHead.x = FIELD_SIZE - 1;
                    } else {
                        snakeNewHead.x--;
                    }
                    break;
                case "up":
                    if (snakeNewHead.y == 0) {
                        snakeNewHead.y = FIELD_SIZE - 1;
                    } else {
                        snakeNewHead.y--;
                    }
                    break;
            }
            snakeSegments.unshift(snakeNewHead);

            if (!growFlag) {
                snakeSegments.pop();
            } else {
                growFlag = false;
            }

            addSnakeToGameField();
        },

        changeDirection: function(newDirection) {
            direction = newDirection;
        },

        grow: function() {
            growFlag = true;
        }
    }
}

var snake = new Snake();

var gameController = new GameController();

function Score(selector) {

    var score = 0;

    var jQuerySelector = selector;

    function updateDisplay() {
        //
        $(jQuerySelector).html(score);
    }

    return {
        increase: function(delta) {
            score += delta;
            updateDisplay();
        },

        decrease: function(delta) {
            score -= delta;
            updateDisplay();
        }
    }
}

var score = new Score("#score");

function GameController() {

    var keyboardHandlers = {
        // Right
        39: function() {
            snake.changeDirection("right");
        },
        // Down
        40: function() {
            snake.changeDirection("down");
        },
        // Left
        37: function() {
            snake.changeDirection("left");
        },
        // Up
        38: function() {
            snake.changeDirection("up");
        }
    };

    var actions = [];

    var savedGameField = [];

    function processAction() {
        beforeActionProcessing();

        while (actions.length > 0) {
            var actionHandler = actions.shift();
            actionHandler.func.call(this, actionHandler.args);
        }

        detectCollision();

        drawScene();
    }

    function beforeActionProcessing() {
        saveGameField();
    }

    function detectCollision() {
        for (var i = 0; i < FIELD_SIZE; i++) {
            for (var j = 0; j < FIELD_SIZE; j++) {
                if (gameField[i][j] == CELL_SNAKE_HEAD) {
                    if (savedGameField[i][j] == CELL_WALL) {
                        // Stop game
                        score.decrease(1);
                    }

                    if (savedGameField[i][j] == CELL_TARGET) {
                        //
                        score.increase(5);
                        putTargetOnField();
                        snake.grow();
                    }
                }
            }
        }
    }

    function saveGameField() {
        savedGameField = [];
        for (var i = 0; i < FIELD_SIZE; i++) {
            savedGameField.push([]);
            for (var j = 0; j < FIELD_SIZE; j++) {
                savedGameField[i].push(gameField[i][j]);
            }
        }
    }

    function scheduleAction(func, args) {
        actions.push({func: func, args: args});
    }

    function initKeyPressListener() {
        $(document).keydown(function(event) {
            var keyCode = event.keyCode;
            if (keyboardHandlers[keyCode]) {
                scheduleAction(keyboardHandlers[keyCode]);
            }
        });
    }

    return {
        start: function() {
            initKeyPressListener();

            setInterval(processAction, 50);
            setInterval(function() {
                scheduleAction(function() {
                    snake.move();
                });
            }, 60);
        }
    }
}

$(document).ready(function() {

    gameFieldView = $("#game-field");

    fillGameField();
    initializeGameFieldView();
    putTargetOnField();

    gameController.start();

});

