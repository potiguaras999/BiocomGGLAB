import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateVestigialPoints,
  CHAMELEON_SCENARIOS,
  CHAMELEON_STATES,
  createChlorophyllPhase1Bag,
  createChlorophyllPhase2Bag,
  evaluateChlorophyllAction,
  evaluateStrataDig,
  FOSSILIZATION_STEPS,
  hasPhotonReachedChloroplast,
  HOMOLOGY_QUESTIONS,
  prepareFossilizationSteps,
  prepareStrataFossils,
  prepareVestigialCases,
  scoreToStars,
  STRATA_FOSSILS,
  VESTIGIAL_CASES,
} from './gameLogic';

test('all vestigial cases contain a valid correctOptionId, vary order, and score with time/streak', () => {
  assert.equal(VESTIGIAL_CASES.length, 3);
  const indices = VESTIGIAL_CASES.map((item) =>
    item.options.findIndex((opt) => opt.id === item.correctOptionId)
  );
  assert.ok(indices.every((idx) => idx >= 0));
  assert.ok(new Set(indices).size > 1);

  const prepared = prepareVestigialCases();
  assert.equal(prepared.length, 3);
  for (const item of prepared) {
    assert.equal(item.options.length, 3);
    assert.ok(item.options.some((opt) => opt.id === item.correctOptionId));
  }

  assert.equal(calculateVestigialPoints(25, 1), 200);
  assert.equal(calculateVestigialPoints(10, 3), 190);
  assert.equal(calculateVestigialPoints(0, 1), 100);
});

test('chlorophyll game rules use +1 absorb, 0 reflect, -1 error, and exact 2:1 / 3:1 bags', () => {
  assert.equal(hasPhotonReachedChloroplast(60, 20, 260), false);
  assert.equal(hasPhotonReachedChloroplast(239, 20, 260), false);
  assert.equal(hasPhotonReachedChloroplast(240, 20, 260), true);

  const blueAbsorb = evaluateChlorophyllAction('blue', 'absorb');
  const redAbsorb = evaluateChlorophyllAction('red', 'absorb');
  const violetAbsorb = evaluateChlorophyllAction('violet', 'absorb');
  const greenReflect = evaluateChlorophyllAction('green', 'reflect');
  assert.equal(blueAbsorb.correct, true);
  assert.equal(blueAbsorb.points, 1);
  assert.equal(redAbsorb.correct, true);
  assert.equal(redAbsorb.points, 1);
  assert.equal(violetAbsorb.correct, true);
  assert.equal(violetAbsorb.points, 1);
  assert.equal(greenReflect.correct, true);
  assert.equal(greenReflect.points, 0);

  const wrongGreen = evaluateChlorophyllAction('green', 'absorb');
  const wrongRed = evaluateChlorophyllAction('red', 'reflect');
  assert.equal(wrongGreen.correct, false);
  assert.equal(wrongGreen.points, -1);
  assert.equal(wrongRed.correct, false);
  assert.equal(wrongRed.points, -1);

  const bag1 = createChlorophyllPhase1Bag();
  assert.equal(bag1.length, 3);
  assert.equal(bag1.filter((c) => c === 'green').length, 2);
  assert.equal(bag1.filter((c) => c !== 'green').length, 1);

  const bag2 = createChlorophyllPhase2Bag();
  assert.equal(bag2.length, 4);
  assert.equal(bag2.filter((c) => c === 'green').length, 1);
  assert.equal(bag2.filter((c) => c !== 'green').length, 3);
});

test('fossilization steps are sequentially ordered 1..4 and strata layers 1..3 exist', () => {
  assert.deepEqual(
    FOSSILIZATION_STEPS.map((s) => s.order),
    [1, 2, 3, 4]
  );
  assert.deepEqual(
    STRATA_FOSSILS.map((f) => f.correctLayer).sort(),
    [1, 2, 3]
  );

  assert.equal(prepareFossilizationSteps().length, 4);
  assert.equal(prepareStrataFossils().length, 3);

  const deepFossil = STRATA_FOSSILS.find((f) => f.correctLayer === 3)!;
  assert.equal(evaluateStrataDig(deepFossil, 3).correct, true);
  const shallowMiss = evaluateStrataDig(deepFossil, 1);
  assert.equal(shallowMiss.correct, false);
  assert.ok(shallowMiss.message.includes('mais profunda'));
});

test('chameleon scenarios map to valid chameleon states and homology items are populated', () => {
  const validStates = new Set(CHAMELEON_STATES.map((s) => s.id));
  for (const sc of CHAMELEON_SCENARIOS) {
    assert.ok(validStates.has(sc.targetState));
  }
  assert.equal(HOMOLOGY_QUESTIONS.length, 4);
  for (const q of HOMOLOGY_QUESTIONS) {
    assert.ok(q.explanation.length > 0);
    assert.ok(q.wrongExplanation.length > 0);
    assert.notEqual(q.explanation, q.wrongExplanation);
  }
  assert.equal(scoreToStars(90), 3);
  assert.equal(scoreToStars(70), 2);
  assert.equal(scoreToStars(40), 1);
});
