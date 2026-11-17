import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Pickaxe,
  Play,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { TaskResult } from '../../types/biology';
import {
  evaluateStrataDig,
  FossilStep,
  FOSSILIZATION_STEPS,
  prepareFossilizationSteps,
  prepareStrataFossils,
  scoreToStars,
  StratumFossil,
} from '../../utils/gameLogic';
import { playError, playPop, playSuccess, playVictory } from '../../utils/sound';
import {
  FossilHeroBanner,
  FossilizationDiorama,
  FossilSpecimenArtwork,
  StratumTextureOverlay,
} from './FossilIllustrations';

interface FossilExcavationGameProps {
  onComplete: (result: TaskResult) => void;
  onExit: () => void;
  autoStart?: boolean;
}

const LAYER_VISUALS = [
  {
    layer: 1,
    title: 'Camada Superior',
    ageLabel: 'Mais recente · Perto da superfície',
    surfaceGradient: 'from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]',
    depthTag: 'Topo',
    isDarkSurface: false,
  },
  {
    layer: 2,
    title: 'Camada Intermediária',
    ageLabel: 'Idade média · Meio da rocha',
    surfaceGradient: 'from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74]',
    depthTag: 'Meio',
    isDarkSurface: false,
  },
  {
    layer: 3,
    title: 'Camada Mais Profunda',
    ageLabel: 'Mais antiga · Milhões de anos',
    surfaceGradient: 'from-[#44403C] via-[#292524] to-[#1C1917]',
    depthTag: 'Fundo',
    isDarkSurface: true,
  },
];

