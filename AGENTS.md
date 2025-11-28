Simple maths tower defence game.

## Aim

A simple tower defence game, with a game mechanic based on solving maths problems

It's in the style of plants vs zombies, where the monsters come from the left hand side

It work in the browser, with no server (i.e. statically hosted)

This is a small game for my son to plan, it can be built in a couple of days max, so we don't need a super complex architecture that can support like a professional/paid game

## Dependecy

https://github.com/RobinL/maths-game-problem-generator

This is a javascript library that generate maths problems of different types and difficult levels.

```js
import { generateProblem, checkAnswer } from 'maths-game-problem-generator';

// Generate a Year 3 division problem
const problem = generateProblem({
  yearLevel: 'year3',
  type: 'division'
});

console.log(problem.expression);      // e.g., "72 ÷ 8"
console.log(problem.answer);          // e.g., 9
console.log(problem.formattedAnswer); // e.g., "9"

// Check a user's answer
const isCorrect = checkAnswer(problem, 9);  // true
const alsoCorrect = checkAnswer(problem, "9");  // true (strings work too)
```



## Mechanics

The user selects a 'base' problem difficulty.  Say, year 1.

Each monster that spawns corresponds to a problem difficulty.  Easy, medium and hard.  If the base is year 1, then
	- easy = year 1
	- medium = year 2
	- hard = year 3

Monsters have health which depleats as you shoot them.

Each turret has a maths problem on it.  Turrets can kill zombies of their correspondind ficciulty:
- Easy turrets kill easy monsters
- Medium turrets kill medium

When you solve the maths problem on a turret it start shoting.  A new problem immediately spawns on the turret.  If solved, the turret shoots faster.


## Getting started

To begin with, there will be no sprites, everything can just be circles/squares.  Green = easy, orange = medium, red = hard.

Monsters can be squares

Turrets can be circles.

We want to design things so that it will be possible to add sprites later.

But let's start with the above game.



----

Please plan this out high level.  What tech should I use?


# Phaser Focus Control Pattern

## Primary File
`src/main.js`

## Pattern: Keyboard Enable/Disable on Focus/Blur

### 1. Canvas Setup
```javascript
canvas.setAttribute('tabindex', '0');  // Make canvas focusable
game.input.keyboard.target = canvas;   // Target Phaser keyboard to canvas
canvas.addEventListener('pointerdown', () => canvas.focus());
```

### 2. HTML Input Handling
Each HTML input element uses:
```javascript
inputElement.addEventListener('focus', () => {
    game.input.keyboard.enabled = false;  // Disable Phaser keyboard when typing
});
inputElement.addEventListener('blur', () => {
    game.input.keyboard.enabled = true;   // Re-enable when done
});
```

### How It Works
- **Phaser keyboard disabled** when HTML inputs receive focus → prevents game from capturing keystrokes while typing
- **Phaser keyboard re-enabled** on input blur → returns control to game
- Canvas click refocuses the game area
- In-game input (`UIScene.js`) uses Phaser's native `this.input.keyboard.on('keydown', ...)` which only fires when enabled


--

One Critical Advice: Hitboxes vs. Textures
Currently, your code relies on the generated texture size for physics:
BootScene creates a 40x40 rectangle.
Monster physics body defaults to the texture size (40x40).
The Trap: When you load a real PNG, it might be 128x128 pixels (for high resolution).
If you just render it, it will look huge.
If you use this.setDisplaySize(40, 40), it looks small, but the Physics Body might stay at 128x128 depending on when physics was enabled.
The Fix:
Always refresh the body after scaling in the constructor:
code
JavaScript
// In Monster.js constructor
this.setDisplaySize(40, 40); // Visual scale
this.refreshBody();          // Resizes physics box to match new visual scale
Or, if the sprite has a lot of transparent whitespace (padding), set the body size manually:
code
JavaScript
// Visual is 40x40, but hitbox is smaller to be forgiving
this.body.setSize(30, 30);
this.body.setOffset(5, 5); // Center the hitbox
Summary