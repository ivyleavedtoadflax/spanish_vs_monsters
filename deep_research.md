# Phaser 3 Arcade Physics Colliders with Custom Classes

## Standard vs. Physics Groups for Colliders

Phaser’s collider system works with both regular Groups and Physics Groups, as long as the contained objects have physics bodies[\[1\]](https://docs.phaser.io/phaser/concepts/physics/arcade#:~:text=,Add%20or%20remove%20game%20objects). In practice, however, it’s common to use physics-enabled groups for convenience. For example, using this.physics.add.group() for dynamic objects (monsters, projectiles) and this.physics.add.staticGroup() for immovable objects is a recommended pattern[\[2\]](https://www.reddit.com/r/phaser/comments/uh6voo/creating_collision_between_two_objects_in/#:~:text=You%20need%20to%20add%20collider,enough%2C%20it%20is%20a%20requirement). Physics Groups automatically enable bodies for their members and allow you to set default physics properties when creating objects. Standard (non-physics) Groups can also be used (the collider will iterate their children’s physics bodies), but older Phaser versions had issues with colliding pure Phaser.GameObjects.Group objects (now resolved in current versions). In summary, **at least one side of a collision should have physics-enabled objects**. Using this.physics.add.group() ensures new objects are physics-enabled and avoids manual calls to physics.add.existing on each object. The official Phaser examples typically use physics groups for any collection of objects that will collide[\[2\]](https://www.reddit.com/r/phaser/comments/uh6voo/creating_collision_between_two_objects_in/#:~:text=You%20need%20to%20add%20collider,enough%2C%20it%20is%20a%20requirement). If you do use a plain group (this.add.group()), make sure you still add physics bodies to its members (as you are doing in your custom class constructors) so that physics.add.collider can detect collisions.

**Pitfall:** If collisions still fail when using plain groups, try switching one or both to physics groups. In general, using physics groups tends to be more foolproof for Arcade collisions.

## Initializing Custom Physics Sprite Classes

When extending Phaser.Physics.Arcade.Sprite, the **proper initialization order** is: call super(scene, x, y, texture) then add the sprite to the scene and enable its physics body. The canonical approach (from Phaser examples) is:

class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Now this.body is defined; set physics properties:
    this.setImmovable(true);
    this.setVelocityX(-MONSTER.speed);
  }
}

