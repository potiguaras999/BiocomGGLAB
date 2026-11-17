import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Play, Target, XCircle } from 'lucide-react';
import { TaskResult } from '../../types/biology';
import {
  CHAMELEON_SCENARIOS,
  CHAMELEON_STATES,
  ChameleonStateId,
  scoreToStars,
} from '../../utils/gameLogic';
import { playError, playPop, playSuccess, playVictory } from '../../utils/sound';

interface ChameleonPowerGameProps {
  onComplete: (result: TaskResult) => void;
  onExit: () => void;
  autoStart?: boolean;
}

export function ChameleonPowerGame({
  onComplete,
  onExit,
  autoStart = false,
}: ChameleonPowerGameProps) {
  const [phase, setPhase] = useState<'title' | 'tune' | 'tongue'>(autoStart ? 'tune' : 'title');
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedState, setSelectedState] = useState<ChameleonStateId | null>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [insectPos, setInsectPos] = useState({ x: 78, y: 40 });
  const [tongueSnap, setTongueSnap] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const scenario = CHAMELEON_SCENARIOS[scenarioIdx];
  const activeChameleon =
    CHAMELEON_STATES.find((s) => s.id === selectedState) ?? CHAMELEON_STATES[0];

  useEffect(() => {
    document.body.dataset.state = phase === 'title' ? 'title' : 'playing';
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  // Animate flying insect during tongue capture sub-phase on the right side of the stage
  useEffect(() => {
    if (phase !== 'tongue' || tongueSnap) return;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 0.16;
      setInsectPos({
        x: 74 + Math.sin(frame * 1.4) * 12,
        y: 44 + Math.cos(frame * 2.1) * 24,
      });
    }, 60);
    return () => window.clearInterval(id);
  }, [phase, tongueSnap]);

  const handleSelectSkin = (stateId: ChameleonStateId) => {
    if (phase !== 'tune') return;
    setAttempts((a) => a + 1);
    setSelectedState(stateId);

    if (stateId === scenario.targetState) {
      playSuccess();
      setHits((h) => h + 1);
      setScore((s) => s + 120);
      setFeedback({
        ok: true,
        text: 'Iridóforos ajustados! Agora toque no inseto para disparar a língua!',
      });
      setTongueSnap(false);
      setPhase('tongue');
    } else {
      playError();
      setFeedback({
        ok: false,
        text: scenario.biologyHint,
      });
    }
  };

  const handleCatchInsect = () => {
    if (phase !== 'tongue' || tongueSnap) return;
    setTongueSnap(true);
    playSuccess();
    const nextScore = score + 80;
    setScore(nextScore);
    setFeedback({ ok: true, text: 'Captura certeira com a língua elástica! +80 pts' });

    window.setTimeout(() => {
      if (scenarioIdx + 1 < CHAMELEON_SCENARIOS.length) {
        setScenarioIdx((i) => i + 1);
        setSelectedState(null);
        setFeedback(null);
        setTongueSnap(false);
        setPhase('tune');
      } else {
        const accuracyPercent = Math.min(100, Math.round((hits / Math.max(1, attempts)) * 100));
        playVictory();
        onComplete({
          stars: scoreToStars(accuracyPercent),
          score: nextScore,
          accuracyPercent,
          summaryLabel:
            'Você ajustou os iridóforos em todos os cenários e capturou os 3 insetos!',
        });
      }
    }, 850);
  };

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
          <span className="text-xs font-medium text-purple-200">Mini-Game · Vídeo 04</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3 shrink-0">
            {CHAMELEON_STATES.map((st) => (
              <div
                key={st.id}
                className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#32064A] bg-[#93D8D3]"
              >
                <img
                  src={st.imageSrc}
                  alt={`Camaleão ${st.label}`}
                  className="w-full h-full object-cover object-center scale-[1.05]"
                />
              </div>
            ))}
          </div>
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold">Mestre Camaleão</h2>
            <p className="text-xs text-purple-200">Verde · Azul · Vermelho</p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
          Camaleões usam cristais na pele (iridóforos) para mudar de cor, se camuflar e se
          comunicar! Escolha a cor certa para cada cena e dispare a língua para capturar o inseto.
        </p>

        <button
          type="button"
          data-start="true"
          onClick={() => {
            playPop();
            setPhase('tune');
          }}
          className="w-full min-h-[52px] rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-base inline-flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          Ativar Iridóforos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Sair
        </button>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-bold tabular-nums">
          <span className="text-slate-600">
            Cena {scenarioIdx + 1}/{CHAMELEON_SCENARIOS.length}
          </span>
          <span className="text-[#16A34A]">{score} pts</span>
        </div>
      </div>

      {/* Interactive Chameleon Stage with Uploaded Artwork */}
      <div className="relative rounded-3xl bg-[#1A2E1A] text-white p-4 sm:p-5 overflow-hidden border border-emerald-900/40 space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-[#4ADE80] relative z-10 leading-snug">
          {scenario.situation}
        </p>

        <div className="relative h-44 sm:h-48 w-full">
          {/* Circular Chameleon Artwork */}
          <div className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-10">
            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 shadow-lg bg-[#93D8D3] transition-all duration-300 ${
                selectedState
                  ? 'ring-white/35 grayscale-0 opacity-100 scale-100'
                  : 'ring-white/15 grayscale opacity-80 scale-[0.97]'
              }`}
            >
              <img
                src={activeChameleon.imageSrc}
                alt={
                  selectedState
                    ? `Camaleão ${activeChameleon.label} no galho`
                    : 'Camaleão aguardando escolha de cor'
                }
                className="w-full h-full object-cover object-center scale-[1.05]"
              />
            </div>
          </div>

          {/* Ballistic Tongue Overlay */}
          {tongueSnap && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
              aria-hidden="true"
            >
              <line
                x1="34"
                y1="50"
                x2={insectPos.x}
                y2={insectPos.y}
                stroke="#F472B6"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <circle cx={insectPos.x} cy={insectPos.y} r="3.2" fill="#EC4899" />
            </svg>
          )}

          {/* Moving Insect Target */}
          {phase === 'tongue' && (
            <button
              type="button"
              onClick={handleCatchInsect}
              aria-label="Capturar inseto com a língua"
              style={{ left: `${insectPos.x}%`, top: `${insectPos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 min-w-[52px] min-h-[52px] rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold flex items-center justify-center shadow-lg ring-4 ring-amber-400/30 active:scale-90 transition-transform"
            >
              <Target className="w-6 h-6" aria-hidden="true" />
            </button>
          )}

          {/* Prompt badge when waiting for tongue catch vs color selection */}
          {phase === 'tune' && (
            <div className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 max-w-[140px] sm:max-w-[180px] text-right pointer-events-none">
              <p className="text-xs text-emerald-200/80 font-medium">
                {selectedState
                  ? `Cor atual: ${activeChameleon.label}`
                  : 'Escolha uma cor abaixo'}
              </p>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-2xl p-3 text-sm font-medium flex items-center gap-2 border ${
            feedback.ok
              ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
              : 'bg-amber-50 text-amber-950 border-amber-200'
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Iridophore Skin Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {CHAMELEON_STATES.map((st) => {
          const isSelected = selectedState === st.id;
          return (
            <button
              key={st.id}
              type="button"
              disabled={phase !== 'tune'}
              onClick={() => handleSelectSkin(st.id)}
              className={`min-h-[64px] p-3 rounded-2xl bg-white border text-left flex items-center gap-3 transition-colors disabled:opacity-55 ${
                isSelected
                  ? 'border-[#32064A] ring-2 ring-[#32064A]/20'
                  : 'border-slate-200 hover:border-[#32064A]'
              }`}
            >
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-black/10 bg-[#93D8D3]">
                <img
                  src={st.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover object-center scale-[1.06]"
                />
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-sm text-slate-900">{st.label}</p>
                <p className="text-[11px] text-slate-500 leading-tight">{st.crystalDesc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
