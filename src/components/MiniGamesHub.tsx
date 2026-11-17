import { Gamepad2, Play, Star } from 'lucide-react';
import { BiologyModule, StudentProgress } from '../types/biology';

interface MiniGamesHubProps {
  modules: BiologyModule[];
  progress: StudentProgress;
  onLaunchTask: (moduleId: string) => void;
}

export function MiniGamesHub({ modules, progress, onLaunchTask }: MiniGamesHubProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Central de Mini-Games e Desafios
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Pratique livremente qualquer mini-game ou quiz de Biologia para bater seus recordes e
          conquistar 3 estrelas em toda a trilha.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {modules.map((mod) => {
          const completion = progress.completedModules[mod.id];
          const kindLabel = `Vídeo 0${mod.order}`;

          return (
            <article
              key={mod.id}
              className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#32064A]">
                    {kindLabel} · {mod.area}
                  </span>
                  {completion && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                      {completion.stars}/3 · Recorde {completion.bestScore}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-xl font-bold text-slate-900">{mod.taskTitle}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{mod.taskDescription}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
                  Módulo 0{mod.order}: {mod.title}
                </span>

                <button
                  type="button"
                  onClick={() => onLaunchTask(mod.id)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#32064A] hover:bg-[#460B66] text-white text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                  Jogar Agora
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
