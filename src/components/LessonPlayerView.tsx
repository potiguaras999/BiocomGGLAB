import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Gamepad2,
  Link2,
  Youtube,
} from 'lucide-react';
import { BiologyModule } from '../types/biology';
import { extractYouTubeId } from '../utils/progression';

interface LessonPlayerViewProps {
  module: BiologyModule;
  customVideoUrl: string;
  isWatched: boolean;
  isCompleted: boolean;
  onBack: () => void;
  onMarkWatched: (moduleId: string) => void;
  onStartTask: (moduleId: string) => void;
  onSaveVideoUrl: (moduleId: string, url: string) => void;
}

export function LessonPlayerView({
  module,
  customVideoUrl,
  isWatched,
  isCompleted,
  onBack,
  onMarkWatched,
  onStartTask,
  onSaveVideoUrl,
}: LessonPlayerViewProps) {
  const activeUrl = customVideoUrl || module.defaultYoutubeUrl;
  const youtubeId = extractYouTubeId(activeUrl);

  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [draftUrl, setDraftUrl] = useState(activeUrl);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    setDraftUrl(customVideoUrl || module.defaultYoutubeUrl);
    setUrlError(null);
  }, [module.id, customVideoUrl, module.defaultYoutubeUrl]);

  // Listen for YouTube embed postMessage "ended" event (playerState === 0)
  useEffect(() => {
    if (!youtubeId) return;
    const onMessage = (event: MessageEvent) => {
      if (typeof event.origin !== 'string' || !event.origin.includes('youtube')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'infoDelivery' && data?.info?.playerState === 0) {
          onMarkWatched(module.id);
        }
      } catch {
        // Ignore unrelated postMessages
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [youtubeId, module.id, onMarkWatched]);

  const taskUnlocked = isWatched || isCompleted;

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftUrl.trim();
    if (!trimmed) {
      onSaveVideoUrl(module.id, '');
      setUrlError(null);
      setShowLinkEditor(false);
      return;
    }
    const parsed = extractYouTubeId(trimmed);
    if (!parsed) {
      setUrlError('Link inválido. Cole uma URL do YouTube (ex: youtube.com/shorts/... ou youtu.be/...).');
      return;
    }
    onSaveVideoUrl(module.id, trimmed);
    setUrlError(null);
    setShowLinkEditor(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-3 -ml-3 rounded-xl inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar à Trilha
        </button>

        <span className="text-xs font-medium text-slate-500">
          Módulo 0{module.order} · {module.area}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Top Column: Vertical 9:16 In-App YouTube Shorts Player + Gate */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl bg-[#26043A] p-3 sm:p-4 flex justify-center shadow-sm">
            {youtubeId ? (
              <div className="w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden bg-black">
                <iframe
                  title={`Videoaula GGLAB: ${module.title}`}
                  src={`https://www.youtube.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full max-w-[320px] aspect-[9/16] rounded-2xl bg-[#32064A] text-white p-6 flex flex-col justify-center items-center text-center gap-3">
                <Youtube className="w-10 h-10 text-red-400" aria-hidden="true" />
                <p className="font-display font-bold text-lg">{module.title}</p>
                <p className="text-xs text-purple-200">Adicione um link do YouTube abaixo para reproduzir aqui.</p>
              </div>
            )}
          </div>

          {/* Action Bar: Watch Gate + Task Launcher */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900">
                  {taskUnlocked
                    ? 'Aula concluída — mini-game liberado!'
                    : 'Assista ao vídeo acima para liberar o desafio'}
                </p>
                <p className="text-xs text-slate-500">
                  {module.taskTitle} · +{module.baseXp} XP · +{module.baseCoins} BioCoins
                </p>
              </div>

              {!taskUnlocked ? (
                <button
                  type="button"
                  onClick={() => onMarkWatched(module.id)}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#32064A] hover:bg-[#460B66] text-white text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Concluir Vídeo (+20 XP)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onStartTask(module.id)}
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-sm font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors active:scale-[0.98]"
                >
                  <Gamepad2 className="w-4 h-4" aria-hidden="true" />
                  {isCompleted ? 'Jogar Novamente' : 'Iniciar Mini-Game'}
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                aria-expanded={showLinkEditor}
                onClick={() => setShowLinkEditor((v) => !v)}
                className="min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#32064A]"
              >
                <Youtube className="w-4 h-4 text-red-600" aria-hidden="true" />
                Trocar link do YouTube desta aula
              </button>

              {showLinkEditor && (
                <form onSubmit={handleSaveLink} className="mt-3 space-y-2.5">
                  <label htmlFor="yt-link-input" className="block text-xs font-medium text-slate-700">
                    URL do YouTube ou Short
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Link2
                        className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        id="yt-link-input"
                        type="text"
                        value={draftUrl}
                        onChange={(e) => setDraftUrl(e.target.value)}
                        placeholder="https://www.youtube.com/shorts/..."
                        className="w-full min-h-[44px] pl-9 pr-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-2 focus:outline-[#32064A]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                    >
                      Salvar Vídeo
                    </button>
                  </div>
                  {urlError && <p className="text-xs font-medium text-red-600">{urlError}</p>}
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right/Bottom Column: Lesson Summary & Key Concepts */}
        <aside className="lg:col-span-6 rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#16A34A]">Videoaula GGLAB · {module.durationLabel}</p>
            <h1 className="font-display text-2xl font-bold text-slate-900">{module.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed">{module.summary}</p>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Pontos-chave para o desafio</h2>
            <ul className="space-y-2.5">
              {module.keyConcepts.map((concept, index) => (
                <li
                  key={concept}
                  className="flex items-start gap-3 text-sm text-slate-700 leading-snug"
                >
                  <span className="font-mono text-xs font-bold text-[#16A34A] mt-0.5 shrink-0">
                    0{index + 1}.
                  </span>
                  <span>{concept}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
