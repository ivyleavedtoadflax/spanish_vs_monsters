# Data Model: Spanish Verb Conjugation Practice

**Feature**: 001-spanish-verb-conjugation  
**Date**: 2025-12-01  
**Prerequisites**: research.md

## Overview

This document defines the data structures and relationships for the Spanish verb conjugation system. The model supports three user stories (P1: Core conjugation, P2: Difficulty progression, P3: Pronoun variety) while maintaining compatibility with the existing tower defense game architecture.

---

## Core Entities

### 1. VerbPrompt

Represents a single conjugation challenge presented on a tower.

```javascript
{
  // Core identification
  infinitive: string,           // Verb infinitive form (e.g., "hablar")
  pronoun: string,              // Subject pronoun (e.g., "yo")
  tense: string,                // Game-friendly tense name (e.g., "present")
  
  // Library integration
  tenseFormal: string,          // Library tense enum (e.g., "PRESENT")
  mood: string,                 // Verb mood (e.g., "INDICATIVE", "SUBJUNCTIVE")
  
  // Validation
  correctAnswers: string[],     // Array of valid forms (e.g., ["hablo"])
                                // Array supports subjunctive alternatives (hablara/hablase)
  
  // Game integration
  difficulty: string,           // Tower difficulty tier ('easy'|'medium'|'hard')
  displayText: string,          // Formatted for UI (e.g., "hablar (yo, present)")
  
  // Metadata (optional)
  verbType: string,             // 'regular-ar' | 'regular-er' | 'regular-ir' | 'irregular'
  isIrregular: boolean          // Quick check for irregular verbs
}
```

**Validation Rules**:
- `infinitive`: Non-empty string, must exist in verb database
- `pronoun`: Must be one of ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas']
- `tense`: Must be valid tense name from TENSE_MAPPING
- `correctAnswers`: Non-empty array, minimum 1 valid form
- `difficulty`: Must be 'easy', 'medium', or 'hard'

**Relationships**:
- One-to-one with Tower (each tower has exactly one current VerbPrompt)
- Many-to-one with VerbData (multiple prompts can reference same verb)
- Tied to difficulty tier via TENSE_MAPPING

**State Transitions**:
```
[Tower created] → [Initial VerbPrompt generated]
[Correct answer] → [New VerbPrompt generated] → [Tower fire rate increases]
[Incorrect answer] → [VerbPrompt unchanged] → [Visual feedback only]
```

---

### 2. ValidationResult

Returned by VerbManager when validating user input against a VerbPrompt.

```javascript
{
  // Core result
  isCorrect: boolean,           // True if answer matches (accent-insensitive)
  
  // Accent handling (FR-002a, FR-002b, FR-002c)
  hasAccents: boolean,          // True if user input contains accent marks
  correctForm: string,          // Properly accented form for feedback display
  
  // Scoring (FR-002c)
  bonusPoints: number,          // Points awarded for correct accent usage (0 or positive)
  
  // Metadata (optional)
  normalizedInput: string,      // User input after normalization (for debugging)
  matchedAnswer: string         // Which correctAnswers[] element matched (if any)
}
```

**Validation Logic**:
1. Normalize user input (lowercase, trim, optionally strip accents)
2. Compare against all `correctAnswers[]` (accent-insensitive)
3. If match found:
   - Set `isCorrect = true`
   - Check if user input has accents AND matches exactly
   - Award `bonusPoints` if perfect match with accents
4. Always return `correctForm` (first valid answer with accents)

**Business Rules**:
- `isCorrect = false` → User sees shake/flash, no points, no tower activation
- `isCorrect = true, bonusPoints = 0` → Tower activates, base points awarded, feedback shows correct accented form
- `isCorrect = true, bonusPoints > 0` → Tower activates, base + bonus points, special visual indicator

---

### 3. VerbData (Virtual Entity)

Not stored as single object, but conceptually represents the verb conjugation database. Backed by `spanish-verbs` library.

**Logical Structure**:
```javascript
{
  infinitive: string,           // "hablar", "comer", "vivir"
  type: string,                 // "regular-ar" | "regular-er" | "regular-ir" | "irregular"
  
  // Conjugations accessible via library
  conjugations: {
    [mood]: {                   // 'INDICATIVE', 'SUBJUNCTIVE', 'CONDITIONAL'
      [tense]: {                // 'PRESENT', 'PRETERITE', 'IMPERFECT', etc.
        [pronoun]: string       // 'yo': 'hablo', 'tú': 'hablas', etc.
      }
    }
  }
}
```

