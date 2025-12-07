# Quickstart Guide: Spanish Verb Conjugation Practice

**Feature**: 001-spanish-verb-conjugation  
**Date**: 2025-12-01  
**Audience**: Developers extending or maintaining the verb conjugation system

## Overview

This guide covers common tasks for working with the Spanish verb conjugation system:
- Adding new verbs
- Adding new tenses
- Adjusting difficulty progression
- Troubleshooting common issues

## Prerequisites

- Node.js and npm installed
- Project dependencies installed (`npm install`)
- Familiarity with JavaScript ES6 modules
- Basic understanding of Spanish verb conjugation

## Quick Reference

### File Locations

```text
src/
├── systems/
│   └── VerbManager.js          # Core verb logic
├── utils/
│   └── accentUtils.js          # Accent handling utilities
├── data/
│   └── verbs.js                # Verb list (optional cache)
└── config.js                   # TENSE_MAPPING configuration
```

### Key Dependencies

```json
{
  "spanish-verbs": "^3.4.0"  // Verb conjugation library
}
```

---

## Adding a New Verb

Verbs are managed through the `spanish-verbs` library. To add a verb to your game's vocabulary:

### Step 1: Add to Verb List

Edit `src/systems/VerbManager.js`:

```javascript
class VerbManager {
  initializeVerbList() {
    return [
      // Existing verbs...
      'hablar',
      'comer',
      'vivir',
      
      // Add your new verb here
      'escribir',  // NEW: to write
    ];
  }
}
```

### Step 2: Verify the Verb Exists in Library

The `spanish-verbs` library supports most common Spanish verbs. Test if your verb works:

```javascript
import { getConjugation } from 'spanish-verbs';

// Test in browser console or Node REPL
const result = getConjugation('escribir', 'PRESENT', 'INDICATIVE', 'YO');
console.log(result);  // Should output: "escribo"
```

If the library doesn't support your verb, you'll need to:
1. Check if it's a less common verb (library focuses on high-frequency verbs)
2. Consider using a more common synonym
3. Or implement a custom fallback in VerbManager

### Step 3: Test in Game

1. Start the game: `npm run dev`
2. Place several towers
3. Wait for your new verb to appear (randomized)
4. Type the correct conjugation and verify it activates the tower

**Verification Checklist**:
- [ ] Verb appears on towers
- [ ] All pronouns work (yo, tú, él, nosotros, vosotros, ellos)
- [ ] All difficulty tenses work (present, preterite, imperfect, subjunctive)
- [ ] Irregular forms conjugate correctly
- [ ] Accent marks handled properly

---

## Adding a New Tense

To add a new tense to the game (e.g., future perfect, conditional perfect):

### Step 1: Update TENSE_MAPPING

Edit `src/config.js`:

```javascript
export const TENSE_MAPPING = {
  easy: {
    tenses: ['PRESENT'],
    moods: ['INDICATIVE'],
    label: 'Beginner'
  },
  medium: {
    tenses: ['PRETERITE', 'IMPERFECT'],
    moods: ['INDICATIVE'],
    label: 'Intermediate'
  },
  hard: {
    tenses: ['PRESENT', 'IMPERFECT'],
    moods: ['SUBJUNCTIVE'],
    additionalTenses: [
      { tense: 'CONDITIONAL', mood: 'INDICATIVE' },
      { tense: 'FUTURE', mood: 'INDICATIVE' },
      { tense: 'FUTURE_PERFECT', mood: 'INDICATIVE' }  // NEW TENSE
    ],
    label: 'Advanced'
  }
};
```

### Step 2: Update VerbManager Logic

If adding to `easy` or `medium`, no code changes needed (uses tenses array directly).

If adding to `hard` (additionalTenses), update `getTenseForDifficulty()` in VerbManager:

