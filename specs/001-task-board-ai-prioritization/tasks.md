# Tareas: Tablero de tareas y priorización con IA

**Entrada**: documentos de diseño en `specs/001-task-board-ai-prioritization/`

**Prerequisitos**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/frontend-api.md` y `quickstart.md`.

**Alcance**: frontend y sidecar local Node/Express del integrante 2. No modificar el
backend oficial, OpenAPI ni colecciones Postman del integrante 1. La integración local
con Gemini no proporciona autorización de usuarios ni persistencia y no es una ruta de
producción.

**Formato**: `- [ ] T### [P?] [US#?] Descripción con ruta(s) de archivo`

- `[P]` identifica tareas paralelizables que escriben archivos distintos y no dependen
  entre sí.
- `[US#]` identifica la historia de usuario de `spec.md`; las tareas Setup, Foundational
  y Polish no llevan etiqueta de historia.
- Las pruebas preceden a la implementación de cada historia. Mantener todos los
  checkboxes vacíos hasta ejecutar realmente las tareas.

## Fase 1: Setup

**Propósito**: inicializar la aplicación frontend y sus herramientas.

- [X] T001 Crear el esqueleto React + TypeScript + Vite, scripts `dev`, `build` y `typecheck` y puntos de entrada en `frontend/package.json`, `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/app/App.tsx`, `frontend/tsconfig.json` y `frontend/vite.config.ts`.
- [X] T002 Configurar Tailwind CSS 4 con el plugin de Vite y estilos base adaptables en `frontend/package.json`, `frontend/vite.config.ts` y `frontend/src/styles.css`.
- [X] T003 Añadir Vitest, React Testing Library, `user-event`, `jest-dom` y MSW; configurar entorno y setup de pruebas en `frontend/package.json`, `frontend/vitest.config.ts` y `frontend/tests/setup.ts`.
- [X] T004 Añadir Playwright y el script `test:e2e`; configurar servidor y directorio de pruebas en `frontend/package.json`, `frontend/playwright.config.ts` y `frontend/tests/e2e/`.

## Fase 2: Fundamentos compartidos

**Propósito**: preparar contratos tipados, selección explícita de servicio y componentes
de estado antes de desarrollar las historias.

- [X] T005 Crear un generador de tipos TypeScript desde el OpenAPI existente, leyéndolo sin modificarlo, y escribir el resultado en `frontend/scripts/generate-api-types.mjs` y `frontend/src/types/openapi.d.ts`.
- [X] T006 [P] Escribir pruebas del cliente HTTP para base URL con `/v1` una sola vez, `POST /auth/login`, token en memoria, Bearer en rutas protegidas, errores HTTP y respuesta `204` sin parseo JSON en `frontend/tests/unit/api-client.test.ts`; escribir pruebas de login con email/password y respuesta `AuthResponse` en `frontend/tests/component/LoginForm.test.tsx`.
- [X] T007 Implementar el cliente HTTP tipado, el token solo en memoria y la normalización de errores en `frontend/src/services/api/client.ts` y `frontend/src/services/api/errors.ts`, haciendo pasar `frontend/tests/unit/api-client.test.ts`.
- [X] T008 [P] Escribir pruebas que exijan selección explícita `api` o `demo` y demuestren que un error API nunca activa demo automáticamente en `frontend/tests/unit/data-mode.test.ts`.
- [X] T009 Implementar resolución explícita `api`/`demo` y configuración pública `VITE_API_BASE_URL`/`VITE_PROJECT_ID` en `frontend/src/app/dataMode.ts` y `frontend/.env.example`; exigir project UUID en modo API y permitir demo sin credenciales ni proyecto remoto, haciendo pasar `frontend/tests/unit/data-mode.test.ts`.
- [X] T010 [P] Escribir pruebas de fixtures deterministas, mutaciones volátiles y ausencia de llamadas HTTP en `frontend/tests/unit/demo-task-service.test.ts`.
- [X] T011 Implementar fixtures de tareas y servicio demo en memoria, cubriendo los estados `TODO`, `IN_PROGRESS`, `DONE` y las prioridades `HIGH`, `MEDIUM`, `LOW`, en `frontend/src/services/demo/taskFixtures.ts` y `frontend/src/services/demo/taskService.ts`.
- [X] T012 Crear login API para email/password y componentes compartidos de carga, error y modo demostración con mensajes anunciables y etiqueta demo persistente en `frontend/src/features/auth/LoginForm.tsx`, `frontend/src/components/feedback/LoadingState.tsx`, `frontend/src/components/feedback/FeedbackBanner.tsx` y `frontend/src/components/feedback/ModeBanner.tsx`; validar el login con `frontend/tests/component/LoginForm.test.tsx`.

