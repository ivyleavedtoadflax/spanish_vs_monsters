import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';
import { YEAR_LEVELS } from '../systems/MathsManager.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Set dark background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Game title
        this.add.text(CANVAS_WIDTH / 2, 100, 'MATHS vs MONSTERS', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#4ade80',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(CANVAS_WIDTH / 2, 160, 'Solve problems. Defend your base.', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#888899'
        }).setOrigin(0.5);

        // Year level label
        this.add.text(CANVAS_WIDTH / 2, 250, 'Select Year Level:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create year level buttons
        this.selectedYearIndex = 1; // Default to Year 1
        this.yearButtons = [];

        const yearLabels = ['Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
        const buttonWidth = 90;
        const buttonSpacing = 10;
        const totalWidth = yearLabels.length * buttonWidth + (yearLabels.length - 1) * buttonSpacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + buttonWidth / 2;

        yearLabels.forEach((label, index) => {
            const x = startX + index * (buttonWidth + buttonSpacing);
            const y = 310;

            const btn = this.add.text(x, y, label, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: index === this.selectedYearIndex ? '#1a1a2e' : '#ffffff',
                backgroundColor: index === this.selectedYearIndex ? '#4ade80' : '#333355',
                padding: { x: 10, y: 8 }
            }).setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            btn.yearIndex = index;

            btn.on('pointerover', () => {
                if (index !== this.selectedYearIndex) {
                    btn.setStyle({ backgroundColor: '#444466' });
                }
            });

            btn.on('pointerout', () => {
                if (index !== this.selectedYearIndex) {
                    btn.setStyle({ backgroundColor: '#333355' });
                }
            });

            btn.on('pointerdown', () => {
                this.selectYear(index);
            });

            this.yearButtons.push(btn);
        });

        // Start Game button
        const startBtn = this.add.text(CANVAS_WIDTH / 2, 420, 'START GAME', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4ade80',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => {
            startBtn.setStyle({ backgroundColor: '#5bef91' });
        });

        startBtn.on('pointerout', () => {
            startBtn.setStyle({ backgroundColor: '#4ade80' });
        });

        startBtn.on('pointerdown', () => {
            this.startGame();
        });

        // Instructions
        this.add.text(CANVAS_WIDTH / 2, 520,
            'Click slots to place towers • Type answers to activate • Match colors to deal damage', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#666677'
        }).setOrigin(0.5);
    }

    selectYear(index) {
        this.selectedYearIndex = index;

        // Update button styles
        this.yearButtons.forEach((btn, i) => {
            if (i === index) {
                btn.setStyle({
                    color: '#1a1a2e',
                    backgroundColor: '#4ade80'
                });
            } else {
                btn.setStyle({
                    color: '#ffffff',
                    backgroundColor: '#333355'
                });
            }
        });
    }

    startGame() {
        // Store selected year level in registry
        this.registry.set('baseYearLevel', YEAR_LEVELS[this.selectedYearIndex]);

        // Start game scene
        this.scene.start('GameScene');
    }
}
