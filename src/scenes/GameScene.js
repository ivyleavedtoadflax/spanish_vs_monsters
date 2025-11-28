import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANES, TOWER_SLOTS_X, COLORS, TOWER, GAME, POINTS } from '../config.js';
import Monster from '../entities/Monster.js';
import Tower from '../entities/Tower.js';
import Projectile from '../entities/Projectile.js';
import WaveManager from '../systems/WaveManager.js';
import MathsManager from '../systems/MathsManager.js';
import InputBox from '../ui/InputBox.js';
import HUD from '../ui/HUD.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Initialize game state
        this.lives = GAME.startLives;
        this.score = 0;

        // Set dark blue background
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // Get selected year level from registry
        const baseYearLevel = this.registry.get('baseYearLevel') || 'year1';

        // Create maths manager with selected year level
        this.mathsManager = new MathsManager(baseYearLevel);

        // Draw lane grid
        this.drawLaneGrid();

        // Create monsters group
        this.monsters = this.add.group();

        // Create towers group
        this.towers = this.add.group();

        // Create projectiles group
        this.projectiles = this.physics.add.group();

        // Track tower slots: slots[laneIndex][slotIndex] = tower or null
        this.slots = [];
        for (let l = 0; l < LANES.length; l++) {
            this.slots[l] = [];
            for (let s = 0; s < TOWER_SLOTS_X.length; s++) {
                this.slots[l][s] = null;
            }
        }

        // Create interactive zones for tower placement
        this.createTowerSlotZones();

        // Create wave manager to spawn monsters
        this.waveManager = new WaveManager(this);

        // Set up world bounds for projectile bouncing
        this.physics.world.setBounds(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject && body.gameObject.onBounce) {
                body.gameObject.onBounce();
            }
        });

        // Set up projectile-monster collision
        this.physics.add.collider(
            this.projectiles,
            this.monsters,
            this.handleProjectileMonsterCollision,
            null,
            this
        );

        // Create input box at bottom of screen
        this.inputBox = new InputBox(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);

        // Listen for answer submissions
        this.events.on('answerSubmitted', this.handleAnswerSubmit, this);

        // Create HUD
        this.hud = new HUD(this, 10, 10);
    }

    createTowerSlotZones() {
        const difficulties = [null, 'easy', 'medium', 'hard']; // null = empty

        for (let laneIndex = 0; laneIndex < LANES.length; laneIndex++) {
            for (let slotIndex = 0; slotIndex < TOWER_SLOTS_X.length; slotIndex++) {
                const x = TOWER_SLOTS_X[slotIndex];
                const y = LANES[laneIndex];

                // Create invisible interactive zone
                const zone = this.add.zone(x, y, TOWER.size + 10, TOWER.size + 10)
                    .setInteractive({ useHandCursor: true });

                zone.laneIndex = laneIndex;
                zone.slotIndex = slotIndex;
                zone.difficultyIndex = 0; // Start with no tower

                zone.on('pointerdown', () => {
                    // Cycle through difficulties
                    zone.difficultyIndex = (zone.difficultyIndex + 1) % difficulties.length;
                    const difficulty = difficulties[zone.difficultyIndex];

                    // Remove existing tower if any
                    const existingTower = this.slots[zone.laneIndex][zone.slotIndex];
                    if (existingTower) {
                        existingTower.destroy();
                        this.slots[zone.laneIndex][zone.slotIndex] = null;
                    }

                    // Create new tower if not empty
                    if (difficulty) {
                        const tower = new Tower(this, x, y, zone.laneIndex, zone.slotIndex, difficulty);
                        const problem = this.mathsManager.generateProblemForDifficulty(difficulty);
                        tower.setProblem(problem);
                        this.towers.add(tower);
                        this.slots[zone.laneIndex][zone.slotIndex] = tower;
                    }
                });
            }
        }
    }

    drawLaneGrid() {
        const graphics = this.add.graphics();

        // Draw horizontal lane divider lines
        graphics.lineStyle(2, 0x333355, 0.5);
        const laneHeight = CANVAS_HEIGHT / LANES.length;

        for (let i = 1; i < LANES.length; i++) {
            const y = i * laneHeight;
            graphics.beginPath();
            graphics.moveTo(0, y);
            graphics.lineTo(CANVAS_WIDTH, y);
            graphics.strokePath();
        }

        // Draw tower slot markers (small circles)
        graphics.lineStyle(2, 0x555577, 0.8);

        for (const laneY of LANES) {
            for (const slotX of TOWER_SLOTS_X) {
                graphics.strokeCircle(slotX, laneY, 24);
            }
        }
    }

    update(time, delta) {
        // Update tower cooldowns and fire
        this.towers.getChildren().forEach(tower => {
            tower.updateCooldown(delta);

            if (tower.canFire()) {
                this.fireTower(tower);
                tower.resetCooldown();
            }
        });

        // Check if any monster reached the left edge
        this.monsters.getChildren().forEach(monster => {
            if (monster.x < 0) {
                this.lives--;
                monster.destroy();

                // Check for game over
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // Update HUD
        this.hud.update(this.score, this.lives);
    }

    gameOver() {
        // Store final score
        this.registry.set('finalScore', this.score);

        // Clean up
        if (this.waveManager) {
            this.waveManager.destroy();
        }

        // Transition to game over scene
        this.scene.start('GameOverScene');
    }

    fireTower(tower) {
        // Fire toward right side with slight random spread
        const velocityX = 300;
        const velocityY = Phaser.Math.Between(-30, 30); // Random spread

        const projectile = new Projectile(
            this,
            tower.x + 30, // Start slightly to the right of tower
            tower.y,
            tower.difficulty,
            velocityX,
            velocityY
        );
        this.projectiles.add(projectile);
    }

    handleProjectileMonsterCollision(projectile, monster) {
        // Check if difficulties match
        if (projectile.difficulty === monster.difficulty) {
            // Same difficulty: deal damage, normal elastic bounce (handled by physics)
            const died = monster.takeDamage(1);
            projectile.onBounce();

            // Award points if monster died
            if (died) {
                this.score += POINTS[monster.difficulty];
            }
        } else {
            // Different difficulty: no damage, invert y-velocity only (deflect vertically)
            projectile.body.velocity.y *= -1;
            projectile.onBounce();
        }
    }

    handleAnswerSubmit(answer) {
        let anyCorrect = false;

        // Check answer against all towers
        this.towers.getChildren().forEach(tower => {
            if (tower.problem && this.mathsManager.checkAnswer(tower.problem, answer)) {
                anyCorrect = true;

                // Activate tower if not already active
                if (!tower.isActive) {
                    tower.activate();
                }

                // Increase fire rate
                tower.increaseFireRate();

                // Assign new problem
                const newProblem = this.mathsManager.generateProblemForDifficulty(tower.difficulty);
                tower.setProblem(newProblem);

                // Visual feedback - pulse effect
                this.tweens.add({
                    targets: tower,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    yoyo: true
                });
            }
        });

        // Flash input box
        this.inputBox.flash(anyCorrect);
    }
}
