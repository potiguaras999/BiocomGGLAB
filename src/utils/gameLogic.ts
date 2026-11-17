// Streamlined pure game rules & datasets aligned strictly to the 5 GGLAB Shorts themes

function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function scoreToStars(accuracyPercent: number): 1 | 2 | 3 {
  if (accuracyPercent >= 85) return 3;
  if (accuracyPercent >= 60) return 2;
  return 1;
}

// 1. Detetive Vestigial (LQcTGLUF9zc - Partes "Inúteis" do seu Corpo!)
export interface VestigialCase {
  id: string;
  partName: string;
  bodyRegion: string;
  ancestralClue: string;
  correctOptionId: string;
  options: { id: string; label: string; detail: string }[];
  fact: string;
}

export const VESTIGIAL_CASES: VestigialCase[] = [
  {
    id: 'vest-apendice',
    partName: 'Apêndice',
    bodyRegion: 'Intestino',
    ancestralClue: 'Costuma ser chamado de "inútil", mas já foi muito maior em nossos ancestrais.',
    correctOptionId: 'dig-plantas',
    options: [
      { id: 'filtrar-sangue', label: 'Filtrar impurezas do sangue', detail: 'Limpeza circulatória' },
      { id: 'dig-plantas', label: 'Ajudar a digerir plantas', detail: 'Dieta rica em folhas e fibras' },
      { id: 'arm-calcio', label: 'Armazenar reservas de cálcio', detail: 'Depósito para os ossos' },
    ],
    fact: 'Hoje ele é pequeno, mas ainda abriga bactérias boas que ajudam o intestino.',
  },
  {
    id: 'vest-coccix',
    partName: 'Cóccix',
    bodyRegion: 'Final da coluna',
    ancestralClue: 'Um ossinho discreto bem na ponta inferior da nossa coluna.',
    correctOptionId: 'cauda',
    options: [
      { id: 'proteger-pulmao', label: 'Proteger os pulmões ao respirar', detail: 'Reforço da caixa torácica' },
      { id: 'sustentar-bracos', label: 'Sustentar a força dos braços', detail: 'Alavanca dos ombros' },
      { id: 'cauda', label: 'Resto de uma cauda ancestral', detail: 'Usada para equilíbrio' },
    ],
    fact: 'O cóccix é a lembrança óssea de que nossos ancestrais distantes tinham cauda.',
  },
  {
    id: 'vest-siso',
    partName: 'Dentes do Siso',
    bodyRegion: 'Fundo da boca',
    ancestralClue: 'Muitas vezes nascem apertados ou sem espaço na boca atual.',
    correctOptionId: 'dieta-dura',
    options: [
      { id: 'falar', label: 'Ajudar na articulação da fala', detail: 'Formação das palavras' },
      { id: 'dieta-dura', label: 'Mastigar alimentos duros e crus', detail: 'Mandíbulas maiores no passado' },
      { id: 'enzimas', label: 'Produzir enzimas digestivas', detail: 'Secreção de saliva extra' },
    ],
    fact: 'Com alimentos cozidos e mais macios, nossa mandíbula diminuiu ao longo da evolução.',
  },
];

export function prepareVestigialCases(rng: () => number = Math.random): VestigialCase[] {
  return shuffleArray(VESTIGIAL_CASES, rng).map((item) => ({
    ...item,
    options: shuffleArray(item.options, rng),
  }));
}

export function calculateVestigialPoints(timeLeftSeconds: number, nextStreak: number): number {
  const clampedTime = Math.max(0, Math.round(timeLeftSeconds));
  const streakBonus = Math.max(0, nextStreak - 1) * 25;
  return 100 + clampedTime * 4 + streakBonus;
}

// 2. Fábrica de Clorofila (JuSyAFu-tGs - A Ciência por Trás da Cor Verde das Plantas!)
export type PhotonColor = 'blue' | 'red' | 'green' | 'violet';
export type PhotonAction = 'absorb' | 'reflect';

const ABSORBABLE_PHOTONS: PhotonColor[] = ['blue', 'red', 'violet'];

// Before 4 points: 2 green photons for every 1 blue/red/violet photon
export function createChlorophyllPhase1Bag(rng: () => number = Math.random): PhotonColor[] {
  const absorbColor = ABSORBABLE_PHOTONS[Math.floor(rng() * ABSORBABLE_PHOTONS.length)];
  return shuffleArray(['green', 'green', absorbColor], rng);
}

// After reaching 4 points (even if errors happen later): 3 blue/red/violet photons for every 1 green photon
export function createChlorophyllPhase2Bag(rng: () => number = Math.random): PhotonColor[] {
  return shuffleArray(['blue', 'red', 'violet', 'green'], rng);
}

