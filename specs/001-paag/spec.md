# Feature Specification: Plataforma de Aprendizaje Automatizado Gamificado (PAAG)

**Feature Branch**: `001-paag` (épicas individuales en ramas `feature/paag-xxx-*`)
**Created**: 2026-07-16
**Status**: Approved
**Input**: `proyecto.md` (solo especificaciones funcionales; sus decisiones tecnológicas fueron descartadas — ver `plan.md` y ADR-006)

> **Neutralidad institucional**: PAAG es una plataforma **libre**, agnóstica de institución.
> Ningún artefacto (código, docs, seeds, UI) debe mencionar universidades, facultades o
> sistemas institucionales específicos. La integración LMS se describe siempre como
> "cualquier LMS compatible con LTI 1.3 (ej. Moodle)".

## Resumen

PAAG es un ecosistema de práctica matemática **paso a paso**, asistido por IA y gamificación.
Sustituye los cuestionarios de selección múltiple por resolución estructurada: cada ejercicio
se desglosa en fases lógicas (identificación, planteamiento, herramientas, procedimiento) con
retroalimentación inmediata. Opera en dos modos:

1. **Modo LMS (LTI 1.3)**: un estudiante entra desde su LMS vía LTI, resuelve una lección y su
   nota regresa automáticamente al LMS (Grade Passback / AGS).
2. **Modo público**: cualquier persona usa la plataforma libremente (invitado o registrado),
   con historial propio, sin ninguna dependencia de un LMS.

## Actores

| Actor | Descripción | App cliente |
|---|---|---|
| **Estudiante (LTI)** | Llega desde un LMS vía LTI 1.3; su nota se sincroniza al LMS | `apps/mobile` (web) |
| **Público General** | Usuario libre, invitado o registrado; practica sin LMS | `apps/mobile` (iOS/Android/web) |
| **Auxiliar** | Gestiona el banco de ejercicios (carga XML, edición, orden) y exporta notas | `apps/portal` |
| **Admin** | Todo lo del auxiliar + gestión de usuarios y configuración LTI | `apps/portal` |

## Historias de usuario (derivadas de CDU001–CDU008)

### US1 — Ingresar vía LTI y guardar sesión (CDU001) — P1

Como estudiante, quiero entrar a PAAG desde mi LMS sin registrarme, para que mi identidad y
contexto de curso se reconozcan automáticamente.

**Given** un LMS con la tool PAAG configurada (LTI 1.3), **When** el estudiante lanza la
actividad, **Then** PAAG valida el launch OIDC, crea/vincula al usuario, abre sesión y lo
redirige a la lección asociada al enlace, sin pedir credenciales.

### US2 — Resolver ejercicios paso a paso (CDU002) — P1

Como estudiante, quiero resolver un ejercicio guiado por fases obligatorias, para desarrollar
método y no solo respuestas.

Fases (flexibles a subfases definidas por el ejercicio):

1. **¿Qué estoy viendo?** — identificación de conceptos.
2. **¿Qué debo hacer?** — planteamiento del objetivo.
3. **¿Qué herramientas tengo?** — selección de teoremas/fórmulas.
4. **Procedimiento** — desarrollo y resolución paso a paso.

**Given** una lección iniciada, **When** el estudiante responde cada fase, **Then** el sistema
valida la respuesta (motor determinista + IA), da feedback inmediato y solo avanza al
completar la fase (con puntaje parcial si hubo errores).

### US3 — Práctica libre dentro del banco (CDU003) — P1

Como público general, quiero elegir un tema y practicar ejercicios del banco sin venir de un
LMS, para estudiar por mi cuenta.

**Given** un usuario público (invitado o registrado), **When** selecciona tema y dificultad,
**Then** recibe un ejercicio aleatorio del banco publicado y sigue el mismo flujo paso a paso;
su resultado se guarda en historial local (invitado) o remoto (registrado).

### US4 — Recibir feedback (CDU004) — P1

Como estudiante, quiero saber inmediatamente qué hice mal y por qué, para corregir en el momento.

**Given** una respuesta enviada en cualquier fase, **When** el motor determinista la evalúa,
**Then** el estudiante recibe correcto/incorrecto al instante; **And** cuando la IA está
disponible, recibe además feedback semántico (ej. "te equivocaste en la ley de signos");
**And** si la IA falla o tarda más del timeout, el feedback determinista es suficiente y
autoritativo (nunca se bloquea el flujo por la IA).

### US5 — Cargar archivos XML para el banco (CDU005) — P2

Como auxiliar, quiero cargar ejercicios en lote mediante un archivo XML validado, para hacer
crecer el banco sin tocar la base de datos.

**Given** un XML conforme al esquema publicado (`contracts/exercise-bank.xsd`), **When** el
auxiliar lo sube desde el portal, **Then** el sistema lo procesa en segundo plano, crea los
ejercicios en estado borrador y entrega un reporte por elemento (creados / rechazados con
motivo). Un XML inválido no crea nada parcialmente inconsistente.

### US6 — Configurar conexión LTI (CDU006) — P2

Como admin, quiero registrar una plataforma LMS (issuer, client id, endpoints, llaves), para
habilitar los launches y el grade passback.

### US7 — Obtener puntaje sincronizado al LMS (CDU007) — P1

Como estudiante LTI, quiero que mi nota de la lección llegue automáticamente a mi LMS.

