import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    create() {
        // Get final score from registry
        const finalScore = this.registry.get('finalScore') || 0;

        // Set dark background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Game Over text
        this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ff6666',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Final score
        this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, `Final Score: ${finalScore}`, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Play Again button
        const playAgainBtn = this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7, 'Play Again', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#44ff44',
            backgroundColor: '#224422',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        playAgainBtn.on('pointerover', () => {
            playAgainBtn.setStyle({ backgroundColor: '#336633' });
        });

        playAgainBtn.on('pointerout', () => {
            playAgainBtn.setStyle({ backgroundColor: '#224422' });
        });

        playAgainBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}
