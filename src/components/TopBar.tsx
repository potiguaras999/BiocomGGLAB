import { Coins, Volume2, VolumeX } from 'lucide-react';
import { AppTab } from '../types/biology';

interface TopBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  xp: number;
  bioCoins: number;
  muted: boolean;
  onToggleMute: () => void;
}

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'trilha', label: 'Trilha' },
  { id: 'games', label: 'Mini-Games' },
  { id: 'recompensas', label: 'Recompensas' },
  { id: 'progresso', label: 'Progresso' },
];

export function TopBar({
  activeTab,
  onSelectTab,
  xp,
  bioCoins,
  muted,
  onToggleMute,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-[52px] bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4 md:gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('trilha')}
          className="flex items-center gap-2.5 min-h-[44px] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#32064A] rounded-lg"
          aria-label="Ir para o início da trilha GGLAB"
        >
          <img
            src="/assets/aistudio/esse_1__54f04e1b.png"
            alt="Logo GGLAB"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-lg object-cover bg-[#32064A]"
          />
          <span className="font-display font-extrabold text-lg tracking-tight text-[#2B0740]">
            GGLAB
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[44px] px-1 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[#16A34A] text-[#1A1625]'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold tabular-nums whitespace-nowrap">
            <span className="text-[#32064A]" aria-label={`${xp} pontos de experiência`}>
              {xp} XP
            </span>
            <span className="text-slate-400" aria-hidden="true">
              ·
            </span>
            <span
              className="inline-flex items-center gap-1 text-amber-700"
              aria-label={`${bioCoins} BioCoins`}
            >
              <Coins className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
              {bioCoins}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Ativar sons do aplicativo' : 'Silenciar sons do aplicativo'}
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {muted ? (
              <VolumeX className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Volume2 className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
