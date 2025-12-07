# Feature Specification: Spanish Verb Conjugation Practice

**Feature Branch**: `001-spanish-verb-conjugation`  
**Created**: 2025-12-01  
**Status**: Draft  
**Input**: User description: "Convert this app to help with Spanish verb tenses. So instead of maths questions, instead the user is asked to conjugate spanish verbs"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Verb Conjugation Practice (Priority: P1)

A learner wants to practice Spanish verb conjugations in a game format. They select a difficulty level (corresponding to verb tense complexity), and monsters spawn with verb conjugation challenges. The learner types the correct conjugation to activate towers that shoot the monsters, reinforcing their learning through gameplay.

**Why this priority**: This is the MVP - replacing maths problems with verb conjugations is the core transformation. Without this, there is no Spanish learning game.

**Independent Test**: Can be fully tested by starting a game, seeing a verb prompt (e.g., "hablar (yo, present)"), typing the correct conjugation ("hablo"), and observing the tower activate and shoot. This delivers the complete core learning loop.

**Acceptance Scenarios**:

1. **Given** the learner has selected "Beginner" difficulty, **When** a monster spawns with a verb prompt "hablar (yo, present)", **Then** the tower displays the prompt and waits for input
2. **Given** a tower shows "comer (tú, present)", **When** the learner types "comes" and submits, **Then** the tower activates, starts shooting, and displays a new verb challenge
3. **Given** a tower shows "comer (yo, preterite)" requiring "comí", **When** the learner types "comi" (without accent), **Then** the tower activates, and the correct form "comí" is briefly shown as feedback
4. **Given** a tower shows "comer (yo, preterite)", **When** the learner types "comí" (with correct accent), **Then** the tower activates and bonus points are awarded for perfect spelling
5. **Given** multiple towers show different verb prompts, **When** the learner types a correct answer, **Then** only the matching tower(s) activate
6. **Given** a tower is active and shooting, **When** the learner answers its next prompt correctly, **Then** the tower's fire rate increases (progressive mastery reward)
7. **Given** the learner types an incorrect conjugation, **When** they submit, **Then** the input box shakes/flashes and clears, but the game continues without penalty

---

### User Story 2 - Difficulty Progression by Tense Complexity (Priority: P2)

A learner wants to progress through increasingly complex verb tenses as they improve. Easy monsters correspond to present tense, medium monsters to past tenses (preterite/imperfect), and hard monsters to more complex tenses (subjunctive, conditional). The base difficulty selection determines which tenses appear.

**Why this priority**: Provides structured learning progression and replayability. Learners can focus on specific tense groups based on their level.

**Independent Test**: Can be tested by selecting different difficulty levels and verifying that the verb tenses match expectations (e.g., Beginner level shows present tense for easy monsters, preterite for medium, imperfect for hard).

**Acceptance Scenarios**:

1. **Given** the learner selects "Beginner" difficulty, **When** easy monsters spawn, **Then** prompts use present tense conjugations only
2. **Given** the learner selects "Intermediate" difficulty, **When** medium monsters spawn, **Then** prompts use preterite or imperfect tense conjugations
3. **Given** the learner selects "Advanced" difficulty, **When** hard monsters spawn, **Then** prompts use subjunctive or conditional tense conjugations
4. **Given** the game is in progress, **When** a wave ends, **Then** the difficulty tier balance shifts toward harder monsters (more red/orange, fewer green)

---

### User Story 3 - Subject Pronoun Variety (Priority: P3)

A learner wants to practice conjugations across all subject pronouns (yo, tú, él/ella, nosotros, vosotros, ellos/ellas) to ensure comprehensive learning. Each verb prompt specifies both the infinitive and the subject pronoun to practice.

**Why this priority**: Ensures comprehensive conjugation practice beyond just first-person singular. Builds toward complete fluency.

**Independent Test**: Can be tested by observing that prompts include different subject pronouns across multiple rounds (e.g., "hablar (yo)", "hablar (tú)", "hablar (nosotros)") and verifying correct answers for each.

**Acceptance Scenarios**:

1. **Given** a tower displays a prompt, **When** the prompt is generated, **Then** it includes both the infinitive verb and a subject pronoun (e.g., "hablar (tú, present)")
2. **Given** multiple rounds of play, **When** prompts are generated, **Then** different subject pronouns appear across towers (yo, tú, él/ella, nosotros, vosotros, ellos/ellas)
3. **Given** a prompt shows "comer (nosotros, present)", **When** the learner types "comemos", **Then** the answer is accepted as correct
4. **Given** a prompt shows "vivir (ellos, preterite)", **When** the learner types "vivieron", **Then** the answer is accepted as correct

---

### Edge Cases

- What happens when a learner types a conjugation that is correct for a different tense than requested? (e.g., types "comí" when prompt asks for "comer (yo, present)")?
  - System should reject as incorrect since the specific tense was requested
- What happens when accent marks are missing (e.g., "comio" instead of "comió")?
  - System accepts the answer as correct (accessible gameplay) but briefly displays the properly accented form as educational feedback
  - Answers with correct accents receive bonus points to encourage proper spelling habits
