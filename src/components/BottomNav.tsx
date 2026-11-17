import { Award, Compass, Gamepad2, TrendingUp } from 'lucide-react';
import { AppTab } from '../types/biology';

interface BottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

const TABS: {
  id: AppTab;
  label: string;
  Icon: typeof Compass;
}[] = [
  { id: 'trilha', label: 'Trilha', Icon: Compass },
  { id: 'games', label: 'Mini-Games', Icon: Gamepad2 },
  { id: 'recompensas', label: 'Recompensas', Icon: Award },
  { id: 'progresso', label: 'Progresso', Icon: TrendingUp },
];

export function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegação inferior"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe"
    >
      <div className="grid grid-cols-4 h-16 items-center max-w-lg mx-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-h-[44px] h-full flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? 'text-[#32064A]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon
                className={`w-[22px] h-[22px] transition-transform ${
                  isActive ? 'text-[#16A34A] scale-105' : ''
                }`}
                strokeWidth={isActive ? 2.4 : 2}
                aria-hidden="true"
              />
              <span className="text-[11px] font-semibold tracking-tight whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
