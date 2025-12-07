# Tasks: Spanish Verb Conjugation Practice

**Feature**: 001-spanish-verb-conjugation  
**Input**: Design documents from `/specs/001-spanish-verb-conjugation/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual verification per constitution (pragmatic testing for educational scope).

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialization and dependency management

- [X] T001 [P] Install spanish-verbs dependency in package.json
- [X] T002 [P] Create src/utils/ directory if not exists
- [X] T003 [P] Create src/data/ directory if not exists
- [X] T004 Verify Phaser 3.90.0 and Vite 7.2.5 installed in package.json

**Checkpoint**: Dependencies installed, directory structure ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Accent Handling Utilities

- [X] T005 [P] Create src/utils/accentUtils.js with stripAccents() function
- [X] T006 [P] Add hasAccents() function to src/utils/accentUtils.js
- [X] T007 [P] Add compareIgnoringAccents() function to src/utils/accentUtils.js
- [X] T008 Add validateAnswer() function to src/utils/accentUtils.js (depends on T005-T007)

### Configuration Updates

- [X] T009 [P] Add TENSE_MAPPING constant to src/config.js with easy/medium/hard mappings
- [X] T010 [P] Add PRONOUNS constant array to src/config.js (yo, tú, él, ella, nosotros, vosotros, ellos, ellas)

**Checkpoint**: Foundation ready - accent utilities and config complete, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Verb Conjugation Practice (Priority: P1) 🎯 MVP

**Goal**: Replace maths problems with Spanish verb conjugations. Learners type correct conjugations to activate towers.

**Independent Test**: Start game → see verb prompt (e.g., "hablar (yo, present)") → type correct answer ("hablo") → tower activates and shoots

### Core VerbManager Implementation

- [X] T011 [US1] Create src/systems/VerbManager.js with class skeleton and constructor(baseDifficulty)
- [X] T012 [US1] Add initializeVerbList() method to VerbManager with 20 high-frequency verbs (10 regular, 10 irregular)
- [X] T013 [US1] Add setBaseDifficulty() method to src/systems/VerbManager.js
- [X] T014 [US1] Add getRandomVerb() private method to src/systems/VerbManager.js
- [X] T015 [US1] Add getRandomPronoun() private method to src/systems/VerbManager.js
- [X] T016 [US1] Add getTenseForDifficulty() private method to src/systems/VerbManager.js
- [X] T017 [US1] Add conjugateVerb() private method with spanish-verbs library integration and fallback to src/systems/VerbManager.js
- [X] T018 [US1] Implement generatePromptForDifficulty(difficulty) method in src/systems/VerbManager.js (depends on T014-T017)
- [X] T019 [US1] Implement validateAnswer(prompt, userAnswer) method in src/systems/VerbManager.js using accentUtils

### GameScene Integration

- [X] T020 [US1] Update src/scenes/GameScene.js to import VerbManager instead of MathsManager
- [X] T021 [US1] Initialize VerbManager in GameScene.create() with base difficulty from registry
- [X] T022 [US1] Update Tower prompt generation to use VerbManager.generatePromptForDifficulty() in src/scenes/GameScene.js
- [X] T023 [US1] Update input validation loop to use VerbManager.validateAnswer() in src/scenes/GameScene.js
- [X] T024 [US1] Add accent feedback display logic (show correctForm for 500ms) in src/scenes/GameScene.js
- [X] T025 [US1] Add bonus points calculation to scoring logic in src/scenes/GameScene.js

### Tower Display Updates

- [X] T026 [US1] Update src/entities/Tower.js to store currentPrompt (VerbPrompt object)
- [X] T027 [US1] Update Tower.js to display verb prompt displayText instead of maths expression
- [X] T028 [US1] Add setPrompt(verbPrompt) method to src/entities/Tower.js

### HUD Updates

- [X] T029 [P] [US1] Add accent bonus indicator text to src/ui/HUD.js
- [X] T030 [P] [US1] Add updateBonusDisplay(bonusPoints) method to src/ui/HUD.js

### InputBox Updates

- [X] T031 [US1] Update src/ui/InputBox.js to show accent feedback overlay (correctForm display)
- [X] T032 [US1] Add showAccentFeedback(correctForm, hasAccents) method to src/ui/InputBox.js with 500ms timer

**Checkpoint**: User Story 1 complete and independently testable - full verb conjugation game loop working

**Manual Verification Checklist**:
- [ ] Start game, place tower, see verb prompt displayed
- [ ] Type correct answer without accents → tower activates, feedback shows accented form
- [ ] Type correct answer with accents → bonus points awarded and displayed
- [ ] Type incorrect answer → shake animation, input clears
- [ ] Multiple towers with different prompts → only matching tower activates
- [ ] Active tower gets new prompt after correct answer
- [ ] Fire rate increases with each correct answer

---

## Phase 4: User Story 2 - Difficulty Progression by Tense Complexity (Priority: P2)

**Goal**: Map difficulty tiers to tense complexity - easy=present, medium=preterite/imperfect, hard=subjunctive/conditional/future

**Independent Test**: Select different difficulties and verify tenses match (Beginner → present only, Intermediate → preterite/imperfect, Advanced → subjunctive/conditional/future)

### MenuScene Updates

- [X] T033 [US2] Update src/scenes/MenuScene.js difficulty labels from Reception-Year6 to Beginner/Intermediate/Advanced
- [X] T034 [US2] Update difficulty selector to use TENSE_MAPPING labels from config.js in src/scenes/MenuScene.js
- [X] T035 [US2] Ensure selected difficulty stored in registry as 'baseDifficulty' in src/scenes/MenuScene.js

### VerbManager Tense Logic

- [X] T036 [US2] Update getTenseForDifficulty() in VerbManager to handle easy tier (PRESENT only)
- [X] T037 [US2] Update getTenseForDifficulty() in VerbManager to handle medium tier (PRETERITE, IMPERFECT)
- [X] T038 [US2] Update getTenseForDifficulty() in VerbManager to handle hard tier (SUBJUNCTIVE 50%, CONDITIONAL 25%, FUTURE 25%)

### Prompt Display Updates

- [X] T039 [US2] Add tense display name mapping (PRESENT→'present', PRETERITE→'preterite', etc.) to src/systems/VerbManager.js
- [X] T040 [US2] Update displayText generation to use user-friendly tense names in VerbPrompt

**Checkpoint**: User Story 2 complete - difficulty progression working, tenses match selected tier

**Manual Verification Checklist**:
- [ ] Select Beginner → all prompts show present tense only
- [ ] Select Intermediate → prompts show preterite or imperfect
- [ ] Select Advanced → prompts show subjunctive, conditional, or future
- [ ] Verify tense distribution roughly matches configured percentages (hard tier)
- [ ] All difficulty levels still support accent handling and bonus points

---

## Phase 5: User Story 3 - Subject Pronoun Variety (Priority: P3)

**Goal**: Ensure all 6 pronouns (yo, tú, él/ella, nosotros, vosotros, ellos/ellas) appear in prompts

**Independent Test**: Play multiple rounds and verify different pronouns appear across towers

### Pronoun Coverage

- [X] T041 [US3] Verify PRONOUNS array in config.js includes all 8 forms (yo, tú, él, ella, nosotros, vosotros, ellos, ellas)
- [X] T042 [US3] Update getRandomPronoun() to select from all pronouns with equal probability in src/systems/VerbManager.js
- [X] T043 [US3] Update displayText format to show both infinitive and pronoun (e.g., "hablar (yo, present)") in src/systems/VerbManager.js

### Conjugation Library Integration

- [X] T044 [US3] Ensure conjugateVerb() converts pronoun to uppercase before calling spanish-verbs library in src/systems/VerbManager.js
- [X] T045 [US3] Test all pronouns with irregular verbs (ser, estar, ir) to verify correct conjugations in src/systems/VerbManager.js

### Display Adjustments

- [X] T046 [US3] Verify Tower text display accommodates longer prompts (e.g., "hablar (nosotros, present)") without overflow in src/entities/Tower.js
- [X] T047 [US3] Test prompt display with all pronoun lengths (él vs. nosotros) for readability in src/entities/Tower.js

**Checkpoint**: User Story 3 complete - all pronouns appearing, comprehensive conjugation practice

**Manual Verification Checklist**:
- [ ] Play 20+ rounds, verify all pronouns appear (yo, tú, él, ella, nosotros, vosotros, ellos, ellas)
- [ ] Verify pronoun distribution is roughly equal (no bias toward certain pronouns)
- [ ] Test each pronoun with present tense: yo→hablo, tú→hablas, él→habla, nosotros→hablamos, etc.
- [ ] Test each pronoun with preterite: yo→hablé, tú→hablaste, etc.
- [ ] Verify irregular verbs conjugate correctly for all pronouns (ser: yo→soy, tú→eres, él→es, etc.)
- [ ] Confirm accent handling works for all pronouns (él→comió, nosotros→comimos)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Edge Case Handling

- [X] T048 [P] Add error handling for spanish-verbs library failures in VerbManager.conjugateVerb()
- [X] T049 [P] Add fallback conjugation for regular verbs in VerbManager (pattern-based for -ar, -er, -ir)
- [ ] T050 [P] Add validation for empty/null user input in VerbManager.validateAnswer()

### Multiple Valid Forms Support

- [ ] T051 Handle subjunctive alternatives (hablara/hablase) in VerbManager.generatePromptForDifficulty()
- [ ] T052 Ensure correctAnswers array supports multiple forms in VerbPrompt generation
- [ ] T053 Test validateAnswer() accepts both subjunctive forms with accent bonus

### Performance Optimization (Optional)

- [ ] T054 [P] Add conjugation caching to VerbManager with Map<string, string>
- [ ] T055 [P] Implement cache key format: "${infinitive}-${tense}-${mood}-${pronoun}"
- [ ] T056 [P] Update conjugateVerb() to check cache before calling library

### Documentation

- [ ] T057 [P] Add inline JSDoc comments to VerbManager public methods
- [ ] T058 [P] Update README.md to reference Spanish verb conjugation feature (if README exists)

### Final Verification

- [ ] T059 Run game in Chrome, Firefox, Safari - verify all browsers work
- [ ] T060 Test with 10 different verbs across all tenses and pronouns
- [ ] T061 Verify accent marks display correctly in all browsers
- [ ] T062 Verify game performance (60 fps, <10ms validation)
- [ ] T063 Run through quickstart.md manual verification checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if multiple developers)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable

### Within Each User Story

- VerbManager core methods before GameScene integration
- GameScene updates before UI updates (Tower, HUD, InputBox)
- All implementation before manual verification

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel
- T001, T002, T003 (directory/dependency setup)

**Phase 2 (Foundational)**: Within categories, [P] tasks can run in parallel
- T005, T006, T007 (accent utility functions - independent)
- T009, T010 (config constants - independent)

**User Story 1**: Some tasks can run in parallel
- T029, T030 (HUD updates - independent of other US1 tasks initially)
- Once VerbManager complete, UI updates (Tower, HUD, InputBox) can proceed in parallel

**Phase 6 (Polish)**: Most tasks marked [P] can run in parallel
- T048, T049, T050 (error handling - independent)
- T054, T055, T056 (caching - independent)
- T057, T058 (documentation - independent)

---

## Parallel Example: User Story 1

After completing VerbManager (T011-T019), these can run in parallel:

```bash
# Terminal 1: GameScene integration
# T020-T025