## Fase 3: User Story 1 - Consultar el tablero (Priority: P1) 🎯 MVP

**Meta**: mostrar tareas de un proyecto conocido, agrupadas una sola vez por estado, con
estados de carga, vacío y error.

**Prueba independiente**: proporcionar tareas de los tres estados y verificar columnas y
tarjetas; comprobar vacío, error recuperable y descarte de respuestas de proyectos o
consultas obsoletas.

### Pruebas de User Story 1

- [X] T013 [P] [US1] Escribir pruebas de tablero para carga, vacío, error con reintento, distribución exacta de estados y respuesta obsoleta en `frontend/tests/component/ProjectBoard.test.tsx`.
- [X] T014 [P] [US1] Escribir pruebas MSW de `GET /projects/{project_id}/tasks` con Bearer y respuesta array `Task`, asegurando URL `/v1` no duplicada, en `frontend/tests/integration/task-list-api.test.ts`.

### Implementación de User Story 1

- [X] T015 [US1] Implementar `listTasks(projectId, filters?)` contra `GET /projects/{project_id}/tasks` usando solo query parameters `status` (`TODO`, `IN_PROGRESS`, `DONE`) y `priority` (`HIGH`, `MEDIUM`, `LOW`) en `frontend/src/services/tasks/taskApi.ts`.
- [X] T016 [P] [US1] Crear tarjeta y columnas semánticas usando los campos `Task` requeridos `id`, `project_id`, `title`, `status`, `priority`, `created_at`; `description` opcional; `assigned_to` UUID string o `null`; `due_date` date-time string o `null`; y `ai_score` number o `null`. Respetar enums `TODO`, `IN_PROGRESS`, `DONE` y `HIGH`, `MEDIUM`, `LOW`; mostrar fecha opcional y score solo si no es `null` en `frontend/src/components/board/TaskCard.tsx` y `frontend/src/components/board/BoardColumn.tsx`.
- [X] T017 [US1] Crear la vista del tablero para el proyecto conocido, conectando los servicios `api`/`demo`, agrupando por enums exactos y descartando respuestas obsoletas tras cambiar proyecto, en `frontend/src/features/tasks/ProjectBoard.tsx`.

**Checkpoint**: completar T001-T017 debe permitir demostrar el tablero sin CRUD; el modo
demo estará identificado y el modo API consultará una ruta OpenAPI existente.

## Fase 4: User Story 2 - Crear y editar tareas (Priority: P1)

**Meta**: crear y editar tareas permitidas conservando borradores y mostrando solo valores
confirmados por la respuesta del servicio.

**Prueba independiente**: crear con título válido y prioridad permitida, rechazar título
vacío y editar un detalle; los fallos no descartan el borrador ni cambian la tarjeta.

### Pruebas de User Story 2

- [X] T018 [P] [US2] Escribir pruebas de formulario para título obligatorio no vacío, selección de prioridad exacta y conservación del borrador ante error en `frontend/tests/component/TaskForm.test.tsx`.
- [X] T019 [P] [US2] Escribir pruebas MSW para `POST /tasks`, `GET /tasks/{id}` y `PUT /tasks/{id}`, validando payloads de `CreateTaskRequest`/`UpdateTaskRequest` y respuesta `Task` en `frontend/tests/integration/task-crud-api.test.ts`.

### Implementación de User Story 2

- [X] T020 [US2] Implementar métodos de creación, lectura por ID y actualización usando `POST /tasks`, `GET /tasks/{id}` y `PUT /tasks/{id}` con tipos generados: `CreateTaskRequest` requiere `project_id` y `title`, con `description`, `priority`, `assigned_to` y `due_date` opcionales; `UpdateTaskRequest` permite los campos documentados opcionales sin asumir que admitan `null`, en `frontend/src/services/tasks/taskApi.ts`.
- [X] T021 [US2] Crear formulario accesible de alta/edición con `title` obligatorio no vacío ni compuesto solo por espacios (el contrato no fija longitud máxima), `description` opcional y `priority` limitada a `HIGH`, `MEDIUM`, `LOW`; ofrecer `due_date` solo como fecha ISO 8601 con zona y no ofrecer asignación remota sin fuente autorizada en `frontend/src/components/forms/TaskForm.tsx`.
- [X] T022 [US2] Conectar alta y edición a la respuesta confirmada, impedir doble envío y conservar borrador/errores por campo ante fallos en `frontend/src/features/tasks/TaskEditor.tsx` y `frontend/src/features/tasks/ProjectBoard.tsx`.

