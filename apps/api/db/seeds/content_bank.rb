# frozen_string_literal: true

def choice_step(phase:, position:, prompt:, answers:, distractors:, hint:)
  labels = answers + distractors
  options = labels.each_with_index.map do |label, index|
    { "id" => ("a".ord + index).chr, "label" => label }
  end

  {
    phase:,
    position:,
    prompt:,
    answer_type: answers.one? ? "single_choice" : "multi_choice",
    options:,
    correct_answer: options.first(answers.size).pluck("id"),
    hints: [ { content: hint, penalty: 2 } ]
  }
end

def exercise_steps(definition)
  [
    choice_step(
      phase: "identification",
      position: 1,
      prompt: "¿Qué tipo de problema representa el enunciado?",
      answers: [ definition.fetch(:concept) ],
      distractors: definition.fetch(:concept_distractors),
      hint: definition.fetch(:identification_hint)
    ),
    choice_step(
      phase: "planning",
      position: 2,
      prompt: "¿Cuál es el objetivo que debe alcanzarse?",
      answers: [ definition.fetch(:objective) ],
      distractors: definition.fetch(:objective_distractors),
      hint: definition.fetch(:planning_hint)
    ),
    choice_step(
      phase: "tools",
      position: 3,
      prompt: "¿Qué herramientas son útiles para resolverlo?",
      answers: definition.fetch(:tools),
      distractors: definition.fetch(:tool_distractors),
      hint: definition.fetch(:tools_hint)
    ),
    {
      phase: "procedure",
      position: 4,
      prompt: definition.fetch(:procedure_prompt),
      answer_type: definition.fetch(:answer_type),
      options: [],
      correct_answer: definition.fetch(:correct_answer),
      tolerance: definition.fetch(:tolerance, 0.001),
      hints: definition.fetch(:procedure_hints).map { |content| { content:, penalty: 2 } }
    }
  ]
end