# Terminal 2: Tower updates  
# T026-T028

# Terminal 3: HUD updates
# T029-T030

# Terminal 4: InputBox updates
# T031-T032
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010) - CRITICAL
3. Complete Phase 3: User Story 1 (T011-T032)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**Estimated time**: 1-2 days (per constitution max 2-day scope)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish → Final testing → Release

**Estimated time**: 2-3 days total

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T011-T032)
   - Developer B: User Story 2 (T033-T040) - waits for US1 VerbManager
   - Developer C: User Story 3 (T041-T047) - waits for US1 VerbManager
3. Stories integrate independently

**Note**: US2 and US3 have light dependencies on US1's VerbManager, so true parallelism limited

---

## Task Summary

### Total Tasks by Phase

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 6 tasks (BLOCKS all user stories)
- **Phase 3 (User Story 1 - MVP)**: 22 tasks
- **Phase 4 (User Story 2)**: 8 tasks
- **Phase 5 (User Story 3)**: 7 tasks
- **Phase 6 (Polish)**: 15 tasks

**Total**: 62 tasks

### Tasks by User Story

- **Setup & Foundation**: 10 tasks (prerequisite for all)
- **US1 (Core Conjugation)**: 22 tasks - MVP deliverable
- **US2 (Difficulty Progression)**: 8 tasks - Enhancement
- **US3 (Pronoun Variety)**: 7 tasks - Comprehensive coverage
- **Polish**: 15 tasks - Quality & edge cases

