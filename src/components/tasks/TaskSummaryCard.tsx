import { ArrowLeft, Award, Coins, RotateCcw, Star } from 'lucide-react';
import { AchievementDef, TaskResult } from '../../types/biology';

interface TaskSummaryCardProps {
  title: string;
  result: TaskResult;
  earnedXp: number;
  earnedCoins: number;
  newAchievements: AchievementDef[];
  onReplay: () => void;
  onExit: () => void;
}

export function TaskSummaryCard({
  title,
  result,
  earnedXp,
  earnedCoins,
  newAchievements,
  onReplay,
  onExit,
}: TaskSummaryCardProps) {
  return (
    <div className="max-w-lg mx-auto rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#16A34A]">Desafio Concluído</p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
          {title}
        </h2>
        <p className="text-sm text-slate-600">{result.summaryLabel}</p>
      </div>

      <div className="flex items-center justify-center gap-2" aria-label={`${result.stars} de 3 estrelas`}>
        {[1, 2, 3].map((idx) => (
          <Star
            key={idx}
            className={`w-10 h-10 transition-transform ${
              idx <= result.stars
                ? 'text-amber-500 fill-amber-400 scale-105'
                : 'text-slate-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 tabular-nums">
        <div>
          <p className="text-xs text-slate-500">Pontuação</p>
          <p className="font-display text-xl font-bold text-slate-900">{result.score}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Precisão</p>
          <p className="font-display text-xl font-bold text-slate-900">{result.accuracyPercent}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Ganhos</p>
          <p className="font-display text-base font-bold text-[#16A34A] inline-flex items-center justify-center gap-1.5">
            +{earnedXp} XP · +{earnedCoins}
            <Coins className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
          </p>
        </div>
      </div>

      {newAchievements.length > 0 && (
        <div className="rounded-2xl bg-purple-50 border border-purple-200/80 p-4 text-left space-y-2">
          <p className="text-xs font-bold text-[#32064A] inline-flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
            Nova Conquista Desbloqueada!
          </p>
          {newAchievements.map((ach) => (
            <div key={ach.id} className="text-sm text-slate-800 flex items-center justify-between gap-2">
              <span className="font-semibold">{ach.title}</span>
              <span className="text-xs font-bold text-amber-700 tabular-nums">
                +{ach.rewardCoins} BioCoins
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="min-h-[48px] flex-1 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-semibold inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Jogar Novamente
        </button>
        <button
          type="button"
          onClick={onExit}
          data-start="true"
          className="min-h-[48px] flex-1 px-4 py-3 rounded-xl bg-[#32064A] hover:bg-[#460B66] text-white text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Continuar Jornada
        </button>
      </div>
    </div>
  );
}
