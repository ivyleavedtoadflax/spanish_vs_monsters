import Phaser from 'phaser';
import { MONSTER, PROJECTILE } from '../config.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a 1x1 white pixel texture for general use
        const pixelGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        pixelGraphics.fillStyle(0xffffff);
        pixelGraphics.fillRect(0, 0, 1, 1);
        pixelGraphics.generateTexture('pixel', 1, 1);
        pixelGraphics.destroy();

        // Create monster texture at actual size (avoids scaling/offset issues)
        const monsterGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        monsterGraphics.fillStyle(0xffffff);
        monsterGraphics.fillRect(0, 0, MONSTER.size, MONSTER.size);
        monsterGraphics.generateTexture('monster', MONSTER.size, MONSTER.size);
        monsterGraphics.destroy();

        // Create projectile texture at actual size
        const projectileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        projectileGraphics.fillStyle(0xffffff);
        projectileGraphics.fillCircle(PROJECTILE.size / 2, PROJECTILE.size / 2, PROJECTILE.size / 2);
        projectileGraphics.generateTexture('projectile', PROJECTILE.size, PROJECTILE.size);
        projectileGraphics.destroy();
    }

    create() {
        this.scene.start('MenuScene');
    }
}
