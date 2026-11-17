import { useState } from 'react';
import { CheckCircle2, Lock, Play, Star } from 'lucide-react';
import { BiologyModule, StudentProgress } from '../types/biology';
import { calculateLevelInfo, extractYouTubeId, isModuleUnlocked } from '../utils/progression';

interface JourneyMapProps {
  modules: BiologyModule[];
  progress: StudentProgress;
  onOpenModule: (moduleId: string) => void;
}

function VideoThumb({
  youtubeId,
  title,
  order,
}: {
  youtubeId: string | null;
  title: string;
  order: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!youtubeId || failed) {
    return (
      <div className="w-16 h-24 rounded-xl bg-[#32064A] text-white flex flex-col items-center justify-center shrink-0 border border-purple-900/30">
        <Play className="w-5 h-5 text-[#4ADE80] fill-current" aria-hidden="true" />
        <span className="text-[10px] font-mono font-bold mt-1">0{order}</span>
      </div>
    );
  }

  return (
    <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-[#26043A] shrink-0 border border-slate-200">
      <img
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt={`Miniatura do vídeo ${title}`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent flex items-center justify-center">
        <span className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center">
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export function JourneyMap({ modules, progress, onOpenModule }: JourneyMapProps) {
  const levelInfo = calculateLevelInfo(progress.xp);
  const completedCount = Object.keys(progress.completedModules).length;

  const nextModule =
    modules.find(
      (m) =>
        isModuleUnlocked(m.order, modules, progress.completedModules) &&
        !progress.completedModules[m.id]
    ) ?? modules[0];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Compact GGLAB Header Strip so all 5 trail videos appear right on the first screen */}
      <section className="rounded-2xl sm:rounded-3xl bg-[#32064A] text-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src="/assets/aistudio/esse_1__54f04e1b.png"
              alt="Personagens e frasco verde do GGLAB"
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-contain bg-[#240336] shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-medium text-purple-200 tabular-nums">
                Nível {levelInfo.level} · {levelInfo.title} · {completedCount}/{modules.length} vídeos
              </p>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold leading-tight">
                Trilha de Biologia GGLAB
              </h1>
              <div className="flex items-center gap-2 max-w-xs">
                <div className="h-2 flex-1 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#22C55E] transition-all duration-300"
                    style={{ width: `${levelInfo.progressPercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-purple-200 tabular-nums shrink-0">
                  {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenModule(nextModule.id)}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 active:scale-[0.98] transition-colors"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            {progress.completedModules[nextModule.id]
              ? `Revisar Vídeo 0${nextModule.order}`
              : `Assistir Vídeo 0${nextModule.order}`}
          </button>
        </div>
      </section>

      {/* Ordered 5-Step Learning Trail immediately visible on page 1 */}
      <section aria-labelledby="trilha-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="trilha-heading" className="font-display text-lg sm:text-xl font-bold text-slate-900">
            Sua Trilha de Vídeos e Mini-Games
          </h2>
          <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
            Ordem 1 → {modules.length}
          </span>
        </div>

        <ol className="relative space-y-3 sm:space-y-3.5">
          {modules.map((mod, idx) => {
            const unlocked = isModuleUnlocked(mod.order, modules, progress.completedModules);
            const completion = progress.completedModules[mod.id];
            const videoWatched = progress.watchedModuleIds.includes(mod.id);
            const youtubeId = extractYouTubeId(
              progress.customVideoUrls[mod.id] || mod.defaultYoutubeUrl
            );
            const isLast = idx === modules.length - 1;

            return (
              <li key={mod.id} className="relative flex gap-3 sm:gap-4 items-stretch">
                {/* Step Node + Connector Line */}
                <div className="flex flex-col items-center shrink-0 pt-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      completion
                        ? 'bg-[#16A34A] text-white'
                        : unlocked
                        ? 'bg-[#32064A] text-white ring-4 ring-purple-100'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                    aria-hidden="true"
                  >
                    {completion ? <CheckCircle2 className="w-4 h-4" /> : `0${mod.order}`}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 mt-1.5 rounded-full ${
                        completion ? 'bg-[#16A34A]' : 'bg-slate-200'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Trail Card */}
                <article
                  className={`flex-1 min-w-0 rounded-2xl border p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors ${
                    unlocked
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-50/90 border-slate-200/70 opacity-85'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <VideoThumb youtubeId={youtubeId} title={mod.title} order={mod.order} />

                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-[11px] sm:text-xs font-medium text-slate-500 truncate">
                        Vídeo 0{mod.order} · {mod.area}
                      </p>
                      <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#32064A] truncate">
                        {mod.taskTitle}
                      </p>

                      {completion ? (
                        <div
                          className="flex items-center gap-1 pt-0.5"
                          aria-label={`Concluído com ${completion.stars} de 3 estrelas`}
                        >
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= completion.stars
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                          <span className="text-[11px] font-semibold text-[#15803D] ml-1">
                            Concluído
                          </span>
                        </div>
                      ) : unlocked ? (
                        <p className="text-[11px] font-semibold text-[#15803D]">
                          {videoWatched ? 'Mini-Game liberado' : 'Pronto para assistir'}
                        </p>
                      ) : (
                        <p className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1">
                          <Lock className="w-3 h-3 shrink-0" aria-hidden="true" />
                          Conclua o Vídeo 0{mod.order - 1}
                        </p>
                      )}
                    </div>
                  </div>

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => onOpenModule(mod.id)}
                      className={`min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 transition-colors ${
                        completion
                          ? 'border border-slate-200 hover:bg-slate-50 text-slate-800'
                          : 'bg-[#32064A] hover:bg-[#460B66] text-white'
                      }`}
                    >
                      {completion ? 'Rever Aula' : 'Assistir Aula'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-label={`Vídeo 0${mod.order} bloqueado`}
                      className="min-h-[44px] w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-200/80 text-slate-500 text-xs font-semibold whitespace-nowrap shrink-0 cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      Bloqueado
                    </button>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
