import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Create a 1x1 white pixel texture programmatically for tinting placeholder shapes
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 1, 1);
        graphics.generateTexture('pixel', 1, 1);
        graphics.destroy();
    }

    create() {
        this.scene.start('MenuScene');
    }
}