subjects = [
  {
    name: "Álgebra básica",
    position: 1,
    topics: [
      {
        name: "Ecuaciones lineales",
        position: 1,
        exercises: [
          {
            title: "Aislar una incógnita",
            statement: "Resuelve la ecuación $3x + 5 = 20$.",
            difficulty: "easy",
            variables: [],
            concept: "Ecuación lineal de una variable",
            concept_distractors: [ "Ecuación cuadrática", "Proporción directa" ],
            identification_hint: "La incógnita aparece elevada a la primera potencia.",
            objective: "Aislar $x$ conservando la igualdad",
            objective_distractors: [ "Factorizar un trinomio", "Calcular un porcentaje" ],
            planning_hint: "Piensa qué cantidad debe quedar sola.",
            tools: [ "Operaciones inversas" ],
            tool_distractors: [ "Fórmula cuadrática", "Regla de tres" ],
            tools_hint: "Suma y multiplicación se deshacen con sus operaciones inversas.",
            procedure_prompt: "¿Cuál es el valor de $x$?",
            answer_type: "numeric",
            correct_answer: { "value" => 5 },
            procedure_hints: [ "Resta 5 en ambos lados.", "Divide el resultado entre 3." ]
          },
          {
            title: "Ecuación con signos",
            statement: "Resuelve $2x - 7 = -15$.",
            difficulty: "medium",
            variables: [],
            concept: "Ecuación lineal con números negativos",
            concept_distractors: [ "Identidad algebraica", "Ecuación cúbica" ],
            identification_hint: "La variable tiene exponente uno y aparecen signos negativos.",
            objective: "Encontrar el número que satisface la igualdad",
            objective_distractors: [ "Simplificar una fracción", "Hallar dos raíces" ],
            planning_hint: "Debes dejar la variable sola en un lado.",
            tools: [ "Operaciones inversas", "Ley de signos" ],
            tool_distractors: [ "Teorema de Pitágoras" ],
            tools_hint: "Cuida el signo al sumar 7 y al dividir.",
            procedure_prompt: "Escribe el valor de $x$.",
            answer_type: "numeric",
            correct_answer: { "value" => -4 },
            procedure_hints: [ "Suma 7 a ambos miembros.", "Ahora divide $-8$ entre 2." ]
          },
          {
            title: "Despeje con variable en ambos lados",
            statement: "Resuelve $5x + 2 = 2x + 14$.",
            difficulty: "hard",
            variables: [ { "name" => "x", "domain" => { "min" => -10, "max" => 10 } } ],
            concept: "Ecuación lineal con variable en ambos miembros",
            concept_distractors: [ "Sistema de dos ecuaciones", "Polinomio sin igualdad" ],
            identification_hint: "La misma variable aparece a ambos lados del signo igual.",
            objective: "Reunir términos con $x$ y aislar la variable",
            objective_distractors: [ "Encontrar el máximo de una función", "Expandir un binomio" ],
            planning_hint: "Lleva todos los términos con variable al mismo miembro.",
            tools: [ "Reducción de términos semejantes", "Operaciones inversas" ],
            tool_distractors: [ "Conversión a porcentaje" ],
            tools_hint: "Puedes restar $2x$ y 2 en ambos lados.",
            procedure_prompt: "Escribe una expresión equivalente al valor de $x$.",
            answer_type: "expression",
            correct_answer: { "expression" => "(14-2)/(5-2)" },
            procedure_hints: [ "Resta $2x$ a ambos lados.", "Resta 2 y divide entre 3." ]
          }
        ]
      },
      {
        name: "Productos notables",
        position: 2,
        exercises: [
          {
            title: "Cuadrado de una suma",
            statement: "Desarrolla $(x + 3)^2$.",
            difficulty: "easy",
            variables: [ { "name" => "x", "domain" => { "min" => -8, "max" => 8 } } ],
            concept: "Cuadrado de un binomio",
            concept_distractors: [ "Diferencia de cuadrados", "Ecuación lineal" ],
            identification_hint: "Todo el binomio está elevado al cuadrado.",
            objective: "Expandir el producto y reducir términos",
            objective_distractors: [ "Despejar $x$", "Convertir a decimal" ],
            planning_hint: "Usa el patrón del cuadrado de una suma.",
            tools: [ "Identidad $(a+b)^2$", "Propiedad distributiva" ],
            tool_distractors: [ "Regla de tres" ],
            tools_hint: "Recuerda el término doble $2ab$.",
            procedure_prompt: "Escribe el polinomio desarrollado.",
            answer_type: "expression",
            correct_answer: { "expression" => "x^2+6*x+9" },
            procedure_hints: [ "Calcula $2(x)(3)$.", "El último término es $3^2$." ]
          },
          {
            title: "Diferencia de cuadrados",
            statement: "Factoriza $x^2 - 25$.",
            difficulty: "medium",
            variables: [ { "name" => "x", "domain" => { "min" => -8, "max" => 8 } } ],
            concept: "Diferencia de cuadrados perfectos",
            concept_distractors: [ "Trinomio cuadrado perfecto", "Proporción inversa" ],
            identification_hint: "Ambos términos son cuadrados y están separados por una resta.",
            objective: "Expresar el polinomio como producto de conjugados",
            objective_distractors: [ "Calcular una media", "Aislar una incógnita lineal" ],
            planning_hint: "Busca los términos $a$ y $b$ de $a^2-b^2$.",
            tools: [ "Identidad $a^2-b^2$", "Raíz cuadrada exacta" ],
            tool_distractors: [ "Fórmula de interés simple" ],
            tools_hint: "La raíz cuadrada de 25 es 5.",
            procedure_prompt: "Escribe la factorización.",
            answer_type: "expression",
            correct_answer: { "expression" => "(x-5)*(x+5)" },
            procedure_hints: [ "Forma dos binomios conjugados.", "Usa $x$ y 5 como términos." ]
          }
        ]
      }
    ]
  },
  {
    name: "Aritmética",
    position: 2,
    topics: [
      {
        name: "Fracciones",
        position: 1,
        exercises: [
          {
            title: "Suma con igual denominador",
            statement: "Calcula $\\frac{3}{8} + \\frac{2}{8}$.",
            difficulty: "easy",
            variables: [],
            concept: "Suma de fracciones homogéneas",
            concept_distractors: [ "Producto de fracciones", "Suma de enteros" ],
            identification_hint: "Los denominadores de ambas fracciones son iguales.",
            objective: "Sumar numeradores y conservar el denominador",
            objective_distractors: [ "Multiplicar denominadores", "Invertir la segunda fracción" ],
            planning_hint: "No necesitas buscar un denominador común nuevo.",
            tools: [ "Regla de suma de fracciones homogéneas" ],
            tool_distractors: [ "Producto cruzado", "Fórmula cuadrática" ],
            tools_hint: "Trabaja primero con los numeradores.",
            procedure_prompt: "Escribe el resultado como expresión fraccionaria.",
            answer_type: "expression",
            correct_answer: { "expression" => "5/8" },
            procedure_hints: [ "Suma $3+2$.", "Conserva el denominador 8." ]
          },
          {
            title: "Suma con distinto denominador",
            statement: "Calcula $\\frac{1}{3} + \\frac{1}{4}$.",
            difficulty: "medium",
            variables: [],
            concept: "Suma de fracciones heterogéneas",
            concept_distractors: [ "División de fracciones", "Resta de decimales" ],
            identification_hint: "Los denominadores son diferentes.",
            objective: "Obtener fracciones equivalentes con denominador común",
            objective_distractors: [ "Sumar directamente los denominadores", "Convertir a porcentaje primero" ],
            planning_hint: "Busca un múltiplo común de 3 y 4.",
            tools: [ "Mínimo común múltiplo", "Fracciones equivalentes" ],
            tool_distractors: [ "Ley de exponentes" ],
            tools_hint: "El mínimo común múltiplo de 3 y 4 es 12.",
            procedure_prompt: "Escribe la fracción simplificada.",
            answer_type: "expression",
            correct_answer: { "expression" => "7/12" },
            procedure_hints: [ "Convierte $1/3$ en $4/12$.", "Convierte $1/4$ en $3/12$." ]
          },
          {
            title: "División de fracciones",
            statement: "Calcula $\\frac{5}{6} \\div \\frac{10}{9}$.",
            difficulty: "hard",
            variables: [],
            concept: "División de fracciones",
            concept_distractors: [ "Suma de fracciones", "Potencia de una fracción" ],
            identification_hint: "El símbolo central indica una división.",
            objective: "Multiplicar por el recíproco y simplificar",
            objective_distractors: [ "Sumar productos cruzados", "Igualar denominadores" ],
            planning_hint: "Transforma la división en multiplicación.",
            tools: [ "Recíproco multiplicativo", "Simplificación por factores comunes" ],
            tool_distractors: [ "Identidad notable" ],
            tools_hint: "El recíproco de $10/9$ es $9/10$.",
            procedure_prompt: "Escribe el resultado simplificado.",
            answer_type: "expression",
            correct_answer: { "expression" => "3/4" },
            procedure_hints: [ "Multiplica $5/6$ por $9/10$.", "Cancela factores comunes antes de multiplicar." ]
          }
        ]
      },
      {
        name: "Razones y proporciones",
        position: 2,
        exercises: [
          {
            title: "Proporción directa",
            statement: "Si 4 cuadernos cuestan 12 unidades monetarias, ¿cuánto cuestan 7 al mismo precio?",
            difficulty: "easy",
            variables: [],
            concept: "Proporción directa",
            concept_distractors: [ "Proporción inversa", "Sucesión geométrica" ],
            identification_hint: "Al aumentar la cantidad, el costo aumenta en la misma razón.",
            objective: "Encontrar el costo correspondiente a 7 unidades",
            objective_distractors: [ "Encontrar un descuento", "Calcular una raíz" ],
            planning_hint: "Primero identifica el costo de una unidad.",
            tools: [ "Valor unitario", "Multiplicación" ],
            tool_distractors: [ "Factorización" ],
            tools_hint: "Divide 12 entre 4.",
            procedure_prompt: "¿Cuál es el costo de 7 cuadernos?",
            answer_type: "numeric",
            correct_answer: { "value" => 21 },
            procedure_hints: [ "Cada cuaderno cuesta 3.", "Multiplica 3 por 7." ]
          },
          {
            title: "Escala de una receta",
            statement: "Una receta para 6 porciones usa 450 g de harina. ¿Cuántos gramos se requieren para 10 porciones?",
            difficulty: "medium",
            variables: [],
            concept: "Escalamiento proporcional",
            concept_distractors: [ "Variación inversa", "Promedio aritmético" ],
            identification_hint: "Las porciones y la cantidad de harina crecen juntas.",
            objective: "Escalar la cantidad de harina a 10 porciones",
            objective_distractors: [ "Restar las porciones", "Calcular una potencia" ],
            planning_hint: "Determina primero los gramos por porción.",
            tools: [ "Razón unitaria", "Proporción directa" ],
            tool_distractors: [ "Diferencia de cuadrados" ],
            tools_hint: "Divide 450 entre 6.",
            procedure_prompt: "¿Cuántos gramos de harina se necesitan?",
            answer_type: "numeric",
            correct_answer: { "value" => 750 },
            procedure_hints: [ "Cada porción requiere 75 g.", "Multiplica 75 por 10." ]
          }
        ]
      }
    ]
  }
]

