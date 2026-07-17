export type AnswerKind = 'choice' | 'number';

export type ExerciseStep = {
  id: string;
  phase: 'identification' | 'planning' | 'tools' | 'procedure';
  prompt: string;
  kind: AnswerKind;
  options?: { id: string; label: string }[];
  /** Correct option id (choice) or numeric value (number). */
  correct: string | number;
  hint: string;
  successFeedback: string;
  errorFeedback: string;
};

export type MathExercise = {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  statement: string;
  steps: ExerciseStep[];
};

export const MATH_EXERCISES: MathExercise[] = [
  {
    id: 'eq-linear-01',
    title: 'Ecuación lineal',
    topic: 'Álgebra',
    difficulty: 'easy',
    statement: 'Resuelve: 2x + 3 = 11',
    steps: [
      {
        id: 'eq1-id',
        phase: 'identification',
        prompt: '¿Qué tipo de ecuación estás viendo?',
        kind: 'choice',
        options: [
          { id: 'a', label: 'Ecuación lineal de primer grado' },
          { id: 'b', label: 'Ecuación cuadrática' },
          { id: 'c', label: 'Sistema de ecuaciones' },
        ],
        correct: 'a',
        hint: 'Solo aparece x a la potencia 1.',
        successFeedback: 'Correcto: es una ecuación lineal.',
        errorFeedback: 'No es cuadrática ni un sistema. Mira el grado de x.',
      },
      {
        id: 'eq1-plan',
        phase: 'planning',
        prompt: '¿Cuál es el objetivo inmediato?',
        kind: 'choice',
        options: [
          { id: 'a', label: 'Aislar x en un lado' },
          { id: 'b', label: 'Calcular la raíz cuadrada' },
          { id: 'c', label: 'Factorizar el trinomio' },
        ],
        correct: 'a',
        hint: 'Queremos dejar x sola.',
        successFeedback: 'Sí: el plan es aislar x.',
        errorFeedback: 'Aquí no hace falta factorizar ni raíz cuadrada.',
      },
      {
        id: 'eq1-tools',
        phase: 'tools',
        prompt: 'Si restas 3 a ambos lados, ¿qué queda?',
        kind: 'choice',
        options: [
          { id: 'a', label: '2x = 8' },
          { id: 'b', label: '2x = 14' },
          { id: 'c', label: 'x + 3 = 11' },
        ],
        correct: 'a',
        hint: '11 − 3 = 8.',
        successFeedback: 'Bien: 2x = 8.',
        errorFeedback: 'Revisa la resta en el lado derecho.',
      },
      {
        id: 'eq1-proc',
        phase: 'procedure',
        prompt: '¿Cuál es el valor de x?',
        kind: 'number',
        correct: 4,
        hint: 'Divide ambos lados entre 2.',
        successFeedback: '¡Exacto! x = 4.',
        errorFeedback: 'Divide 8 ÷ 2 para obtener x.',
      },
    ],
  },
  {
    id: 'frac-add-01',
    title: 'Suma de fracciones',
    topic: 'Aritmética',
    difficulty: 'easy',
    statement: 'Calcula: 1/2 + 1/4',
    steps: [
      {
        id: 'fr1-id',
        phase: 'identification',
        prompt: '¿Qué necesitas antes de sumar?',
        kind: 'choice',
        options: [
          { id: 'a', label: 'Un denominador común' },
          { id: 'b', label: 'Un numerador común' },
          { id: 'c', label: 'Convertir a decimal siempre' },
        ],
        correct: 'a',
        hint: 'Las fracciones se suman con el mismo denominador.',
        successFeedback: 'Correcto: busca un denominador común.',
        errorFeedback: 'Para sumar fracciones unifica el denominador.',
      },
      {
        id: 'fr1-tools',
        phase: 'tools',
        prompt: 'Con denominador 4, ¿cómo se escribe 1/2?',
        kind: 'choice',
        options: [
          { id: 'a', label: '2/4' },
          { id: 'b', label: '1/4' },
          { id: 'c', label: '3/4' },
        ],
        correct: 'a',
        hint: 'Multiplica numerador y denominador por 2.',
        successFeedback: 'Sí: 1/2 = 2/4.',
        errorFeedback: '1/2 equivalente con denominador 4 es 2/4.',
      },
      {
        id: 'fr1-proc',
        phase: 'procedure',
        prompt: '¿Cuánto es 2/4 + 1/4? (escribe el numerador de ?/4)',
        kind: 'number',
        correct: 3,
        hint: 'Suma solo los numeradores: 2 + 1.',
        successFeedback: 'Perfecto: 3/4.',
        errorFeedback: '2 + 1 = 3, así que el resultado es 3/4.',
      },
    ],
  },
  {
    id: 'geo-area-01',
    title: 'Área de un triángulo',
    topic: 'Geometría',
    difficulty: 'medium',
    statement: 'Un triángulo tiene base 10 y altura 6. ¿Cuál es su área?',
    steps: [
      {
        id: 'ge1-id',
        phase: 'identification',
        prompt: '¿Qué fórmula aplica?',
        kind: 'choice',
        options: [
          { id: 'a', label: 'Área = (base × altura) / 2' },
          { id: 'b', label: 'Área = base × altura' },
          { id: 'c', label: 'Área = base + altura' },
        ],
        correct: 'a',
        hint: 'El área del triángulo es la mitad del rectángulo.',
        successFeedback: 'Correcto: (b × h) / 2.',
        errorFeedback: 'Recuerda dividir entre 2.',
      },
      {
        id: 'ge1-proc',
        phase: 'procedure',
        prompt: 'Calcula el área numérica.',
        kind: 'number',
        correct: 30,
        hint: '(10 × 6) / 2.',
        successFeedback: '¡Bien! El área es 30.',
        errorFeedback: '10 × 6 = 60, y 60 / 2 = 30.',
      },
    ],
  },
  {
    id: 'pct-01',
    title: 'Porcentaje',
    topic: 'Aritmética',
    difficulty: 'easy',
    statement: '¿Cuánto es el 20% de 150?',
    steps: [
      {
        id: 'pc1-tools',
        phase: 'tools',
        prompt: '¿Cómo se expresa 20% como decimal?',
        kind: 'choice',
        options: [
          { id: 'a', label: '0.2' },
          { id: 'b', label: '2.0' },
          { id: 'c', label: '0.02' },
        ],
        correct: 'a',
        hint: '20% = 20/100.',
        successFeedback: 'Sí: 20% = 0.2.',
        errorFeedback: '20 ÷ 100 = 0.2.',
      },
      {
        id: 'pc1-proc',
        phase: 'procedure',
        prompt: 'Calcula 0.2 × 150.',
        kind: 'number',
        correct: 30,
        hint: 'También puedes hacer 150 × 20 / 100.',
        successFeedback: 'Correcto: 30.',
        errorFeedback: '150 × 0.2 = 30.',
      },
    ],
  },
  {
    id: 'pyth-01',
    title: 'Pitágoras',
    topic: 'Geometría',
    difficulty: 'medium',
    statement: 'En un triángulo rectángulo, a = 3 y b = 4. ¿Cuánto mide la hipotenusa c?',
    steps: [
      {
        id: 'py1-id',
        phase: 'identification',
        prompt: '¿Qué relación usas?',
        kind: 'choice',
        options: [
          { id: 'a', label: 'a² + b² = c²' },
          { id: 'b', label: 'a + b = c' },
          { id: 'c', label: 'a × b = c' },
        ],
        correct: 'a',
        hint: 'Teorema de Pitágoras.',
        successFeedback: 'Exacto: a² + b² = c².',
        errorFeedback: 'No se suman ni multiplican los lados directamente.',
      },
      {
        id: 'py1-proc',
        phase: 'procedure',
        prompt: '¿Cuál es el valor de c?',
        kind: 'number',
        correct: 5,
        hint: '√(9 + 16) = √25.',
        successFeedback: '¡Clásico 3-4-5! c = 5.',
        errorFeedback: '3² + 4² = 9 + 16 = 25 → c = 5.',
      },
    ],
  },
];

export function getExerciseById(id: string): MathExercise | undefined {
  return MATH_EXERCISES.find(exercise => exercise.id === id);
}

export const PHASE_LABELS: Record<ExerciseStep['phase'], string> = {
  identification: '¿Qué estoy viendo?',
  planning: '¿Qué debo hacer?',
  tools: '¿Qué herramientas tengo?',
  procedure: 'Procedimiento',
};
