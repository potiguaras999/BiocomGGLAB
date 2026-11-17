import { AchievementDef, BiologyModule, RewardItem } from '../types/biology';

export const BIOLOGY_MODULES: BiologyModule[] = [
  {
    id: 'modulo-vestigiais',
    order: 1,
    title: 'Partes "Inúteis" do seu Corpo!',
    area: 'Evolução Humana',
    durationLabel: 'Short · 1 min',
    summary:
      'Descubra por que partes do corpo humano — como apêndice, cóccix e dentes do siso — são heranças evolutivas dos nossos ancestrais.',
    keyConcepts: [
      'Estruturas vestigiais perderam parte da função que tinham nos ancestrais',
      'O apêndice ajudava a digerir plantas e hoje abriga bactérias benéficas',
      'O cóccix é o resquício ósseo de uma cauda ancestral',
      'Os dentes do siso mudaram junto com nossos hábitos e dieta',
    ],
    storyboardSlides: [
      {
        step: 'Parte 1',
        title: 'Heranças Evolutivas',
        caption: 'Nosso corpo guarda pistas de estruturas que eram importantes em nossos ancestrais.',
        highlight: 'Órgãos Vestigiais',
      },
    ],
    defaultYoutubeUrl: 'https://www.youtube.com/shorts/LQcTGLUF9zc',
    taskType: 'vestigial_game',
    taskTitle: 'Mini-Game: Detetive Vestigial',
    taskDescription:
      'Conecte apêndice, cóccix e dentes do siso às suas antigas funções ancestrais.',
    baseXp: 120,
    baseCoins: 40,
  },
  {
    id: 'modulo-clorofila',
    order: 2,
    title: 'A Cor Verde das Plantas',
    area: 'Botânica & Luz',
    durationLabel: 'Short · 1 min',
    summary:
      'Entenda por que enxergamos as plantas verdes: quais cores da luz do Sol a clorofila absorve para fazer energia e qual cor ela reflete.',
    keyConcepts: [
      'A luz do Sol reúne várias cores do espectro visível',
      'A clorofila absorve principalmente luz azul, violeta e vermelha',
      'A luz verde é refletida pelas folhas até os nossos olhos',
    ],
    storyboardSlides: [
      {
        step: 'Parte 1',
        title: 'Absorção e Reflexão',
        caption: 'A clorofila absorve azul e vermelho e reflete o verde.',
        highlight: 'Luz Verde Refletida',
      },
    ],
    defaultYoutubeUrl: 'https://www.youtube.com/shorts/JuSyAFu-tGs',
    taskType: 'chlorophyll_game',
    taskTitle: 'Mini-Game: Fábrica de Clorofila',
    taskDescription:
      'Absorva os fótons azuis e vermelhos para gerar energia e reflita a luz verde!',
    baseXp: 140,
    baseCoins: 45,
  },
  {
    id: 'modulo-fosseis',
    order: 3,
    title: 'Fósseis: Segredos de Milhões de Anos',
    area: 'Paleontologia',
    durationLabel: 'Short · 1 min',
    summary:
      'Veja como a Terra preserva vestígios de seres vivos por milhões de anos por meio do soterramento rápido, mineralização e camadas do solo.',
    keyConcepts: [
      'O organismo precisa ser soterrado rápido em área com lama ou areia',
      'Pouco oxigênio impede a decomposição completa dos restos',
      'Minerais substituem aos poucos ossos e conchas ao longo do tempo',
      'Camadas mais fundas guardam os fósseis mais antigos',
    ],
    storyboardSlides: [
      {
        step: 'Parte 1',
        title: 'Como um Fóssil Nasce',
        caption: 'Soterramento rápido, falta de oxigênio e mineralização em camadas.',
        highlight: 'Mais Fundo = Mais Antigo',
      },
    ],
    defaultYoutubeUrl: 'https://www.youtube.com/shorts/Y9bXMlhQ_eM',
    taskType: 'fossil_game',
    taskTitle: 'Mini-Game: Escavação Estratigráfica',
    taskDescription:
      'Ordene a formação de um fóssil e descubra em qual camada da Terra cada registro está.',
    baseXp: 150,
    baseCoins: 50,
  },
  {
    id: 'modulo-camaleoes',
    order: 4,
    title: 'O Incrível Poder dos Camaleões',
    area: 'Zoologia',
    durationLabel: 'Short · 1 min',
    summary:
      'Descubra por que os camaleões mudam de cor — muito além da camuflagem — e como eles caçam com velocidade.',
    keyConcepts: [
      'A mudança de cor serve para comunicação, temperatura e camuflagem',
      'Cores escuras ajudam a absorver calor; cores claras refletem a luz',
      'Cores vibrantes comunicam humor, alerta ou disputa territorial',
      'Sua língua rápida captura insetos à distância',
    ],
    storyboardSlides: [
      {
        step: 'Parte 1',
        title: 'Muito Além da Camuflagem',
        caption: 'Eles ajustam a cor da pele para temperatura, disfarce e comunicação.',
        highlight: 'Temperatura · Comunicação · Caça',
      },
    ],
    defaultYoutubeUrl: 'https://www.youtube.com/shorts/OukPwmUtlxs',
    taskType: 'chameleon_game',
    taskTitle: 'Mini-Game: Mestre Camaleão',
    taskDescription:
      'Ajuste a cor do camaleão para cada situação e dispare a língua para capturar o inseto!',
    baseXp: 160,
    baseCoins: 55,
  },
  {
    id: 'modulo-homologia',
    order: 5,
    title: 'Morcego, Baleia e Você',
    area: 'Evolução & Anatomia',
    durationLabel: 'Short · 1 min',
    summary:
      'O que humanos, morcegos e baleias têm em comum? Todos são mamíferos que compartilham o mesmo plano básico de ossos herdado de um ancestral comum.',
    keyConcepts: [
      'Humanos, morcegos e baleias são mamíferos com ancestral comum',
      'Braço humano, asa de morcego e nadadeira de baleia têm os mesmos ossos básicos',
      'A evolução adaptou esses mesmos ossos para pegar, voar e nadar',
    ],
    storyboardSlides: [
      {
        step: 'Parte 1',
        title: 'O Mesmo Esqueleto Adaptado',
        caption: 'Funções diferentes, mas o mesmo padrão ósseo herdado.',
        highlight: 'Ancestral Comum Mamífero',
      },
    ],
    defaultYoutubeUrl: 'https://www.youtube.com/shorts/jX2os4FQy44',
    taskType: 'homology_game',
    taskTitle: 'Mini-Game: Morcego, Baleia e Você',
    taskDescription:
      'Compare os ossos no raio-X evolutivo e identifique estruturas de mesma origem ancestral.',
    baseXp: 180,
    baseCoins: 65,
  },
];

