/**
 * Test suite for accentUtils.js
 * Verifies correctness of accent handling functions
 */

import {
  stripAccents,
  compareIgnoringAccents,
  hasAccents,
  calculateAccentBonus,
  validateAnswer
} from '../src/utils/accentUtils.js';

// ANSI color codes for pretty output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function pass(msg) {
  console.log(`${colors.green}✓ ${msg}${colors.reset}`);
}

function fail(msg) {
  console.log(`${colors.red}✗ ${msg}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(80)}${colors.reset}\n`);
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    pass(message);
  } else {
    failedTests++;
    fail(message);
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

// =============================================================================
// TEST SUITE
// =============================================================================

section('TEST 1: stripAccents()');

assertEqual(stripAccents('comí'), 'comi', 'stripAccents("comí")');
assertEqual(stripAccents('habló'), 'hablo', 'stripAccents("habló")');
assertEqual(stripAccents('español'), 'espanol', 'stripAccents("español")');
assertEqual(stripAccents('niño'), 'nino', 'stripAccents("niño")');
assertEqual(stripAccents('güero'), 'guero', 'stripAccents("güero")');
assertEqual(stripAccents('COMÍ'), 'COMI', 'stripAccents("COMÍ") preserves case');
assertEqual(stripAccents('comi'), 'comi', 'stripAccents("comi") handles no accents');

section('TEST 2: compareIgnoringAccents()');

assertEqual(compareIgnoringAccents('comí', 'comi'), true, 'comí vs comi');
assertEqual(compareIgnoringAccents('comi', 'comí'), true, 'comi vs comí (reversed)');
assertEqual(compareIgnoringAccents('habló', 'hablo'), true, 'habló vs hablo');
assertEqual(compareIgnoringAccents('español', 'espanol'), true, 'español vs espanol');
assertEqual(compareIgnoringAccents('niño', 'nino'), true, 'niño vs nino');
assertEqual(compareIgnoringAccents('Comí', 'comi'), true, 'Comí vs comi (case insensitive)');
assertEqual(compareIgnoringAccents('HABLÓ', 'hablo'), true, 'HABLÓ vs hablo (case insensitive)');
assertEqual(compareIgnoringAccents('comí', 'como'), false, 'comí vs como (different words)');
assertEqual(compareIgnoringAccents('habló', 'habla'), false, 'habló vs habla (different words)');

section('TEST 3: hasAccents()');

assertEqual(hasAccents('comí'), true, 'hasAccents("comí")');
assertEqual(hasAccents('comi'), false, 'hasAccents("comi")');
assertEqual(hasAccents('español'), true, 'hasAccents("español")');
assertEqual(hasAccents('espanol'), false, 'hasAccents("espanol")');
assertEqual(hasAccents('niño'), true, 'hasAccents("niño")');
assertEqual(hasAccents('nino'), false, 'hasAccents("nino")');
assertEqual(hasAccents('güero'), true, 'hasAccents("güero")');
assertEqual(hasAccents('guero'), false, 'hasAccents("guero")');
assertEqual(hasAccents('COMÍ'), true, 'hasAccents("COMÍ") detects uppercase accents');

section('TEST 4: calculateAccentBonus()');

assertEqual(calculateAccentBonus('comí', 'comí'), 10, 'Correct with accents = 10 points');
assertEqual(calculateAccentBonus('comi', 'comí'), 0, 'Correct without accents = 0 points');
assertEqual(calculateAccentBonus('como', 'comí'), 0, 'Incorrect = 0 points');
assertEqual(calculateAccentBonus('habló', 'hablo'), 10, 'habló vs hablo = 10 points');
assertEqual(calculateAccentBonus('español', 'espanol'), 10, 'español vs espanol = 10 points');
assertEqual(calculateAccentBonus('comí', 'comí', 20), 20, 'Custom bonus amount works');

section('TEST 5: validateAnswer()');

const test5_1 = validateAnswer('comí', 'comí');
assertEqual(test5_1.isCorrect, true, 'Perfect match: isCorrect = true');
assertEqual(test5_1.hasAccents, true, 'Perfect match: hasAccents = true');
assertEqual(test5_1.perfectMatch, true, 'Perfect match: perfectMatch = true');
assertEqual(test5_1.bonusPoints, 10, 'Perfect match: bonusPoints = 10');

const test5_2 = validateAnswer('comi', 'comí');
assertEqual(test5_2.isCorrect, true, 'No accents: isCorrect = true');
assertEqual(test5_2.hasAccents, false, 'No accents: hasAccents = false');
assertEqual(test5_2.perfectMatch, false, 'No accents: perfectMatch = false');
assertEqual(test5_2.bonusPoints, 0, 'No accents: bonusPoints = 0');

const test5_3 = validateAnswer('como', 'comí');
assertEqual(test5_3.isCorrect, false, 'Wrong answer: isCorrect = false');
assertEqual(test5_3.hasAccents, false, 'Wrong answer: hasAccents = false');
assertEqual(test5_3.perfectMatch, false, 'Wrong answer: perfectMatch = false');
assertEqual(test5_3.bonusPoints, 0, 'Wrong answer: bonusPoints = 0');

const test5_4 = validateAnswer('Comí', 'comí');
assertEqual(test5_4.isCorrect, true, 'Case insensitive: isCorrect = true');
assertEqual(test5_4.perfectMatch, true, 'Case insensitive: perfectMatch = true');

section('TEST 6: Real Game Scenarios');

// Scenario: User types correct answer without accents
const scenario1 = validateAnswer('hablo', 'habló');
assertEqual(scenario1.isCorrect, true, 'Scenario 1: Answer accepted');
assertEqual(scenario1.bonusPoints, 0, 'Scenario 1: No bonus');
pass('Scenario 1: User gets base points, no bonus');

// Scenario: User types correct answer with accents
const scenario2 = validateAnswer('habló', 'habló');
assertEqual(scenario2.isCorrect, true, 'Scenario 2: Answer accepted');
assertEqual(scenario2.bonusPoints, 10, 'Scenario 2: Bonus awarded');
pass('Scenario 2: User gets base points + bonus');

// Scenario: User types wrong answer
const scenario3 = validateAnswer('habla', 'habló');
assertEqual(scenario3.isCorrect, false, 'Scenario 3: Answer rejected');
assertEqual(scenario3.bonusPoints, 0, 'Scenario 3: No points');
pass('Scenario 3: User gets no points');

// Scenario: Complex word with multiple accents
const scenario4 = validateAnswer('comíamos', 'comiamos');
assertEqual(scenario4.isCorrect, true, 'Scenario 4: Complex word accepted');
assertEqual(scenario4.bonusPoints, 10, 'Scenario 4: Bonus for using accent');
pass('Scenario 4: Complex word with accent works');

section('TEST 7: Edge Cases');

assertEqual(compareIgnoringAccents('', ''), true, 'Empty strings match');
assertEqual(compareIgnoringAccents('   ', '   '), true, 'Whitespace strings match');
assertEqual(stripAccents('áéíóúñü'), 'aeiounu', 'All Spanish accented characters');
assertEqual(hasAccents('áéíóú'), true, 'Multiple accents detected');
assertEqual(hasAccents('aeiou'), false, 'No accents in vowels');
assertEqual(compareIgnoringAccents('año', 'ano'), true, 'ñ treated as n for matching');

section('TEST 8: Performance Check');

console.log('Running 10,000 comparisons...');
const startTime = performance.now();
for (let i = 0; i < 10000; i++) {
  compareIgnoringAccents('comíamos', 'comiamos');
  hasAccents('español');
  stripAccents('niño');
}
const endTime = performance.now();
const duration = endTime - startTime;

console.log(`Time: ${duration.toFixed(2)}ms`);
if (duration < 100) {
  pass(`Performance excellent: ${duration.toFixed(2)}ms < 100ms target`);
} else {
  fail(`Performance issue: ${duration.toFixed(2)}ms >= 100ms target`);
}

// =============================================================================
// SUMMARY
// =============================================================================

section('TEST RESULTS');

console.log(`Total Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

if (failedTests === 0) {
  console.log(`\n${colors.green}${'🎉'.repeat(20)}${colors.reset}`);
  console.log(`${colors.green}ALL TESTS PASSED!${colors.reset}`);
  console.log(`${colors.green}${'🎉'.repeat(20)}${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`\n${colors.red}SOME TESTS FAILED${colors.reset}\n`);
  process.exit(1);
}
