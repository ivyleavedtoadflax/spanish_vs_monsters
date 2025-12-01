import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, DIFFICULTY_SETTINGS, TENSE_MAPPING } from '../config.js';
import AudioControls from '../ui/AudioControls.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Create semi-transparent dark overlay to let HTML background show through
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0d0d1a, 0.9);
        overlay.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        overlay.setDepth(-5);
        
        console.log('MenuScene created');

        // Game title
        this.add.text(CANVAS_WIDTH / 2, 100, 'SPANISH vs MONSTERS', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#4ade80',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(CANVAS_WIDTH / 2, 160, 'Conjugate verbs. Defend your base.', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#888899'
        }).setOrigin(0.5);

        // Verb Difficulty label
        this.add.text(CANVAS_WIDTH / 2, 250, 'Select Verb Level:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create verb difficulty buttons
        this.selectedVerbDifficulty = 'easy'; // Default to Beginner
        this.verbButtons = [];

        // Create game speed selection
        this.selectedGameDifficulty = 'medium'; // Default to Medium
        this.gameButtons = [];

        const verbLevels = [
            { key: 'easy', label: TENSE_MAPPING.easy.label },
            { key: 'medium', label: TENSE_MAPPING.medium.label },
            { key: 'hard', label: TENSE_MAPPING.hard.label }
        ];
        
        const buttonWidth = 120;
        const buttonSpacing = 20;
        const totalWidth = verbLevels.length * buttonWidth + (verbLevels.length - 1) * buttonSpacing;
        const startX = (CANVAS_WIDTH - totalWidth) / 2 + buttonWidth / 2;

        verbLevels.forEach((level, index) => {
            const x = startX + index * (buttonWidth + buttonSpacing);
            const y = 310;

            const btn = this.add.text(x, y, level.label, {
                fontSize: '16px',
                fontFamily: 'Arial',
                color: level.key === this.selectedVerbDifficulty ? '#1a1a2e' : '#ffffff',
                backgroundColor: level.key === this.selectedVerbDifficulty ? '#4ade80' : '#333355',
                padding: { x: 15, y: 10 }
            }).setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            btn.verbKey = level.key;

            btn.on('pointerover', () => {
                if (level.key !== this.selectedVerbDifficulty) {
                    btn.setStyle({ backgroundColor: '#444466' });
                }
            });

            btn.on('pointerout', () => {
                if (level.key !== this.selectedVerbDifficulty) {
                    btn.setStyle({ backgroundColor: '#333355' });
                }
            });

            btn.on('pointerdown', () => {
                this.selectVerbDifficulty(level.key);
            });

            this.verbButtons.push(btn);
        });

        // Game Speed label
        this.add.text(CANVAS_WIDTH / 2, 370, 'Select Game Speed:', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Create game speed buttons
        const difficultyKeys = Object.keys(DIFFICULTY_SETTINGS);
        const diffButtonWidth = 100;
        const diffButtonSpacing = 10;
        const diffTotalWidth = difficultyKeys.length * diffButtonWidth + (difficultyKeys.length - 1) * diffButtonSpacing;
        const diffStartX = (CANVAS_WIDTH - diffTotalWidth) / 2 + diffButtonWidth / 2;

        difficultyKeys.forEach((key, index) => {
            const setting = DIFFICULTY_SETTINGS[key];
            const x = diffStartX + index * (diffButtonWidth + diffButtonSpacing);
            const y = 420;

            const isSelected = key === this.selectedGameDifficulty;
            const btn = this.add.text(x, y, setting.label, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: isSelected ? '#1a1a2e' : '#ffffff',
                backgroundColor: isSelected ? '#fbbf24' : '#333355',
                padding: { x: 10, y: 8 }
            }).setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            btn.difficultyKey = key;

            btn.on('pointerover', () => {
                if (key !== this.selectedGameDifficulty) {
                    btn.setStyle({ backgroundColor: '#444466' });
                }
            });

            btn.on('pointerout', () => {
                if (key !== this.selectedGameDifficulty) {
                    btn.setStyle({ backgroundColor: '#333355' });
                }
            });

            btn.on('pointerdown', () => {
                this.selectGameDifficulty(key);
            });

            this.gameButtons.push(btn);
        });

        // Start Game button
        const startBtn = this.add.text(CANVAS_WIDTH / 2, 510, 'START GAME', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: '#4ade80',
            padding: { x: 30, y: 15 }
        }).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(100); // Ensure it's on top

        startBtn.on('pointerover', () => {
            startBtn.setStyle({ backgroundColor: '#5bef91' });
        });

        startBtn.on('pointerout', () => {
            startBtn.setStyle({ backgroundColor: '#4ade80' });
        });

        startBtn.on('pointerdown', () => {
            console.log('Start button clicked');
            this.startGame();
        });

        // Add Enter key listener to start game
        const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.on('down', () => {
            console.log('Enter key pressed in Menu');
            this.startGame();
        });

        // Debug: Log any click on the scene
        this.input.on('pointerdown', (pointer) => {
            console.log(`Pointer down at ${pointer.x}, ${pointer.y}`);
        });

        // Instructions
        this.add.text(CANVAS_WIDTH / 2, 600,
            'Type the correct verb conjugation to activate towers. Use accents for bonus points!', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#2fff00ff'
        }).setOrigin(0.5);

        // Audio controls (bottom right)
        this.audioControls = new AudioControls(this);
    }

    selectVerbDifficulty(key) {
        this.selectedVerbDifficulty = key;

        // Update button styles
        this.verbButtons.forEach((btn) => {
            if (btn.verbKey === key) {
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

    selectGameDifficulty(key) {
        this.selectedGameDifficulty = key;

        // Update button styles
        this.gameButtons.forEach((btn) => {
            if (btn.difficultyKey === key) {
                btn.setStyle({
                    color: '#1a1a2e',
                    backgroundColor: '#fbbf24'
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
        // Map verb difficulty key to label for VerbManager
        const verbDifficultyLabel = TENSE_MAPPING[this.selectedVerbDifficulty].label;
        
        // Store selected verb difficulty label in registry (Beginner/Intermediate/Advanced)
        this.registry.set('baseDifficulty', this.selectedVerbDifficulty);

        // Store selected game difficulty in registry
        this.registry.set('gameDifficulty', this.selectedGameDifficulty);

        // Start game scene
        this.scene.start('GameScene');
    }
}
