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

const canvas = game.canvas;
canvas.setAttribute('tabindex', '0');  // Make canvas focusable
game.input.keyboard.target = canvas;   // Target Phaser keyboard to canvas
canvas.addEventListener('pointerdown', () => canvas.focus());
