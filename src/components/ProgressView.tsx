import { useState } from 'react';
import { Award, CheckCircle2, Flame, RotateCcw, Star } from 'lucide-react';
import { BiologyModule, StudentProgress } from '../types/biology';
import { calculateLevelInfo } from '../utils/progression';

interface ProgressViewProps {
  modules: BiologyModule[];
  progress: StudentProgress;
  onResetProgress: () => void;
}

export function ProgressView({ modules, progress, onResetProgress }: ProgressViewProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const levelInfo = calculateLevelInfo(progress.xp);
  const completedCount = Object.keys(progress.completedModules).length;
  const totalStars = Object.values(progress.completedModules).reduce((sum, c) => sum + c.stars, 0);
  const maxStars = modules.length * 3;
  const completionPct = Math.round((completedCount / modules.length) * 100);

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          Progresso da Sua Jornada
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Acompanhe sua evolução nos vídeos, pontuação nos mini-games e desempenho por área da Biologia.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 tabular-nums">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs text-slate-500">Nível Atual</p>
          <p className="font-display text-2xl font-extrabold text-[#32064A]">
            Nível {levelInfo.level}
          </p>
          <p className="text-xs font-medium text-slate-600">{levelInfo.title}</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs text-slate-500">Conclusão da Trilha</p>
          <p className="font-display text-2xl font-extrabold text-[#16A34A]">{completionPct}%</p>
          <p className="text-xs text-slate-600">
            {completedCount} de {modules.length} módulos
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs text-slate-500">Estrelas Obtidas</p>
          <p className="font-display text-2xl font-extrabold text-amber-600 inline-flex items-center gap-1.5">
            {totalStars}/{maxStars}
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" aria-hidden="true" />
          </p>
          <p className="text-xs text-slate-600">Nos quizzes e mini-games</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-1">
          <p className="text-xs text-slate-500">Sequência Ativa</p>
          <p className="font-display text-2xl font-extrabold text-slate-900 inline-flex items-center gap-1.5">
            {progress.streakDays} dia{progress.streakDays > 1 ? 's' : ''}
            <Flame className="w-5 h-5 text-orange-500" aria-hidden="true" />
          </p>
          <p className="text-xs text-slate-600">{progress.xp} XP acumulados</p>
        </div>
      </div>

      {/* Per-Module Mastery Breakdown */}
      <section className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Desempenho por Módulo
          </h2>
          <span className="text-xs text-slate-500 inline-flex items-center gap-1">
            <Award className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
            {progress.unlockedAchievements.length} conquistas
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {modules.map((mod) => {
            const comp = progress.completedModules[mod.id];
            const watched = progress.watchedModuleIds.includes(mod.id);
            return (
              <div
                key={mod.id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs text-slate-500">
                    Módulo 0{mod.order} · {mod.area}
                  </p>
                  <p className="font-display font-bold text-slate-900">{mod.title}</p>
                </div>

                <div className="flex items-center gap-4 text-xs sm:text-sm tabular-nums">
                  <span className="text-slate-600">
                    Aula: {watched ? 'Assistida' : 'Pendente'}
                  </span>
                  {comp ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#15803D]">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      {comp.stars}★ · Recorde {comp.bestScore} pts
                    </span>
                  ) : (
                    <span className="text-slate-400">Desafio pendente</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safe Demo Reset */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Reiniciar progresso</p>
          <p className="text-xs text-slate-500">Todo o progresso do app será apagado.</p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#ff0000] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Zerar Progresso
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onResetProgress();
                setConfirmReset(false);
              }}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
            >
              Confirmar Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