```javascript
getTenseForDifficulty(difficulty) {
  const config = TENSE_MAPPING[difficulty];
  
  if (difficulty === 'hard') {
    const rand = Math.random();
    if (rand < 0.4) {          // 40% subjunctive
      const randomTense = config.tenses[Math.floor(Math.random() * config.tenses.length)];
      return { tense: randomTense, mood: 'SUBJUNCTIVE' };
    } else if (rand < 0.6) {    // 20% conditional
      return { tense: 'CONDITIONAL', mood: 'INDICATIVE' };
    } else if (rand < 0.8) {    // 20% future
      return { tense: 'FUTURE', mood: 'INDICATIVE' };
    } else {                    // 20% future perfect (NEW)
      return { tense: 'FUTURE_PERFECT', mood: 'INDICATIVE' };
    }
  }
  // ... rest of method
}
```

### Step 3: Verify Library Support

Check if `spanish-verbs` supports your tense:

```javascript
import { getConjugation } from 'spanish-verbs';

const result = getConjugation('hablar', 'FUTURE_PERFECT', 'INDICATIVE', 'YO');
console.log(result);  // Should output: "habré hablado"
```

**Library Tense Names** (see spanish-verbs documentation):
- PRESENT, PRETERITE, IMPERFECT, FUTURE
- CONDITIONAL
- PRESENT_PERFECT, PAST_PERFECT, FUTURE_PERFECT
- And subjunctive variants

### Step 4: Update Display Text

Ensure user-friendly tense names in VerbPrompt generation:

```javascript
const tenseDisplayNames = {
  'PRESENT': 'present',
  'PRETERITE': 'preterite',
  'IMPERFECT': 'imperfect',
  'FUTURE': 'future',
  'CONDITIONAL': 'conditional',
  'FUTURE_PERFECT': 'future perfect',  // NEW
  // ... etc
};
```

### Step 5: Test All Pronouns

Compound tenses (like future perfect) use auxiliary verbs, so test thoroughly:

```text
hablar (yo, future perfect) → "habré hablado"
hablar (tú, future perfect) → "habrás hablado"
hablar (nosotros, future perfect) → "habremos hablado"
```

---

## Adjusting Difficulty Progression

### Change Tense Distribution

Edit `src/config.js` TENSE_MAPPING to reassign tenses to different difficulty tiers:

**Example: Move imperfect from medium to easy**

```javascript
export const TENSE_MAPPING = {
  easy: {
    tenses: ['PRESENT', 'IMPERFECT'],  // Added imperfect
    moods: ['INDICATIVE'],
    label: 'Beginner'
  },
  medium: {
    tenses: ['PRETERITE'],  // Removed imperfect
    moods: ['INDICATIVE'],
    label: 'Intermediate'
  },
  // hard unchanged
};
```

### Change Difficulty Labels

Update labels shown in MenuScene:

```javascript
export const TENSE_MAPPING = {
  easy: {
    // ...
    label: 'Easy Mode'  // Changed from "Beginner"
  },
  // ... etc
};
```

Then update MenuScene.js to use these labels in the dropdown.

### Adjust Probability Distribution (Hard Tier)

In VerbManager's `getTenseForDifficulty()`, adjust the random thresholds:

```javascript
if (difficulty === 'hard') {
  const rand = Math.random();
  if (rand < 0.7) {          // Increased to 70% subjunctive (was 50%)
    // subjunctive
  } else if (rand < 0.85) {  // 15% conditional (was 25%)
    // conditional
  } else {                   // 15% future (was 25%)
    // future
  }
}
```

---

## Troubleshooting

### Issue: Accent Marks Not Displaying

**Symptoms**: Accented characters appear as � or boxes

**Solutions**:

1. **Check HTML charset**:
   ```html
   <meta charset="UTF-8">
   ```

2. **Check font support**:
   Use a font that supports Spanish characters (most modern web fonts do)

3. **Verify file encoding**:
   Save all .js files as UTF-8 (check your editor settings)

4. **Test in browser console**:
   ```javascript
   console.log('comí');  // Should display correctly
   ```

### Issue: Validation Too Strict / Too Lenient

**Symptoms**: Correct answers rejected, or incorrect answers accepted

**Debugging Steps**:

1. **Add logging to validateAnswer()**:
   ```javascript
   validateAnswer(prompt, userAnswer) {
     console.log('Validating:', userAnswer);
     console.log('Against:', prompt.correctAnswers);
     const result = /* ... validation logic */;
     console.log('Result:', result);
     return result;
   }
   ```

