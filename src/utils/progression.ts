import {
  AchievementDef,
  BiologyModule,
  ModuleCompletion,
  RewardItem,
  StudentProgress,
  TaskResult,
} from '../types/biology';

export function createInitialProgress(): StudentProgress {
  return {
    xp: 0,
    bioCoins: 25,
    streakDays: 1,
    watchedModuleIds: [],
    completedModules: {},
    customVideoUrls: {},
    unlockedRewards: [],
    equippedRewardId: null,
    unlockedAchievements: [],
  };
}

export function extractYouTubeId(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live')) {
        const id = parts[1];
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const LEVEL_TITLES = [
  'Aprendiz de Bancada',
  'Detetive Evolutivo',
  'Botânico de Luz',
  'Paleontólogo Júnior',
  'Explorador Zoológico',
  'Cientista GGLAB',
];

export function calculateLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  const xpPerLevel = 200;
  const level = Math.floor(safeXp / xpPerLevel) + 1;
  const currentLevelXp = safeXp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
  const titleIndex = Math.min(LEVEL_TITLES.length - 1, level - 1);

  return {
    level,
    title: LEVEL_TITLES[titleIndex],
    currentLevelXp,
    nextLevelXp: xpPerLevel,
    progressPercent,
  };
}

export function isModuleUnlocked(
  moduleOrder: number,
  modules: BiologyModule[],
  completedModules: Record<string, ModuleCompletion>
): boolean {
  if (moduleOrder <= 1) return true;
  const prevModule = modules.find((m) => m.order === moduleOrder - 1);
  if (!prevModule) return true;
  return Boolean(completedModules[prevModule.id]);
}

export function calculateTaskReward(
  stars: 1 | 2 | 3,
  baseXp: number,
  baseCoins: number,
  isFirstCompletion: boolean
): { earnedXp: number; earnedCoins: number } {
  const starMultiplier = stars === 3 ? 1.3 : stars === 2 ? 1.0 : 0.75;
  const replayFactor = isFirstCompletion ? 1 : 0.35;

  const earnedXp = Math.max(15, Math.round(baseXp * starMultiplier * replayFactor));
  const earnedCoins = Math.max(5, Math.round(baseCoins * starMultiplier * replayFactor));
  return { earnedXp, earnedCoins };
}

export function markVideoWatched(progress: StudentProgress, moduleId: string): StudentProgress {
  if (progress.watchedModuleIds.includes(moduleId)) {
    return progress;
  }
  return {
    ...progress,
    xp: progress.xp + 20,
    bioCoins: progress.bioCoins + 5,
    watchedModuleIds: [...progress.watchedModuleIds, moduleId],
  };
}

export function applyTaskCompletion(
  progress: StudentProgress,
  mod: BiologyModule,
  result: TaskResult,
  achievements: AchievementDef[],
  totalModules: number
): {
  nextProgress: StudentProgress;
  earnedXp: number;
  earnedCoins: number;
  newlyUnlockedAchievements: AchievementDef[];
} {
  const existing = progress.completedModules[mod.id];
  const isFirstCompletion = !existing;
  const { earnedXp, earnedCoins } = calculateTaskReward(
    result.stars,
    mod.baseXp,
    mod.baseCoins,
    isFirstCompletion
  );

  const updatedCompletion: ModuleCompletion = {
    moduleId: mod.id,
    stars: existing ? (Math.max(existing.stars, result.stars) as 1 | 2 | 3) : result.stars,
    bestScore: existing ? Math.max(existing.bestScore, result.score) : result.score,
    attempts: (existing?.attempts ?? 0) + 1,
    completedAt: new Date().toISOString(),
  };

  const watchedSet = progress.watchedModuleIds.includes(mod.id)
    ? progress.watchedModuleIds
    : [...progress.watchedModuleIds, mod.id];

  let draft: StudentProgress = {
    ...progress,
    xp: progress.xp + earnedXp,
    bioCoins: progress.bioCoins + earnedCoins,
    watchedModuleIds: watchedSet,
    completedModules: {
      ...progress.completedModules,
      [mod.id]: updatedCompletion,
    },
  };

  const newlyUnlockedAchievements = evaluateNewAchievements(draft, achievements, totalModules);
  if (newlyUnlockedAchievements.length > 0) {
    const bonusCoins = newlyUnlockedAchievements.reduce((sum, a) => sum + a.rewardCoins, 0);
    draft = {
      ...draft,
      bioCoins: draft.bioCoins + bonusCoins,
      unlockedAchievements: [
        ...draft.unlockedAchievements,
        ...newlyUnlockedAchievements.map((a) => a.id),
      ],
    };
  }

  return {
    nextProgress: draft,
    earnedXp,
    earnedCoins,
    newlyUnlockedAchievements,
  };
}

export function evaluateNewAchievements(
  progress: StudentProgress,
  achievements: AchievementDef[],
  totalModules: number
): AchievementDef[] {
  const completedList = Object.values(progress.completedModules);
  const completedCount = completedList.length;

  const isMet = (id: string): boolean => {
    switch (id) {
      case 'ach-first-step':
        return Boolean(progress.completedModules['modulo-vestigiais']) || completedCount >= 1;
      case 'ach-botany-light':
        return (progress.completedModules['modulo-clorofila']?.stars ?? 0) >= 2;
      case 'ach-three-stars':
        return completedList.some((c) => c.stars === 3);
      case 'ach-chameleon-pro':
        return Boolean(progress.completedModules['modulo-camaleoes']);
      case 'ach-all-modules':
        return completedCount >= totalModules;
      default:
        return false;
    }
  };

  return achievements.filter(
    (ach) => !progress.unlockedAchievements.includes(ach.id) && isMet(ach.id)
  );
}

export function purchaseRewardItem(
  progress: StudentProgress,
  item: RewardItem
): { ok: boolean; reason?: string; nextProgress: StudentProgress } {
  if (progress.unlockedRewards.includes(item.id)) {
    return {
      ok: true,
      nextProgress: {
        ...progress,
        equippedRewardId: item.id,
      },
    };
  }

  if (progress.bioCoins < item.cost) {
    return {
      ok: false,
      reason: `Faltam ${item.cost - progress.bioCoins} BioCoins para desbloquear.`,
      nextProgress: progress,
    };
  }

  return {
    ok: true,
    nextProgress: {
      ...progress,
      bioCoins: progress.bioCoins - item.cost,
      unlockedRewards: [...progress.unlockedRewards, item.id],
      equippedRewardId: item.id,
    },
  };
}