### Parallel Opportunities

- **Phase 1**: 3 tasks can run in parallel (T001-T003)
- **Phase 2**: 4 tasks can run in parallel (T005-T007, T009-T010)
- **Phase 3**: 2 tasks can run in parallel (T029-T030 after VerbManager done)
- **Phase 6**: 9 tasks can run in parallel (most documentation and optimization)

**Total parallelizable**: ~18 tasks (29% of total)

### Independent Test Criteria

**User Story 1 (MVP)**:
- Complete verb conjugation game loop functional
- Accent handling works (accept without, bonus with)
- Tower activation, new prompts, fire rate increase all working

**User Story 2**:
- Difficulty selection changes tenses appropriately
- Easy → present only
- Medium → preterite/imperfect
- Advanced → subjunctive/conditional/future

**User Story 3**:
- All 6 pronouns appear in gameplay
- Each pronoun conjugates correctly for all tenses
- No pronoun bias in random selection

---

## Suggested MVP Scope

**Minimum Viable Product**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)

This delivers:
- ✅ Core verb conjugation practice
- ✅ Accent handling with bonus points
- ✅ Tower defense game loop preserved
- ✅ Educational feedback (show correct accented form)
- ✅ Present, preterite, imperfect tenses functional
- ✅ All pronouns included (via foundational PRONOUNS setup)

**Can be delivered in**: 1-2 days (per constitution)

**Delivers value**: Complete learning game with verb conjugation replacing maths

**Can be demoed**: Immediately after Phase 3 completion

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests (per constitution - manual verification only)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`  
✅ Sequential task IDs (T001-T063)  
✅ Clear file paths in descriptions  
✅ User story labels present for US1, US2, US3 tasks  
✅ Parallel markers [P] where appropriate  
✅ Independent test criteria defined for each story  
✅ MVP scope clearly identified (User Story 1)

**Tasks ready for execution!** 🚀