2. **Check accent normalization**:
   ```javascript
   import { stripAccents } from '../utils/accentUtils.js';
   console.log(stripAccents('comí'));  // Should output: "comi"
   console.log(stripAccents('comi'));  // Should output: "comi"
   ```

3. **Verify library conjugation**:
   ```javascript
   const conjugation = getConjugation('comer', 'PRETERITE', 'INDICATIVE', 'YO');
   console.log(conjugation);  // Should be: "comí"
   ```

**Common Fixes**:

- **Extra whitespace**: Ensure `trim()` is called on user input
- **Case sensitivity**: Ensure `toLowerCase()` is used in comparison
- **Multiple valid forms**: Check `correctAnswers` is an array with all forms

### Issue: Performance Lag / Slow Validation

**Symptoms**: Game freezes or lags when validating answers

**Profiling**:

```javascript
validateAnswer(prompt, userAnswer) {
  const start = performance.now();
  const result = /* ... validation logic */;
  const end = performance.now();
  console.log(`Validation took ${end - start}ms`);
  return result;
}
```

**Optimizations**:

1. **Enable conjugation caching** (if not already):
   ```javascript
   constructor() {
     this.conjugationCache = new Map();
   }
   
   conjugateVerb(infinitive, tense, mood, pronoun) {
     const key = `${infinitive}-${tense}-${mood}-${pronoun}`;
     if (this.conjugationCache.has(key)) {
       return this.conjugationCache.get(key);
     }
     const result = getConjugation(infinitive, tense, mood, pronoun);
     this.conjugationCache.set(key, result);
     return result;
   }
   ```

2. **Reduce verb list size** (for testing):
   Start with 10-20 verbs, expand to 50-100 once performance validated

3. **Profile accent stripping**:
   The pre-compiled regex pattern should be very fast (<0.001ms)

### Issue: Library Error "Verb Not Found"

**Symptoms**: Console error when trying to conjugate a verb

**Solutions**:

1. **Check verb spelling**:
   ```javascript
   // Wrong: 'escriber'
   // Correct: 'escribir'
   ```

2. **Verify verb is in library**:
   Common verbs are supported, very rare verbs may not be

3. **Implement fallback**:
   ```javascript
   conjugateVerb(infinitive, tense, mood, pronoun) {
     try {
       return getConjugation(infinitive, tense, mood, pronoun);
     } catch (error) {
       console.warn(`Conjugation failed for ${infinitive}, using fallback`);
       return this.fallbackConjugation(infinitive, pronoun, tense);
     }
   }
   ```

### Issue: Irregular Verbs Conjugating Wrong

**Symptoms**: "soy" not accepted for "ser (yo, present)"

**Check**:

1. **Verify library output**:
   ```javascript
   console.log(getConjugation('ser', 'PRESENT', 'INDICATIVE', 'YO'));
   // Should output: "soy"
   ```

2. **Check pronoun format**:
   Library expects uppercase: 'YO', not 'yo'
   ```javascript
   const pronoun = 'yo'.toUpperCase();  // Convert before passing to library
   ```

3. **Verify correctAnswers array**:
   ```javascript
   console.log(prompt.correctAnswers);  // Should be: ["soy"]
   ```

---

## Testing Scenarios

### Manual Test Checklist

Run through these scenarios after any changes:

**Basic Functionality**:
- [ ] Game starts without errors
- [ ] MenuScene displays difficulty options (Beginner/Intermediate/Advanced)
- [ ] Towers display verb prompts (e.g., "hablar (yo, present)")
- [ ] Typing correct answer activates tower
- [ ] Typing incorrect answer shows shake animation

**Accent Handling**:
- [ ] Answer without accents accepted (e.g., "comi" for "comí")
- [ ] Correct accented form displayed as feedback
- [ ] Answer with correct accents awards bonus points
- [ ] Bonus points visible in HUD

**All Difficulties**:
- [ ] Beginner: Only present tense appears
- [ ] Intermediate: Preterite and imperfect appear
- [ ] Advanced: Subjunctive, conditional, future appear

