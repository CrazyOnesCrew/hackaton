# Implementation Plan: PAAG

**Branch**: `001-paag` | **Date**: 2026-07-16 | **Spec**: [spec.md](./spec.md)

## Summary

Construir PAAG sobre el stack **ya existente en este repositorio**, sin introducir runtimes
nuevos. `proyecto.md` aporta únicamente el *qué* (flujos, casos de uso, pedagogía); todas sus
decisiones tecnológicas (Node/Express, MariaDB, DeepSeek, SymPy/Math.js) fueron **descartadas**
(ADR-006).

## Technical Context

| Aspecto | Decisión |
|---|---|
| Backend / lógica de negocio | Ruby on Rails 8.1 (`apps/api`) — única autoridad (ADR-002) |
| Base de datos | PostgreSQL 17 (contenedor `db` del `docker-compose.yml`) |
| Jobs asíncronos | Solid Queue (servicio `worker` ya definido en compose) |
| App estudiante/público | `apps/mobile`: Expo 54 + expo-router + **react-native-web** → iOS, Android y **web** desde un solo código |
| Gestor de contenidos (auxiliares/admin) | `apps/portal`: Next.js 16 + Tailwind 4, BFF con cookies httpOnly (ya implementado) |
| IA (feedback semántico) | Gema `anthropic` (ya en `Gemfile`), `ANTHROPIC_API_KEY` (ya en `apps/api/.env.example`), detrás de un adapter (ADR-004) |
| Validación matemática | Ruby puro dentro de Rails: respuestas estructuradas + equivalencia numérica por muestreo (ADR-005). Sin SymPy, sin Math.js autoritativo |
| LTI 1.3 | Implementación en Rails (OIDC login/launch, JWKS, AGS). Contingencia: export CSV Moodle (ADR-003) |
| Contenedores | Docker Compose para dev (db, api, worker, portal); imágenes prod ya existentes (`apps/api/Dockerfile`, `apps/portal/Dockerfile`) + export estático de Expo web |
| Testing | Minitest (api), Vitest (portal), Jest (mobile). Sin llamadas vivas a IA en tests |

## Constitution Check

- **I. Spec-Driven**: este directorio es el spec aprobado; cada ticket referencia sus FRs.
- **II. Vertical slices**: los clientes arrancan mock-first contra `contracts/`
  (`EXPO_PUBLIC_USE_MOCK_API` ya existe en mobile); cada épica termina integrada end-to-end.
- **III. Rails source of truth**: scoring, validación, dificultad, LTI e IA viven solo en
  `apps/api`. Los clientes solo pre-validan UX (ej. formato de un número) sin autoridad.
- **IV. Simplicidad**: cero servicios nuevos (se descartó el sidecar SymPy), cero dependencias
  de runtime nuevas en el backend salvo las que un ticket justifique (ej. JWT para LTI).
- **V. Test gate**: cada ticket lista sus comandos de verificación (tabla §7 de `AGENTS.md`).

## Decisiones técnicas clave

### Validación matemática determinista (ADR-005)

Los pasos de un ejercicio son **tipados**; la validación depende del tipo, todo en Ruby:

| `answer_type` | Validación |
|---|---|
| `single_choice` / `multi_choice` | Comparación exacta contra ids de opciones correctas |
| `numeric` | `\|respuesta - esperado\| <= tolerance` (tolerancia por paso) |
| `expression` | Equivalencia numérica: evaluar respuesta y esperado en N puntos de muestreo aleatorios dentro de un dominio definido por el ejercicio; equivalentes si coinciden dentro de la tolerancia en todos los puntos. Parser propio de expresiones aritméticas (whitelist de funciones: `sin, cos, tan, log, ln, sqrt, abs, exp`, operadores y variables declaradas). **Nunca** `eval` de Ruby |

El banco XML define para cada paso: tipo, respuesta esperada, tolerancia, variables y dominio
de muestreo. Esto hace la validación barata, determinista y testeable sin dependencias.

### Feedback IA (ADR-004)

- `Ai::FeedbackService` con adapter (`Ai::Providers::Anthropic`) — cambiar de proveedor es
  implementar otro adapter.
- Input: enunciado + paso + respuesta del estudiante + veredicto determinista.
  Output estructurado (JSON): `{ verdictAgrees: bool, feedback: string, errorTag: string? }`.
- Reglas: timeout 8s, sin reintentos síncronos, la IA **no** puede cambiar el veredicto
  determinista; si `verdictAgrees=false` solo se loguea para auditoría. Tests con dobles.

### LTI 1.3 (ADR-003)

- Endpoints: `GET/POST /lti/login` (OIDC initiation), `POST /lti/launch` (validación id_token
  contra JWKS de la plataforma, nonce/state), `GET /lti/jwks` (llaves públicas de la tool).
- AGS: job Solid Queue `GradePassbackJob` con reintentos/backoff, tabla de auditoría `grade_syncs`.
- El launch crea/vincula `User` (por `iss`+`sub`) y una `Session` normal del template, luego
  redirige a la app web de Expo con el token: la app estudiante no distingue LTI de público
  salvo por el origen de la `LessonSession`.
- Dependencia nueva justificada: gema `jwt` (verificación de id_tokens). Evaluar en el ticket
  si `json-jwt`/`jwt` alcanza antes de considerar gemas LTI completas.

### Sesión dual (FR-005)

- **Registrado/LTI**: `Session` + Bearer del template (ya implementado).
- **Invitado**: sin cuenta; la app crea `LessonSession` anónimas con un `guestToken` generado
  por el backend (sin PII); el historial vive en el dispositivo (MMKV / localStorage).

### Estilo visual (styleguide.md)

Tokens compartidos conceptualmente (cada app los implementa en su sistema):
paleta lavanda `#B9A8F0`-ish como primario, ámbar como acento, fondos blanco/gris muy claro,
pills full-rounded, cards radius 24–30px sin sombras, tipografía Nunito (Google Fonts en
portal, `expo-font` en mobile). Detalle en tickets PAAG-002/003.

## Estructura del feature

```text
specs/001-paag/
├── spec.md              # Qué/por qué (aprobado)
├── plan.md              # Este archivo
├── data-model.md        # Entidades y migraciones
├── quickstart.md        # Levantar todo con Docker
├── contracts/           # Contratos API + XSD + LTI + CSV (fuente de verdad para clientes)
├── tasks.md             # Índice de épicas/tickets, dependencias, asignación
├── tickets/             # Un .md por ticket, autocontenido para un agente
└── team/                # Guía de arranque por desarrollador (A/B/C)
```

## Orden de ejecución (resumen)

E00 Fundaciones → E01 Dominio → (E02 XML ∥ E03 Motor) → E04 Validación → (E05 IA ∥ E06
Dificultad) → (E07 LTI ∥ E08 CSV) → E11 Gamificación → E12 Despliegue.
E09 (mobile) y E10 (portal) corren **en paralelo desde que existen los contratos**, mock-first.
