import Phaser from 'phaser';

export default class HUD extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);

        this.scene = scene;

        // Add to scene
        scene.add.existing(this);

        // Create background panel
        this.background = scene.add.rectangle(0, 0, 200, 40, 0x000000, 0.5);
        this.background.setOrigin(0, 0);
        this.add(this.background);

        // Create score text
        this.scoreText = scene.add.text(10, 8, 'Score: 0', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff'
        });
        this.add(this.scoreText);

        // Create lives text
        this.livesText = scene.add.text(10, 24, 'Lives: 10', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ff6666'
        });
        this.add(this.livesText);
    }

    update(score, lives) {
        this.scoreText.setText(`Score: ${score}`);
        this.livesText.setText(`Lives: ${lives}`);

        // Flash lives red when low
        if (lives <= 3) {
            this.livesText.setColor('#ff3333');
        } else {
            this.livesText.setColor('#ff6666');
        }
    }
}
