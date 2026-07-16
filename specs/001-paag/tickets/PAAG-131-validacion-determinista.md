# PAAG-131: Validación matemática determinista (Ruby puro)

**Épica**: E04 Validación | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-101 | **Rama**: `feature/paag-131-validacion-determinista`

## Contexto

Autoridad única de corrección de respuestas. **Leer ADR-005**
(`docs/architecture/decisions/005-deterministic-math-validation-in-ruby.md`) y la sección
"Decisiones técnicas" de `specs/001-paag/plan.md`. Sin dependencias nuevas; **prohibido
`eval`/`instance_eval` de Ruby sobre input del usuario**.

## Alcance

POROs en `apps/api/app/services/validation/`:

1. `Validation::AnswerValidator.call(step:, answer:)` → `Result` (`correct?`, `error`).
   Despacha por `answer_type`:
   - `single_choice`/`multi_choice`: igualdad de conjuntos de option ids contra
     `correct_answer`.
   - `numeric`: `(answer["value"] - expected).abs <= step.tolerance` (castear con rigor;
     input no numérico → incorrecto con error de formato, no excepción).
   - `expression`: equivalencia numérica por muestreo (abajo).
2. `Validation::ExpressionParser`: tokenizer + parser recursivo (precedencia estándar) a un
   AST. Acepta: números, variables declaradas en `exercise.variables`, `+ - * / ^`,
   paréntesis, funciones whitelist `sin cos tan log ln sqrt abs exp`, unario `-`.
   Cualquier otro token → `ParseError` con posición.
3. `Validation::ExpressionEvaluator.eval(ast, bindings)` → Float. División por cero /
   dominio inválido (log de negativo) en un punto de muestreo → descartar ese punto y
   muestrear otro (máx 3N intentos).
4. Equivalencia: N=12 puntos aleatorios (semilla determinista por submission para
   reproducibilidad en tests) dentro del dominio de `exercise.variables`; equivalentes si
   `|a-b| <= tolerance * max(1, |b|)` en todos los puntos.
5. Tests exhaustivos: casos equivalentes no triviales (`(x+1)^2` vs `x^2+2*x+1`), no
   equivalentes cercanos, errores de sintaxis, inyecciones (`system(...)`, backticks) que
   deben fallar como `ParseError`, tolerancias, dominios con singularidades (`1/x`).

## Criterios de aceptación

- Suite de al menos 30 casos de expresión pasando.
- Ninguna ruta de código ejecuta strings del usuario como Ruby.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman   # brakeman sin warnings de eval
```
