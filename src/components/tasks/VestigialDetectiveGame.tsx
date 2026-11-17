import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  PauseCircle,
  Play,
  Sparkles,
  Timer,
  XCircle,
  Zap,
} from 'lucide-react';
import { TaskResult } from '../../types/biology';
import {
  calculateVestigialPoints,
  prepareVestigialCases,
  scoreToStars,
  VestigialCase,
} from '../../utils/gameLogic';
import { playError, playPop, playSuccess, playVictory } from '../../utils/sound';

interface VestigialDetectiveGameProps {
  onComplete: (result: TaskResult) => void;
  onExit: () => void;
  autoStart?: boolean;
}

const SECONDS_PER_CASE = 25;

export function VestigialDetectiveGame({
  onComplete,
  onExit,
  autoStart = false,
}: VestigialDetectiveGameProps) {
  const [phase, setPhase] = useState<'title' | 'playing'>(autoStart ? 'playing' : 'title');
  const [cases, setCases] = useState<VestigialCase[]>(() => prepareVestigialCases());
  const [caseIdx, setCaseIdx] = useState(0);
  const [eliminatedOptionId, setEliminatedOptionId] = useState<string | null>(null);
  const [lupaUsesLeft, setLupaUsesLeft] = useState(2);
  const [freezeUsesLeft, setFreezeUsesLeft] = useState(1);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  const [caseResults, setCaseResults] = useState<('pending' | 'hit' | 'miss')[]>(() =>
    Array(cases.length).fill('pending')
  );
  const [score, setScore] = useState(0);
  const [lastGained, setLastGained] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(SECONDS_PER_CASE * 1000);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current = cases[caseIdx];
  const timeLeft = Math.ceil(timeLeftMs / 1000);
  const hasAnswered = selectedId !== null || timeLeftMs <= 0;
  const isCorrect = selectedId === current.correctOptionId;
  const progressPercent = Math.max(0, Math.min(100, (timeLeftMs / (SECONDS_PER_CASE * 1000)) * 100));

  useEffect(() => {
    document.body.dataset.state = phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  // Smooth 100ms countdown for dynamic progress bar & 25s limit
  useEffect(() => {
    if (phase !== 'playing' || hasAnswered || isTimeFrozen) return;
    const id = window.setInterval(() => {
      setTimeLeftMs((prev) => Math.max(0, prev - 100));
    }, 100);
    return () => window.clearInterval(id);
  }, [phase, hasAnswered, isTimeFrozen, caseIdx]);

  // Timeout trigger
  useEffect(() => {
    if (phase === 'playing' && timeLeftMs <= 0 && selectedId === null) {
      playError();
      setStreak(0);
      setLastGained(null);
      setCaseResults((prev) => prev.map((r, i) => (i === caseIdx ? 'miss' : r)));
    }
  }, [phase, timeLeftMs, selectedId, caseIdx]);

  const handleStartMatch = () => {
    playPop();
    const nextCases = prepareVestigialCases();
    setCases(nextCases);
    setCaseIdx(0);
    setEliminatedOptionId(null);
    setLupaUsesLeft(2);
    setFreezeUsesLeft(1);
    setIsTimeFrozen(false);
    setCaseResults(Array(nextCases.length).fill('pending'));
    setScore(0);
    setLastGained(null);
    setStreak(0);
    setHits(0);
    setTimeLeftMs(SECONDS_PER_CASE * 1000);
    setSelectedId(null);
    setPhase('playing');
  };

  const handleUseLupa = () => {
    if (hasAnswered || lupaUsesLeft <= 0 || eliminatedOptionId) return;
    const wrongOptions = current.options.filter((o) => o.id !== current.correctOptionId);
    if (wrongOptions.length === 0) return;
    const pick = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    playPop();
    setEliminatedOptionId(pick.id);
    setLupaUsesLeft((n) => n - 1);
  };

  const handleFreezeTime = () => {
    if (hasAnswered || freezeUsesLeft <= 0 || isTimeFrozen) return;
    playPop();
    setIsTimeFrozen(true);
    setFreezeUsesLeft((n) => n - 1);
  };

  const handleChoose = useCallback(
    (optionId: string) => {
      if (hasAnswered || optionId === eliminatedOptionId) return;
      setSelectedId(optionId);
      if (optionId === current.correctOptionId) {
        playSuccess();
        const nextStreak = streak + 1;
        const gained = calculateVestigialPoints(timeLeft, nextStreak);
        setStreak(nextStreak);
        setScore((s) => s + gained);
        setLastGained(gained);
        setHits((h) => h + 1);
        setCaseResults((prev) => prev.map((r, i) => (i === caseIdx ? 'hit' : r)));
      } else {
        playError();
        setStreak(0);
        setLastGained(null);
        setCaseResults((prev) => prev.map((r, i) => (i === caseIdx ? 'miss' : r)));
      }
    },
    [hasAnswered, eliminatedOptionId, current.correctOptionId, streak, timeLeft, caseIdx]
  );

  const handleNext = useCallback(() => {
    playPop();
    if (caseIdx + 1 < cases.length) {
      setCaseIdx((i) => i + 1);
      setEliminatedOptionId(null);
      setIsTimeFrozen(false);
      setSelectedId(null);
      setLastGained(null);
      setTimeLeftMs(SECONDS_PER_CASE * 1000);
    } else {
      const accuracyPercent = Math.round((hits / cases.length) * 100);
      playVictory();
      onComplete({
        stars: scoreToStars(accuracyPercent),
        score,
        accuracyPercent,
        summaryLabel: `Você decifrou ${hits} de ${cases.length} pistas evolutivas do corpo humano.`,
      });
    }
  }, [caseIdx, cases.length, hits, onComplete, score]);

  // Keyboard shortcuts (1/2/3 or A/B/C to answer, Enter for next)
  useEffect(() => {
    if (phase !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (hasAnswered) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
        return;
      }
      const key = e.key.toLowerCase();
      const map: Record<string, number> = { '1': 0, a: 0, '2': 1, b: 1, '3': 2, c: 2 };
      if (key in map && current.options[map[key]]) {
        e.preventDefault();
        handleChoose(current.options[map[key]].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, hasAnswered, current.options, handleChoose, handleNext]);

  if (phase === 'title') {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-[#32064A] text-white p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold text-purple-100 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar
          </button>
          <span className="text-xs font-medium text-purple-200">Mini-Quiz · Vídeo 01</span>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold">Detetive Vestigial</h2>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
            Apêndice, cóccix e dentes do siso... Você tem <strong>25 segundos</strong> por caso para
            desvendar qual era a função dessas estruturas nos nossos ancestrais. Responda rápido
            para multiplicar seu combo e conte com a <strong>Lupa</strong> ou o{' '}
            <strong>Congelar Tempo</strong> se precisar!
          </p>
        </div>

        <button
          type="button"
          data-start="true"
          onClick={handleStartMatch}
          className="w-full min-h-[52px] rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-base inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          Iniciar Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top HUD: Exit, 4-Case Strip, Streak Combo, Score */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Sair
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-bold tabular-nums">
          <div className="flex items-center gap-1" aria-label={`Caso ${caseIdx + 1} de ${cases.length}`}>
            {caseResults.map((res, idx) => (
              <span
                key={idx}
                className={`w-6 h-6 rounded-full text-[11px] flex items-center justify-center font-mono transition-colors ${
                  res === 'hit'
                    ? 'bg-[#16A34A] text-white'
                    : res === 'miss'
                    ? 'bg-red-500 text-white'
                    : idx === caseIdx
                    ? 'bg-[#32064A] text-white ring-2 ring-purple-300'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {idx + 1}
              </span>
            ))}
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg ${
              streak >= 2 ? 'bg-amber-100 text-amber-700' : 'text-amber-600'
            }`}
          >
            <Flame className="w-4 h-4" aria-hidden="true" />
            {streak}x
          </span>

          <span className="text-[#16A34A]">{score} pts</span>
        </div>
      </div>

      {/* Case Card with Live Timer, Speed Bonus & Power-Ups */}
      <div className="rounded-3xl bg-[#26043A] text-white p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-purple-200 tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#4ADE80]" aria-hidden="true" />
            Caso {caseIdx + 1}/{cases.length} · {current.bodyRegion}
          </span>

          <div className="flex items-center gap-2.5">
            {!hasAnswered && (
              <span className="text-[11px] font-semibold text-purple-200/90 hidden sm:inline">
                +{calculateVestigialPoints(timeLeft, streak + 1)} pts se acertar agora
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                isTimeFrozen
                  ? 'text-sky-300'
                  : timeLeft <= 6
                  ? 'text-red-300'
                  : timeLeft <= 12
                  ? 'text-amber-300'
                  : 'text-[#4ADE80]'
              }`}
            >
              <Timer className="w-4 h-4" aria-hidden="true" />
              {isTimeFrozen ? `${timeLeft}s · Pausado` : `${timeLeft}s`}
            </span>
          </div>
        </div>

        {/* Smooth Countdown Bar */}
        <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
          <div
            className={`h-full transition-[width,background-color] duration-100 ease-linear ${
              isTimeFrozen
                ? 'bg-sky-400'
                : timeLeft <= 6
                ? 'bg-red-500'
                : timeLeft <= 12
                ? 'bg-amber-400'
                : 'bg-[#22C55E]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
              {current.partName}
            </h2>
            {hasAnswered && isCorrect && lastGained !== null && (
              <span className="px-2.5 py-1 rounded-xl bg-[#22C55E] text-[#052E16] font-extrabold text-xs tabular-nums shrink-0">
                +{lastGained} pts
              </span>
            )}
          </div>
          <p className="text-sm text-purple-100 leading-relaxed">{current.ancestralClue}</p>
        </div>

        {/* Tactical Power-Up Bar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            disabled={hasAnswered || lupaUsesLeft <= 0 || eliminatedOptionId !== null}
            onClick={handleUseLupa}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold text-amber-200 inline-flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Lupa · -1 errada ({lupaUsesLeft})</span>
          </button>

          <button
            type="button"
            disabled={hasAnswered || freezeUsesLeft <= 0 || isTimeFrozen}
            onClick={handleFreezeTime}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-xs font-bold text-sky-200 inline-flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
          >
            <PauseCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              {isTimeFrozen ? 'Tempo Congelado' : `Pausar Tempo (${freezeUsesLeft})`}
            </span>
          </button>
        </div>
      </div>

      {/* Shuffled Alternative Cards */}
      <div className="space-y-2.5">
        {current.options.map((opt, idx) => {
          const isThisCorrect = opt.id === current.correctOptionId;
          const isPicked = opt.id === selectedId;
          const isEliminated = opt.id === eliminatedOptionId;
          const letter = ['A', 'B', 'C'][idx] ?? '';
          let cls =
            'bg-white border-slate-200 hover:border-[#32064A] hover:shadow-sm text-slate-900 active:scale-[0.99]';
          let badgeCls = 'bg-slate-100 text-slate-700';

          if (isEliminated && !hasAnswered) {
            cls = 'bg-slate-100 border-slate-200 text-slate-400 line-through opacity-55';
          } else if (hasAnswered) {
            if (isThisCorrect) {
              cls = 'bg-emerald-50 border-[#16A34A] text-emerald-950';
              badgeCls = 'bg-[#16A34A] text-white';
            } else if (isPicked) {
              cls = 'bg-red-50 border-red-500 text-red-950';
              badgeCls = 'bg-red-500 text-white';
            } else {
              cls = 'bg-slate-50 border-slate-200 text-slate-400';
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={hasAnswered || isEliminated}
              onClick={() => handleChoose(opt.id)}
              className={`w-full min-h-[64px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${cls}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${badgeCls}`}
                >
                  {letter}
                </span>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm sm:text-base">{opt.label}</p>
                  <p className="text-xs opacity-80">{opt.detail}</p>
                </div>
              </div>
              {hasAnswered && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" aria-hidden="true" />
              )}
              {hasAnswered && isPicked && !isThisCorrect && (
                <XCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Feedback & Fact from Video */}
      {hasAnswered && (
        <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-sm">
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900">
              {selectedId === null
                ? 'Tempo esgotado! '
                : isCorrect
                ? 'Pista confirmada! '
                : 'Fato evolutivo: '}
            </strong>
            {current.fact}
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="w-full min-h-[48px] rounded-xl bg-[#32064A] hover:bg-[#460B66] text-white font-bold text-sm transition-colors"
          >
            {caseIdx + 1 < cases.length ? 'Próximo Caso' : 'Ver Resultado Final'}
          </button>
        </div>
      )}
    </div>
  );
}