- What happens when a verb has multiple valid conjugations (e.g., imperfect subjunctive has two forms: "hablara" or "hablase")?
  - System should accept both valid forms
  - Bonus points apply if the learner includes correct accents on whichever form they choose
- What happens if the learner is unfamiliar with certain verb forms?
  - Game continues without punishment for wrong answers; learning happens through repetition and pattern recognition

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display verb conjugation prompts showing infinitive, subject pronoun, and tense (e.g., "hablar (yo, present)")
- **FR-002**: System MUST validate learner input against correct conjugation for the specific verb, pronoun, and tense
- **FR-002a**: System MUST accept answers both with and without accent marks as correct (accessibility-first approach)
- **FR-002b**: System MUST display the correctly accented form briefly after accepting an answer without accents (educational feedback)
- **FR-002c**: System MUST award bonus points when learner provides conjugations with correct accent marks
- **FR-003**: System MUST accept multiple valid conjugation forms where they exist (e.g., imperfect subjunctive alternatives)
- **FR-004**: System MUST support common Spanish verbs including regular and irregular forms across major tenses
- **FR-005**: System MUST map difficulty levels to verb tense complexity:
  - Easy: Present tense
  - Medium: Preterite and imperfect
  - Hard: Subjunctive, conditional, and compound tenses
- **FR-006**: System MUST include all six subject pronouns (yo, tú, él/ella, nosotros, vosotros, ellos/ellas) in prompt generation
- **FR-007**: System MUST activate towers when correct conjugation is entered, matching existing tower behavior
- **FR-008**: System MUST increase tower fire rate with each correct answer, maintaining progressive reward
- **FR-009**: System MUST provide immediate visual feedback for incorrect answers (shake/flash) without penalizing lives
- **FR-010**: System MUST continue accepting new answers after correct conjugation (tower stays active with new prompt)
- **FR-011**: System MUST display current verb prompt on each tower clearly visible during gameplay
- **FR-012**: System MUST allow learner to select base difficulty level (Beginner/Intermediate/Advanced) at game start
- **FR-013**: System MUST generate conjugation prompts that match the tower's difficulty tier (easy/medium/hard)

### Key Entities

- **Verb Conjugation Prompt**: Represents a challenge presented on a tower, consisting of:
  - Infinitive verb (e.g., "hablar", "comer", "vivir")
  - Subject pronoun (yo, tú, él/ella, nosotros, vosotros, ellos/ellas)
  - Tense (present, preterite, imperfect, subjunctive, conditional, etc.)
  - Correct answer(s) - array to support multiple valid forms
  
- **Verb Data**: Collection of Spanish verbs with conjugation rules or lookup tables, including:
  - Regular verb patterns (-ar, -er, -ir)
  - Irregular verb forms
  - Stem-changing verbs
  - Reflexive verbs

- **Difficulty Tier**: Mapping between game difficulty (easy/medium/hard) and linguistic complexity:
  - Determines which tenses are used
  - Controls verb selection complexity (common vs. advanced vocabulary)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Learners can start practicing Spanish verb conjugations within 30 seconds of launching the game (same as current maths version)
- **SC-002**: The game correctly validates at least 50 common Spanish verbs across all six subject pronouns and major tenses (present, preterite, imperfect)
- **SC-003**: 90% of conjugation prompts display clearly on towers without text overflow or readability issues
- **SC-004**: Learners complete at least 20 successful conjugations per 5-minute gameplay session (similar engagement to maths version)
- **SC-005**: Game accepts all valid conjugation forms for verbs with multiple correct answers (e.g., subjunctive alternatives)
- **SC-006**: The game maintains the same performance and responsiveness as the original maths version (no lag in answer validation)
- **SC-007**: Learners receive immediate visual feedback showing correct accent marks within 0.5 seconds of submitting an answer without accents
- **SC-008**: The bonus point system for correct accents encourages at least 30% of answers to include proper accent marks over time

## Assumptions

1. **Verb data source**: The game will need a verb conjugation data source or library (similar to how it currently uses `maths-game-problem-generator`). We assume either:
   - A Spanish verb conjugation library exists that can be integrated
   - A custom verb conjugation dataset will be created
   
2. **Accent marks**: Spanish conjugations often require accent marks (é, á, í, ó, ú, ñ). The system accepts answers with or without accents but provides educational feedback and bonus points for correct accent usage. This balances accessibility with teaching proper spelling.

3. **Verb selection**: Initially focusing on high-frequency verbs (top 50-100 most common verbs) provides sufficient practice variety without overwhelming content creation.

4. **Tense coverage**: The game will cover major tenses taught in standard Spanish curricula:
   - Present (presente)
   - Preterite (pretérito)
   - Imperfect (imperfecto)
   - Present subjunctive (subjuntivo presente)
   - Conditional (condicional)
   - Future tense can be added if needed

5. **Language**: UI elements (score, lives, instructions) will remain in English initially, with only the verb prompts in Spanish. Full Spanish localization is out of scope for this feature.

6. **Game mechanics preservation**: All existing game mechanics (tower placement, projectile bouncing, wave progression, scoring) remain unchanged. Only the challenge content changes from maths to verbs.
