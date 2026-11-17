import { useState } from 'react';

export const FOSSIL_HERO_IMAGE = '/src/assets/images/fossil_hero_clean_1794923396247.jpg';
export const FOSSIL_RIVER_IMAGE = '/src/assets/images/fossil_river_clean_1794923395366.jpg';

export const FOSSIL_SPECIMEN_IMAGES: Record<string, { src: string; alt: string }> = {
  'fos-recente': {
    src: '/src/assets/images/fossil_leaf_clean_1794923394743.jpg',
    alt: 'Ilustração simples de folha fossilizada em tom arenito dourado',
  },
  'fos-dino': {
    src: '/src/assets/images/fossil_dino_clean_1794923394795.jpg',
    alt: 'Ilustração simples de pegada de dinossauro em tom terracota',
  },
  'fos-antigo': {
    src: '/src/assets/images/fossil_shell_clean_1794923395584.jpg',
    alt: 'Ilustração simples de concha espiralada antiga em tom ardósia escuro',
  },
};

export function FossilHeroBanner() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#F5F4F2] aspect-[16/9] border border-white/20 shadow-sm">
      {!imgFailed ? (
        <img
          src={FOSSIL_HERO_IMAGE}
          alt="Ilustração limpa em camadas da Terra com grama no topo, arenito, terracota, rocha escura, concha e pegada"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-center scale-[1.12]"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-emerald-800 via-amber-700 to-stone-900 flex items-center justify-center p-4 text-center">
          <p className="text-sm font-semibold text-amber-100">
            Camadas da Terra · Formação e Escavação de Fósseis
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Interactive 16:9 diorama for Stage 1 (How a Fossil Forms).
 * Combines the clean flat vector river cross-section with a synchronized
 * interactive SVG overlay that reveals each step (0..4).
 */
export function FossilizationDiorama({ completedCount }: { completedCount: number }) {
  const [bgFailed, setBgFailed] = useState(false);
  const step1Done = completedCount >= 1;
  const step2Done = completedCount >= 2;
  const step3Done = completedCount >= 3;
  const step4Done = completedCount >= 4;

  const badgeLabel =
    completedCount === 0
      ? 'Cenário Inicial · Rio com água e camada de sedimentos'
      : completedCount === 1
      ? '1/4 · Organismo repousa no fundo com areia e lama'
      : completedCount === 2
      ? '2/4 · Soterramento rápido bloqueia o oxigênio (O₂)'
      : completedCount === 3
      ? '3/4 · Minerais infiltram os restos ao longo do tempo'
      : '4/4 · Fóssil preservado nas camadas de rocha!';

  return (
    <div className="rounded-3xl bg-[#1A102B] border border-purple-500/25 overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs bg-white/5 border-b border-white/10">
        <span className="font-semibold text-amber-300">{badgeLabel}</span>
        <span className="font-mono text-purple-200 tabular-nums shrink-0">
          {completedCount}/4
        </span>
      </div>

      <div className="relative w-full aspect-[16/9] bg-[#D9EEF9] overflow-hidden">
        {!bgFailed && (
          <img
            src={FOSSIL_RIVER_IMAGE}
            alt="Diagrama simples em corte de um rio com céu claro, água azul, faixa de areia dourada e camada de sedimento marrom"
            referrerPolicy="no-referrer"
            onError={() => setBgFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center scale-[1.14] transition-all duration-500 ${
              step4Done ? 'brightness-[0.72] saturate-[0.85]' : 'brightness-100'
            }`}
          />
        )}

        {/* Measured readability scrim at bottom for caption */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent"
          aria-hidden="true"
        />

        <svg
          viewBox="0 0 360 202"
          className="relative z-10 w-full h-full block"
          role="img"
          aria-label="Ilustração interativa das quatro etapas de formação de um fóssil"
        >
          {/* Oxygen Bubbles in Water (blocked once buried in Step 2) */}
          <g>
            <g opacity={step2Done ? 0.28 : 0.96} className="transition-opacity duration-500">
              <circle cx="48" cy="86" r="5.5" fill="#FFFFFF" fillOpacity="0.3" stroke="#FFFFFF" strokeWidth="1.8" />
              <circle cx="64" cy="102" r="4" fill="#FFFFFF" fillOpacity="0.3" stroke="#FFFFFF" strokeWidth="1.8" />
            </g>
            <rect
              x="74"
              y="78"
              width={step2Done ? 62 : 34}
              height="20"
              rx="6"
              fill={step2Done ? '#991B1B' : '#0369A1'}
            />
            <text
              x="82"
              y="92"
              fill={step2Done ? '#FEE2E2' : '#FFFFFF'}
              fontSize="11"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {step2Done ? 'Sem O₂' : 'O₂'}
            </text>
            {step2Done && (
              <line x1="40" y1="95" x2="70" y2="80" stroke="#EF4444" strokeWidth="2.6" strokeLinecap="round" />
            )}
          </g>

          {/* Step 2: Rapid Burial Mud/Sand Blanket */}
          {step2Done && !step4Done && (
            <g className="transition-opacity duration-500">
              <path
                d="M 0 122 Q 90 116 180 122 T 360 120 L 360 162 L 0 162 Z"
                fill="#C27832"
                fillOpacity="0.9"
              />
              <circle cx="52" cy="136" r="2.5" fill="#FDE68A" fillOpacity="0.45" />
              <circle cx="112" cy="132" r="2" fill="#FDE68A" fillOpacity="0.45" />
              <circle cx="272" cy="134" r="2.5" fill="#FDE68A" fillOpacity="0.45" />
            </g>
          )}

          {/* Step 4: Flat Geological Rock Strata Above */}
          {step4Done && (
            <g>
              <rect x="0" y="34" width="360" height="32" fill="#E6A94D" />
              <rect x="0" y="66" width="360" height="36" fill="#D9734E" />
              <rect x="0" y="102" width="360" height="44" fill="#6D5446" />
              <rect x="12" y="42" width="176" height="17" rx="4" fill="#1C1917" fillOpacity="0.72" />
              <text x="18" y="54" fill="#FEF3C7" fontSize="9.5" fontWeight="bold">
                Camadas mais novas por cima
              </text>
            </g>
          )}

          {/* Step 3+: Cyan Mineral Droplets Seeping Down Into Fossil */}
          {step3Done && (
            <g>
              {[138, 168, 198, 228].map((xPos, i) => (
                <g key={xPos}>
                  <line
                    x1={xPos}
                    y1={step4Done ? 104 : 120}
                    x2={xPos}
                    y2="147"
                    stroke="#38BDF8"
                    strokeWidth="2.4"
                    strokeDasharray="4 3"
                  />
                  <polygon
                    points={`${xPos},${144 + (i % 2) * 3} ${xPos - 4},${151 + (i % 2) * 3} ${xPos + 4},${151 + (i % 2) * 3}`}
                    fill="#7DD3FC"
                  />
                </g>
              ))}
              <rect x="246" y="122" width="70" height="19" rx="5" fill="#0C4A6E" />
              <text x="253" y="135" fill="#E0F2FE" fontSize="10" fontWeight="bold">
                Minerais ↓
              </text>
            </g>
          )}

          {/* Organism / Prehistoric Fish Skeleton -> Mineralized Golden Fossil */}
          <g
            transform={step1Done ? 'translate(132, 146)' : 'translate(132, 92)'}
            className="transition-transform duration-500"
          >
            {/* Clean rounded backdrop pocket behind skeleton */}
            <ellipse
              cx="46"
              cy="16"
              rx="55"
              ry="18"
              fill={step4Done ? '#292524' : step3Done ? '#1E3A5F' : '#1E293B'}
              fillOpacity={step1Done ? 0.55 : 0.25}
            />
            {/* Spine */}
            <line
              x1="15"
              y1="16"
              x2="80"
              y2="16"
              stroke={step3Done ? '#FDE047' : '#FFFFFF'}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Ribs */}
            {[28, 38, 48, 58, 68].map((rx, idx) => (
              <line
                key={rx}
                x1={rx}
                y1={6 + idx * 0.8}
                x2={rx}
                y2={26 - idx * 0.8}
                stroke={step3Done ? '#FACC15' : '#F8FAFC'}
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            ))}
            {/* Skull */}
            <path
              d="M 15 16 Q 1 8 1 16 Q 1 24 15 16 Z"
              fill={step3Done ? '#F59E0B' : '#FFFFFF'}
            />
            <circle cx="7" cy="14.5" r="1.8" fill="#1E1B4B" />
            {/* Tail Fin */}
            <path
              d="M 80 16 L 94 6 L 89 16 L 94 26 Z"
              fill={step3Done ? '#F59E0B' : 'none'}
              fillOpacity={step3Done ? 0.45 : 0}
              stroke={step3Done ? '#FACC15' : '#FFFFFF'}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </g>

          {/* Bottom Caption */}
          <text x="14" y="191" fill="#FEF3C7" fontSize="10.5" fontWeight="700">
            {step4Done
              ? 'Rocha sedimentar antiga (milhões de anos)'
              : step1Done
              ? 'Fundo de rio / mar com sedimentos'
              : 'Toque na 1ª etapa abaixo para iniciar a fossilização'}
          </text>
        </svg>
      </div>
    </div>
  );
}

/**
 * Museum-grade specimen illustration with resilient custom SVG fallback.
 */
export function FossilSpecimenArtwork({
  fossilId,
  sizeClass = 'w-14 h-14',
  roundedClass = 'rounded-2xl',
}: {
  fossilId: string;
  sizeClass?: string;
  roundedClass?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const specimen = FOSSIL_SPECIMEN_IMAGES[fossilId];

  if (specimen && !imgFailed) {
    return (
      <div
        className={`${sizeClass} ${roundedClass} overflow-hidden border border-white/25 bg-stone-900 shadow-sm shrink-0`}
      >
        <img
          src={specimen.src}
          alt={specimen.alt}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-center"
        />
      </div>
    );
  }

  return <FallbackFossilSvg fossilId={fossilId} sizeClass={sizeClass} />;
}

function FallbackFossilSvg({
  fossilId,
  sizeClass,
}: {
  fossilId: string;
  sizeClass: string;
}) {
  if (fossilId === 'fos-recente') {
    return (
      <svg viewBox="0 0 64 64" className={sizeClass} aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
        <path
          d="M 18 44 C 18 24, 34 16, 48 16 C 48 30, 40 46, 20 46 Z"
          fill="#F59E0B"
          fillOpacity="0.28"
          stroke="#92400E"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path d="M 16 48 L 44 20" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (fossilId === 'fos-dino') {
    return (
      <svg viewBox="0 0 64 64" className={sizeClass} aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="14" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2.5" />
        <path
          d="M 32 48 C 26 48, 23 41, 26 35 L 17 20 C 16 17, 19 15, 22 18 L 29 31 L 30 14 C 30 11, 34 11, 34 14 L 35 31 L 42 18 C 45 15, 48 17, 47 20 L 38 35 C 41 41, 38 48, 32 48 Z"
          fill="#C2410C"
          fillOpacity="0.88"
          stroke="#7C2D12"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className={sizeClass} aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="#E7E5E4" stroke="#57534E" strokeWidth="2.5" />
      <path
        d="M 32 34 C 32 31, 36 31, 36 34 C 36 39, 28 40, 27 34 C 26 26, 38 24, 41 32 C 44 43, 27 49, 20 39 C 13 28, 25 14, 39 17 C 50 19, 53 34, 47 44"
        fill="none"
        stroke="#44403C"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="33" cy="34" r="2.2" fill="#44403C" />
    </svg>
  );
}

/**
 * Illustrated SVG geological texture backdrop for each Earth stratum row in Stage 2.
 */
export function StratumTextureOverlay({
  layer,
  isCrackedEmpty,
}: {
  layer: number;
  isCrackedEmpty: boolean;
}) {
  return (
    <svg
      viewBox="0 0 400 90"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full opacity-45"
      aria-hidden="true"
    >
      {layer === 1 && (
        <g>
          {/* Sandy sediment waves & small pebbles */}
          <path d="M 0 28 Q 90 22 180 29 T 400 25" fill="none" stroke="#92400E" strokeOpacity="0.28" strokeWidth="1.5" />
          <path d="M 0 62 Q 120 68 250 58 T 400 64" fill="none" stroke="#92400E" strokeOpacity="0.24" strokeWidth="1.3" />
          <ellipse cx="64" cy="44" rx="5" ry="3" fill="#B45309" fillOpacity="0.25" />
          <ellipse cx="215" cy="20" rx="6" ry="3.2" fill="#B45309" fillOpacity="0.22" />
          <ellipse cx="315" cy="52" rx="4.5" ry="2.8" fill="#B45309" fillOpacity="0.25" />
        </g>
      )}
      {layer === 2 && (
        <g>
          {/* Terracotta sandstone bedding planes & rock grains */}
          <path d="M 0 22 L 140 26 L 260 20 L 400 24" fill="none" stroke="#7C2D12" strokeOpacity="0.3" strokeWidth="1.6" />
          <path d="M 0 58 L 110 54 L 285 62 L 400 56" fill="none" stroke="#7C2D12" strokeOpacity="0.26" strokeWidth="1.6" />
          <polygon points="155,36 164,34 168,42 157,44" fill="#9A3412" fillOpacity="0.22" />
          <polygon points="292,38 304,36 300,45 289,44" fill="#9A3412" fillOpacity="0.22" />
        </g>
      )}
      {layer === 3 && (
        <g>
          {/* Deep dark slate rock fractures & mineral veins */}
          <path d="M 30 0 L 58 42 L 46 90" fill="none" stroke="#E7E5E4" strokeOpacity="0.22" strokeWidth="1.4" />
          <path d="M 190 0 L 210 38 L 245 90" fill="none" stroke="#FDE68A" strokeOpacity="0.18" strokeWidth="1.2" />
          <path d="M 330 0 L 315 50 L 340 90" fill="none" stroke="#E7E5E4" strokeOpacity="0.2" strokeWidth="1.4" />
          <line x1="0" y1="45" x2="400" y2="49" stroke="#0C0A09" strokeOpacity="0.3" strokeWidth="2" />
        </g>
      )}
      {isCrackedEmpty && (
        <g stroke="#991B1B" strokeWidth="2" strokeOpacity="0.65" strokeLinecap="round">
          <path d="M 275 18 L 292 40 L 281 66" fill="none" />
          <path d="M 292 40 L 312 46" fill="none" />
        </g>
      )}
    </svg>
  );
}
