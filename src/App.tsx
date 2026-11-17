import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { JourneyMap } from './components/JourneyMap';
import { LessonPlayerView } from './components/LessonPlayerView';
import { MiniGamesHub } from './components/MiniGamesHub';
import { ProgressView } from './components/ProgressView';
import { RewardsView } from './components/RewardsView';
import { TopBar } from './components/TopBar';
import { ChameleonPowerGame } from './components/tasks/ChameleonPowerGame';
import { ChlorophyllFactoryGame } from './components/tasks/ChlorophyllFactoryGame';
import { FossilExcavationGame } from './components/tasks/FossilExcavationGame';
import { HomologyLabGame } from './components/tasks/HomologyLabGame';
import { TaskSummaryCard } from './components/tasks/TaskSummaryCard';
import { VestigialDetectiveGame } from './components/tasks/VestigialDetectiveGame';
import { ACHIEVEMENTS, BIOLOGY_MODULES, REWARD_ITEMS } from './data/curriculum';
import { AchievementDef, AppTab, RewardItem, StudentProgress, TaskResult } from './types/biology';
import {
  applyTaskCompletion,
  createInitialProgress,
  markVideoWatched,
  purchaseRewardItem,
} from './utils/progression';
import { isSoundMuted, playPop, setSoundMuted } from './utils/sound';

const STORAGE_KEY = 'gglab_student_progress_v2';

type ActiveView =
  | { kind: 'tab' }
  | { kind: 'lesson'; moduleId: string }
  | { kind: 'task'; moduleId: string; runKey: number; autoStart: boolean }
  | {
      kind: 'summary';
      moduleId: string;
      result: TaskResult;
      earnedXp: number;
      earnedCoins: number;
      newAchievements: AchievementDef[];
    };

function loadSavedProgress(): StudentProgress {
  if (typeof window === 'undefined') return createInitialProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<StudentProgress>;
    return {
      ...createInitialProgress(),
      ...parsed,
      completedModules: parsed.completedModules ?? {},
      customVideoUrls: parsed.customVideoUrls ?? {},
      watchedModuleIds: parsed.watchedModuleIds ?? [],
      unlockedRewards: parsed.unlockedRewards ?? [],
      unlockedAchievements: parsed.unlockedAchievements ?? [],
    };
  } catch {
    return createInitialProgress();
  }
}

