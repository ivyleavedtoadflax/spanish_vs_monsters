import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';

const config = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: 'game',
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,          // Scale to fit while maintaining aspect ratio
    autoCenter: Phaser.Scale.CENTER_BOTH  // Center horizontally and vertically
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false  // Enable to visualize physics bodies
    }
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

const game = new Phaser.Game(config);

// Cleanup any rogue input elements from previous sessions (HMR safety)
const existingInputs = document.querySelectorAll('input');
existingInputs.forEach(input => input.remove());

game.events.on('ready', () => {
    const canvas = game.canvas;
    if (canvas) {
        // Just set tabindex to allow focus, but let Phaser handle the rest
        canvas.setAttribute('tabindex', '0');
        canvas.focus();
    }
});

// Handle window resize to properly scale the game
window.addEventListener('resize', () => {
    game.scale.refresh();
});