## Fase 5: User Story 6 - Usar el tablero de forma accesible (Priority: P1)

**Meta**: garantizar que los controles existentes puedan usarse por teclado y tecnologías
de asistencia, sin depender de color, arrastre ni puntero.

**Prueba independiente**: recorrer tablero, formularios y un diálogo con teclado; verificar
nombres accesibles, vínculo de errores, foco visible y retorno del foco.

### Pruebas de User Story 6

- [X] T023 [P] [US6] Escribir pruebas de interacción por teclado y comprobaciones automatizadas de accesibilidad para tablero, formulario y diálogo en `frontend/tests/component/accessibility.test.tsx`.

### Implementación de User Story 6

- [X] T024 [US6] Ajustar tablero, tarjetas, formularios y feedback para encabezados/listas semánticos, labels asociados, `aria-describedby` en errores, anuncios de carga/error, texto además de color y layout móvil en `frontend/src/components/board/BoardColumn.tsx`, `frontend/src/components/board/TaskCard.tsx`, `frontend/src/components/forms/TaskForm.tsx` y `frontend/src/components/feedback/FeedbackBanner.tsx`.
- [X] T025 [US6] Crear diálogo reutilizable accesible que enfoque su contenido al abrirse, mantenga la tabulación, permita Escape antes de confirmar y devuelva foco al disparador en `frontend/src/components/feedback/ConfirmDialog.tsx`.

## Fase 6: User Story 3 - Cambiar estado y eliminar tareas (Priority: P2)

**Meta**: cambiar entre estados OpenAPI y borrar tras confirmación, sin actualizaciones
optimistas engañosas.

**Prueba independiente**: cambiar el estado y comprobar columna solo tras éxito; cancelar
un borrado o simular error conserva la tarjeta; una respuesta `204` elimina sin parsear
JSON.

### Pruebas de User Story 3

- [X] T026 [P] [US3] Escribir pruebas de estado con éxito/error, control operable por teclado y diálogo de borrado con confirmar/cancelar en `frontend/tests/component/TaskActions.test.tsx`.
- [X] T027 [P] [US3] Escribir pruebas MSW de actualización de `status` y `DELETE /tasks/{id}` con respuesta `204` sin cuerpo, en `frontend/tests/integration/task-actions-api.test.ts`.

### Implementación de User Story 3

- [X] T028 [US3] Implementar operaciones de cambio de estado con `PUT /tasks/{id}` y borrado con `DELETE /tasks/{id}`, tratando `204` como respuesta sin cuerpo en `frontend/src/services/tasks/taskApi.ts`.
- [X] T029 [US3] Crear control nativo accesible para cambiar `status` entre `TODO`, `IN_PROGRESS` y `DONE`, bloqueando duplicados por tarea y actualizando columna solo tras éxito en `frontend/src/components/forms/StatusSelect.tsx` y `frontend/src/features/tasks/ProjectBoard.tsx`.
- [X] T030 [US3] Integrar `ConfirmDialog` con eliminación confirmada, cancelar sin petición, error conservando la tarjeta y feedback de éxito en `frontend/src/features/tasks/TaskActions.tsx` y `frontend/src/features/tasks/ProjectBoard.tsx`.

## Fase 7: User Story 4 - Filtrar tareas (Priority: P2)

**Meta**: filtrar por estado y prioridad, mostrar criterios activos y limpiar filtros.

**Prueba independiente**: probar filtros individuales y combinados con enums exactos,
limpieza de filtros y rechazo de una respuesta de selección obsoleta.

### Pruebas de User Story 4

- [X] T031 [P] [US4] Escribir pruebas de filtros individuales/combinados, chips/valores activos y limpiar filtros en `frontend/tests/component/TaskFilters.test.tsx`.
- [X] T032 [P] [US4] Escribir pruebas MSW que verifiquen que `GET /projects/{project_id}/tasks` envía `status` y `priority` exactos y no envía parámetros vacíos en `frontend/tests/integration/task-filters-api.test.ts`.

