import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { TaskResult } from '../../types/biology';
import {
  createChlorophyllPhase1Bag,
  createChlorophyllPhase2Bag,
  evaluateChlorophyllAction,
  hasPhotonReachedChloroplast,
  PhotonAction,
  PhotonColor,
  scoreToStars,
} from '../../utils/gameLogic';
import {
  isSoundMuted,
  playDamage,
  playPop,
  playSuccess,
  playVictory,
  setSoundMuted,
} from '../../utils/sound';

interface ChlorophyllFactoryGameProps {
  onComplete: (result: TaskResult) => void;
  onExit: () => void;
  autoStart?: boolean;
}

type GamePhase = 'title' | 'playing' | 'paused' | 'victory';

interface FallingPhoton {
  active: boolean;
  color: PhotonColor;
  x: number;
  y: number;
  vy: number;
  reflected: boolean;
}

interface BurstParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface FloatingPopup {
  active: boolean;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const TARGET_PHOTONS = 12;
const PHASE2_THRESHOLD = 4;
const PHOTON_RADIUS = 20;

const PHOTON_HEX: Record<PhotonColor, string> = {
  blue: '#38BDF8',
  red: '#F43F5E',
  violet: '#A855F7',
  green: '#22C55E',
};

const PHOTON_LABEL: Record<PhotonColor, string> = {
  blue: 'AZUL',
  red: 'VERMELHO',
  violet: 'VIOLETA',
  green: 'VERDE',
};

export function ChlorophyllFactoryGame({
  onComplete,
  onExit,
  autoStart = false,
}: ChlorophyllFactoryGameProps) {
  const [phase, setPhase] = useState<GamePhase>(autoStart ? 'playing' : 'title');
  const [activeMode, setActiveMode] = useState<PhotonAction | null>(null);
  const [hud, setHud] = useState({
    score: 0,
    processed: 0,
    correctActions: 0,
    glucose: 0,
    reachedPhase2: false,
    feedback: 'Toque em Absorver ou Refletir para preparar o cloroplasto!',
  });
  const [muted, setMuted] = useState(isSoundMuted());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const victoryTimeoutRef = useRef<number | null>(null);
  const phaseRef = useRef<GamePhase>(phase);
  phaseRef.current = phase;

  const simRef = useRef({
    width: 560,
    height: 360,
    score: 0,
    processed: 0,
    correctActions: 0,
    glucose: 0,
    reachedFourPoints: false,
    photonQueue: [] as PhotonColor[],
    chloroplastMode: null as PhotonAction | null,
    spawnCooldown: 0.2,
    impactFlashLife: 0,
    impactFlashColor: '#4ADE80',
    photons: Array.from({ length: 8 }, (): FallingPhoton => ({
      active: false,
      color: 'blue',
      x: 0,
      y: 0,
      vy: 175,
      reflected: false,
    })),
    particles: Array.from({ length: 48 }, (): BurstParticle => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0.4,
      color: '#22C55E',
    })),
    popups: Array.from({ length: 6 }, (): FloatingPopup => ({
      active: false,
      x: 0,
      y: 0,
      text: '',
      color: '#FFFFFF',
      life: 0,
    })),
  });

  const spawnBurst = (x: number, y: number, color: string) => {
    const pool = simRef.current.particles;
    let count = 0;
    for (let i = 0; i < pool.length && count < 16; i++) {
      if (!pool[i].active) {
        const ang = (Math.PI * 2 * count) / 16;
        const spd = 85 + Math.random() * 110;
        pool[i].active = true;
        pool[i].x = x;
        pool[i].y = y;
        pool[i].vx = Math.cos(ang) * spd;
        pool[i].vy = Math.sin(ang) * spd;
        pool[i].life = 0.36;
        pool[i].maxLife = 0.36;
        pool[i].color = color;
        count++;
      }
    }
  };

  const spawnPopup = (x: number, y: number, text: string, color: string) => {
    const slot = simRef.current.popups.find((p) => !p.active);
    if (!slot) return;
    slot.active = true;
    slot.x = x;
    slot.y = y - 12;
    slot.text = text;
    slot.color = color;
    slot.life = 0.65;
  };

  const spawnNextPhoton = () => {
    const s = simRef.current;
    const slot = s.photons.find((p) => !p.active);
    if (!slot) return;
    if (s.photonQueue.length === 0) {
      s.photonQueue = s.reachedFourPoints
        ? createChlorophyllPhase2Bag()
        : createChlorophyllPhase1Bag();
    }
    const color = s.photonQueue.shift() ?? 'green';
    slot.active = true;
    slot.color = color;
    slot.x = s.width * (0.24 + Math.random() * 0.52);
    slot.y = -PHOTON_RADIUS;
    slot.vy = s.reachedFourPoints
      ? Math.min(255, 205 + Math.max(0, s.score - PHASE2_THRESHOLD) * 5)
      : Math.min(200, 172 + s.score * 6);
    slot.reflected = false;
  };

  const resetGame = useCallback((nextPhase: GamePhase) => {
    if (victoryTimeoutRef.current !== null) {
      window.clearTimeout(victoryTimeoutRef.current);
      victoryTimeoutRef.current = null;
    }
    const s = simRef.current;
    s.score = 0;
    s.processed = 0;
    s.correctActions = 0;
    s.glucose = 0;
    s.reachedFourPoints = false;
    s.photonQueue = [];
    s.chloroplastMode = null;
    s.spawnCooldown = 0.2;
    s.impactFlashLife = 0;
    for (const p of s.photons) p.active = false;
    for (const pt of s.particles) pt.active = false;
    for (const pop of s.popups) pop.active = false;
    setActiveMode(null);
    setHud({
      score: 0,
      processed: 0,
      correctActions: 0,
      glucose: 0,
      reachedPhase2: false,
      feedback: 'Toque em Absorver ou Refletir para preparar o cloroplasto!',
    });
    setPhase(nextPhase);
  }, []);

  const startGame = useCallback(() => {
    playPop();
    resetGame('playing');
  }, [resetGame]);

  const handleSelectMode = useCallback((action: PhotonAction) => {
    if (phaseRef.current !== 'playing') return;
    playPop();
    simRef.current.chloroplastMode = action;
    setActiveMode(action);
  }, []);

  useEffect(() => {
    return () => {
      if (victoryTimeoutRef.current !== null) {
        window.clearTimeout(victoryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    document.body.dataset.state = phase === 'victory' ? 'gameover' : phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (phaseRef.current === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startGame();
        return;
      }
      if (k === 'p' || e.key === 'Escape') {
        if (phaseRef.current === 'playing') setPhase('paused');
        else if (phaseRef.current === 'paused') setPhase('playing');
        return;
      }
      if (k === 'r' && (phaseRef.current === 'playing' || phaseRef.current === 'paused')) {
        startGame();
        return;
      }
      if (phaseRef.current === 'playing') {
        if (k === 'a' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleSelectMode('absorb');
        } else if (k === 'd' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleSelectMode('reflect');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [startGame, handleSelectMode]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(290, Math.floor(rect.width));
      const h = Math.max(260, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      simRef.current.width = w;
      simRef.current.height = h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let rafId = 0;
    let last = performance.now();

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const s = simRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      for (const pt of s.particles) {
        if (!pt.active) continue;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) pt.active = false;
      }

      for (const pop of s.popups) {
        if (!pop.active) continue;
        pop.y -= 36 * dt;
        pop.life -= dt;
        if (pop.life <= 0) pop.active = false;
      }

      if (s.impactFlashLife > 0) {
        s.impactFlashLife = Math.max(0, s.impactFlashLife - dt);
      }

      const leafTop = s.height - 76;

      if (phaseRef.current === 'playing') {
        // Keep one falling photon at a time with brisk pacing until reaching 12 points
        const fallingCount = s.photons.filter((p) => p.active && !p.reflected).length;
        s.spawnCooldown -= dt;
        if (fallingCount === 0 && s.spawnCooldown <= 0 && s.score < TARGET_PHOTONS) {
          spawnNextPhoton();
          s.spawnCooldown = 0.18;
        }

        for (const p of s.photons) {
          if (!p.active) continue;
          p.y += p.vy * dt;

          if (p.reflected) {
            if (p.y < -32) {
              p.active = false;
            }
            continue;
          }

          // Only resolve absorption or reflection when the photon physically reaches the chloroplast
          if (hasPhotonReachedChloroplast(p.y, PHOTON_RADIUS, leafTop)) {
            s.processed += 1;
            s.spawnCooldown = 0.18;

            let feedbackText = '';
            if (s.chloroplastMode === null) {
              p.active = false;
              s.score = Math.max(0, s.score - 1);
              s.glucose = Math.min(100, Math.round((s.score / TARGET_PHOTONS) * 100));
              s.impactFlashLife = 0.22;
              s.impactFlashColor = '#EF4444';
              playDamage();
              spawnBurst(p.x, leafTop, '#F59E0B');
              spawnPopup(p.x, leafTop, '-1 pt', '#FCA5A5');
              feedbackText =
                'Escolha Absorver ou Refletir antes do fóton chegar ao cloroplasto! (-1 pt)';
            } else {
              const evalRes = evaluateChlorophyllAction(p.color, s.chloroplastMode);
              feedbackText = evalRes.label;

              if (evalRes.correct) {
                playSuccess();
                s.correctActions += 1;
                s.impactFlashLife = 0.22;
                s.impactFlashColor = PHOTON_HEX[p.color];
                spawnBurst(p.x, leafTop, PHOTON_HEX[p.color]);

                if (s.chloroplastMode === 'reflect') {
                  // Reflecting green yields 0 points and 0 ATP
                  p.reflected = true;
                  p.y = leafTop - PHOTON_RADIUS - 2;
                  p.vy = -340;
                  spawnPopup(p.x, leafTop, 'REFLETIDO', '#86EFAC');
                } else {
                  s.score = Math.max(0, s.score + evalRes.points);
                  s.glucose = Math.min(100, Math.round((s.score / TARGET_PHOTONS) * 100));
                  p.active = false;
                  spawnPopup(p.x, leafTop, '+1 pt', '#4ADE80');

                  if (!s.reachedFourPoints && s.score >= PHASE2_THRESHOLD) {
                    s.reachedFourPoints = true;
                    // Flush remaining 2:1 bag so the next photon immediately uses the 3:1 Phase 2 ratio
                    s.photonQueue = [];
                    feedbackText =
                      '4 pontos! Ritmo acelerado — agora vêm mais fótons de energia!';
                  }
                }
              } else {
                playDamage();
                p.active = false;
                s.score = Math.max(0, s.score + evalRes.points);
                s.glucose = Math.min(100, Math.round((s.score / TARGET_PHOTONS) * 100));
                s.impactFlashLife = 0.22;
                s.impactFlashColor = '#EF4444';
                spawnBurst(p.x, leafTop, '#EF4444');
                spawnPopup(p.x, leafTop, '-1 pt', '#FCA5A5');
              }
            }

            setHud({
              score: s.score,
              processed: s.processed,
              correctActions: s.correctActions,
              glucose: s.glucose,
              reachedPhase2: s.reachedFourPoints,
              feedback: feedbackText,
            });

            if (s.score >= TARGET_PHOTONS && victoryTimeoutRef.current === null) {
              victoryTimeoutRef.current = window.setTimeout(() => {
                victoryTimeoutRef.current = null;
                if (phaseRef.current === 'playing') {
                  playVictory();
                  setPhase('victory');
                }
              }, 380);
            }
          }
        }
      }

      const dpr = canvas.width / Math.max(1, s.width);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Sky-to-leaf gradient
      const bg = ctx.createLinearGradient(0, 0, 0, s.height);
      bg.addColorStop(0, '#0F172A');
      bg.addColorStop(1, '#064E3B');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, s.width, s.height);

      // Chloroplast target zone at bottom reflecting the currently armed mode
      const mode = s.chloroplastMode;
      ctx.fillStyle =
        mode === 'absorb' ? '#2E1065' : mode === 'reflect' ? '#16A34A' : '#14532D';
      ctx.beginPath();
      ctx.roundRect(16, leafTop, s.width - 32, 60, 22);
      ctx.fill();

      if (s.impactFlashLife > 0) {
        ctx.save();
        ctx.globalAlpha = (s.impactFlashLife / 0.22) * 0.45;
        ctx.fillStyle = s.impactFlashColor;
        ctx.beginPath();
        ctx.roundRect(16, leafTop, s.width - 32, 60, 22);
        ctx.fill();
        ctx.restore();
      }

      ctx.strokeStyle =
        mode === 'absorb' ? '#A855F7' : mode === 'reflect' ? '#86EFAC' : '#4ADE80';
      ctx.lineWidth = mode ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = '#F0FDF4';
      ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      const chloroplastText =
        mode === 'absorb'
          ? 'CLOROPLASTO · MODO: ABSORVER LUZ'
          : mode === 'reflect'
          ? 'CLOROPLASTO · MODO: REFLETIR VERDE'
          : 'CLOROPLASTO · ESCOLHA UM MODO ABAIXO';
      ctx.fillText(chloroplastText, s.width / 2, leafTop + 35);

      // Draw photons with dynamic speed trail
      for (const p of s.photons) {
        if (!p.active) continue;
        ctx.save();
        ctx.translate(p.x, p.y);

        // Motion trail behind photon
        const trailLen = p.reflected ? 34 : 44;
        const trailDir = p.reflected ? 1 : -1;
        const trailGrad = ctx.createLinearGradient(0, 0, 0, trailDir * trailLen);
        trailGrad.addColorStop(0, `${PHOTON_HEX[p.color]}99`);
        trailGrad.addColorStop(1, `${PHOTON_HEX[p.color]}00`);
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, trailDir * trailLen);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PHOTON_HEX[p.color];
        ctx.beginPath();
        ctx.arc(0, 0, PHOTON_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = '800 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(PHOTON_LABEL[p.color], 0, 34);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(PHOTON_LABEL[p.color], 0, 33);
        ctx.restore();
      }

      // Draw particles
      for (const pt of s.particles) {
        if (!pt.active) continue;
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Draw floating +1 / -1 / REFLETIDO popups
      for (const pop of s.popups) {
        if (!pop.active) continue;
        ctx.save();
        ctx.globalAlpha = Math.min(1, pop.life / 0.3);
        ctx.font = '800 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(pop.text, pop.x + 1, pop.y + 1);
        ctx.fillStyle = pop.color;
        ctx.fillText(pop.text, pop.x, pop.y);
        ctx.restore();
      }

      ctx.restore();
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleFinish = () => {
    const accuracyPercent = Math.min(
      100,
      Math.round((hud.correctActions / Math.max(1, hud.processed)) * 100)
    );
    onComplete({
      stars: scoreToStars(accuracyPercent),
      score: hud.score,
      accuracyPercent,
      summaryLabel: `Você completou os ${TARGET_PHOTONS} pontos absorvendo luz útil para a fotossíntese!`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExit}
          className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              const next = !muted;
              setSoundMuted(next);
              setMuted(next);
            }}
            aria-label={muted ? 'Ativar som' : 'Silenciar som'}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {phase === 'playing' && (
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                setPhase('paused');
              }}
              aria-label="Pausar"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canvas Stage */}
      <div
        ref={containerRef}
        data-chloroplast-mode={activeMode ?? 'none'}
        className="relative w-full h-[320px] sm:h-[360px] rounded-3xl overflow-hidden border border-emerald-900/40 bg-[#0F172A] shadow-sm"
      >
        <canvas ref={canvasRef} data-testid="chlorophyll-canvas" className="w-full h-full block" />

        {phase === 'playing' && (
          <div className="pointer-events-none absolute inset-x-0 top-0 p-3 flex items-center justify-between text-white">
            <div className="bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 tabular-nums">
              <span className="text-xs text-slate-300">Pontos </span>
              <span className="font-bold text-[#4ADE80]">
                {hud.score}/{TARGET_PHOTONS}
              </span>
              {hud.reachedPhase2 && (
                <span className="ml-2 text-[11px] font-bold text-amber-300">· TURBO</span>
              )}
            </div>
            <div className="bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold tabular-nums text-sky-300">
              ATP: {hud.glucose}%
            </div>
          </div>
        )}

        {phase === 'title' && (
          <div className="absolute inset-0 bg-[#0B1120]/90 flex items-center justify-center p-5 text-center text-white">
            <div className="max-w-md space-y-4">
              <p className="text-xs font-semibold text-[#4ADE80]">Mini-Game · Vídeo 02</p>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
                Fábrica de Clorofila
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Alcance <strong>12 pontos</strong>! Só <strong>Absorver</strong> (+1 pt) soma
                pontos e energia; <strong>Refletir o Verde</strong> não dá ganhos, mas evita perder{' '}
                <strong>1 ponto</strong>. Ao chegar em 4 pontos, o ritmo acelera!
              </p>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="w-full min-h-[48px] rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-base inline-flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                Ligar Cloroplasto
              </button>
            </div>
          </div>
        )}

        {phase === 'paused' && (
          <div className="absolute inset-0 bg-[#0B1120]/90 flex items-center justify-center p-5 text-center text-white">
            <div className="max-w-xs w-full space-y-3">
              <h3 className="font-display text-2xl font-bold">Jogo Pausado</h3>
              <button
                type="button"
                onClick={() => setPhase('playing')}
                className="w-full min-h-[46px] rounded-xl bg-[#22C55E] text-[#052E16] font-bold text-sm"
              >
                Retomar
              </button>
              <button
                type="button"
                onClick={startGame}
                className="w-full min-h-[46px] rounded-xl bg-white/10 text-white font-semibold text-sm inline-flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {phase === 'victory' && (
          <div className="absolute inset-0 bg-[#0B1120]/92 flex items-center justify-center p-5 text-center text-white">
            <div className="max-w-sm w-full space-y-4">
              <p className="text-xs font-bold text-[#4ADE80]">Espectro Dominado!</p>
              <h3 className="font-display text-2xl font-extrabold">Fotossíntese Completa</h3>
              <p className="text-sm text-slate-200 tabular-nums">
                {hud.score}/{TARGET_PHOTONS} pontos · {hud.correctActions} acertos
              </p>
              <button
                type="button"
                data-start="true"
                onClick={handleFinish}
                className="w-full min-h-[48px] rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-sm"
              >
                Resgatar Recompensa
              </button>
            </div>
          </div>
        )}
      </div>

      {phase === 'playing' && (
        <p role="status" className="text-xs sm:text-sm font-medium text-center text-slate-700">
          {hud.feedback}
        </p>
      )}

      {/* Thumb-Zone Chloroplast Mode Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={phase !== 'playing'}
          aria-pressed={activeMode === 'absorb'}
          onClick={() => handleSelectMode('absorb')}
          className={`min-h-[72px] rounded-2xl p-3 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-all disabled:opacity-50 ${
            activeMode === 'absorb'
              ? 'bg-[#32064A] text-white border-2 border-[#C084FC] ring-4 ring-purple-300/70 shadow-lg'
              : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-300'
          }`}
        >
          <span className="font-display font-bold text-base inline-flex items-center gap-1.5">
            {activeMode === 'absorb' ? (
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" aria-hidden="true" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#32064A]" aria-hidden="true" />
            )}
            Absorver Luz
          </span>
          <span
            className={`text-[11px] font-semibold ${
              activeMode === 'absorb' ? 'text-[#E9D5FF]' : 'text-slate-500'
            }`}
          >
            {activeMode === 'absorb' ? 'ATIVADO' : 'Azul · Vermelho · Violeta'}
          </span>
        </button>

        <button
          type="button"
          disabled={phase !== 'playing'}
          aria-pressed={activeMode === 'reflect'}
          onClick={() => handleSelectMode('reflect')}
          className={`min-h-[72px] rounded-2xl p-3 flex flex-col items-center justify-center gap-1 active:scale-[0.97] transition-all disabled:opacity-50 ${
            activeMode === 'reflect'
              ? 'bg-[#16A34A] text-white border-2 border-[#86EFAC] ring-4 ring-emerald-300/75 shadow-lg'
              : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <span className="font-display font-bold text-base inline-flex items-center gap-1.5">
            {activeMode === 'reflect' ? (
              <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4 text-[#16A34A]" aria-hidden="true" />
            )}
            Refletir Verde
          </span>
          <span
            className={`text-[11px] font-semibold ${
              activeMode === 'reflect' ? 'text-emerald-50' : 'text-slate-500'
            }`}
          >
            {activeMode === 'reflect' ? 'ATIVADO' : 'Dá a cor às folhas'}
          </span>
        </button>
      </div>
    </div>
  );
}
