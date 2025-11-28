import Phaser from 'phaser';
import { TOWER, COLORS } from '../config.js';

/**
 * TowerSlot represents an empty tower slot with a maths problem.
 * When the problem is solved, the slot spawns a Tower and is destroyed.
 */
export default class TowerSlot extends Phaser.GameObjects.Container {
    constructor(scene, x, y, lane, slotIndex, difficulty = 'easy') {
        super(scene, x, y);

        this.difficulty = difficulty;
        this.lane = lane;
        this.slotIndex = slotIndex;
        this.problem = null;

        // Add to scene
        scene.add.existing(this);

        // Create slot background circle (outline only, semi-transparent)
        this.slotBg = scene.add.graphics();
        this.slotBg.lineStyle(3, COLORS[difficulty], 0.6);
        this.slotBg.strokeCircle(0, 0, TOWER.size / 2 + 4);
        this.add(this.slotBg);

        // Create problem text display
        this.problemText = scene.add.text(0, 0, '', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.add(this.problemText);

        // Difficulty indicator (small colored dot above the slot)
        this.difficultyDot = scene.add.graphics();
        this.difficultyDot.fillStyle(COLORS[difficulty], 1);
        this.difficultyDot.fillCircle(0, -TOWER.size / 2 - 10, 5);
        this.add(this.difficultyDot);
    }

    setProblem(problem) {
        this.problem = problem;
        this.problemText.setText(problem.expression);
    }

    destroy() {
        // Clean up child elements
        if (this.slotBg) this.slotBg.destroy();
        if (this.problemText) this.problemText.destroy();
        if (this.difficultyDot) this.difficultyDot.destroy();
        super.destroy();
    }
}