**Given** una lección de origen LTI completada, **When** se calcula el puntaje final,
**Then** PAAG lo envía al LMS vía AGS (asíncrono, con reintentos); **And** el resultado del
envío queda auditado. Si el origen fue público, el resultado va solo al historial.

### US8 — Realizar otro ejercicio con dificultad variable (CDU008) — P1

Como estudiante, al terminar un ejercicio (éxito o fracaso) quiero elegir explícitamente si el
siguiente será más difícil, igual o más fácil, para controlar mi ritmo.

**Given** un intento finalizado, **When** el estudiante elige subir/mantener/bajar dificultad,
**Then** el sistema selecciona aleatoriamente un ejercicio no repetido del banco en ese nivel;
**And** si no hay ejercicios disponibles en ese nivel, ofrece el nivel más cercano y lo indica.

### US9 — Exportación de notas CSV (contingencia) — P2

Como auxiliar, quiero exportar las notas de un contexto en CSV compatible con importación de
Moodle, para cuando el grade passback LTI no esté disponible o esté bloqueado.

### US10 — Gamificación — P3

Como estudiante, quiero ganar puntos, mantener rachas y desbloquear insignias al practicar,
para mantenerme motivado. Los datos se persisten en el backend (usuarios registrados/LTI).

## Requerimientos funcionales

- **FR-001** Integración LTI 1.3: OIDC login/launch, validación de firma (JWKS), Deep Linking
  básico (asociar enlace → lección) y AGS para calificaciones.
- **FR-002** Módulo de resolución estructurada: ejercicios compuestos de pasos tipados por
  fase; no se avanza sin completar la fase actual.
- **FR-003** Dificultad dinámica: elección explícita del usuario tras cada intento
  (subir/mantener/bajar); selección aleatoria sin repetición dentro de la sesión.
- **FR-004** Gestor de contenido: CRUD de ejercicios para rol `auxiliary`/`admin` + carga XML
  en lote con validación y reporte.
- **FR-005** Sesión dual: tráfico LTI (autenticado por launch) vs web/móvil abierta
  (invitado o cuenta propia). El auth de cuentas ya existe en `apps/api` y se reutiliza.
- **FR-006** Validación asistida: motor determinista en Rails (autoridad) + feedback semántico
  IA (complemento, con timeout y fallback).
- **FR-007** Puntaje: parcial por paso (errores/pistas restan), total por intento, agregado
  por lección; persistido y auditable.
- **FR-008** Export CSV compatible Moodle por contexto LTI.
- **FR-009** Gamificación: puntos, rachas, insignias.

## Requerimientos no funcionales

- **NFR-001** Todo el stack corre en Docker (dev y prod); despliegue agnóstico On-Premise/Cloud.
- **NFR-002** Base de datos relacional: PostgreSQL (la del repo).
- **NFR-003** Los clientes nunca contienen lógica de negocio autoritativa (ADR-002).
- **NFR-004** Tests automatizados sin llamadas vivas a IA (dobles/mocks).
- **NFR-005** UI conforme a `styleguide.md` (paleta pastel lavanda/ámbar, pills, cards
  redondeadas, flat design, tipografía redondeada).
- **NFR-006** Identificadores de código, DB y API en inglés; copy de UI en español.

## Casos borde

- Launch LTI con firma inválida o `nonce` repetido → rechazo con error claro, sin sesión.
- IA no disponible / timeout → feedback determinista solamente; el flujo nunca se bloquea.
- XML parcialmente válido → se importan los válidos, reporte detallado de los rechazados
  (comportamiento transaccional por ejercicio, no por archivo).
- Banco sin ejercicios en la dificultad pedida → ofrecer nivel más cercano, indicándolo.
- Invitado cierra el navegador → historial local se conserva (storage del dispositivo); al
  registrarse no se migra automáticamente (exclusión de alcance, ver abajo).
- Grade passback falla (LMS caído) → reintentos con backoff; visible en auditoría; el
  auxiliar siempre puede usar el export CSV.

## Criterios de éxito

- **SC-001** Un estudiante puede completar el ciclo LTI completo: launch → lección → nota en
  el LMS, sin intervención manual.
- **SC-002** Un usuario público puede completar un ejercicio paso a paso de inicio a fin,
  incluyendo feedback y elección de dificultad siguiente, en móvil y en web.
- **SC-003** Un auxiliar puede poblar el banco vía XML y ver el reporte de importación.
- **SC-004** Con la IA deshabilitada, la plataforma sigue siendo completamente funcional.
- **SC-005** `docker compose up` levanta el entorno completo de desarrollo.

## Exclusiones (fuera de alcance de esta fase)

- Editor visual/WYSIWYG de ejercicios (solo XML + CRUD básico).
- Migración de historial invitado → cuenta registrada.
- Notificaciones push, modo offline completo, i18n más allá de es/en copy.
- Reconocimiento de escritura a mano / OCR de procedimientos.
- LTI 1.1 o versiones anteriores.
- Analíticas avanzadas para docentes (solo listado de resultados + CSV).

## Entidades clave

Ver `data-model.md`. Resumen: `Subject → Topic → Exercise → ExerciseStep (+ Hint)` para el
banco; `LessonSession → Attempt → StepSubmission` para la resolución; `LtiPlatform`,
`LtiResourceLink`, `GradeSync` para LTI; `GamificationProfile`, `Badge` para gamificación.