export const REWARD_ITEMS: RewardItem[] = [
  {
    id: 'reward-jaleco',
    name: 'Jaleco Neon GGLAB',
    category: 'Equipamento',
    description: 'Uniforme clássico de bancada inspirado na equipe do laboratório.',
    cost: 40,
    accentColor: '#16A34A',
    iconKey: 'flask',
  },
  {
    id: 'reward-folha-clorofila',
    name: 'Prisma de Clorofila',
    category: 'Mascote',
    description: 'Cristal botânico que reflete luz verde em alta intensidade.',
    cost: 60,
    accentColor: '#059669',
    iconKey: 'leaf',
  },
  {
    id: 'reward-microscopio',
    name: 'Lupa Paleontológica Pro',
    category: 'Equipamento',
    description: 'Lente de precisão para analisar fósseis e pistas da Terra.',
    cost: 80,
    accentColor: '#7C3AED',
    iconKey: 'microscope',
  },
  {
    id: 'reward-mascote-dna',
    name: 'Camaleão Cromático',
    category: 'Mascote',
    description: 'Companheiro colorido que acompanha sua trilha no GGLAB.',
    cost: 100,
    accentColor: '#DB2777',
    iconKey: 'dna',
  },
  {
    id: 'reward-escudo-evolucao',
    name: 'Selo Ancestral Comum',
    category: 'Equipamento',
    description: 'Insígnia especial dos exploradores da evolução.',
    cost: 120,
    accentColor: '#0284C7',
    iconKey: 'shield',
  },
  {
    id: 'reward-titulo-mestre',
    name: 'Título: Cientista GGLAB',
    category: 'Título',
    description: 'Título exclusivo exibido no topo da sua jornada de progresso.',
    cost: 150,
    accentColor: '#D97706',
    iconKey: 'crown',
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'ach-first-step',
    title: 'Detetive do Corpo',
    description: 'Concluiu o Vídeo 01 e o desafio sobre partes vestigiais.',
    rewardCoins: 20,
    iconKey: 'rocket',
  },
  {
    id: 'ach-botany-light',
    title: 'Mestre da Clorofila',
    description: 'Completou a Fábrica de Clorofila com 2 ou mais estrelas.',
    rewardCoins: 30,
    iconKey: 'star',
  },
  {
    id: 'ach-three-stars',
    title: 'Nota Máxima no Lab',
    description: 'Conquistou 3 estrelas em qualquer mini-game do GGLAB.',
    rewardCoins: 25,
    iconKey: 'dna',
  },
  {
    id: 'ach-chameleon-pro',
    title: 'Reflexo de Camaleão',
    description: 'Venceu o desafio do Vídeo 04 sobre camaleões.',
    rewardCoins: 35,
    iconKey: 'shield',
  },
  {
    id: 'ach-all-modules',
    title: 'Mestre da Trilha GGLAB',
    description: 'Assistiu aos 5 vídeos e concluiu todos os mini-games.',
    rewardCoins: 90,
    iconKey: 'trophy',
  },
];