export function FossilExcavationGame({
  onComplete,
  onExit,
  autoStart = false,
}: FossilExcavationGameProps) {
  const [phase, setPhase] = useState<'title' | 'stage1' | 'stage2'>(autoStart ? 'stage1' : 'title');
  const [shuffledSteps, setShuffledSteps] = useState<FossilStep[]>(() => prepareFossilizationSteps());
  const [strataQueue, setStrataQueue] = useState<StratumFossil[]>(() => prepareStrataFossils());
  const [nextOrder, setNextOrder] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [fossilIdx, setFossilIdx] = useState(0);
  const [foundByLayer, setFoundByLayer] = useState<Record<number, StratumFossil>>({});
  const [crackedEmptyLayers, setCrackedEmptyLayers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    document.body.dataset.state = phase === 'title' ? 'title' : 'playing';
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  const handleStartMatch = () => {
    playPop();
    setShuffledSteps(prepareFossilizationSteps());
    setStrataQueue(prepareStrataFossils());
    setNextOrder(1);
    setCompletedSteps([]);
    setFossilIdx(0);
    setFoundByLayer({});
    setCrackedEmptyLayers([]);
    setScore(0);
    setHits(0);
    setAttempts(0);
    setFeedback(null);
    setPhase('stage1');
  };

  const handlePickStep = (stepId: string, order: number) => {
    if (completedSteps.includes(stepId)) return;
    setAttempts((a) => a + 1);

    if (order === nextOrder) {
      playSuccess();
      const updated = [...completedSteps, stepId];
      setCompletedSteps(updated);
      setHits((h) => h + 1);
      setScore((s) => s + 90);
      setFeedback({ ok: true, text: `Etapa ${order}/4 ativada no cenário!` });

      if (order === FOSSILIZATION_STEPS.length) {
        window.setTimeout(() => {
          setFeedback(null);
          setPhase('stage2');
        }, 900);
      } else {
        setNextOrder(order + 1);
      }
    } else {
      playError();
      setFeedback({
        ok: false,
        text: `Ainda não! Observe o cenário acima: o que vem na ${nextOrder}ª etapa?`,
      });
    }
  };

  const currentFossil = strataQueue[fossilIdx];
  const isRevealingCurrent = Boolean(foundByLayer[currentFossil.correctLayer]);

  const handlePickLayer = (layerNum: number) => {
    if (isRevealingCurrent || foundByLayer[layerNum]) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const evaluation = evaluateStrataDig(currentFossil, layerNum);
    if (evaluation.correct) {
      playSuccess();
      const nextHits = hits + 1;
      const nextScore = score + 130;
      setHits(nextHits);
      setScore(nextScore);
      setFoundByLayer((prev) => ({ ...prev, [layerNum]: currentFossil }));
      setCrackedEmptyLayers([]);
      setFeedback({ ok: true, text: evaluation.message });

      window.setTimeout(() => {
        if (fossilIdx + 1 < strataQueue.length) {
          setFossilIdx((i) => i + 1);
          setFeedback(null);
        } else {
          const accuracyPercent = Math.min(100, Math.round((nextHits / nextAttempts) * 100));
          playVictory();
          onComplete({
            stars: scoreToStars(accuracyPercent),
            score: nextScore,
            accuracyPercent,
            summaryLabel: `Você formou o fóssil no cenário e escavou todas as camadas da Terra!`,
          });
        }
      }, 1050);
    } else {
      playError();
      setCrackedEmptyLayers((prev) => (prev.includes(layerNum) ? prev : [...prev, layerNum]));
      setFeedback({ ok: false, text: evaluation.message });
    }
  };

  if (phase === 'title') {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-[#32064A] text-white p-5 sm:p-7 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold text-purple-100 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar
          </button>
          <span className="text-xs font-medium text-purple-200">Mini-Game · Vídeo 03</span>
        </div>

        <FossilHeroBanner />

        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
            Escavação Estratigráfica
          </h2>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
            Acompanhe um fóssil se formar passo a passo no rio pré-histórico e depois escave as
            camadas da Terra para descobrir cada registro na profundidade certa!
          </p>
        </div>

        <button
          type="button"
          data-start="true"
          onClick={handleStartMatch}
          className="w-full min-h-[52px] rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-base inline-flex items-center justify-center gap-2 transition-colors"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          Iniciar Escavação
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
            {phase === 'stage1'
              ? `Fossilização ${completedSteps.length}/4`
              : `Fóssil ${Math.min(fossilIdx + 1, strataQueue.length)}/${strataQueue.length}`}
          </span>
          <span className="text-[#16A34A]">{score} pts</span>
        </div>
      </div>

      {phase === 'stage1' ? (
        <div className="space-y-3.5">
          {/* Interactive Visual Diorama */}
          <FossilizationDiorama completedCount={completedSteps.length} />

          <div className="rounded-2xl bg-[#26043A] text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[#4ADE80] inline-flex items-center gap-1.5">
                <Layers className="w-4 h-4" aria-hidden="true" />
                Etapa 1 de 2 · Monte o Processo
              </p>
              <h2 className="font-display text-lg sm:text-xl font-bold">
                Toque na {nextOrder}ª etapa da fossilização
              </h2>
            </div>
            <div className="flex items-center gap-1 shrink-0" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className={`w-6 h-6 rounded-full text-[11px] font-mono font-bold flex items-center justify-center ${
                    n <= completedSteps.length
                      ? 'bg-[#22C55E] text-[#052E16]'
                      : n === nextOrder
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white/15 text-purple-200'
                  }`}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          {feedback && (
            <div
              role="status"
              className={`rounded-2xl p-3 text-sm font-medium flex items-center gap-2 border ${
                feedback.ok
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                  : 'bg-red-50 text-red-950 border-red-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <div className="space-y-2.5">
            {shuffledSteps.map((step) => {
              const done = completedSteps.includes(step.id);
              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={done}
                  onClick={() => handlePickStep(step.id, step.order)}
                  className={`w-full min-h-[60px] p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all active:scale-[0.99] ${
                    done
                      ? 'bg-emerald-50 border-[#16A34A] text-emerald-950'
                      : 'bg-white border-slate-200 hover:border-[#32064A] text-slate-900'
                  }`}
                >
                  <div>
                    <p className="font-display font-bold text-sm sm:text-base">{step.title}</p>
                    <p className="text-xs opacity-80">{step.detail}</p>
                  </div>
                  {done && (
                    <span className="font-mono text-sm font-extrabold text-[#16A34A] shrink-0">
                      #{step.order}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {/* Target Fossil Specimen Card */}
          <div className="rounded-3xl bg-[#26043A] text-white p-4 sm:p-5 flex items-center gap-4 shadow-sm">
            <FossilSpecimenArtwork
              fossilId={currentFossil.id}
              sizeClass="w-20 h-20 sm:w-24 sm:h-24"
              roundedClass="rounded-2xl"
            />
            <div className="space-y-1 min-w-0">
              <p className="text-xs font-semibold text-[#4ADE80] inline-flex items-center gap-1.5">
                <Pickaxe className="w-4 h-4" aria-hidden="true" />
                Etapa 2 de 2 · Escave a camada correta
              </p>
              <h2 className="font-display text-lg sm:text-xl font-extrabold leading-tight">
                {currentFossil.fossilName}
              </h2>
              <p className="text-xs sm:text-sm text-purple-100 leading-snug">
                {currentFossil.clue}
              </p>
            </div>
          </div>

          {feedback && (
            <div
              role="status"
              className={`rounded-2xl p-3 text-sm font-medium flex items-center gap-2 border ${
                feedback.ok
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                  : 'bg-red-50 text-red-950 border-red-200'
              }`}
            >
              {feedback.ok ? (
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Illustrated Geological Cross-Section (Surface -> Deepest Rock) */}
          <div className="rounded-3xl border border-stone-300 overflow-hidden bg-stone-100 shadow-sm">
            {/* Grass & Surface Banner */}
            <div className="relative bg-gradient-to-b from-sky-100 via-emerald-100 to-emerald-600/25 border-b-4 border-emerald-700 px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-bold text-emerald-950">
              <span>Superfície da Terra (Tempo atual)</span>
              <span className="inline-flex items-center gap-1 text-stone-800 shrink-0">
                <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                Mais fundo = mais antigo
              </span>
            </div>

            {/* 3 Illustrated Rock Strata */}
            <div className="divide-y-2 divide-stone-950/20">
              {LAYER_VISUALS.map((layer) => {
                const discovered = foundByLayer[layer.layer];
                const isCrackedEmpty = crackedEmptyLayers.includes(layer.layer);
                const dark = layer.isDarkSurface;

                return (
                  <button
                    key={layer.layer}
                    type="button"
                    disabled={Boolean(discovered) || isRevealingCurrent}
                    onClick={() => handlePickLayer(layer.layer)}
                    className={`w-full min-h-[92px] px-4 py-3 bg-gradient-to-r ${layer.surfaceGradient} text-left flex items-center justify-between gap-3 transition-transform active:scale-[0.995] disabled:cursor-default relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#22C55E]`}
                  >
                    <StratumTextureOverlay layer={layer.layer} isCrackedEmpty={isCrackedEmpty} />

                    <div className="flex items-center gap-3 min-w-0 relative z-10">
                      <span
                        className={`w-12 py-1.5 rounded-lg font-mono text-[11px] font-extrabold text-center shrink-0 ${
                          dark
                            ? 'bg-white/15 text-stone-100 border border-white/15'
                            : 'bg-stone-900/10 text-stone-900'
                        }`}
                      >
                        {layer.depthTag}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`font-display font-extrabold text-sm sm:text-base ${
                            dark ? 'text-stone-50' : 'text-stone-950'
                          }`}
                        >
                          {layer.title}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            discovered
                              ? dark
                                ? 'text-emerald-300'
                                : 'text-emerald-900'
                              : isCrackedEmpty
                              ? dark
                                ? 'text-red-200'
                                : 'text-red-900'
                              : dark
                              ? 'text-stone-300'
                              : 'text-stone-800'
                          }`}
                        >
                          {discovered
                            ? `Descoberto: ${discovered.fossilName}!`
                            : isCrackedEmpty
                            ? 'Rocha escavada — nada aqui'
                            : layer.ageLabel}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 relative z-10 flex items-center gap-2">
                      {discovered ? (
                        <div className="flex items-center gap-1.5">
                          <Sparkles
                            className={`w-4 h-4 ${dark ? 'text-amber-300' : 'text-amber-700'}`}
                            aria-hidden="true"
                          />
                          <FossilSpecimenArtwork
                            fossilId={discovered.id}
                            sizeClass="w-14 h-14"
                            roundedClass="rounded-xl"
                          />
                        </div>
                      ) : isCrackedEmpty ? (
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            dark
                              ? 'bg-red-950/90 text-red-100 border border-red-400/35'
                              : 'bg-red-900/15 text-red-950'
                          }`}
                        >
                          Vazia
                        </span>
                      ) : (
                        <span
                          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                            dark
                              ? 'bg-white/10 border-white/20 text-stone-100'
                              : 'bg-white/70 border-stone-500/30 text-stone-900'
                          }`}
                        >
                          <Pickaxe className="w-5 h-5" aria-hidden="true" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specimen Discovery Tray */}
          <div className="grid grid-cols-3 gap-2">
            {strataQueue.map((fos, idx) => {
              const found = Boolean(foundByLayer[fos.correctLayer]);
              const isCurrent = idx === fossilIdx;
              const shortLabel =
                fos.id === 'fos-recente'
                  ? 'Mais recente'
                  : fos.id === 'fos-dino'
                  ? 'Dinossauro'
                  : 'Concha antiga';
              return (
                <div
                  key={fos.id}
                  className={`rounded-2xl border p-2.5 flex flex-col items-center text-center gap-1.5 ${
                    found
                      ? 'bg-emerald-50 border-[#16A34A]'
                      : isCurrent
                      ? 'bg-white border-[#32064A]'
                      : 'bg-slate-50 border-slate-200 opacity-65'
                  }`}
                >
                  <div className={found ? '' : isCurrent ? 'opacity-90' : 'grayscale opacity-45'}>
                    <FossilSpecimenArtwork
                      fossilId={fos.id}
                      sizeClass="w-11 h-11"
                      roundedClass="rounded-xl"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    {found ? shortLabel : isCurrent ? 'Escavando' : 'Pendente'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