**Access Pattern**:
```javascript
import { getConjugation } from 'spanish-verbs';

const conjugation = getConjugation(
  infinitive,  // 'hablar'
  tense,       // 'PRESENT'
  mood,        // 'INDICATIVE'
  pronoun      // 'YO'
);
// Returns: 'hablo'
```

**Verb Selection**:
- **MVP**: 20 high-frequency verbs (10 regular, 10 irregular)
- **Phase 2**: 50 common verbs
- **Future**: 100+ comprehensive coverage

**High-Priority Verbs** (for MVP):

| Infinitive | Type | Reason |
|------------|------|--------|
| ser | irregular | Most common, essential |
| estar | irregular | State/location, essential |
| tener | irregular | Have/possession, high frequency |
| hacer | irregular | Do/make, high frequency |
| ir | irregular | Go, high frequency |
| poder | irregular | Can/ability, common |
| decir | irregular | Say/tell, common |
| ver | irregular | See, common |
| dar | irregular | Give, common |
| saber | irregular | Know, common |
| hablar | regular-ar | Speak, most common -ar verb |
| trabajar | regular-ar | Work, common |
| estudiar | regular-ar | Study, educational context |
| comer | regular-er | Eat, most common -er verb |
| beber | regular-er | Drink, common |
| leer | regular-er | Read, educational context |
| vivir | regular-ir | Live, most common -ir verb |
| escribir | regular-ir | Write, educational context |
| abrir | regular-ir | Open, common |
| recibir | regular-ir | Receive, common |

---

### 4. DifficultyTierMapping

Configuration object mapping game difficulty to linguistic complexity.

```javascript
const TENSE_MAPPING = {
  easy: {
    tenses: ['PRESENT'],
    moods: ['INDICATIVE'],
    label: 'Beginner',
    cefr: 'A1-A2',
    description: 'Present tense (regular and irregular verbs)'
  },
  
  medium: {
    tenses: ['PRETERITE', 'IMPERFECT'],
    moods: ['INDICATIVE'],
    label: 'Intermediate',
    cefr: 'B1',
    description: 'Preterite and Imperfect (past tenses)'
  },
  
  hard: {
    // Subjunctive mood
    tenses: ['PRESENT', 'IMPERFECT'],
    moods: ['SUBJUNCTIVE'],
    // Plus conditional and future indicative
    additionalTenses: [
      { tense: 'CONDITIONAL', mood: 'INDICATIVE' },
      { tense: 'FUTURE', mood: 'INDICATIVE' }
    ],
    label: 'Advanced',
    cefr: 'B2-C1',
    description: 'Subjunctive, Conditional, and Future tenses'
  }
};
```

**Usage**:
- MenuScene: Display `label` in difficulty selector (Beginner/Intermediate/Advanced)
- VerbManager: Use `tenses` and `moods` to filter available conjugations
- HUD: Show current difficulty tier label

**Difficulty Selection Logic**:
```javascript
function getTenseForDifficulty(difficulty) {
  const config = TENSE_MAPPING[difficulty];
  
  // For easy/medium: randomly select from tenses array
  if (difficulty === 'easy' || difficulty === 'medium') {
    const randomTense = config.tenses[Math.floor(Math.random() * config.tenses.length)];
    return { tense: randomTense, mood: config.moods[0] };
  }
  
  // For hard: 50% subjunctive, 25% conditional, 25% future
  if (difficulty === 'hard') {
    const rand = Math.random();
    if (rand < 0.5) {
      // Subjunctive
      const randomTense = config.tenses[Math.floor(Math.random() * config.tenses.length)];
      return { tense: randomTense, mood: 'SUBJUNCTIVE' };
    } else if (rand < 0.75) {
      // Conditional
      return { tense: 'CONDITIONAL', mood: 'INDICATIVE' };
    } else {
      // Future
      return { tense: 'FUTURE', mood: 'INDICATIVE' };
    }
  }
}
```

---

## Relationships & Data Flow

### Prompt Generation Flow