### Implementación de User Story 4

- [X] T033 [P] [US4] Crear controles de filtro accesibles que solo permitan los enums OpenAPI y expongan una acción de limpiar en `frontend/src/components/board/TaskFilters.tsx`.
- [X] T034 [US4] Conectar filtros con `listTasks`, conservar ambos query parameters al combinarlos y evitar que respuestas antiguas reemplacen la selección actual en `frontend/src/features/tasks/ProjectBoard.tsx` y `frontend/src/services/tasks/taskApi.ts`.

## Fase 8: User Story 5 - Priorizar tareas pendientes con IA (Priority: P3)

**Meta**: priorizar con Gemini mediante el sidecar local, mantener disponible el orden
manual y validar la salida completa antes de aplicarla. La integración oficial de
producción sigue dependiendo del contrato del integrante 1.

**Prueba independiente**: ordenar tareas manualmente por `HIGH`, `MEDIUM`, `LOW`, fecha
ascendente (sin fecha al final), `created_at` e `id`; probar la fórmula con semántica fija,
validar la respuesta Gemini, evitar scores parciales y mantener prioridad manual.

### Pruebas de User Story 5

- [X] T035 [P] [US5] Escribir pruebas de orden manual determinista y controles de IA activa con opción manual disponible en `frontend/tests/component/TaskPrioritization.test.tsx`.

### Implementación de User Story 5

- [X] T036 [P] [US5] Implementar comparador manual por prioridad `HIGH`, `MEDIUM`, `LOW`, luego `due_date` ascendente con fechas ausentes al final, `created_at` ascendente e `id` ascendente en `frontend/src/features/tasks/manualPriority.ts`.
- [X] T037 [US5] Conectar los controles de priorización Gemini y fallback manual, anunciar progreso/errores, deshabilitar duplicados y no mostrar falsos scores en `frontend/src/components/board/PriorityControls.tsx` y `frontend/src/features/tasks/ProjectBoard.tsx`.
- [ ] T038 [US5] **Bloqueada por DEP-IA**: después de que el integrante 1 publique y apruebe endpoint, DTOs y errores en OpenAPI, añadir pruebas de integración que acepten solo un resultado por tarea `TODO`, validen score finito en `[0,1]`, comprueben orden descendente por `ai_score` con desempates por `created_at` e `id`, no apliquen lotes parciales, prueben timeout de 20 segundos sin reintento automático y verifiquen que los errores publicados conservan prioridad/estado y permiten continuar manualmente en `frontend/tests/integration/ai-prioritization-api.test.ts`.
- [ ] T039 [US5] **Bloqueada por DEP-IA**: implementar el cliente IA únicamente contra el endpoint y esquemas ya publicados, enlazando respuesta por `id`, dejando prioridad/estado intactos y manejando errores/timeout en `frontend/src/services/tasks/aiPrioritizationApi.ts`.
- [ ] T040 [US5] **Bloqueada por DEP-IA**: habilitar la acción IA tras publicar el contrato; impedir duplicados, refrescar tareas antes de reintento después de timeout y no aplicar respuesta al cambiar proyecto en `frontend/src/components/board/PriorityControls.tsx` y `frontend/src/features/tasks/ProjectBoard.tsx`.

### Integración IA local independiente (implementada)

- [X] T045 [US5] Crear el sidecar Node/Express de desarrollo con CORS local, límite de frecuencia, endpoint de health y errores explícitos en `ai-service/server.js` y `ai-service/src/app.js`.
- [X] T046 [US5] Integrar Gemini con salida estructurada, timeout, manejo de cuota y clave solo en servidor en `ai-service/src/gemini.js`.
- [X] T047 [US5] Validar el snapshot `TODO`, los IDs/resultados y calcular `D`, `P`, `S`, score y ranking deterministas en `ai-service/src/scoring.js`.
- [X] T048 [US5] Implementar el cliente de priorización, validación de lote, comparación del snapshot y representación de score/razón en `frontend/src/services/tasks/aiPrioritization.ts`, `frontend/src/features/tasks/ProjectBoard.tsx` y `frontend/src/components/board/TaskCard.tsx`.
- [X] T049 [US5] Añadir pruebas del sidecar, Gemini mockeado, UI, e2e y pasos de configuración/privacidad en `ai-service/test/`, `frontend/tests/` y `frontend/README.md`.

