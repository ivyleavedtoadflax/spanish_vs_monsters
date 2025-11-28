import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LANES, TOWER_SLOTS_X, COLORS, TOWER, GAME, POINTS } from '../config.js';
import Monster from '../entities/Monster.js';
import Tower from '../entities/Tower.js';
import TowerSlot from '../entities/TowerSlot.js';
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

        // Create monsters group - simple group, monsters handle their own physics
        this.monsters = this.add.group();

        // Create towers group
        this.towers = this.add.group();

        // Create projectiles group - simple group, projectiles handle their own physics
        this.projectiles = this.add.group();

        // Track tower slots: slots[laneIndex][slotIndex] = tower or null
        this.slots = [];
        // Track tower slot UI (maths problems before tower spawns)
        this.towerSlots = [];
        for (let l = 0; l < LANES.length; l++) {
            this.slots[l] = [];
            this.towerSlots[l] = [];
            for (let s = 0; s < TOWER_SLOTS_X.length; s++) {
                this.slots[l][s] = null;
                this.towerSlots[l][s] = null;
            }
        }

        // Create tower slots with maths problems (towers spawn when solved)
        this.createTowerSlots();

        // Create wave manager to spawn monsters
        this.waveManager = new WaveManager(this);

        // Set up world bounds for projectile bouncing
        this.physics.world.setBounds(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.physics.world.on('worldbounds', (body) => {
            if (body.gameObject && body.gameObject.onBounce) {
                body.gameObject.onBounce();
            }
        });

        // Note: Collision detection is done manually in update()
        // because physics groups interfere with our custom sprite classes

        // Create input box at bottom of screen
        this.inputBox = new InputBox(this, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 40);

        // Listen for answer submissions
        this.events.on('answerSubmitted', this.handleAnswerSubmit, this);

        // Create HUD
        this.hud = new HUD(this, 10, 10);
    }

    createTowerSlots() {
        // Assign difficulties to slots in a pattern
        // Each lane has: easy, medium, hard, easy (or similar pattern)
        const slotDifficulties = ['easy', 'medium', 'hard', 'easy'];

        for (let laneIndex = 0; laneIndex < LANES.length; laneIndex++) {
            for (let slotIndex = 0; slotIndex < TOWER_SLOTS_X.length; slotIndex++) {
                const x = TOWER_SLOTS_X[slotIndex];
                const y = LANES[laneIndex];

                // Rotate the difficulty pattern per lane for variety
                const difficultyIndex = (slotIndex + laneIndex) % slotDifficulties.length;
                const difficulty = slotDifficulties[difficultyIndex];

                // Create tower slot with maths problem
                const towerSlot = new TowerSlot(this, x, y, laneIndex, slotIndex, difficulty);
                const problem = this.mathsManager.generateProblemForDifficulty(difficulty);
                towerSlot.setProblem(problem);

                this.towerSlots[laneIndex][slotIndex] = towerSlot;
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
        const towers = this.towers.getChildren().slice();
        for (const tower of towers) {
            if (tower && tower.active) {
                tower.updateCooldown(delta);

                if (tower.canFire()) {
                    this.fireTower(tower);
                    tower.resetCooldown();
                }
            }
        }

        // Check projectile-monster collisions manually
        this.checkProjectileMonsterCollisions();

        // Check if any monster reached the left edge
        const monsters = this.monsters.getChildren().slice();
        for (const monster of monsters) {
            if (monster && monster.active && monster.x < 0) {
                this.lives--;
                monster.destroy();

                // Check for game over
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }

        // Update HUD
        this.hud.update(this.score, this.lives);
    }

    checkProjectileMonsterCollisions() {
        const projectiles = this.projectiles.getChildren();
        const monsters = this.monsters.getChildren();

        for (const projectile of projectiles) {
            if (!projectile || !projectile.active || !projectile.body) continue;

            for (const monster of monsters) {
                if (!monster || !monster.active || !monster.body) continue;

                // Check if bodies overlap using Phaser's built-in check
                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    projectile.getBounds(),
                    monster.getBounds()
                )) {
                    this.handleProjectileMonsterCollision(projectile, monster);
                }
            }
        }
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

        try {
            const projectile = new Projectile(
                this,
                tower.x + 30, // Start slightly to the right of tower
                tower.y,
                tower.difficulty,
                velocityX,
                velocityY
            );
            this.projectiles.add(projectile);
        } catch (e) {
            console.error('Error creating projectile:', e);
        }
    }

    handleProjectileMonsterCollision(projectile, monster) {
        // Safety checks
        if (!projectile.active || !monster.active) return;

        // Prevent multiple triggers for the same collision
        const now = this.time.now;
        if (projectile.lastBounceTime && now - projectile.lastBounceTime < 150) {
            return;
        }
        projectile.lastBounceTime = now;

        // Check difficulty logic
        if (projectile.difficulty === monster.difficulty) {
            const died = monster.takeDamage(1);
            if (died) {
                this.score += POINTS[monster.difficulty];
            }
        }

        // Bounce the projectile off the monster
        // Determine bounce direction based on relative position
        const dx = projectile.x - monster.x;
        const dy = projectile.y - monster.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            // Hit from left or right - reverse X velocity
            projectile.body.velocity.x *= -1;
            // Push projectile away to prevent re-collision
            projectile.x += dx > 0 ? 5 : -5;
        } else {
            // Hit from top or bottom - reverse Y velocity
            projectile.body.velocity.y *= -1;
            // Push projectile away to prevent re-collision
            projectile.y += dy > 0 ? 5 : -5;
        }

        // Register the bounce for projectile lifespan
        if (projectile.onBounce) {
            projectile.onBounce();
        }
    }

    handleAnswerSubmit(answer) {
        console.log('Answer submitted:', answer);
        let anyCorrect = false;

        // First, check answer against tower slots (to spawn new towers)
        for (let laneIndex = 0; laneIndex < LANES.length; laneIndex++) {
            for (let slotIndex = 0; slotIndex < TOWER_SLOTS_X.length; slotIndex++) {
                const towerSlot = this.towerSlots[laneIndex][slotIndex];

                if (towerSlot && towerSlot.problem) {
                    const isCorrect = this.mathsManager.checkAnswer(towerSlot.problem, answer);

                    if (isCorrect) {
                        anyCorrect = true;

                        const x = TOWER_SLOTS_X[slotIndex];
                        const y = LANES[laneIndex];
                        const difficulty = towerSlot.difficulty;

                        // Destroy the tower slot
                        towerSlot.destroy();
                        this.towerSlots[laneIndex][slotIndex] = null;

                        // Create the actual tower (already active)
                        const tower = new Tower(this, x, y, laneIndex, slotIndex, difficulty);
                        tower.activate(); // Tower starts active immediately

                        // Assign a new problem to the tower
                        const newProblem = this.mathsManager.generateProblemForDifficulty(difficulty);
                        tower.setProblem(newProblem);

                        this.towers.add(tower);
                        this.slots[laneIndex][slotIndex] = tower;

                        console.log('Tower spawned at lane', laneIndex, 'slot', slotIndex);

                        // Visual feedback
                        this.tweens.add({
                            targets: tower,
                            scaleX: 1.3,
                            scaleY: 1.3,
                            duration: 100,
                            yoyo: true
                        });
                    }
                }
            }
        }

        // Then, check answer against existing towers (to boost fire rate)
        const towers = this.towers.getChildren().slice();
        console.log('Checking against', towers.length, 'towers');

        for (const tower of towers) {
            try {
                if (tower.problem) {
                    console.log('Checking tower problem:', tower.problem.expression, 'answer:', tower.problem.answer);
                    const isCorrect = this.mathsManager.checkAnswer(tower.problem, answer);
                    console.log('Is correct:', isCorrect);

                    if (isCorrect) {
                        anyCorrect = true;

                        // Increase fire rate
                        tower.increaseFireRate();

                        // Assign new problem
                        const newProblem = this.mathsManager.generateProblemForDifficulty(tower.difficulty);
                        tower.setProblem(newProblem);
                        console.log('New problem assigned:', newProblem.expression);

                        // Visual feedback - pulse effect on the problem text
                        this.tweens.add({
                            targets: tower.problemText,
                            scaleX: 1.3,
                            scaleY: 1.3,
                            duration: 100,
                            yoyo: true
                        });
                    }
                }
            } catch (e) {
                console.error('Error checking answer:', e);
            }
        }

        console.log('Any correct:', anyCorrect);
        // Flash input box
        this.inputBox.flash(anyCorrect);
    }
}