```
[User starts game]
    ↓
[MenuScene: Select base difficulty (Beginner/Intermediate/Advanced)]
    ↓
[GameScene: Initialize VerbManager with base difficulty]
    ↓
[Tower created with difficulty tier (easy/medium/hard)]
    ↓
[VerbManager.generatePromptForDifficulty(tier)]
    ↓
[Select random verb from database]
    ↓
[Select random pronoun from ['yo', 'tú', 'él', ...]]
    ↓
[Get tense/mood from TENSE_MAPPING[tier]]
    ↓
[Call spanish-verbs library: getConjugation()]
    ↓
[Build VerbPrompt object]
    ↓
[Return to Tower for display]
```

### Answer Validation Flow

```
[User types answer in InputBox]
    ↓
[User presses Enter]
    ↓
[GameScene receives input]
    ↓
[Loop through all towers with active prompts]
    ↓
[VerbManager.validateAnswer(prompt, userInput)]
    ↓
[accentUtils.validateAnswer() performs comparison]
    ↓
[Return ValidationResult]
    ↓
[If isCorrect = true]
    ├─→ [Activate tower]
    ├─→ [Add base points + bonusPoints]
    ├─→ [Show correctForm feedback (0.5s)]
    ├─→ [Generate new VerbPrompt]
    └─→ [Increase fire rate]
[If isCorrect = false]
    ├─→ [Shake InputBox]
    └─→ [Clear input]
```

---

## State Management

### VerbManager State

```javascript
class VerbManager {
  // Configuration state
  baseDifficulty: string;         // 'Beginner' | 'Intermediate' | 'Advanced'
  
  // Verb database (can be lazy-loaded)
  verbList: string[];             // Array of infinitives ['hablar', 'comer', ...]
  
  // Optional: Cache for performance
  conjugationCache: Map<string, string>;  // Key: 'hablar-PRESENT-INDICATIVE-YO', Value: 'hablo'
  
  // Constants
  PRONOUNS: string[];             // ['yo', 'tú', 'él', ...]
  TENSE_MAPPING: object;          // Difficulty → tenses configuration
}
```

**Cache Strategy** (optional optimization):
- First call: Fetch from `spanish-verbs` library, store in cache
- Subsequent calls: Return from cache
- Cache key format: `${infinitive}-${tense}-${mood}-${pronoun}`
- Benefits: Reduces library calls, improves performance
- Tradeoff: Memory usage (~5 KB for 100 verbs × 6 tenses × 6 pronouns = 3600 entries)

### Tower-Prompt Binding

Each Tower stores its current VerbPrompt:

```javascript
class Tower extends Phaser.Physics.Arcade.Sprite {
  // Existing properties...
  
  // NEW: Verb conjugation prompt
  currentPrompt: VerbPrompt;      // Current challenge
  
  // Display
  problemText: Phaser.GameObjects.Text;  // Rename from "problem" to make sense for verbs
}
```

**Lifecycle**:
1. Tower created → `currentPrompt` = null
2. Tower placed → Generate initial VerbPrompt
3. Correct answer → Generate new VerbPrompt, increase fire rate
4. Tower removed → Clear reference

---

## Validation Rules Summary

### Input Validation (User Answer)

| Rule | Check | Error Handling |
|------|-------|----------------|
| Empty input | `input.trim().length === 0` | Return `isCorrect: false` |
| Only whitespace | After trim, check length | Return `isCorrect: false` |
| Special characters | Allow accents, letters only | Strip numbers/symbols before comparison |
| Case sensitivity | Convert to lowercase | Case-insensitive match |
| Accent marks | Strip for comparison | Compare normalized strings |

### Prompt Validation (Generation)

| Rule | Check | Error Handling |
|------|-------|----------------|
| Verb exists | Check against `verbList` | Fallback to default verb ('hablar') |
| Tense valid | Check TENSE_MAPPING | Throw error (should never happen) |
| Pronoun valid | Check PRONOUNS array | Throw error (should never happen) |
| Library failure | Catch getConjugation() error | Fallback to regular conjugation pattern |

---

## Edge Cases & Multiple Valid Forms

### Subjunctive Alternatives

Spanish imperfect subjunctive has two valid forms:

```javascript
{
  infinitive: "hablar",
  pronoun: "yo",
  tense: "imperfect",
  mood: "SUBJUNCTIVE",
  correctAnswers: ["hablara", "hablase"],  // Both valid!
  ...
}
```