**All Pronouns**:
- [ ] yo prompts work
- [ ] tú prompts work
- [ ] él/ella prompts work
- [ ] nosotros prompts work
- [ ] vosotros prompts work
- [ ] ellos/ellas prompts work

**Edge Cases**:
- [ ] Multiple valid forms accepted (subjunctive alternatives)
- [ ] Empty input rejected gracefully
- [ ] Very long input handled
- [ ] Irregular verbs (ser, estar, ir) work correctly

### Automated Testing (Optional)

If using Vitest:

```bash
npm run test
```

Run specific test file:

```bash
npx vitest src/systems/VerbManager.test.js
```

---

## Common Customizations

### Limit to Specific Verb Types

Filter verb list to only regular verbs (for beginners):

```javascript
initializeVerbList() {
  return [
    // Regular -ar verbs
    'hablar', 'trabajar', 'estudiar',
    // Regular -er verbs
    'comer', 'beber', 'leer',
    // Regular -ir verbs
    'vivir', 'escribir', 'abrir'
    // Exclude irregular verbs like ser, estar, ir
  ];
}
```

### Change Bonus Point Amount

Edit `src/utils/accentUtils.js`:

```javascript
export function validateAnswer(userAnswer, correctAnswers, bonusAmount = 20) {
  // Changed from default 10 to 20
  // ... rest of function
}
```

Or pass custom amount in VerbManager:

```javascript
validateAnswer(prompt, userAnswer) {
  return validateAnswer(userAnswer, prompt.correctAnswers, 15);  // 15 points
}
```

### Add Verb Categories (Future Enhancement)

Structure verbs by theme:

```javascript
const VERB_CATEGORIES = {
  motion: ['ir', 'venir', 'llegar', 'salir'],
  communication: ['hablar', 'decir', 'preguntar'],
  daily: ['comer', 'dormir', 'trabajar', 'estudiar']
};

// Then filter by category in VerbManager
getVerbsForCategory(category) {
  return VERB_CATEGORIES[category] || this.verbList;
}
```

---

## Development Workflow

### Typical Development Cycle

1. **Make changes** to VerbManager, config, or utils
2. **Save files** (Vite hot-reloads automatically)
3. **Test in browser** (refresh if needed)
4. **Check console** for errors or warnings
5. **Iterate** until working as expected
6. **Commit changes** with descriptive message

### Hot Reload Caveats

Vite hot-reload works well, but may require full refresh if:
- Changing config.js constants
- Adding new dependencies
- Modifying class constructors
- Seeing unexpected behavior (try hard refresh: Ctrl+Shift+R)

### Debugging Tips

**Enable verbose logging**:

```javascript
// In VerbManager constructor
this.debug = true;  // Enable debug logs

generatePromptForDifficulty(difficulty) {
  if (this.debug) {
    console.log('[VerbManager] Generating prompt for:', difficulty);
  }
  // ... rest of method
}
```

**Browser DevTools**:
- Console: Check for errors, add console.log statements
- Network: Verify library loaded correctly
- Application → Local Storage: Check if game state persists
- Performance: Profile if experiencing lag

---

## Reference Links

- **spanish-verbs library**: https://github.com/RosaeNLG/rosaenlg
- **Phaser 3 documentation**: https://photonstorm.github.io/phaser3-docs/
- **Vite documentation**: https://vitejs.dev/
- **Spanish verb conjugation reference**: https://www.studyspanish.com/verbs
- **CEFR levels for Spanish**: https://www.cervantes.es/lengua_y_ensenanza/

---

## Getting Help

If you encounter issues not covered here:

1. **Check research.md**: Contains technical decisions and alternatives
2. **Check data-model.md**: Understand entity relationships
3. **Check contracts/VerbManager.md**: API documentation
4. **Review existing code**: MathsManager.js follows same pattern
5. **Check library docs**: spanish-verbs GitHub repository

---

## Next Steps

After completing your changes:

1. **Test manually** using checklist above
2. **Update documentation** if adding major features
3. **Commit changes** with clear message
4. **Consider adding tests** (optional, see Testing Strategy in constitution)

**Ready to implement?** Return to `plan.md` for full implementation plan, or run `/speckit.tasks` to generate detailed task list.
