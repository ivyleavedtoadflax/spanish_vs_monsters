import Tower from '../Tower.js';
import { createProjectile } from '../projectiles/ProjectileFactory.js';

/**
 * SpreadTower - fires multiple projectiles in a spread pattern.
 * Upgrades increase the projectile count.
 */
export default class SpreadTower extends Tower {
    constructor(scene, x, y, lane, slotIndex, difficulty = 'medium') {
        super(scene, x, y, lane, slotIndex, difficulty);
    }

    /**
     * Calculate spread angle based on projectile count.
     * Scales linearly from base angle (30°) at 3 projectiles to max (120°) at 10 projectiles.
     * @param {number} projectileCount - Current number of projectiles
     * @returns {number} The spread angle in degrees
     */
    calculateSpreadAngle(projectileCount) {
        const minCount = 2;
        const maxCount = 10;
        const minAngle = 20;
        const maxAngle = 120;

        // Clamp projectile count to valid range
        const clampedCount = Phaser.Math.Clamp(projectileCount, minCount, maxCount);

        // Linear interpolation between min and max angle
        const t = (clampedCount - minCount) / (maxCount - minCount);
        return minAngle + t * (maxAngle - minAngle);
    }

    /**
     * Fire multiple projectiles in a spread pattern.
     * @param {Phaser.Scene} scene - The game scene
     */
    fire(scene) {
        const config = this.getProjectileConfig();
        const projectileCount = this.stats.projectileCount || 3;
        const spreadAngle = this.calculateSpreadAngle(projectileCount);
        const speed = config.projectileSpeed;

        // Calculate angle step between projectiles
        // If 3 projectiles and 30 degree spread, angles are -15, 0, +15
        const totalSpread = Phaser.Math.DegToRad(spreadAngle);
        const angleStep = projectileCount > 1 ? totalSpread / (projectileCount - 1) : 0;
        const startAngle = -totalSpread / 2;

        for (let i = 0; i < projectileCount; i++) {
            // Calculate angle for this projectile (0 = straight right)
            const angle = startAngle + (i * angleStep);

            // Calculate velocity components
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;

            const projectile = createProjectile(
                scene,
                this.x + 30, // Start slightly to the right of tower
                this.y,
                config,
                this.difficulty,
                velocityX,
                velocityY
            );

            scene.projectiles.add(projectile);
        }
    }
}