This pattern is shown in official sources[\[3\]](https://phaser.discourse.group/t/problem-with-extended-phaser-physics-arcade-sprite/1631#:~:text=class%20Player%20extends%20Phaser.Physics.Arcade.Sprite%20,existing%28this)[\[4\]](https://phaser.discourse.group/t/how-to-add-custom-sprite-to-a-group/3666#:~:text=export%20default%20class%20extends%20Phaser,scene%2C%20x%2C%20y%2C%20texture). Calling scene.add.existing(this) puts your sprite in the display list, and scene.physics.add.existing(this) creates an Arcade Physics body (dynamic by default) and links it to the sprite[\[3\]](https://phaser.discourse.group/t/problem-with-extended-phaser-physics-arcade-sprite/1631#:~:text=class%20Player%20extends%20Phaser.Physics.Arcade.Sprite%20,existing%28this). After these calls, you can safely set body properties like bounce, immovability, velocity, etc. in the constructor. This ensures your custom sprite is both visible and physics-enabled.

**Groups and Double Initialization:** Be cautious when adding these custom objects to a Physics Group. Adding an already-physics-enabled object to a physics group can re-enable its body or reset its defaults. In fact, if you add the object to a physics group **after** setting velocity, you may find the velocity zeroed out or overridden[\[5\]](https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415#:~:text=I%20tried%20this%20and%20the,Do%20this%20instead). This is because this.physics.add.group() will enable physics on any new group member by default. To avoid this “double initialization” issue, you have a few options:

* **Option 1:** *Do not call* scene.physics.add.existing(this) in your class. Instead, create the sprite (scene.add.existing) and add it to a physics group which will enable the body for you. Then set the physics properties. For example:

* this.monsters \= this.physics.add.group();
  const monster \= new Monster(this, x, y, 'pixel');  // calls scene.add.existing internally
  this.monsters.add(monster);
  monster.body.setVelocityX(-MONSTER.speed);

* Here, the group’s .add() will enable the body if not already enabled, so calling physics.add.existing in the class is redundant. You then set velocity *after* adding to the group, which avoids the group resetting it[\[5\]](https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415#:~:text=I%20tried%20this%20and%20the,Do%20this%20instead).

* **Option 2:** Keep the class enabling physics (as in your current code), but add the object to a **non-physics Group** (just for organization). This avoids double-enabling. Since the sprite already has a body from the constructor, a plain group is sufficient for the collider to work (the physics world will check the group’s children)[\[1\]](https://docs.phaser.io/phaser/concepts/physics/arcade#:~:text=,Add%20or%20remove%20game%20objects). This is what you attempted – and it is a valid approach – so the collider issue likely lies elsewhere (addressed below).

* **Option 3:** Use the group’s built-in creation with a classType. For example, this.projectiles \= this.physics.add.group({ classType: Projectile, runChildUpdate: true });. This lets Phaser handle creating instances with physics. If you call this.projectiles.create(x, y) or get() on that group, it will instantiate a Projectile with physics. However, note that passing extra constructor arguments via group methods can be tricky. You might instead call new Projectile(...) and then add as above.

In all cases, remember that a physics group may reset certain body defaults when enabling the body. If you see velocities or bounce values getting lost, set them *after* the object is fully added to the physics world[\[5\]](https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415#:~:text=I%20tried%20this%20and%20the,Do%20this%20instead). Also, **do not call scene.physics.add.existing twice** – doing so can create conflicts or a new body on the same sprite. One call per object is enough (the group counts as one if it’s adding the body).

## Collider Registration and Timing

You can register colliders **even if the groups are initially empty**. Phaser’s physics.add.collider returns a Collider object that continuously checks for overlaps between the specified objects each frame[\[6\]](https://docs.phaser.io/phaser/concepts/physics/arcade#:~:text=,Add%20or%20remove%20game%20objects). This means you can set up this.physics.add.collider(this.projectiles, this.monsters, this.handleProjectileMonsterCollision, null, this) in create(), before or after adding any members. As monsters and projectiles are added to their groups, the collider will automatically include them. There is no requirement that groups have members at the time of collider creation. (For example, you can create a collider with an empty group and later add sprites to that group – collisions will be detected as they come into existence.)

What’s critical is that the objects involved **have active, enabled physics bodies** when collisions occur. Ensure that when you spawn a Monster or Projectile, its body is enabled (body.enable \= true by default). If either object’s body is disabled (body.enable=false), it won’t collide. Also verify the objects and groups you pass to physics.add.collider are the correct ones (e.g. the actual group instances, not undefined). In some cases, if you accidentally call scene.physics.add.collider before this.monsters or this.projectiles are defined, it could silently fail. But as long as you use this.monsters and this.projectiles after creating them (even if still empty), Phaser should handle it.

In the forum example you found, the user had to delay creating the collider only because their player object was being added later via a server event. In a typical game scene, you would create your groups, add your initial objects, and set up colliders all in create(). No explicit “refresh” of the collider is needed after new objects – Phaser monitors the groups continuously.

**Collider and Body States:** The Arcade Physics engine will not call your collision callback if the bodies don’t actually collide. If your callback isn’t firing, aside from group type issues, it could be that the objects never overlap due to positioning or body sizes. Double-check that the objects are on a collision course (e.g., monster moving left and projectile moving towards it). Enabling physics debug (discussed below) will help confirm this. Also, note that collisions require the bodies to actually touch or overlap. If an object’s body is very small (or still at default 1x1 size) due to scaling issues, collisions might never register visually.

## Bounce Behavior with Immovable Bodies

In Arcade Physics, if a moving body with a bounce factor collides with an immovable body, the bounce is handled automatically by the physics engine. You **do not** need to manually reverse velocities in the collision callback. The bounce coefficient (setBounce(x, y)) on a body determines how much velocity it retains on collision – a value of 1 means a full reflection (100% of speed preserved, just inverted)[\[7\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=const%20sprite%20%3D%20this,setCollideWorldBounds%28true)[\[8\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=this). In your case, a Projectile with body.setBounce(1,1) colliding with an immovable Monster should rebound without any custom code. The Monster, being immovable, will not move at all, acting like a wall. The Projectile’s velocity will flip direction (and since bounce=1, its speed remains the same). This is exactly how Phaser handles, for example, bouncing balls against static walls.

For example, the official **Phaser “Collide Event” example** creates an immovable block and a bouncing sprite: the sprite is given .setBounce(1,1) and the block .setImmovable(true), and the sprite bounces off the block on collision[\[9\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=create%20%28%29%20,setImmovable%28true)[\[8\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=this). No special code was required beyond setting the bounce and adding the collider. In your tower defense scenario, consider what should happen on impact: if you want the projectile to *not* bounce but instead explode or disappear, you might set bounce to 0 and handle destruction in the collision callback. But if bounce is intended (maybe projectiles ricochet off monsters), the physics will handle the ricochet. Just be aware that with immovable=true, the Monster won’t budge; all bounce effect applies to the Projectile.

**Note:** If you find the bounce isn’t happening, ensure that the bounce is set on the **moving object’s body** (setting it on an immovable has no effect since it doesn’t move). Also, if using a staticGroup for monsters instead of making them dynamic immovable, the effect is similar – the dynamic projectile will bounce off a static body as well.

## Debugging Collision Issues

To debug Arcade Physics collisions, Phaser provides several tools and techniques:

* **Enable Physics Debugging:** In your game config, set physics.arcade.debug: true. This will render debug outlines around all physics bodies and show their velocity vectors. It’s immensely helpful to see if sprites have the expected size and position. With debug on, you can visually confirm that the Monster and Projectile bodies overlap when you expect a collision. If you notice the bodies are tiny or not where the sprites are, you may need to adjust anchor/origin or call body.setSize or refreshBody() after scaling a sprite. For instance, if your Monster uses a 1x1 pixel texture scaled up, its physics body might still be 1x1 unless updated. In such a case, use monster.body.setSize(width, height) (or monster.setDisplaySize) to match the visible size, or simply create a larger sprite texture for physics purposes.

* **Use Console Logs in Callbacks:** Add a console.log at the start of your handleProjectileMonsterCollision to see if it ever executes. If it never prints, the collider isn’t firing. You can also supply a **processCallback** (the fourth parameter of physics.add.collider) that always returns true but logs something — this runs during the collision check even if no collision is resolved. For example:

* this.physics.add.collider(this.projectiles, this.monsters, handleCollision, (proj, monst) \=\> {
      console.log('Checking collision between', proj.name, monst.name);
      return true; // process every pair
  }, this);

* This can spam the console, but it confirms that the collider is actively checking pairs.

* **Global Collide Event:** Phaser’s Arcade Physics world can emit a global event when any collision occurs. To use it, set body.onCollide \= true on one of the bodies you’re interested in, and then listen to this.physics.world.on('collide', ...)[\[8\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=this). For example:

* projectile.body.onCollide \= true;
  this.physics.world.on('collide', (gameObject1, gameObject2, body1, body2) \=\> {
      console.log('Collision detected between', gameObject1, 'and', gameObject2);
  });

* This will log **every** collision involving any body with onCollide=true. It’s useful to ensure collisions are happening and to see which objects are involved. (Remember to remove or disable this in production, as it can be performance-intensive if many collisions occur.)

* **Verify Object States:** During gameplay, use the console to inspect monster.body and projectile.body. Ensure their enabled flags are true (body.enable) and they haven’t been set to allowCollision.none or some such. Also check their x and y coordinates and velocity at runtime to confirm they should intersect. If projectiles or monsters “stop moving,” verify that their body.moves is true (should be by default for dynamic bodies) and that body.velocity is what you expect. If a sprite suddenly isn’t moving, perhaps its velocity was reset to 0 (which could happen if you accidentally added it to a physics group late, as discussed) or maybe its active status was set to false (inactive sprites are skipped by the physics engine). Ensure you’re not calling any method that deactivates or kills the sprites inadvertently.

* **Collision Bounds & Size:** As mentioned, one common oversight is sprite scaling vs. body size. If you create a physics body before setting the sprite’s scale, the body will still use the original texture size. For a 1×1 px texture, that means a 1×1 collision box\! If you then scale the sprite up by, say, 20, the sprite looks bigger but the physics body remains 1×1 (unless you call body.setSize or refreshBody). This could make collisions nearly impossible to detect visually. The fix is to set the scale **before** enabling physics or call sprite.body.setSize(sprite.width \* sprite.scaleX, sprite.height \* sprite.scaleY) after scaling. Using debug outlines will immediately reveal if this is the case – you’ll see a tiny red or green box for the body if it’s too small.

By following the above steps, you can identify whether the collider is firing and where things might be going wrong. Often, once the physics bodies are set up correctly and the collider is in place, collisions in Phaser Arcade Physics “just work.” In summary, ensure your custom classes add their physics bodies correctly, use the appropriate group types to avoid conflicts, and leverage Phaser’s debug features to fine-tune the collision interaction. With the canonical patterns and these debugging techniques, your tower defense projectiles and monsters should collide as expected\!

**Sources:** Phaser 3 official documentation and examples, and community discussions were used to validate these best practices and troubleshooting steps[\[1\]](https://docs.phaser.io/phaser/concepts/physics/arcade#:~:text=,Add%20or%20remove%20game%20objects)[\[2\]](https://www.reddit.com/r/phaser/comments/uh6voo/creating_collision_between_two_objects_in/#:~:text=You%20need%20to%20add%20collider,enough%2C%20it%20is%20a%20requirement)[\[3\]](https://phaser.discourse.group/t/problem-with-extended-phaser-physics-arcade-sprite/1631#:~:text=class%20Player%20extends%20Phaser.Physics.Arcade.Sprite%20,existing%28this)[\[5\]](https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415#:~:text=I%20tried%20this%20and%20the,Do%20this%20instead)[\[10\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=const%20sprite%20%3D%20this,setGravityY%28200)[\[8\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=this). Each cited source provides insight into proper usage of Arcade Physics with custom sprites, collider behavior, and common pitfalls.

---

[\[1\]](https://docs.phaser.io/phaser/concepts/physics/arcade#:~:text=,Add%20or%20remove%20game%20objects) [\[6\]](https://docs.phaser.io/phaser/concepts/physics/arcade#:~:text=,Add%20or%20remove%20game%20objects) Arcade Physics

[https://docs.phaser.io/phaser/concepts/physics/arcade](https://docs.phaser.io/phaser/concepts/physics/arcade)

[\[2\]](https://www.reddit.com/r/phaser/comments/uh6voo/creating_collision_between_two_objects_in/#:~:text=You%20need%20to%20add%20collider,enough%2C%20it%20is%20a%20requirement) Creating collision between two objects in separate classes : r/phaser

[https://www.reddit.com/r/phaser/comments/uh6voo/creating\_collision\_between\_two\_objects\_in/](https://www.reddit.com/r/phaser/comments/uh6voo/creating_collision_between_two_objects_in/)

[\[3\]](https://phaser.discourse.group/t/problem-with-extended-phaser-physics-arcade-sprite/1631#:~:text=class%20Player%20extends%20Phaser.Physics.Arcade.Sprite%20,existing%28this) Problem with extended Phaser.Physics.Arcade.Sprite \- Phaser 3 \- Phaser

[https://phaser.discourse.group/t/problem-with-extended-phaser-physics-arcade-sprite/1631](https://phaser.discourse.group/t/problem-with-extended-phaser-physics-arcade-sprite/1631)

[\[4\]](https://phaser.discourse.group/t/how-to-add-custom-sprite-to-a-group/3666#:~:text=export%20default%20class%20extends%20Phaser,scene%2C%20x%2C%20y%2C%20texture) How to add custom sprite to a group \- Phaser 3 \- Phaser

[https://phaser.discourse.group/t/how-to-add-custom-sprite-to-a-group/3666](https://phaser.discourse.group/t/how-to-add-custom-sprite-to-a-group/3666)

[\[5\]](https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415#:~:text=I%20tried%20this%20and%20the,Do%20this%20instead) Adding physics body to a group \- Phaser 3 \- Phaser

[https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415](https://phaser.discourse.group/t/adding-physics-body-to-a-group/6415)

[\[7\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=const%20sprite%20%3D%20this,setCollideWorldBounds%28true) [\[8\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=this) [\[9\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=create%20%28%29%20,setImmovable%28true) [\[10\]](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event#:~:text=const%20sprite%20%3D%20this,setGravityY%28200) Phaser \- Examples \- v3.85.0 \- physics \- arcade \- Collide Event

[https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event](https://phaser.io/examples/v3.85.0/physics/arcade/view/collide-event)