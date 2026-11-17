import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Play, XCircle } from 'lucide-react';
import { TaskResult } from '../../types/biology';
import { HOMOLOGY_QUESTIONS, scoreToStars } from '../../utils/gameLogic';
import { playError, playPop, playSuccess, playVictory } from '../../utils/sound';

interface HomologyLabGameProps {
  onComplete: (result: TaskResult) => void;
  onExit: () => void;
  autoStart?: boolean;
}

export function HomologyLabGame({
  onComplete,
  onExit,
  autoStart = false,
}: HomologyLabGameProps) {
  const [phase, setPhase] = useState<'title' | 'playing'>(autoStart ? 'playing' : 'title');
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<'comum' | 'diferente' | null>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);

  const current = HOMOLOGY_QUESTIONS[qIdx];
  const hasAnswered = selected !== null;
  const isCorrect = selected === current.correctType;

  useEffect(() => {
    document.body.dataset.state = phase;
    return () => {
      delete document.body.dataset.state;
    };
  }, [phase]);

  const handleChoose = (choice: 'comum' | 'diferente') => {
    if (hasAnswered) return;
    setSelected(choice);
    if (choice === current.correctType) {
      playSuccess();
      setHits((h) => h + 1);
      setScore((s) => s + 125);
    } else {
      playError();
    }
  };

  const handleNext = () => {
    playPop();
    if (qIdx + 1 < HOMOLOGY_QUESTIONS.length) {
      setQIdx((i) => i + 1);
      setSelected(null);
    } else {
      const accuracyPercent = Math.round((hits / HOMOLOGY_QUESTIONS.length) * 100);
      playVictory();
      onComplete({
        stars: scoreToStars(accuracyPercent),
        score,
        accuracyPercent,
        summaryLabel: `Você acertou ${hits} de ${HOMOLOGY_QUESTIONS.length} comparações de anatomia!`,
      });
    }
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
          <span className="text-xs font-medium text-purple-200">Mini-Game · Vídeo 05</span>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold">
            Morcego, Baleia e Você
          </h2>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
            Compare o braço humano, a asa de morcego e a nadadeira de baleia nos raios X e descubra
            a origem deles.
          </p>
        </div>

        <button
          type="button"
          data-start="true"
          onClick={() => {
            playPop();
            setPhase('playing');
          }}
          className="w-full min-h-[52px] rounded-xl bg-[#22C55E] hover:bg-[#16A34A] text-[#052E16] font-extrabold text-base inline-flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" aria-hidden="true" />
          Abrir Raio-X Comparativo
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
            Análise {qIdx + 1}/{HOMOLOGY_QUESTIONS.length}
          </span>
          <span className="text-[#16A34A]">{score} pts</span>
        </div>
      </div>

      {/* Comparative Bone X-Ray Diagram */}
      {(() => {
        const isHumanVsBat = current.id === 'hom-1';
        const isHumanVsWhale = current.id === 'hom-2';
        const isBatVsInsect = current.id === 'hom-3';

        return (
          <div
            className={`rounded-3xl text-white p-2.5 sm:p-3.5 space-y-2.5 w-full ${
              isHumanVsBat || isHumanVsWhale ? 'sm:max-w-[460px] sm:mx-auto' : ''
            } ${isBatVsInsect ? 'bg-[#1D1033]' : 'bg-[#1C1E38]'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1.5 pt-0.5">
              <span className="font-semibold text-purple-200">
                {isBatVsInsect
                  ? 'Comparação: Morcego × Inseto'
                  : isHumanVsBat
                  ? 'Comparação: Humano × Morcego'
                  : isHumanVsWhale
                  ? 'Comparação: Humano × Baleia'
                  : 'Raio-X Ósseo Comparado'}
              </span>
              {!isBatVsInsect ? (
                <span className="text-slate-300">
                  <span className="text-amber-400 font-bold">Braço</span> ·{' '}
                  <span className="text-sky-400 font-bold">Antebraço</span> ·{' '}
                  <span className="text-emerald-400 font-bold">Dedos</span>
                </span>
              ) : (
                <span className="text-slate-300">Estrutura interna × externa</span>
              )}
            </div>

            {isHumanVsWhale ? (
              <div className="grid grid-cols-2 gap-1.5 w-full">
                <div className="relative aspect-[16/27] w-full overflow-hidden rounded-2xl bg-[#1D1F3A]">
                  <img
                    src="/assets/aistudio/Gemini_Generated_Image_hve4xvhve4xvhve4_3d75c1c3.jpg"
                    alt="Esquema dos ossos do braço humano (Pegar)"
                    className="absolute inset-y-0 left-0 h-full w-[300%] max-w-none"
                  />
                </div>
                <div className="relative aspect-[16/27] w-full overflow-hidden rounded-2xl bg-[#1D1F3A]">
                  <img
                    src="/assets/aistudio/Gemini_Generated_Image_hve4xvhve4xvhve4_3d75c1c3.jpg"
                    alt="Esquema dos ossos da nadadeira da baleia (Nadar)"
                    className="absolute inset-y-0 right-0 h-full w-[300%] max-w-none"
                  />
                </div>
              </div>
            ) : (
              <div
                className={`rounded-2xl overflow-hidden w-full ${
                  isBatVsInsect ? 'bg-[#1D1033] aspect-[16/7]' : 'bg-[#1D1F3A]'
                }`}
              >
                <img
                  src={
                    isBatVsInsect
                      ? '/src/assets/images/regenerated_image_1794919547913.png'
                      : isHumanVsBat
                      ? '/assets/aistudio/Gemini_Generated_Image_hve4xvhve4xvhve4_112_3ee319b1.jpg'
                      : '/assets/aistudio/Gemini_Generated_Image_hve4xvhve4xvhve4_3d75c1c3.jpg'
                  }
                  alt={
                    isBatVsInsect
                      ? 'Esquema comparativo de órgãos análogos: asa do morcego (Voar) e asa da borboleta (Voar)'
                      : isHumanVsBat
                      ? 'Esquema comparativo dos ossos: Humano (Pegar) e Morcego (Voar)'
                      : 'Esquema comparativo dos ossos do membro anterior: Humano (Pegar), Morcego (Voar) e Baleia (Nadar)'
                  }
                  className={
                    isBatVsInsect ? 'w-full h-full object-cover object-bottom block' : 'w-full h-auto block'
                  }
                />
              </div>
            )}
          </div>
        );
      })()}

      {/* Question Card */}
      <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-slate-900">{current.pairTitle}</h2>
          <p className="text-sm text-slate-600">{current.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={hasAnswered}
            onClick={() => handleChoose('comum')}
            className={`min-h-[56px] p-4 rounded-2xl border flex items-center justify-center text-center transition-colors ${
              hasAnswered && current.correctType === 'comum'
                ? 'bg-emerald-50 border-[#16A34A] text-emerald-950'
                : hasAnswered && selected === 'comum'
                ? 'bg-red-50 border-red-500 text-red-950'
                : 'bg-white border-slate-200 hover:border-[#32064A] text-slate-900'
            }`}
          >
            <p className="font-display font-bold text-base">Mesma origem</p>
          </button>

          <button
            type="button"
            disabled={hasAnswered}
            onClick={() => handleChoose('diferente')}
            className={`min-h-[56px] p-4 rounded-2xl border flex items-center justify-center text-center transition-colors ${
              hasAnswered && current.correctType === 'diferente'
                ? 'bg-emerald-50 border-[#16A34A] text-emerald-950'
                : hasAnswered && selected === 'diferente'
                ? 'bg-red-50 border-red-500 text-red-950'
                : 'bg-white border-slate-200 hover:border-[#32064A] text-slate-900'
            }`}
          >
            <p className="font-display font-bold text-base">Origens diferentes</p>
          </button>
        </div>

        {hasAnswered && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div
              className={`rounded-xl p-3.5 text-sm flex items-start gap-2.5 border ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                  : 'bg-amber-50 text-amber-950 border-amber-200'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <p>{isCorrect ? current.explanation : current.wrongExplanation}</p>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full min-h-[48px] rounded-xl bg-[#32064A] hover:bg-[#460B66] text-white font-bold text-sm"
            >
              {qIdx + 1 < HOMOLOGY_QUESTIONS.length ? 'Próxima Comparação' : 'Ver Resultado Final'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
