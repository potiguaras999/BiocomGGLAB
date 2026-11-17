import { useState } from 'react';
import {
  Award,
  Check,
  Coins,
  Crown,
  Dna,
  FlaskConical,
  Leaf,
  Microscope,
  Rocket,
  Shield,
  Star,
  Trophy,
} from 'lucide-react';
import { AchievementDef, RewardItem, StudentProgress } from '../types/biology';

interface RewardsViewProps {
  progress: StudentProgress;
  storeItems: RewardItem[];
  achievements: AchievementDef[];
  onPurchaseOrEquip: (item: RewardItem) => { ok: boolean; reason?: string };
}

function RewardIcon({ iconKey, className }: { iconKey: RewardItem['iconKey']; className?: string }) {
  switch (iconKey) {
    case 'microscope':
      return <Microscope className={className} aria-hidden="true" />;
    case 'dna':
      return <Dna className={className} aria-hidden="true" />;
    case 'flask':
      return <FlaskConical className={className} aria-hidden="true" />;
    case 'shield':
      return <Shield className={className} aria-hidden="true" />;
    case 'leaf':
      return <Leaf className={className} aria-hidden="true" />;
    case 'crown':
      return <Crown className={className} aria-hidden="true" />;
  }
}

function AchievementIcon({
  iconKey,
  className,
}: {
  iconKey: AchievementDef['iconKey'];
  className?: string;
}) {
  switch (iconKey) {
    case 'rocket':
      return <Rocket className={className} aria-hidden="true" />;
    case 'dna':
      return <Dna className={className} aria-hidden="true" />;
    case 'shield':
      return <Shield className={className} aria-hidden="true" />;
    case 'star':
      return <Star className={className} aria-hidden="true" />;
    case 'trophy':
      return <Trophy className={className} aria-hidden="true" />;
  }
}

export function RewardsView({
  progress,
  storeItems,
  achievements,
  onPurchaseOrEquip,
}: RewardsViewProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  const equipped = storeItems.find((i) => i.id === progress.equippedRewardId);

  const handleAction = (item: RewardItem) => {
    const res = onPurchaseOrEquip(item);
    if (!res.ok && res.reason) {
      setFeedback(res.reason);
    } else if (progress.unlockedRewards.includes(item.id)) {
      setFeedback(`${item.name} equipado no seu perfil de laboratório.`);
    } else {
      setFeedback(`Você desbloqueou e equipou: ${item.name}!`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Balance Header */}
      <section className="rounded-3xl bg-[#32064A] text-white p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-purple-200">
            Recompensas do Laboratório
            {equipped ? ` · Equipado: ${equipped.name}` : ''}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold">
            Loja BioCoins &amp; Conquistas
          </h1>
          <p className="text-sm text-purple-100/90">
            Troque as BioCoins ganhas nas videoaulas e mini-games por itens exclusivos do GGLAB.
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl px-5 py-3.5 shrink-0 flex items-center gap-3">
          <Coins className="w-7 h-7 text-amber-400 shrink-0" aria-hidden="true" />
          <div className="tabular-nums">
            <p className="text-xs text-purple-200">Seu Saldo</p>
            <p className="font-display text-2xl font-extrabold">{progress.bioCoins} BioCoins</p>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          role="status"
          className="rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-medium flex items-center justify-between gap-3"
        >
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs text-slate-300 hover:text-white min-h-[36px] px-2"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Lab Store */}
      <section aria-labelledby="loja-heading" className="space-y-4">
        <h2 id="loja-heading" className="font-display text-xl font-bold text-slate-900">
          Bancada de Itens Colecionáveis
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeItems.map((item) => {
            const isUnlocked = progress.unlockedRewards.includes(item.id);
            const isEquipped = progress.equippedRewardId === item.id;
            const canAfford = progress.bioCoins >= item.cost;

            return (
              <article
                key={item.id}
                className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col justify-between gap-4 shadow-xs"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: item.accentColor }}
                  >
                    <RewardIcon iconKey={item.iconKey} className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">{item.category}</p>
                    <h3 className="font-display text-base font-bold text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-amber-700 tabular-nums inline-flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    {isUnlocked ? 'Desbloqueado' : `${item.cost} BioCoins`}
                  </span>

                  {isEquipped ? (
                    <span className="min-h-[44px] px-3.5 rounded-xl bg-emerald-50 text-[#15803D] text-xs font-bold inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4" aria-hidden="true" />
                      Equipado
                    </span>
                  ) : isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => handleAction(item)}
                      className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold whitespace-nowrap"
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAction(item)}
                      disabled={!canAfford}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                        canAfford
                          ? 'bg-[#32064A] hover:bg-[#460B66] text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Desbloquear
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Achievements */}
      <section aria-labelledby="conquistas-heading" className="space-y-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="conquistas-heading" className="font-display text-xl font-bold text-slate-900">
            Conquistas da Jornada
          </h2>
          <span className="text-xs text-slate-500 tabular-nums">
            {progress.unlockedAchievements.length}/{achievements.length} desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {achievements.map((ach) => {
            const unlocked = progress.unlockedAchievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`rounded-2xl border p-4 flex items-center gap-3.5 ${
                  unlocked
                    ? 'bg-white border-emerald-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200/70 opacity-75'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    unlocked ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  <AchievementIcon iconKey={ach.iconKey} className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 truncate">
                      {ach.title}
                    </h3>
                    <span className="text-xs font-bold text-amber-700 tabular-nums shrink-0">
                      +{ach.rewardCoins} BioCoins
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ach.description}</p>
                </div>
                {unlocked && (
                  <Award className="w-5 h-5 text-[#16A34A] shrink-0" aria-label="Conquistado" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