## Fase final: Polish y validación transversal

**Propósito**: documentar ejecución, recorrer flujos principales y verificar el frontend sin
alterar archivos del integrante 1.

- [X] T041 Crear guía de instalación, configuración `api`/`demo`, persistencia volátil y dependencias pendientes en `frontend/README.md`.
- [X] T042 [P] Crear recorridos Playwright de tablero, CRUD y filtros en demo, y del modo API usando MSW explícitamente identificado como mock en `frontend/tests/e2e/task-board.spec.ts`.
- [X] T043 Ejecutar typecheck, pruebas unitarias/componentes/integración, pruebas end-to-end y build; resolver fallos solo dentro de `frontend/` y registrar los comandos en `frontend/README.md`.
- [X] T044 Realizar revisión manual de teclado, foco, anuncios y layout móvil; documentar resultados y limitaciones en `frontend/README.md`.

## Dependencias externas (no son tareas del integrante 2)

No añadir tareas que modifiquen archivos del integrante 1. Los siguientes elementos deben
resolverse por su responsable antes de habilitar los flujos indicados:

- **DEP-PROYECTO**: el OpenAPI no define listado de proyectos; se necesita un
  `project_id` conocido/configurado para el modo API.
- **DEP-AUTH**: el integrante 1 debe verificar autorización en el servidor en cada
  petición protegida, incluyendo acceso al proyecto y permiso requerido, y probar
  rechazos para usuarios sin acceso o con rol insuficiente. La UI no sustituye ni infiere
  esa autorización; el modo API depende de esta garantía.
- **DEP-ROL**: `AuthResponse` no incluye MEMBER/ADMIN/VIEWER ni hay consulta documentada
  de membresía; la UI no inferirá permisos. El servidor sigue siendo autoridad y puede
  responder `403`.
- **DEP-SCORE**: gate externo del integrante 1, no tarea de implementación del integrante
  2. Antes de declarar completa la funcionalidad, el backend debe probar con D/P/S fijos
  la fórmula constitucional, los resultados `0.9000` y `0.1000`, los límites temporales,
  el redondeo y el rechazo de entradas semánticas inválidas. No duplicar el cálculo en el
  frontend.
- **DEP-PUT**: falta aclarar si PUT reemplaza o combina campos y cómo limpiar
  `due_date`/`assigned_to`; el cliente no enviará `null` ni dependerá de semántica no
  publicada.
- **DEP-ERRORES**: varias operaciones protegidas no documentan de forma uniforme `401` y
  `403`; el frontend manejará respuestas del servidor sin inventar contrato.
- **DEP-IA**: no existe `POST /projects/{project_id}/tasks/prioritize` en el OpenAPI. La
  IA conectada y T038-T040 permanecen bloqueadas hasta publicar ruta, permisos, DTOs,
  límites, errores, timeout y atomicidad. La integración también requiere comprobar orden
  descendente por `ai_score`, desempates por `created_at` e `id`, y continuidad manual ante
  los errores publicados. Los archivos backend/OpenAPI del integrante 1 quedan fuera de
  esta lista de cambios.

## Dependencias y orden de ejecución

### Dependencias de fases

- **Setup (Fase 1)**: inicializa `frontend/`; empezar por T001 y completar Tailwind y
  herramientas antes de pruebas.
- **Foundational (Fase 2)**: depende de Setup y bloquea todas las historias; tipos,
  cliente HTTP, modo explícito, servicio demo y feedback se completan primero.
- **US1 (Fase 3)**: primera entrega demostrable del tablero; depende de Setup y Foundation.
- **US2 (Fase 4)**: depende de Foundation y usa el servicio/API y el tablero de US1 para
  integración completa.
- **US6 (Fase 5)**: depende de los controles de US1/US2 y prepara el diálogo que
  reutiliza US3.
- **US3 (Fase 6)**: depende de US1, cliente HTTP y diálogo accesible de US6.
- **US4 (Fase 7)**: depende del cargador de US1 y su método de lista.
- **US5 (Fase 8)**: la integración local con Gemini y el orden manual se completan sin el
  backend oficial; T038-T040 siguen dependiendo de DEP-IA para producción.
- **Polish**: T041-T044 depende de los flujos que se desean entregar.

### Dependencias entre historias

