import test from 'node:test';
import assert from 'node:assert/strict';
import { ACHIEVEMENTS, BIOLOGY_MODULES, REWARD_ITEMS } from '../data/curriculum';
import {
  applyTaskCompletion,
  calculateLevelInfo,
  calculateTaskReward,
  createInitialProgress,
  extractYouTubeId,
  isModuleUnlocked,
  markVideoWatched,
  purchaseRewardItem,
} from './progression';

test('extractYouTubeId parses all 5 official GGLAB YouTube Shorts links', () => {
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/LQcTGLUF9zc'), 'LQcTGLUF9zc');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/JuSyAFu-tGs'), 'JuSyAFu-tGs');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/Y9bXMlhQ_eM'), 'Y9bXMlhQ_eM');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/OukPwmUtlxs'), 'OukPwmUtlxs');
  assert.equal(extractYouTubeId('https://www.youtube.com/shorts/jX2os4FQy44'), 'jX2os4FQy44');
  assert.equal(extractYouTubeId('https://youtu.be/LQcTGLUF9zc?si=abc'), 'LQcTGLUF9zc');
  assert.equal(extractYouTubeId('https://example.com/video'), null);
});

test('calculateLevelInfo computes level progression cleanly', () => {
  const lvl1 = calculateLevelInfo(0);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.progressPercent, 0);

  const lvl2 = calculateLevelInfo(250);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.currentLevelXp, 50);
  assert.equal(lvl2.progressPercent, 25);
});

test('module unlock follows sequential 5-module journey order', () => {
  const initial = createInitialProgress();
  assert.equal(BIOLOGY_MODULES.length, 5);
  assert.equal(isModuleUnlocked(1, BIOLOGY_MODULES, initial.completedModules), true);
  assert.equal(isModuleUnlocked(2, BIOLOGY_MODULES, initial.completedModules), false);

  const afterMod1 = applyTaskCompletion(
    initial,
    BIOLOGY_MODULES[0],
    { stars: 3, score: 650, accuracyPercent: 100, summaryLabel: 'Perfeito' },
    ACHIEVEMENTS,
    BIOLOGY_MODULES.length
  ).nextProgress;

  assert.equal(isModuleUnlocked(2, BIOLOGY_MODULES, afterMod1.completedModules), true);
  assert.equal(isModuleUnlocked(3, BIOLOGY_MODULES, afterMod1.completedModules), false);
});

test('markVideoWatched grants XP and coins only once per module', () => {
  const p0 = createInitialProgress();
  const p1 = markVideoWatched(p0, 'modulo-vestigiais');
  assert.equal(p1.xp, 20);
  assert.equal(p1.bioCoins, 30);

  const p2 = markVideoWatched(p1, 'modulo-vestigiais');
  assert.equal(p2.xp, 20);
  assert.equal(p2.bioCoins, 30);
});

test('applyTaskCompletion awards stars, unlocks achievements, and caps replay rewards', () => {
  const p0 = createInitialProgress();
  const first = applyTaskCompletion(
    p0,
    BIOLOGY_MODULES[0],
    { stars: 3, score: 900, accuracyPercent: 95, summaryLabel: 'Excelente' },
    ACHIEVEMENTS,
    BIOLOGY_MODULES.length
  );

  const expectedFirst = calculateTaskReward(3, BIOLOGY_MODULES[0].baseXp, BIOLOGY_MODULES[0].baseCoins, true);
  assert.equal(first.earnedXp, expectedFirst.earnedXp);
  assert.equal(first.earnedCoins, expectedFirst.earnedCoins);
  assert.ok(first.newlyUnlockedAchievements.some((a) => a.id === 'ach-first-step'));
  assert.ok(first.newlyUnlockedAchievements.some((a) => a.id === 'ach-three-stars'));

  const replay = applyTaskCompletion(
    first.nextProgress,
    BIOLOGY_MODULES[0],
    { stars: 2, score: 950, accuracyPercent: 85, summaryLabel: 'Bom' },
    ACHIEVEMENTS,
    BIOLOGY_MODULES.length
  );
  assert.equal(replay.nextProgress.completedModules[BIOLOGY_MODULES[0].id].stars, 3);
  assert.equal(replay.nextProgress.completedModules[BIOLOGY_MODULES[0].id].bestScore, 950);
  assert.equal(replay.nextProgress.completedModules[BIOLOGY_MODULES[0].id].attempts, 2);
});

test('purchaseRewardItem validates BioCoins balance and equips unlocked item', () => {
  const p0 = createInitialProgress();
  const cheapItem = REWARD_ITEMS[0];
  const fail = purchaseRewardItem(p0, cheapItem);
  assert.equal(fail.ok, false);
  assert.equal(fail.nextProgress.bioCoins, 25);

  const rich = { ...p0, bioCoins: 100 };
  const success = purchaseRewardItem(rich, cheapItem);
  assert.equal(success.ok, true);
  assert.equal(success.nextProgress.bioCoins, 60);
  assert.equal(success.nextProgress.equippedRewardId, cheapItem.id);
});
