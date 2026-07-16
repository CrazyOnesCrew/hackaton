# PAAG-204: Mobile — feedback, resultados y elección de dificultad siguiente

**Épica**: E09 | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: PAAG-203 | **Rama**: `feature/paag-204-mobile-feedback`

## Contexto

Cierre del ciclo de un intento (US4 + US8 del `spec.md`). **Contrato: `contracts/solving.md`**
(secciones "Envío de pasos" y "Dificultad dinámica"). Estilo `styleguide.md` con la mascota
ilustrada (estilo búho/gato de la referencia) como acompañante del feedback.

## Alcance

1. Card de feedback en el paso (dentro de PAAG-203, aquí se pule): muestra
   `feedback.deterministic` siempre y `feedback.ai` cuando `aiStatus=ok` (con etiqueta sutil
   "Tutor IA"); estados `timeout/error/skipped` → solo determinista, sin mostrar error técnico.
2. Pantalla de resultado del intento (`practice/results` o modal al completar):
   puntaje obtenido/máximo con animación, resumen de pasos (correcto al 1er intento /
   con reintentos / con pistas), mascota con mensaje según desempeño.
3. Selector de siguiente acción (US8): tres cards/botones pill — "Más difícil" /
   "Igual" / "Más fácil" → `POST /lesson_sessions/:id/attempts` con `difficultyChoice`;
   mostrar aviso si la respuesta trae `fallback: true` ("no hay ejercicios de ese nivel,
   te damos uno <nivel>"); y botón "Terminar" → `POST /lesson_sessions/:id/complete` →
   pantalla de resumen de lección con `finalScore`.
4. Caso `bank_exhausted` (422): mensaje amable + solo opción de terminar.
5. Tests: render de resultados, las 4 acciones, fallback y banco agotado.

## Criterios de aceptación

- Con mocks: completar ejercicio → elegir "más difícil" → recibir nuevo ejercicio → terminar
  lección → ver resumen con nota final, en móvil y web.

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