export function hasPhotonReachedChloroplast(
  photonY: number,
  photonRadius: number,
  chloroplastTopY: number
): boolean {
  return photonY + photonRadius >= chloroplastTopY;
}

export function evaluateChlorophyllAction(
  photon: PhotonColor,
  action: PhotonAction
): { correct: boolean; label: string; points: number } {
  const shouldReflect = photon === 'green';
  const expected: PhotonAction = shouldReflect ? 'reflect' : 'absorb';
  const correct = action === expected;

  if (correct) {
    if (shouldReflect) {
      return {
        correct: true,
        label: 'Luz verde refletida — sem ganho de pontos.',
        points: 0,
      };
    }
    return {
      correct: true,
      label: `Luz ${photon === 'blue' ? 'azul' : photon === 'violet' ? 'violeta' : 'vermelha'} absorvida! (+1 pt)`,
      points: 1,
    };
  }

  return {
    correct: false,
    label: shouldReflect
      ? 'A planta reflete o verde — toque em Refletir! (-1 pt)'
      : 'A clorofila absorve essa cor para fazer energia — toque em Absorver! (-1 pt)',
    points: -1,
  };
}

// 3. Escavação Estratigráfica (Y9bXMlhQ_eM - Fósseis)
export interface FossilStep {
  id: string;
  order: number;
  title: string;
  detail: string;
}

export const FOSSILIZATION_STEPS: FossilStep[] = [
  {
    id: 'step-1',
    order: 1,
    title: 'O organismo morre em área com sedimentos',
    detail: 'Próximo a lama, areia ou fundo de rios e mares.',
  },
  {
    id: 'step-2',
    order: 2,
    title: 'É coberto rápido, quase sem oxigênio',
    detail: 'Isso evita que o corpo se decomponha por completo.',
  },
  {
    id: 'step-3',
    order: 3,
    title: 'Minerais entram nos restos ao longo do tempo',
    detail: 'A água traz minerais que vão substituindo ossos e conchas.',
  },
  {
    id: 'step-4',
    order: 4,
    title: 'Fica guardado nas camadas da Terra',
    detail: 'Vira rocha e atravessa milhões de anos preservado.',
  },
];

export interface StratumFossil {
  id: string;
  fossilName: string;
  eraLabel: string;
  correctLayer: number; // 1 = topo (mais recente), 3 = mais profundo (mais antigo)
  clue: string;
}

export const STRATA_FOSSILS: StratumFossil[] = [
  {
    id: 'fos-recente',
    fossilName: 'Fóssil Mais Recente',
    eraLabel: 'Camada Superior (Mais Perto da Superfície)',
    correctLayer: 1,
    clue: 'Viveu há menos tempo — ficou soterrado pelas camadas mais novas.',
  },
  {
    id: 'fos-dino',
    fossilName: 'Pegada / Osso de Dinossauro',
    eraLabel: 'Camada Intermediária',
    correctLayer: 2,
    clue: 'Mais antigo que os animais recentes, no meio das camadas de rocha.',
  },
  {
    id: 'fos-antigo',
    fossilName: 'Concha Marinha Antiquíssima',
    eraLabel: 'Camada Mais Profunda',
    correctLayer: 3,
    clue: 'Registro de milhões e milhões de anos atrás, bem no fundo do solo.',
  },
];

export function prepareFossilizationSteps(rng: () => number = Math.random): FossilStep[] {
  return shuffleArray(FOSSILIZATION_STEPS, rng);
}

export function prepareStrataFossils(rng: () => number = Math.random): StratumFossil[] {
  return shuffleArray(STRATA_FOSSILS, rng);
}

export function evaluateStrataDig(
  fossil: StratumFossil,
  pickedLayer: number
): { correct: boolean; message: string } {
  if (pickedLayer === fossil.correctLayer) {
    return {
      correct: true,
      message: `Achado perfeito! ${fossil.fossilName} pertence à ${fossil.eraLabel}.`,
    };
  }
  const directionHint =
    pickedLayer < fossil.correctLayer
      ? 'Esse fóssil é mais antigo — escave em uma camada mais profunda!'
      : 'Esse fóssil é mais recente — escave em uma camada mais perto da superfície!';
  return {
    correct: false,
    message: `Só rocha vazia aqui! ${directionHint}`,
  };
}

// 4. Mestre Camaleão (OukPwmUtlxs - O INCRÍVEL PODER dos Camaleões!)
export type ChameleonStateId = 'green' | 'blue' | 'red';

export interface ChameleonScenario {
  id: string;
  situation: string;
  biologyHint: string;
  targetState: ChameleonStateId;
  targetColorHex: string;
}