Subject.transaction do
  subjects.each do |subject_data|
    subject = Subject.find_or_initialize_by(slug: subject_data.fetch(:name).parameterize)
    subject.assign_attributes(subject_data.slice(:name, :position).merge(deleted_at: nil))
    subject.save!

    subject_data.fetch(:topics).each do |topic_data|
      topic = subject.topics.find_or_initialize_by(slug: topic_data.fetch(:name).parameterize)
      topic.assign_attributes(topic_data.slice(:name, :position).merge(deleted_at: nil))
      topic.save!

      topic_data.fetch(:exercises).each do |exercise_data|
        exercise = topic.exercises.find_or_initialize_by(title: exercise_data.fetch(:title))
        exercise.assign_attributes(
          exercise_data.slice(:title, :statement, :difficulty, :variables).merge(
            status: "draft",
            source: "manual",
            exercise_import: nil,
            deleted_at: nil
          )
        )
        exercise.save!

        steps = exercise_steps(exercise_data)
        exercise.exercise_steps.where.not(position: steps.pluck(:position)).destroy_all
        steps.each do |step_data|
          step = exercise.exercise_steps.find_or_initialize_by(position: step_data.fetch(:position))
          step.assign_attributes(step_data.except(:hints))
          step.save!

          hints = step_data.fetch(:hints)
          step.hints.where.not(position: 1..hints.size).destroy_all
          hints.each_with_index do |hint_data, index|
            hint = step.hints.find_or_initialize_by(position: index + 1)
            hint.assign_attributes(hint_data)
            hint.save!
          end
        end

        exercise.update!(status: "published")
      end
    end
  end
end

puts "Seeded content bank: #{Subject.count} subject(s), #{Topic.count} topic(s), #{Exercise.count} exercise(s)."
