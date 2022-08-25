import Bullet from "./Bullet.js";

export default class BulletController {
    bullets = [];
    timeNextBullet = 0;

    constructor(canvas, maxBullets, bulletColor, soundEnabled) {
        this.canvas = canvas;
        this.maxBullets = maxBullets;
        this.bulletColor = bulletColor;
        this.soundEnabled = soundEnabled;

        this.shootSound = new Audio("./sounds/shoot.wav");
        this.shootSound.volume = 0.2;
    }

    draw(ctx) {
        // Handle bullets leaving the screen
        this.bullets = this.bullets.filter(bullet => bullet.y + bullet.width > 0 && bullet.y <= this.canvas.height);

        // Draw bullets
        this.bullets.forEach(bullet => bullet.draw(ctx));
        if (this.timeNextBullet > 0) this.timeNextBullet--;
    }

    collideWith(sprite) {
        const bulletHitSpriteIndex = this.bullets.findIndex(bullet => bullet.collideWith(sprite));
        
        if (bulletHitSpriteIndex >= 0) {
            this.bullets.splice(bulletHitSpriteIndex, 1);
            return true;
        }
        return false;
    }

    shoot(x, y, velocity, timeNextBullet) {
        if (this.timeNextBullet <= 0 && this.bullets.length < this.maxBullets) {
            const bullet = new Bullet(this.canvas, x, y, velocity, this.bulletColor)
            this.bullets.push(bullet);
            if (this.soundEnabled) {
                this.shootSound.currentTime = 0;
                this.shootSound.play();
            }
            this.timeNextBullet = timeNextBullet;
        }
    };
}