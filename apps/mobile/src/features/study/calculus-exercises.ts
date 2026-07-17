export type CalculusTopic = {
  id: string;
  name: string;
  description: string;
  icon: 'functions' | 'timeline' | 'integration-instructions' | 'swap-horiz' | 'trending-up';
  tint: string;
};

export type CalculusExercise = {
  id: string;
  topicId: string;
  question: string;
  /** Stored in logical order; UI shuffles before display. */
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export const CALCULUS_TOPICS: CalculusTopic[] = [
  {
    id: 'limits',
    name: 'Límites',
    description: 'Continuidad, límites laterales y indeterminaciones básicas.',
    icon: 'timeline',
    tint: '#7EC8E3',
  },
  {
    id: 'derivatives',
    name: 'Derivadas',
    description: 'Reglas de potencia, producto, cociente y derivadas trigonométricas.',
    icon: 'functions',
    tint: '#8B74E8',
  },
  {
    id: 'chain-rule',
    name: 'Regla de la cadena',
    description: 'Composición de funciones y derivadas encadenadas.',
    icon: 'swap-horiz',
    tint: '#B9A5F5',
  },
  {
    id: 'integrals',
    name: 'Integrales',
    description: 'Antiderivadas, integrales definidas y área bajo la curva.',
    icon: 'integration-instructions',
    tint: '#F5A623',
  },
  {
    id: 'applications',
    name: 'Aplicaciones',
    description: 'Máximos, mínimos, razones de cambio y optimización.',
    icon: 'trending-up',
    tint: '#F2994A',
  },
];

export const CALCULUS_EXERCISES: CalculusExercise[] = [
  // —— Límites ——
  {
    id: 'lim-1',
    topicId: 'limits',
    question: '¿Cuál es lim(x→2) (3x + 1)?',
    options: ['5', '7', '6', '8'],
    correctAnswer: '7',
    explanation: 'Sustitución directa: 3(2) + 1 = 7.',
  },
  {
    id: 'lim-2',
    topicId: 'limits',
    question: '¿Cuál es lim(x→0) (sin x / x)?',
    options: ['0', '1', 'No existe', '∞'],
    correctAnswer: '1',
    explanation: 'Es un límite notable: lim(sin x / x) = 1 cuando x → 0.',
  },
  {
    id: 'lim-3',
    topicId: 'limits',
    question: '¿Cuál es lim(x→3) (x² − 9)/(x − 3)?',
    options: ['0', '3', '6', '9'],
    correctAnswer: '6',
    explanation: 'Factoriza: (x−3)(x+3)/(x−3) = x+3 → 3+3 = 6.',
  },
  {
    id: 'lim-4',
    topicId: 'limits',
    question: '¿Cuál es lim(x→∞) (2x + 5)/(x − 1)?',
    options: ['0', '1', '2', '5'],
    correctAnswer: '2',
    explanation: 'Divide numerator y denominador entre x: → 2/1 = 2.',
  },
  {
    id: 'lim-5',
    topicId: 'limits',
    question: '¿Cuál es lim(x→1) (x³ − 1)/(x − 1)?',
    options: ['1', '2', '3', '4'],
    correctAnswer: '3',
    explanation: 'Factor (x−1)(x²+x+1); al simplificar queda x²+x+1 → 1+1+1 = 3.',
  },

  // —— Derivadas ——
  {
    id: 'der-1',
    topicId: 'derivatives',
    question: '¿Cuál es la derivada de f(x) = x⁵?',
    options: ['5x⁴', 'x⁴', '5x⁵', '4x⁵'],
    correctAnswer: '5x⁴',
    explanation: 'Regla de la potencia: d/dx[xⁿ] = n·xⁿ⁻¹ → 5x⁴.',
  },
  {
    id: 'der-2',
    topicId: 'derivatives',
    question: '¿Cuál es f′(x) si f(x) = 3x² − 4x + 7?',
    options: ['6x − 4', '3x − 4', '6x + 7', '6x² − 4'],
    correctAnswer: '6x − 4',
    explanation: 'Derivada término a término: 6x − 4.',
  },
  {
    id: 'der-3',
    topicId: 'derivatives',
    question: '¿Cuál es la derivada de f(x) = cos x?',
    options: ['sin x', '−sin x', 'cos x', '−cos x'],
    correctAnswer: '−sin x',
    explanation: 'd/dx[cos x] = −sin x.',
  },
  {
    id: 'der-4',
    topicId: 'derivatives',
    question: '¿Cuál es la derivada de f(x) = eˣ?',
    options: ['eˣ', 'x·eˣ', 'ln x', '1/x'],
    correctAnswer: 'eˣ',
    explanation: 'La exponencial es su propia derivada.',
  },
  {
    id: 'der-5',
    topicId: 'derivatives',
    question: '¿Cuál es f′(x) si f(x) = √x = x^(1/2)?',
    options: ['1/(2√x)', '1/√x', '2√x', '1/(2x)'],
    correctAnswer: '1/(2√x)',
    explanation: 'Potencia: (1/2)x^(−1/2) = 1/(2√x).',
  },
  {
    id: 'der-6',
    topicId: 'derivatives',
    question: '¿Cuál es la derivada de f(x) = ln x (x > 0)?',
    options: ['1/x', 'x', 'eˣ', '1'],
    correctAnswer: '1/x',
    explanation: 'd/dx[ln x] = 1/x.',
  },

  // —— Regla de la cadena ——
  {
    id: 'chain-1',
    topicId: 'chain-rule',
    question: '¿Cuál es la derivada de f(x) = (2x + 1)³?',
    options: ['3(2x + 1)²', '6(2x + 1)²', '(2x + 1)³', '6(2x + 1)'],
    correctAnswer: '6(2x + 1)²',
    explanation: 'Cadena: 3(2x+1)² · 2 = 6(2x+1)².',
  },
  {
    id: 'chain-2',
    topicId: 'chain-rule',
    question: '¿Cuál es f′(x) si f(x) = sin(3x)?',
    options: ['cos(3x)', '3 cos(3x)', '−3 sin(3x)', '3 sin(3x)'],
    correctAnswer: '3 cos(3x)',
    explanation: 'Derivada externa cos(3x) multiplicada por 3.',
  },
  {
    id: 'chain-3',
    topicId: 'chain-rule',
    question: '¿Cuál es la derivada de f(x) = e^(2x)?',
    options: ['2e^(2x)', 'e^(2x)', '2eˣ', 'eˣ'],
    correctAnswer: '2e^(2x)',
    explanation: 'e^(2x) · 2 por la regla de la cadena.',
  },
  {
    id: 'chain-4',
    topicId: 'chain-rule',
    question: '¿Cuál es f′(x) si f(x) = ln(x² + 1)?',
    options: ['2x/(x² + 1)', '1/(x² + 1)', '2x', 'x/(x² + 1)'],
    correctAnswer: '2x/(x² + 1)',
    explanation: '(1/(x²+1)) · 2x = 2x/(x²+1).',
  },

  // —— Integrales ——
  {
    id: 'int-1',
    topicId: 'integrals',
    question: '¿Cuál es ∫ 2x dx?',
    options: ['x² + C', '2x² + C', 'x + C', '4x + C'],
    correctAnswer: 'x² + C',
    explanation: 'Antiderivada de 2x es x² (+ constante).',
  },
  {
    id: 'int-2',
    topicId: 'integrals',
    question: '¿Cuál es ∫ cos x dx?',
    options: ['sin x + C', '−sin x + C', 'cos x + C', '−cos x + C'],
    correctAnswer: 'sin x + C',
    explanation: 'La derivada de sin x es cos x.',
  },
  {
    id: 'int-3',
    topicId: 'integrals',
    question: '¿Cuál es ∫₀² x dx?',
    options: ['4', '1', '2', '0'],
    correctAnswer: '2',
    explanation: '[x²/2]₀² = 4/2 − 0 = 2.',
  },
  {
    id: 'int-4',
    topicId: 'integrals',
    question: '¿Cuál es ∫ (1/x) dx (x > 0)?',
    options: ['ln x + C', '1/x² + C', 'x + C', 'eˣ + C'],
    correctAnswer: 'ln x + C',
    explanation: 'Antiderivada clásica del logaritmo natural.',
  },
  {
    id: 'int-5',
    topicId: 'integrals',
    question: '¿Cuál es ∫₀¹ 3x² dx?',
    options: ['1', '3', '9', '0'],
    correctAnswer: '1',
    explanation: '[x³]₀¹ = 1³ − 0 = 1.',
  },
  {
    id: 'int-6',
    topicId: 'integrals',
    question: '¿Cuál es ∫ eˣ dx?',
    options: ['eˣ + C', 'x·eˣ + C', 'eˣ/x + C', 'ln x + C'],
    correctAnswer: 'eˣ + C',
    explanation: 'eˣ es su propia antiderivada.',
  },

  // —— Aplicaciones ——
  {
    id: 'app-1',
    topicId: 'applications',
    question: 'Si f′(x) = 0 en x = c y f″(c) > 0, ¿qué hay en x = c?',
    options: ['Mínimo local', 'Máximo local', 'Punto de inflexión', 'Discontinuidad'],
    correctAnswer: 'Mínimo local',
    explanation: 'Criterio de la segunda derivada: f″ > 0 → cóncava hacia arriba → mínimo.',
  },
  {
    id: 'app-2',
    topicId: 'applications',
    question: '¿Cuál es la pendiente de la recta tangente a y = x² en x = 3?',
    options: ['3', '6', '9', '12'],
    correctAnswer: '6',
    explanation: 'y′ = 2x → en x = 3 la pendiente es 6.',
  },
  {
    id: 'app-3',
    topicId: 'applications',
    question: 'Un rectángulo tiene perímetro 20. ¿Qué lado x maximiza el área A = x(10 − x)?',
    options: ['x = 5', 'x = 10', 'x = 2', 'x = 0'],
    correctAnswer: 'x = 5',
    explanation: 'Parábola A = −x² + 10x; vértice en x = 10/2 = 5.',
  },
  {
    id: 'app-4',
    topicId: 'applications',
    question: '¿En qué x se anula f′(x) si f(x) = x³ − 3x?',
    options: ['x = ±1', 'x = 0 solamente', 'x = 3', 'x = ±√3'],
    correctAnswer: 'x = ±1',
    explanation: 'f′(x) = 3x² − 3 = 3(x² − 1) → x = ±1.',
  },
  {
    id: 'app-5',
    topicId: 'applications',
    question: 'La velocidad v(t) = 4t. ¿Cuál es el desplazamiento entre t = 0 y t = 3?',
    options: ['12', '18', '6', '36'],
    correctAnswer: '18',
    explanation: '∫₀³ 4t dt = [2t²]₀³ = 18.',
  },
];

export function getTopicById(topicId: string): CalculusTopic | undefined {
  return CALCULUS_TOPICS.find(topic => topic.id === topicId);
}

export function getExercisesByTopic(topicId: string): CalculusExercise[] {
  return CALCULUS_EXERCISES.filter(exercise => exercise.topicId === topicId);
}

export function countExercisesByTopic(topicId: string): number {
  return getExercisesByTopic(topicId).length;
}
