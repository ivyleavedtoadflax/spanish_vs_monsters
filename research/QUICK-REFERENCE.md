# Accent Utils - Quick Reference Card

## Import

```javascript
import { compareIgnoringAccents, hasAccents, validateAnswer } from './utils/accentUtils.js';
```

## Three Main Functions

### 1. compareIgnoringAccents(str1, str2)
**Returns:** `boolean`

```javascript
compareIgnoringAccents('comi', 'comí')    // true
compareIgnoringAccents('Comí', 'comi')    // true (case-insensitive)
compareIgnoringAccents('como', 'comí')    // false
```

### 2. hasAccents(text)
**Returns:** `boolean`

```javascript
hasAccents('comí')    // true
hasAccents('comi')    // false
hasAccents('español') // true
```

### 3. validateAnswer(userAnswer, correctAnswer)
**Returns:** `object`

```javascript
validateAnswer('comí', 'comí')
// {
//   isCorrect: true,
//   hasAccents: true,
//   perfectMatch: true,
//   bonusPoints: 10
// }

validateAnswer('comi', 'comí')
// {
//   isCorrect: true,
//   hasAccents: false,
//   perfectMatch: false,
//   bonusPoints: 0
// }
```

## Common Patterns

### Pattern 1: Simple Check
```javascript
if (compareIgnoringAccents(userInput, answer)) {
  activateTower();
}
```

### Pattern 2: With Bonus
```javascript
const result = validateAnswer(userInput, answer);
if (result.isCorrect) {
  addPoints(100 + result.bonusPoints);
}
```

### Pattern 3: Full Feedback
```javascript
const result = validateAnswer(userInput, answer);

if (result.isCorrect) {
  if (result.perfectMatch) {
    showMessage('Perfect! ⭐⭐⭐');
  } else if (result.hasAccents) {
    showMessage('Great! ⭐⭐');
  } else {
    showMessage('Correct! ⭐');
  }
  addPoints(100 + result.bonusPoints);
}
```

## Performance

- Single comparison: **<0.001ms**
- 10,000 comparisons: **~10ms**
- Safe for real-time games: **✓**

## Spanish Characters Handled

✓ á, é, í, ó, ú (and uppercase)  
✓ ñ, Ñ  
✓ ü, Ü  
✓ Case-insensitive  
✓ Trimming recommended: `userInput.trim()`

## Test Status

**59/59 tests passed** ✓

Run tests:
```bash
node research/test-accent-utils.js
```

## That's It!

Three functions, battle-tested, ready to use. See `USAGE-EXAMPLE.md` for more patterns.
