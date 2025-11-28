import Phaser from 'phaser';
import { PROJECTILE, COLORS } from '../config.js';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, difficulty = 'easy', velocityX = 300, velocityY = 0) {
        // Use the properly-sized projectile texture
        super(scene, x, y, 'projectile');

        this.difficulty = difficulty;
        this.bounceCount = 0;
        this.maxBounces = PROJECTILE.maxBounces;

        // Add to scene and enable physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set appearance - just tint, no scaling needed
        this.setTint(COLORS[difficulty]);

        // Body is automatically sized to texture
        // Make it a circle for better bounce physics
        this.body.setCircle(PROJECTILE.size / 2);

        // Enable world bounds collision and bouncing
        this.body.setCollideWorldBounds(true);
        this.body.setBounce(1, 1);
        this.body.onWorldBounds = true;

        // Set initial velocity
        this.body.setVelocity(velocityX, velocityY);
    }

    onBounce() {
        if (!this.active) return; // Already destroyed

        this.bounceCount++;
        if (this.bounceCount >= this.maxBounces) {
            this.destroy();
        }
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Destroy if off-screen (shouldn't happen with world bounds, but safety check)
        if (this.active && (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 650)) {
            this.destroy();
        }
    }
}