**Validation**: Accept either form, award bonus if user includes accents on their chosen form.

### Reflexive Verbs (Future Enhancement)

Not in MVP, but data model supports:

```javascript
{
  infinitive: "lavarse",  // "to wash oneself"
  pronoun: "yo",
  correctAnswers: ["me lavo"],  // Includes reflexive pronoun
  isReflexive: true
}
```

### Voseo (Regional Variants)

`spanish-verbs` library supports voseo (vos instead of tú), but we'll standardize on Castilian Spanish for simplicity:
- Use 'tú' (not 'vos')
- Use 'vosotros' (not 'ustedes' for plural)

---

## Performance Considerations

### Memory Footprint

**Estimated memory usage**:
- `spanish-verbs` library: ~152 KB
- VerbPrompt objects: ~200 bytes each
- ValidationResult objects: ~150 bytes each
- Cache (if enabled): ~5 KB for 3600 entries

**Total**: <200 KB additional memory (negligible for modern browsers)

### Computation Complexity

| Operation | Complexity | Performance |
|-----------|------------|-------------|
| Generate prompt | O(1) | <1ms |
| Validate answer | O(n) where n = correctAnswers length | <1ms (n typically 1-2) |
| Strip accents | O(m) where m = string length | <0.001ms |
| Library conjugation | O(1) with cache | <1ms |

**Bottleneck**: None identified. All operations well within <100ms requirement.

---

## Testing Strategy

### Unit Test Coverage (Optional)

If implementing Vitest tests:

1. **VerbManager**:
   - `generatePromptForDifficulty()` returns valid VerbPrompt
   - `validateAnswer()` handles correct/incorrect answers
   - Accent bonus calculated correctly
   - Multiple valid forms accepted

2. **accentUtils**:
   - `stripAccents()` removes all Spanish accents
   - `compareIgnoringAccents()` matches accent variants
   - `hasAccents()` detects accents correctly
   - `validateAnswer()` returns correct ValidationResult

3. **Edge Cases**:
   - Empty input
   - Only whitespace
   - Multiple valid subjunctive forms
   - Irregular verbs
   - All 6 pronouns

### Manual Verification (Mandatory per Constitution)

**Test Plan**:
1. Start game, select Beginner
2. Verify tower shows present tense prompt
3. Type correct answer without accents → Tower activates, feedback shows accented form
4. Type correct answer with accents → Bonus points awarded
5. Type incorrect answer → Shake animation, no activation
6. Repeat for Intermediate (preterite/imperfect) and Advanced (subjunctive/conditional)

---

## Future Enhancements (Out of Scope for MVP)

### Potential Data Model Extensions

1. **Verb Categories**:
   ```javascript
   {
     category: 'motion' | 'communication' | 'daily_activities',
     tags: ['irregular', 'stem-changing', 'reflexive']
   }
   ```

2. **Learning Analytics**:
   ```javascript
   {
     attempts: number,
     correctCount: number,
     lastAttempted: timestamp,
     averageTime: number
   }
   ```

3. **Compound Tenses**:
   ```javascript
   {
     tense: "present_perfect",
     correctAnswers: ["he hablado"],  // Auxiliary + past participle
     requiresAuxiliary: true
   }
   ```

4. **Progressive Forms**:
   ```javascript
   {
     tense: "present_progressive",
     correctAnswers: ["estoy hablando"],
     requiresGerund: true
   }
   ```

**Decision**: Defer until core MVP stable and user feedback gathered.

---

## Summary

### Key Data Structures

1. **VerbPrompt**: Challenge presented to user (infinitive, pronoun, tense → correctAnswers)
2. **ValidationResult**: Validation outcome (isCorrect, hasAccents, bonusPoints)
3. **VerbData**: Virtual entity backed by `spanish-verbs` library
4. **DifficultyTierMapping**: Configuration linking game difficulty to linguistic complexity

### Core Relationships

- Tower ↔ VerbPrompt (one-to-one)
- VerbPrompt ↔ VerbData (many-to-one)
- Difficulty ↔ Tenses (one-to-many)

### Validation Guarantees

- Accent-insensitive comparison (accessibility)
- Correct accented form always returned (educational feedback)
- Bonus points for perfect accent usage (encouragement)
- Multiple valid forms supported (subjunctive alternatives)

**Next**: Generate API contracts for VerbManager methods.