- **US1 (P1)**: después de Foundation; independiente de otras historias y MVP.
- **US2 (P1)**: los formularios se pueden desarrollar después de Foundation; la
  integración al tablero requiere US1.
- **US6 (P1)**: reutiliza tablero/formularios de US1/US2 y se completa antes del diálogo
  de borrado de US3.
- **US3 (P2)**: depende del tablero US1 y del diálogo accesible US6.
- **US4 (P2)**: depende de US1; no depende de CRUD ni de priorización.
- **US5 (P3)**: la integración Gemini local y el orden manual son independientes; el
  endpoint oficial de producción permanece bloqueado por DEP-IA.

### Grafo de dependencias

```text
Setup -> Foundation -> US1 -> US2 -> US6 -> US3
                         |              |
                         +-> US4 -------+
Foundation -> US5 (orden manual + acción pendiente)
US5 -> ai-service local (Gemini)
DEP-IA ----> US5 (integración de producción con API oficial)
US1 + US2 + US3 + US4 + US5 + US6 -> Polish
```

### Oportunidades de paralelismo

- Tras T001, T002 puede avanzar; T003/T004 se ejecutan según dependencias de paquetes.
- En Foundation, T006, T008 y T010 escriben pruebas distintas y pueden prepararse en
  paralelo una vez instaladas las herramientas; sus implementaciones esperan los tests.
- Dentro de US1, T013 y T014 son paralelos; tras ellas, T015 y T016 pueden avanzar en
  archivos separados antes de T017.
- Dentro de US2, T018 y T019 son paralelos; T020 y T021 pueden empezar tras ambas y T022
  integra sus resultados.
- En US3, T026 y T027 son paralelos; la mutación API y componentes requieren después
  integración ordenada.
- En US4, T031 y T032 son paralelos; T033 puede desarrollarse aparte de lógica de query,
  pero T034 integra ambas.
- En US5, T035-T037 cubren controles y priorización local; T045-T049 implementan el
  sidecar independiente. T038-T040 no se ejecutan hasta cerrar DEP-IA de producción.
- T042 puede prepararse en paralelo con la documentación de T041 una vez estabilizados
  los flujos que cubrirá.

### Ejemplos de ejecución paralela

```text
Después de Setup:
- T006: pruebas del cliente HTTP en frontend/tests/unit/api-client.test.ts
- T008: pruebas de selección de modo en frontend/tests/unit/data-mode.test.ts
- T010: pruebas del servicio demo en frontend/tests/unit/demo-task-service.test.ts
```

```text
US1:
- T013: pruebas del tablero en frontend/tests/component/ProjectBoard.test.tsx
- T014: pruebas HTTP de listado en frontend/tests/integration/task-list-api.test.ts
Después de las pruebas:
- T015: servicio de listado
- T016: tarjeta/columna accesibles
```

```text
US2:
- T018: pruebas de formulario
- T019: pruebas de contrato CRUD
Después de las pruebas:
- T020: operaciones de servicio
- T021: formulario
```

## Estrategia de implementación

### MVP primero

1. Completar Fase 1 y Fase 2.
2. Completar US1, incluida carga/error/vacío y el modo demo claramente rotulado.
3. **DETENERSE Y VALIDAR** contra `frontend/tests/component/ProjectBoard.test.tsx` y
   `frontend/tests/integration/task-list-api.test.ts`.
4. Entregar una demostración navegable de tablero; el modo API real requiere proyecto y
   backend disponibles.

### Entrega incremental

1. Añadir US2 para crear/editar.
2. Añadir US6 y validar accesibilidad de teclado.
3. Añadir US3 para cambiar estado y borrar.
4. Añadir US4 para filtros.
5. Añadir US5: integrar el sidecar Gemini local y fallback manual; la conexión oficial de
   producción requiere resolver DEP-IA.
6. Completar Polish y ejecutar la guía `specs/001-task-board-ai-prioritization/quickstart.md`.

## Notas de integridad

- Todas las tareas de implementación apuntan a rutas dentro de `frontend/`; los documentos
  de este feature solo registran contratos y dependencias.
- `Framework con IA/.spec/api/openapi-spec.yaml` es fuente de lectura, no destino de
  escritura.
- No crear pruebas ni colecciones dentro del directorio del integrante 1.
- No guardar secretos en `VITE_*`; no conectar el navegador directamente al proveedor IA.
- Los checkboxes se mantienen vacíos: esta lista planifica el trabajo, no declara
  implementación terminada.
