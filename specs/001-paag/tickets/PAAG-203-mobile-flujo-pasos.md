# PAAG-203: Mobile — flujo de resolución paso a paso (4 fases)

**Épica**: E09 | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: PAAG-201 | **Rama**: `feature/paag-203-mobile-flujo-pasos`

## Contexto

La pantalla núcleo de PAAG (US2 del `spec.md`). El ejercicio se resuelve por fases:
¿Qué estoy viendo? → ¿Qué debo hacer? → ¿Qué herramientas tengo? → Procedimiento.
**Contrato: `contracts/solving.md`** (shapes de attempt/step/submission, semántica de
avance). Estilo `styleguide.md`: cards redondeadas, progreso amigable, tono lúdico.

## Alcance

1. `practice/[topicId]`: layout con enunciado arriba (card, LaTeX), indicador de progreso de
   fases (4 puntos/chips con la fase actual resaltada en lavanda), y el paso actual abajo.
2. Inputs por `answerType`:
   - `single_choice`/`multi_choice`: opciones como chips/cards seleccionables.
   - `numeric`: input numérico con teclado adecuado.
   - `expression`: input de texto con hint de sintaxis (`2*x+1`); pre-validación UX ligera
     de paréntesis balanceados (solo aviso visual — la autoridad es el backend, ADR-002).
3. Envío → `POST /attempts/:id/step_submissions`; respuesta incorrecta: shake sutil + card
   de feedback (determinista + IA si viene, ver PAAG-204) y permite reintentar; correcta:
   check animado y avanza a `nextStep`.
4. Botón de pista (icono ámbar): `POST /attempts/:id/hints`, muestra la pista en bottom
   sheet (Gorhom, ya instalada) con nota de penalización.
5. Puntaje del intento visible (badge ámbar arriba a la derecha, estilo styleguide).
6. Reanudación: al abrir con una lección `active`, cargar `GET /lesson_sessions/:id` y
   continuar donde iba.
7. Tests: render por tipo de input, avance de paso, manejo de error de red.

## Criterios de aceptación

- Con mocks: completar un ejercicio de 4 fases de punta a punta en móvil y web, incluyendo
  un reintento y una pista.
- La UI nunca queda bloqueada esperando feedback IA (`aiStatus` puede ser `timeout`).

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
