export type AppTab = 'trilha' | 'games' | 'recompensas' | 'progresso';

export type TaskType =
  | 'vestigial_game'
  | 'chlorophyll_game'
  | 'fossil_game'
  | 'chameleon_game'
  | 'homology_game';

export interface StoryboardSlide {
  step: string;
  title: string;
  caption: string;
  highlight: string;
}

export interface BiologyModule {
  id: string;
  order: number;
  title: string;
  area: string;
  durationLabel: string;
  summary: string;
  keyConcepts: string[];
  storyboardSlides: StoryboardSlide[];
  defaultYoutubeUrl: string;
  taskType: TaskType;
  taskTitle: string;
  taskDescription: string;
  baseXp: number;
  baseCoins: number;
}

export interface ModuleCompletion {
  moduleId: string;
  stars: 1 | 2 | 3;
  bestScore: number;
  attempts: number;
  completedAt: string;
}

export interface RewardItem {
  id: string;
  name: string;
  category: 'Equipamento' | 'Mascote' | 'Título';
  description: string;
  cost: number;
  accentColor: string;
  iconKey: 'microscope' | 'dna' | 'flask' | 'shield' | 'leaf' | 'crown';
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  iconKey: 'rocket' | 'dna' | 'shield' | 'star' | 'trophy';
}

export interface StudentProgress {
  xp: number;
  bioCoins: number;
  streakDays: number;
  watchedModuleIds: string[];
  completedModules: Record<string, ModuleCompletion>;
  customVideoUrls: Record<string, string>;
  unlockedRewards: string[];
  equippedRewardId: string | null;
  unlockedAchievements: string[];
}

export interface TaskResult {
  stars: 1 | 2 | 3;
  score: number;
  accuracyPercent: number;
  summaryLabel: string;
}