export default function App() {
  const [progress, setProgress] = useState<StudentProgress>(loadSavedProgress);
  const [activeTab, setActiveTab] = useState<AppTab>('trilha');
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return { kind: 'task', moduleId: 'modulo-clorofila', runKey: 1, autoStart: true };
      }
    }
    return { kind: 'tab' };
  });
  const [muted, setMuted] = useState(isSoundMuted());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const handleSelectTab = (tab: AppTab) => {
    playPop();
    setActiveTab(tab);
    setActiveView({ kind: 'tab' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModule = (moduleId: string) => {
    playPop();
    setActiveView({ kind: 'lesson', moduleId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkWatched = (moduleId: string) => {
    playPop();
    setProgress((prev) => markVideoWatched(prev, moduleId));
  };

  const handleSaveVideoUrl = (moduleId: string, url: string) => {
    setProgress((prev) => ({
      ...prev,
      customVideoUrls: {
        ...prev.customVideoUrls,
        [moduleId]: url,
      },
    }));
  };

  const handleStartTask = (moduleId: string, autoStart = false) => {
    playPop();
    setActiveView({
      kind: 'task',
      moduleId,
      runKey: Date.now(),
      autoStart,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteTask = (moduleId: string, result: TaskResult) => {
    const mod = BIOLOGY_MODULES.find((m) => m.id === moduleId);
    if (!mod) return;

    const outcome = applyTaskCompletion(
      progress,
      mod,
      result,
      ACHIEVEMENTS,
      BIOLOGY_MODULES.length
    );

    setProgress(outcome.nextProgress);
    setActiveView({
      kind: 'summary',
      moduleId,
      result,
      earnedXp: outcome.earnedXp,
      earnedCoins: outcome.earnedCoins,
      newAchievements: outcome.newlyUnlockedAchievements,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePurchaseOrEquip = (item: RewardItem) => {
    const res = purchaseRewardItem(progress, item);
    if (res.ok) {
      playPop();
      setProgress(res.nextProgress);
    }
    return { ok: res.ok, reason: res.reason };
  };

  const handleToggleMute = () => {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  };

  const handleResetProgress = () => {
    const fresh = createInitialProgress();
    setProgress(fresh);
    setActiveTab('trilha');
    setActiveView({ kind: 'tab' });
  };

  const currentModule =
    activeView.kind !== 'tab'
      ? BIOLOGY_MODULES.find((m) => m.id === activeView.moduleId) ?? null
      : null;

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#1A1625] flex flex-col">
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        xp={progress.xp}
        bioCoins={progress.bioCoins}
        muted={muted}
        onToggleMute={handleToggleMute}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 pt-5 sm:pt-7 pb-24 md:pb-12">
        {activeView.kind === 'tab' && activeTab === 'trilha' && (
          <JourneyMap
            modules={BIOLOGY_MODULES}
            progress={progress}
            onOpenModule={handleOpenModule}
          />
        )}

        {activeView.kind === 'tab' && activeTab === 'games' && (
          <MiniGamesHub
            modules={BIOLOGY_MODULES}
            progress={progress}
            onLaunchTask={(moduleId) => handleStartTask(moduleId, false)}
          />
        )}

        {activeView.kind === 'tab' && activeTab === 'recompensas' && (
          <RewardsView
            progress={progress}
            storeItems={REWARD_ITEMS}
            achievements={ACHIEVEMENTS}
            onPurchaseOrEquip={handlePurchaseOrEquip}
          />
        )}

        {activeView.kind === 'tab' && activeTab === 'progresso' && (
          <ProgressView
            modules={BIOLOGY_MODULES}
            progress={progress}
            onResetProgress={handleResetProgress}
          />
        )}

        {activeView.kind === 'lesson' && currentModule && (
          <LessonPlayerView
            module={currentModule}
            customVideoUrl={progress.customVideoUrls[currentModule.id] ?? ''}
            isWatched={progress.watchedModuleIds.includes(currentModule.id)}
            isCompleted={Boolean(progress.completedModules[currentModule.id])}
            onBack={() => setActiveView({ kind: 'tab' })}
            onMarkWatched={handleMarkWatched}
            onStartTask={(id) => handleStartTask(id, false)}
            onSaveVideoUrl={handleSaveVideoUrl}
          />
        )}

        {activeView.kind === 'task' && currentModule && (
          <div key={activeView.runKey}>
            {currentModule.taskType === 'vestigial_game' && (
              <VestigialDetectiveGame
                autoStart={activeView.autoStart}
                onComplete={(res) => handleCompleteTask(currentModule.id, res)}
                onExit={() => setActiveView({ kind: 'tab' })}
              />
            )}
            {currentModule.taskType === 'chlorophyll_game' && (
              <ChlorophyllFactoryGame
                autoStart={activeView.autoStart}
                onComplete={(res) => handleCompleteTask(currentModule.id, res)}
                onExit={() => setActiveView({ kind: 'tab' })}
              />
            )}
            {currentModule.taskType === 'fossil_game' && (
              <FossilExcavationGame
                autoStart={activeView.autoStart}
                onComplete={(res) => handleCompleteTask(currentModule.id, res)}
                onExit={() => setActiveView({ kind: 'tab' })}
              />
            )}
            {currentModule.taskType === 'chameleon_game' && (
              <ChameleonPowerGame
                autoStart={activeView.autoStart}
                onComplete={(res) => handleCompleteTask(currentModule.id, res)}
                onExit={() => setActiveView({ kind: 'tab' })}
              />
            )}
            {currentModule.taskType === 'homology_game' && (
              <HomologyLabGame
                autoStart={activeView.autoStart}
                onComplete={(res) => handleCompleteTask(currentModule.id, res)}
                onExit={() => setActiveView({ kind: 'tab' })}
              />
            )}
          </div>
        )}

        {activeView.kind === 'summary' && currentModule && (
          <TaskSummaryCard
            title={currentModule.taskTitle}
            result={activeView.result}
            earnedXp={activeView.earnedXp}
            earnedCoins={activeView.earnedCoins}
            newAchievements={activeView.newAchievements}
            onReplay={() => handleStartTask(currentModule.id, true)}
            onExit={() => {
              setActiveTab('trilha');
              setActiveView({ kind: 'tab' });
            }}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />
    </div>
  );
}