export const CHAMELEON_STATES: {
  id: ChameleonStateId;
  label: string;
  crystalDesc: string;
  hex: string;
  imageSrc: string;
}[] = [
  {
    id: 'green',
    label: 'Verde',
    crystalDesc: 'Camuflagem entre as folhas',
    hex: '#84CC16',
    imageSrc: '/assets/aistudio/Gemini_Generated_Image_ye43fcye43fcye43_2664d7ba.jpg',
  },
  {
    id: 'blue',
    label: 'Azul',
    crystalDesc: 'Sinal de calma e tom frio',
    hex: '#2563EB',
    imageSrc: '/assets/aistudio/Gemini_Generated_Image_44tbqf44tbqf44tb_1313ba36.jpg',
  },
  {
    id: 'red',
    label: 'Vermelho',
    crystalDesc: 'Alerta, defesa ou exibição',
    hex: '#EF4444',
    imageSrc: '/assets/aistudio/Gemini_Generated_Image_cwjo0gcwjo0gcwjo_e0122be1.jpg',
  },
];

export const CHAMELEON_SCENARIOS: ChameleonScenario[] = [
  {
    id: 'cham-1',
    situation: 'Um predador passou perto do galho cheio de folhas! Qual cor ajuda no disfarce?',
    biologyHint: 'Entre as folhas, o tom verde ajuda o camaleão a se misturar ao ambiente!',
    targetState: 'green',
    targetColorHex: '#84CC16',
  },
  {
    id: 'cham-2',
    situation: 'O dia está bem quente e o camaleão quer um tom frio para refletir luz e relaxar.',
    biologyHint: 'Cristais mais próximos refletem a luz azul — tom frio e tranquilo!',
    targetState: 'blue',
    targetColorHex: '#2563EB',
  },
  {
    id: 'cham-3',
    situation: 'Outro camaleão invadiu o galho! Hora de mandar um sinal forte de alerta.',
    biologyHint: 'Cores quentes e vibrantes como o vermelho servem para alerta e comunicação!',
    targetState: 'red',
    targetColorHex: '#EF4444',
  },
];

// 5. Lab de Homologia (jX2os4FQy44 - Morcego, Baleia e VOCÊ)
export interface HomologyQuestion {
  id: string;
  pairTitle: string;
  description: string;
  correctType: 'comum' | 'diferente';
  explanation: string;
  wrongExplanation: string;
}

export const HOMOLOGY_QUESTIONS: HomologyQuestion[] = [
  {
    id: 'hom-1',
    pairTitle: 'Braço humano × Asa do morcego',
    description: 'Um serve para pegar e o outro para voar, mas o padrão de ossos por dentro é o mesmo.',
    correctType: 'comum',
    explanation:
      'Isso mesmo! Mesma origem! Ambos são mamíferos e herdaram o mesmo plano de ossos de um ancestral comum.',
    wrongExplanation:
      'Opa! Na verdade, eles têm a mesma origem! Apesar de funções diferentes, os dois são mamíferos e herdaram o mesmo plano de ossos de um ancestral comum.',
  },
  {
    id: 'hom-2',
    pairTitle: 'Braço humano × Nadadeira da baleia',
    description: 'Mesmo vivendo no mar, a baleia guarda ossos equivalentes ao braço e aos dedos humanos.',
    correctType: 'comum',
    explanation:
      'Isso mesmo! Mesma origem! Baleias também são mamíferos e seus ossos foram adaptados para nadar.',
    wrongExplanation:
      'Opa! Eles têm a mesma origem! Baleias também são mamíferos e guardam os mesmos ossos do braço e dos dedos adaptados para nadar.',
  },
  {
    id: 'hom-3',
    pairTitle: 'Asa do morcego × Asa de inseto',
    description: 'As duas servem para voar, mas o inseto não tem ossos como os mamíferos.',
    correctType: 'diferente',
    explanation:
      'Isso mesmo! Origens diferentes! Elas têm a mesma função (voar), mas são órgãos análogos e não vieram do mesmo esqueleto ancestral.',
    wrongExplanation:
      'Opa! As origens são diferentes! Elas têm a mesma função (voar), mas são órgãos análogos e não possuem a mesma origem!',
  },
  {
    id: 'hom-4',
    pairTitle: 'Morcego × Baleia × Você',
    description: 'Todos respiram por pulmões, são mamíferos e têm o mesmo plano básico de ossos no membro.',
    correctType: 'comum',
    explanation:
      'Isso mesmo! Mesma origem! É a prova da evolução a partir de um ancestral comum mamífero.',
    wrongExplanation:
      'Opa! Na verdade, todos têm a mesma origem! Morcego, baleia e você são mamíferos que herdaram esse plano básico de um ancestral comum.',
  },
];
