import Enemy from "./Enemy.js";
import MovingDirection from "./MovingDirection.js";

export default class EnemyController {
    // Create random matrix of enemies
    createEnemyMap() {
        let enemyArr = Array(6).fill(null).map(() => Array.from({ length: 9 }, () => Math.floor(Math.random() * 3 + 1)));
        return enemyArr;
    }

    enemyMap = this.createEnemyMap();

    enemyRows = [];

    // Define directions and velocity
    currentDirection = MovingDirection.right;
    xVelocity = 0;
    yVelocity = 0;
    defaultXVelocity = 1;
    defaultYVelocity = 1;
    moveDownTimerDefault = 30;
    moveDownTimer = this.moveDownTimerDefault;
    fireBulletTimerDefault = 100;
    fireBulletTimer = this.fireBulletTimerDefault;

    constructor(canvas, enemyBulletController, playerBulletController) {
        this.canvas = canvas;
        this.enemyBulletController = enemyBulletController;
        this.playerBulletController = playerBulletController;

        this.enemyDeathSound = new Audio('./sounds/enemy-death.wav');
        this.enemyDeathSound.volume = 0.2

        this.createEnemies();
    }

    draw(ctx) {
        this.decrementMoveDownTimer();
        this.updateVelocityAndDirection();
        this.collisionDetection();
        this.drawEnemies(ctx);
        this.resetMoveDownTimer();
        this.fireBullet();
    }

    collisionDetection() {
        this.enemyRows.forEach(enemyRow => {
            enemyRow.forEach((enemy, enemyIndex) => {
                if (this.playerBulletController.collideWith(enemy)) {
                    this.enemyDeathSound.currentTime = 0;
                    this.enemyDeathSound.play();
                    enemyRow.splice(enemyIndex, 1);
                }
            });
        });

        this.enemyRows = this.enemyRows.filter(enemyRow => enemyRow.length > 0);
    }

    fireBullet() {
        this.fireBulletTimer--;
        if (this.fireBulletTimer <= 0) {
            this.fireBulletTimer = this.fireBulletTimerDefault;
            const allEnemies = this.enemyRows.flat();
            const enemyIndex = Math.floor(Math.random() * allEnemies.length);
            const enemy = allEnemies[enemyIndex];
            this.enemyBulletController.shoot(enemy.x, enemy.y, -3);
            console.log(enemyIndex);
        }
    }

    resetMoveDownTimer() {
        if (this.moveDownTimer <= 0) {
            this.moveDownTimer = this.moveDownTimerDefault;
        }
    }

    decrementMoveDownTimer() {
        if (this.currentDirection === MovingDirection.downLeft ||
            this.currentDirection === MovingDirection.downRight) {
            this.moveDownTimer--;
        }
    }

    // Update V and D
    updateVelocityAndDirection() {
        for (const enemyRow of this.enemyRows) {
            // Set current direction to move right
            if (this.currentDirection == MovingDirection.right) {
                this.xVelocity = this.defaultXVelocity;
                this.yVelocity = 0;
                const rightMostEnemy = enemyRow[enemyRow.length - 1];
                // check if rightmost enemy is at end of canvas
                // Move downLeft
                if (rightMostEnemy.x + rightMostEnemy.width >= this.canvas.width) {
                    this.currentDirection = MovingDirection.downLeft;
                    break;
                }
            } else if (this.currentDirection === MovingDirection.downLeft) {
                // Move left
                if (this.moveDown(MovingDirection.left)) {
                    break;
                }
            } else if (this.currentDirection === MovingDirection.left) {
                // Check if leftmost enemy is near at start of canvas
                // Move Down Right
                this.xVelocity = -this.defaultXVelocity;
                this.yVelocity = 0;
                const leftMostEnemy = enemyRow[0];
                if (leftMostEnemy.x <= 0) {
                    this.currentDirection = MovingDirection.downRight;
                    break;
                }
                // Move right
            } else if (this.currentDirection === MovingDirection.downRight) {
                if (this.moveDown(MovingDirection.right)) {
                    break;
                }
            }
        }
    }

    moveDown(newDirection) {
        this.xVelocity = 0;
        this.yVelocity = this.defaultYVelocity;
        if (this.moveDownTimer <= 0) {
            this.currentDirection = newDirection;
            return true;
        } else { return false }
    }

    // Draw enemies on canvas
    drawEnemies(ctx) {
        this.enemyRows.flat().forEach(enemy => {
            enemy.move(this.xVelocity, this.yVelocity);
            enemy.draw(ctx);
        })
    }

    // Create and define enemies
    createEnemies() {
        this.enemyMap.forEach((row, rowIndex) => {
            this.enemyRows[rowIndex] = [];
            row.forEach((eNumber, eIndex) => {
                if (eNumber > 0) {
                    this.enemyRows[rowIndex].push(new Enemy(eIndex * 50, rowIndex * 35, eNumber));
                }
            })
        })
    }

    collideWith(sprite) {
        return this.enemyRows.flat().some(enemy => enemy.collideWith(sprite));
    }
}