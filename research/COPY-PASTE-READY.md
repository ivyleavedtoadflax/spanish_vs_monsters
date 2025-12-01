# Copy-Paste Ready Code

## The Complete Solution (src/utils/accentUtils.js)

This file is already created and ready to use at:
**`src/utils/accentUtils.js`**

## Example Integration in GameScene

```javascript
// At the top of your GameScene.js
import { compareIgnoringAccents, validateAnswer } from '../utils/accentUtils.js';

class GameScene extends Phaser.Scene {
  
  // ... your existing code ...
  
  checkAnswer() {
    const userInput = this.inputBox.getText().trim();
    const correctAnswer = this.currentProblem.answer;
    
    // Use validateAnswer for complete result
    const result = validateAnswer(userInput, correctAnswer);
    
    if (result.isCorrect) {
      // Calculate points
      let points = this.getBasePoints();
      
      // Add bonus for using accents
      if (result.bonusPoints > 0) {
        this.showMessage('¡Perfecto! +' + result.bonusPoints + ' bonus!');
        points += result.bonusPoints;
      } else {
        this.showMessage('¡Correcto!');
      }
      
      // Award points
      this.addScore(points);
      
      // Enable tower to shoot
      this.currentTower.activate();
      
      // Clear input and generate new problem
      this.inputBox.clear();
      this.generateNewProblem();
      
    } else {
      // Wrong answer
      this.showMessage('Incorrecto');
      this.playSound('wrong');
      this.inputBox.shake();
    }
  }
  
  getBasePoints() {
    // Points based on monster difficulty
    switch (this.currentMonster.difficulty) {
      case 'easy': return 100;
      case 'medium': return 200;
      case 'hard': return 300;
      default: return 100;
    }
  }
}
```

## Minimal Example (Just Accept Answers)

If you just want to accept answers with or without accents:

```javascript
import { compareIgnoringAccents } from '../utils/accentUtils.js';

// Somewhere in your answer checking code
if (compareIgnoringAccents(userInput, correctAnswer)) {
  // Correct!
  activateTower();
} else {
  // Wrong
  showError();
}
```

## Full Example (Accept + Award Bonus)

```javascript
import { validateAnswer } from '../utils/accentUtils.js';

const result = validateAnswer(userInput, correctAnswer);

if (result.isCorrect) {
  const totalPoints = 100 + result.bonusPoints;
  addScore(totalPoints);
  
  if (result.bonusPoints > 0) {
    showBonusEffect();  // Visual effect for bonus
  }
  
  activateTower();
} else {
  showError();
}
```

## Testing Your Integration

Quick test in browser console:

```javascript
import { compareIgnoringAccents, hasAccents, validateAnswer } from './utils/accentUtils.js';

// Should return true
console.log(compareIgnoringAccents('comi', 'comí'));

// Should return { isCorrect: true, hasAccents: true, perfectMatch: true, bonusPoints: 10 }
console.log(validateAnswer('comí', 'comí'));

// Should return { isCorrect: true, hasAccents: false, perfectMatch: false, bonusPoints: 0 }
console.log(validateAnswer('comi', 'comí'));
```

## Common Gotchas

1. **Always trim user input**: `userInput.trim()`
2. **Function is case-insensitive**: "Comí" = "comi" ✓
3. **Import path**: Use `../utils/accentUtils.js` from scenes folder
4. **No setup needed**: Functions work immediately after import

## That's All You Need!

The utility is complete, tested, and ready to use. Just import and call the functions.

For more examples, see `USAGE-EXAMPLE.md`.
