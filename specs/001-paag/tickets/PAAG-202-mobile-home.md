# PAAG-202: Mobile — Home: selección de tema y dificultad

**Épica**: E09 | **App**: `apps/mobile` | **Asignado**: Dev B
**Depende de**: PAAG-201 | **Rama**: `feature/paag-202-mobile-home`

## Contexto

Primera pantalla del estudiante. **Estilo: `styleguide.md`** — layout tipo "Study Guide" de
la referencia: header limpio, chips de filtro pill, cards muy redondeadas con iconos de
materia coloridos, paleta pastel. Componentes base de PAAG-003. Datos: `GET /subjects` y
`GET /subjects/:slug/topics` (contrato `content.md`).

## Alcance

1. `practice/index`: lista de subjects como cards (icono, nombre, número de temas); al
   expandir/entrar, topics con sus `exerciseCounts` por dificultad como chips de color
   (easy=verde suave, medium=ámbar, hard=coral — dentro de la paleta pastel).
2. Selector de dificultad inicial (chips pill: Fácil/Medio/Difícil) antes de iniciar.
3. CTA "Practicar" → `POST /lesson_sessions` → navega a `practice/[topicId]` con la lección.
4. Estados: loading (skeletons), error con retry, topic sin ejercicios en el nivel
   (deshabilitar chip con conteo 0).
5. Animaciones sutiles con Moti (ya instalada) para entrada de cards.
6. Tests de la pantalla (render, selección, navegación) con Testing Library.

## Criterios de aceptación

- Flujo tema+dificultad → lección creada funciona con mocks en móvil y web.
- Visual conforme al styleguide (verificar contra `styleguide.md`, no inventar estilos).

## Verificación

```bash
cd apps/mobile
pnpm type-check && pnpm lint && pnpm test
```
