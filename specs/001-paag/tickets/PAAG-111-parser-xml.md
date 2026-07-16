# PAAG-111: Parser y validador XML del banco de ejercicios

**Épica**: E02 Import XML | **App**: `apps/api` | **Asignado**: Dev A
**Depende de**: PAAG-101 | **Rama**: `feature/paag-111-parser-xml`

## Contexto

Los auxiliares cargan ejercicios en lote vía XML. El esquema oficial es
**`specs/001-paag/contracts/exercise-bank.xsd`** (leerlo completo; también la semántica en
`contracts/imports-exports.md`). Rails ya incluye Nokogiri (dependencia de Rails) — usarlo
para parseo y validación XSD; no agregar gemas.

## Alcance

1. Copiar el XSD a `apps/api/app/services/exercise_bank/schema.xsd` (fuente de verdad sigue
   siendo el de contracts/; mantener sincronizados — anotar comentario).
2. `ExerciseBank::Parser` (POROs en `app/services/exercise_bank/`):
   - `validate_schema(xml_string)` → errores de XSD legibles (o vacío).
   - `parse(xml_string)` → array de hashes con el shape de atributos de `Exercise` +
     `steps` + `hints` anidados (mapear `phase`/`answerType`/`difficulty` a los enums).
3. Validaciones semánticas post-XSD por ejercicio (el XSD no las cubre):
   `topicSlug` existe; steps choice tienen ≥1 opción `correct="true"`; steps
   numeric/expression traen `correctAnswer` con el atributo correcto; variables declaradas
   cubren las usadas en expresiones.
4. Fixtures de test: XML válido completo, XML con XSD roto, XML con errores semánticos
   parciales (en `test/fixtures/files/`).
5. Tests unitarios exhaustivos del parser.

## Fuera de alcance

- Persistencia y endpoints (PAAG-112).

## Criterios de aceptación

- El fixture válido produce hashes listos para `Exercise.create!`.
- Errores devueltos con índice del ejercicio y mensaje claro (los verá el auxiliar en el portal).

## Verificación

```bash
cd apps/api
bin/rails test && bin/rubocop && bin/brakeman
```
