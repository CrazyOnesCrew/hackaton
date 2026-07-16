# PAAG-151: Dificultad dinámica y selección del siguiente ejercicio

**Épica**: E06 | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-122 | **Rama**: `feature/paag-151-dificultad-dinamica`

## Contexto

Al terminar un intento, el estudiante elige explícitamente subir/mantener/bajar dificultad
(US8/CDU008 en `spec.md`). **Contrato: `contracts/solving.md` sección "Dificultad dinámica"**.

## Alcance

1. `POST /api/v1/lesson_sessions/:id/attempts` con `difficultyChoice: keep|increase|decrease`:
   - 422 si el attempt actual sigue `in_progress`.
   - Nueva dificultad = dificultad del attempt anterior ± 1 nivel (clamp easy..hard).
2. `Exercises::RandomPicker.call(topic:, difficulty:, exclude_ids:)` (service):
   - Excluye ejercicios ya intentados en la lección.
   - Si no hay en el nivel pedido: busca en el nivel más cercano (primero ±1, luego ±2) y
     marca `fallback: true` + `difficultyApplied` en la respuesta.
   - Si no queda ningún ejercicio sin repetir en el topic: 422 `code: bank_exhausted` con
     mensaje claro (la UI ofrece cerrar la lección).
3. Refactorizar la creación del primer attempt (PAAG-122) para usar el mismo picker
   (`difficulty_choice: initial`).
4. Tests: transiciones de dificultad, clamps en extremos, fallback, banco agotado, exclusión
   de repetidos.

## Criterios de aceptación

- Secuencia easy → increase → increase queda en hard (clamp); decrease desde easy queda easy.
- Nunca se repite un ejercicio dentro de la misma lección.

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
