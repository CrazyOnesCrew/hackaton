# PAAG-101: Modelos y migraciones del banco de ejercicios + seeds

**Épica**: E01 Dominio | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-004 | **Rama**: `feature/paag-101-modelos-banco`

## Contexto

Base de datos del banco de contenido de PAAG. Leer **obligatoriamente**
`specs/001-paag/data-model.md` (sección "Banco de contenido") — ahí están columnas, enums y
constraints exactos. Convenciones del repo: migraciones Rails como fuente de verdad, concern
`Discardable` existente para soft-delete, identificadores en inglés.

## Alcance

1. Migraciones y modelos: `Subject`, `Topic`, `Exercise`, `ExerciseStep`, `Hint`,
   `ExerciseImport` (solo la tabla; el flujo de import es PAAG-111/112).
2. Validaciones de modelo:
   - Slugs autogenerados (parameterize) y únicos en su ámbito.
   - `ExerciseStep`: `options` requerido y no vacío si `answer_type` es choice;
     `correct_answer` con el shape correcto según tipo (validación custom);
     `position` única por exercise.
   - `Exercise#publishable?`: al menos un paso de fase `procedure` y todos los pasos con
     respuesta correcta definida. Transición a `published` la valida (se usa en PAAG-103).
3. Asociaciones con `dependent:` correcto y scopes: `Exercise.published`, `by_difficulty`.
4. Seeds idempotentes (`db/seeds.rb` o seed file separado): 2 subjects, 4 topics y ~10
   ejercicios completos de álgebra básica con sus 4 fases, opciones, respuestas numéricas y
   de expresión, y pistas. **Contenido matemático genérico, sin referencias institucionales.**
   Estos seeds son los que usarán B y C para probar; que sean realistas.
5. Annotate/tests de modelos (validaciones y scopes).

## Criterios de aceptación

- `bin/rails db:reset` deja un banco navegable (subjects → topics → exercises publicados).
- No se puede publicar un ejercicio sin paso `procedure` ni guardar un step choice sin opciones.

## Verificación

```bash
cd apps/api
bin/rails db:reset && bin/rails test && bin/rubocop && bin/brakeman
```
