# Feature Specification: Tablero de tareas y priorización con IA

**Feature Branch**: No creada; no se configuró un hook de rama.

**Created**: 2026-10-30

**Status**: Draft

**Input**: Especificación inicial del integrante 2, actualizada por solicitud posterior para implementar una integración Gemini real en un sidecar local independiente, sin modificar el OpenAPI ni backend oficial del integrante 1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar el tablero (Priority: P1)

Como usuario con acceso a un proyecto quiero consultar sus tareas agrupadas por estado
para conocer qué está pendiente, en curso y terminado.

**Why this priority**: La consulta del trabajo es la base de las demás acciones y ofrece
valor aunque no se habiliten todavía las funciones de IA.

**Independent Test**: Con una respuesta de tareas que contenga los tres estados, comprobar
que cada tarea aparece una vez en la columna correspondiente. La historia funciona sin
crear ni editar tareas.

**Acceptance Scenarios**:

1. **Given** un usuario autenticado y un proyecto accesible con tareas `TODO`,
   `IN_PROGRESS` y `DONE`, **When** abre el tablero, **Then** ve las columnas Pendiente,
   En curso y Terminada, y cada tarea aparece en la columna de su estado.
2. **Given** que se están cargando las tareas, **When** la consulta aún no ha terminado,
   **Then** se muestra un estado de carga y no un mensaje engañoso de tablero vacío.
3. **Given** que la consulta termina correctamente sin tareas, **When** se presenta el
   resultado, **Then** se muestra un estado vacío y una acción para crear una tarea solo
   si el usuario tiene permiso.
4. **Given** una consulta de tablero que falla, **When** se presenta el error, **Then** se
   conserva el contexto visible, se indica que no se pudo cargar y se ofrece reintentar;
   el fallo no se representa como una lista vacía.
5. **Given** una consulta iniciada para un proyecto anterior, **When** el usuario cambia
   de proyecto y luego llega la respuesta anterior, **Then** esa respuesta no reemplaza
   el tablero del proyecto activo.
6. **Given** un usuario sin acceso a un proyecto, **When** intenta consultar su tablero,
   **Then** el servidor deniega el acceso y no se muestran las tareas del proyecto.

---

### User Story 2 - Crear y editar tareas (Priority: P1)

Como miembro autorizado quiero crear y editar tareas para mantener actualizado el trabajo
del proyecto.

**Why this priority**: La gestión directa de tareas constituye el valor esencial del
tablero y no depende de la integración de IA.

**Independent Test**: Crear una tarea con título y prioridad válidos, verificar que aparece
con los valores devueltos por el servicio y editar después sus campos permitidos.

**Acceptance Scenarios**:

1. **Given** un usuario autorizado y un título con contenido, **When** guarda una tarea
   nueva con una prioridad válida, **Then** la tarea se crea en el proyecto activo y se
   presenta la respuesta confirmada por el servicio.
2. **Given** un título vacío o compuesto solo por espacios, **When** el usuario intenta
   guardar, **Then** se muestra un error junto al campo y no se envía la creación.
3. **Given** que se está guardando una tarea nueva, **When** el usuario activa Guardar
   varias veces, **Then** se procesa una sola creación y se informa que está en curso.
4. **Given** un error al guardar, **When** termina el intento, **Then** se conserva el
   borrador y se ofrece reintentar explícitamente.
5. **Given** una tarea existente, **When** el usuario abre su detalle, **Then** puede
   revisar título, descripción, estado, prioridad y los campos opcionales presentes.
6. **Given** cambios válidos en una tarea, **When** el usuario confirma la edición,
   **Then** el tablero refleja los valores devueltos tras el éxito; si falla, conserva
   los datos anteriores y el borrador para corregir o reintentar.
7. **Given** que se está guardando una edición, **When** el usuario vuelve a activarla,
   **Then** no se inicia una segunda operación simultánea para esa tarea.

---

### User Story 3 - Cambiar estado y eliminar tareas (Priority: P2)

Como miembro autorizado quiero cambiar el estado o eliminar una tarea para reflejar el
progreso real del proyecto.

**Why this priority**: Estas acciones completan el ciclo de gestión diaria después de que
las tareas ya están disponibles en el tablero.

**Independent Test**: Cambiar una tarea entre los estados permitidos, verificar el
resultado confirmado y eliminar otra mediante confirmación explícita.

**Acceptance Scenarios**:

1. **Given** una tarea en `TODO`, **When** el usuario selecciona `IN_PROGRESS` con
   teclado o puntero, **Then** el cambio se solicita con ese valor OpenAPI y la tarjeta
   solo se mueve tras la confirmación satisfactoria.
2. **Given** una tarea en cualquier estado válido, **When** el usuario selecciona otro
   estado permitido (`TODO`, `IN_PROGRESS` o `DONE`), **Then** el tablero la muestra una
   sola vez en la nueva columna después del éxito.
3. **Given** que falla el cambio de estado, **When** se informa del error, **Then** la
   tarjeta mantiene el estado anterior y el usuario puede reintentar.
4. **Given** una tarea que el usuario puede editar, **When** selecciona Eliminar,
   **Then** aparece una confirmación que identifica la tarea y permite cancelar.
5. **Given** la confirmación de eliminación, **When** el usuario la acepta y el servicio
   confirma la eliminación, **Then** la tarjeta desaparece sin intentar mostrar una
   respuesta de tarea.
6. **Given** la confirmación de eliminación, **When** el usuario cancela o el servicio
   devuelve un error, **Then** la tarea permanece en el tablero.
7. **Given** un usuario con rol `VIEWER`, **When** intenta cambiar el estado o eliminar
   una tarea, **Then** el servidor deniega la operación y la interfaz comunica falta de
   permisos sin cerrar la sesión.

---

### User Story 4 - Filtrar tareas (Priority: P2)

Como usuario del proyecto quiero filtrar por estado y prioridad para encontrar las tareas
que necesito revisar.

**Why this priority**: Los filtros mejoran la navegación en tableros con muchas tareas,
pero no impiden usar las funciones principales.

**Independent Test**: Aplicar cada filtro por separado y combinado, comprobar los valores
devueltos y quitar los filtros para recuperar la vista general.

**Acceptance Scenarios**:

1. **Given** un proyecto con distintos estados, **When** el usuario filtra por estado,
   **Then** ve únicamente tareas cuyo `status` coincide con `TODO`, `IN_PROGRESS` o
   `DONE`, según corresponda.
2. **Given** un proyecto con distintas prioridades, **When** el usuario filtra por
   prioridad, **Then** ve únicamente tareas cuyo `priority` coincide con `HIGH`,
   `MEDIUM` o `LOW`.
3. **Given** que ambos filtros están activos, **When** se muestran resultados,
   **Then** cada tarea satisface ambos filtros y los criterios seleccionados son visibles.
4. **Given** filtros activos, **When** el usuario los limpia, **Then** se restaura la
   vista sin filtros del proyecto.
5. **Given** que una respuesta de una selección de filtros anterior llega después de la
   selección actual, **When** se actualiza la vista, **Then** no sustituye los resultados
   más recientes.
6. **Given** una tarea de un proyecto al que el usuario no tiene acceso, **When** intenta
   filtrar o consultar sus tareas, **Then** el servidor deniega el acceso y no se muestra
   información del proyecto.

---

### User Story 5 - Priorizar tareas pendientes con IA (Priority: P3)

Como usuario autorizado quiero solicitar una recomendación de orden para mis tareas
pendientes y conservar el control manual cuando el servicio de IA no esté disponible.

**Why this priority**: La recomendación aporta valor adicional, pero depende de una
ampliación aún no publicada del contrato y no debe bloquear el tablero ni la gestión manual.

**Independent Test**: Con una respuesta de priorización de prueba válida, verificar que se
unen puntuaciones por identificador y se ordenan solo las tareas pendientes. Simular
errores y confirmar que las prioridades manuales y las demás acciones siguen disponibles.

**Acceptance Scenarios**:

1. **Given** un usuario autorizado y al menos una tarea `TODO`, **When** solicita
   priorización, **Then** la interfaz informa del progreso, evita solicitudes duplicadas
   y presenta el resultado solo cuando la respuesta es válida y corresponde al proyecto
   activo.
2. **Given** un resultado válido de IA, **When** se aplica al tablero, **Then** se
   actualiza el orden de las tareas `TODO` mediante `ai_score`, sin modificar `priority`
   ni `status`; las tareas `IN_PROGRESS` y `DONE` no se incluyen en el ranking.
3. **Given** tareas con igual `ai_score`, **When** se presenta el ranking, **Then** se
   desempata por `created_at` ascendente y después por `id` ascendente.
4. **Given** que no hay tareas `TODO`, **When** se muestra la acción de priorizar,
   **Then** está deshabilitada o no disponible con una explicación y no se genera una
   puntuación ficticia.
5. **Given** que la priorización termina con error, respuesta inválida, limitación de
   frecuencia o indisponibilidad, **When** se informa del fallo, **Then** se ofrece
   continuar manualmente ordenando por prioridad `HIGH`, `MEDIUM`, `LOW`, después por
   fecha ascendente (sin fecha al final), `created_at` e `id`.
6. **Given** que una solicitud de priorización supera el límite de espera de la interfaz,
   **When** se cumplen 20 segundos sin respuesta, **Then** se muestra el timeout, se
   mantiene disponible la gestión manual y no se reintenta automáticamente.
7. **Given** un timeout del cliente, **When** el usuario decide volver a intentarlo,
   **Then** se actualizan las tareas antes del nuevo intento para reflejar si la solicitud
   anterior llegó a completarse.
8. **Given** que cambió el proyecto activo mientras se esperaba la respuesta de IA,
   **When** llega esa respuesta, **Then** no se aplican puntuaciones al proyecto nuevo.
9. **Given** un usuario con rol `VIEWER` en la integración de producción, **When** solicita
   priorización con IA, **Then** el backend oficial deniega la operación antes de enviar
   datos a un proveedor; el sidecar local no se expone a usuarios o proyectos reales.
10. **Given** una prueba con `D=1`, `P=1` y `S=0.5`, **When** se calcula el resultado,
    **Then** `ai_score` es `0.9000`; con `D=0`, `P=0` y `S=0.5`, es `0.1000`.
11. **Given** una respuesta con una puntuación no finita o fuera de `[0, 1]`, o con
    identificadores ausentes, repetidos o ajenos, **When** se procesa el lote, **Then**
    se rechaza el lote completo y no se aplica ningún resultado.
12. **Given** el endpoint oficial aún no está publicado en OpenAPI, **When** el sidecar
    local está disponible y configurado, **Then** la integración real con Gemini funciona
    sin presentarse como una API oficial de producción.
13. **Given** que una operación produce `401`, `403`, `404`, `409`, `422`, `429`, `502`,
    `503` o `504`, **When** se muestra el error, **Then** se aplica el comportamiento
    correspondiente descrito en Edge Cases sin perder la gestión manual.

---

### User Story 6 - Usar el tablero de forma accesible (Priority: P1)

Como persona que navega con teclado o tecnologías de asistencia quiero completar las
acciones del tablero sin depender del color, del arrastre o del puntero.

**Why this priority**: La accesibilidad es necesaria para que todas las personas puedan
usar los flujos principales, incluidos los cambios de estado y la gestión de errores.

**Independent Test**: Completar consulta, filtrado, edición, cambio de estado y confirmación
de borrado con teclado; revisar etiquetas, foco y anuncios de estado.

**Acceptance Scenarios**:

1. **Given** el tablero y sus controles, **When** una persona navega solo con teclado,
   **Then** puede llegar a filtros, acciones y tareas, distinguir el foco y completar las
   operaciones principales sin arrastrar.
2. **Given** un formulario con un campo inválido, **When** aparece un error, **Then** el
   mensaje identifica el campo y se anuncia sin depender solo del color.
3. **Given** que se abre un diálogo de borrado, **When** aparece, se cierra con Escape
   antes de confirmar o se confirma, **Then** el foco se gestiona y vuelve al control que
   abrió el diálogo al cerrarse.
4. **Given** una pantalla estrecha, **When** se recorren las columnas y acciones,
   **Then** todas pueden usarse sin desplazamiento horizontal obligatorio.

---

### Edge Cases

- Una carga en curso no se presenta como estado vacío; un error de consulta tampoco se
  interpreta como lista vacía.
- Una respuesta tardía de otro proyecto o de filtros anteriores no sustituye la vista
  vigente.
- Un valor de estado o prioridad que no pertenezca a los enums del contrato no se muestra
  como opción ni se envía.
- Un proyecto no accesible o un usuario sin permisos recibe el error correspondiente; la
  interfaz no considera que ocultar botones conceda autorización.
- Un error `401` requiere volver a autenticarse; `403` indica permisos insuficientes y no
  debe expulsar al usuario.
- Un error `404` informa que el recurso ya no está disponible y permite actualizar la
  vista.
- Un error `409` durante priorización requiere actualizar las tareas antes de reintentar.
- Un error `422` comunica que la solicitud no se puede procesar sin descartar el tablero.
- Un error `429` comunica el límite y respeta `Retry-After` cuando el servicio lo envíe.
- Los errores `502`, `503` y `504` de IA dejan disponibles filtros, edición, cambio de
  estado y orden manual.
- Los datos de título, descripción y razón de IA se presentan como texto, nunca como
  contenido activo.
- En una respuesta de IA con identificadores ausentes, repetidos, ajenos al proyecto o
  puntuaciones fuera de rango, no se aplica parcialmente ningún resultado.
- En móvil, las tres columnas se pueden recorrer y gestionar sin arrastre ni
  desplazamiento horizontal obligatorio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La persona usuaria MUST poder consultar tareas de un proyecto conocido
  mediante `GET /projects/{project_id}/tasks`, agrupadas exactamente una vez en `TODO`,
  `IN_PROGRESS` o `DONE`.
- **FR-002**: La interfaz MUST ofrecer los nombres visibles Pendiente, En curso y
  Terminada para esos estados y MUST conservar los valores de estado OpenAPI al solicitar
  o actualizar tareas.
- **FR-003**: La interfaz MUST permitir crear tareas mediante `POST /tasks` con
  `project_id` y `title`, y permitir elegir `priority` entre `HIGH`, `MEDIUM` y `LOW`.
  Los campos opcionales solo se ofrecerán según el contrato publicado.
- **FR-004**: La interfaz MUST rechazar localmente títulos vacíos o compuestos solo por
  espacios, mostrar el error junto al campo y conservar el borrador cuando falle el
  guardado.
- **FR-005**: La persona usuaria MUST poder consultar el detalle con `GET /tasks/{id}` y
  editar mediante `PUT /tasks/{id}` los campos admitidos por `UpdateTaskRequest`; los
  valores del tablero MUST reflejar la respuesta confirmada por el servicio.
- **FR-006**: La persona usuaria autorizada MUST poder cambiar el estado entre `TODO`,
  `IN_PROGRESS` y `DONE`; la interfaz MUST mover la tarea solo después del éxito.
- **FR-007**: La interfaz MUST solicitar confirmación antes de eliminar una tarea
  mediante `DELETE /tasks/{id}` y retirarla del tablero solo después de recibir
  confirmación satisfactoria `204`.
- **FR-008**: La persona usuaria MUST poder filtrar por los parámetros `status` y
  `priority` de `GET /projects/{project_id}/tasks`, con los enums exactos del contrato;
  MUST poder ver y limpiar los filtros activos.
- **FR-009**: La priorización con IA MUST limitarse a tareas `TODO` del proyecto activo,
  sin alterar su prioridad ni estado y sin incluir tareas `IN_PROGRESS` o `DONE`.
- **FR-010**: La interfaz MUST poder usar el sidecar local Gemini del integrante 2, fuera
  del OpenAPI oficial. Esa ruta MUST permanecer local y no se presentará como autorizada
  ni apta para producción hasta integrarla con el backend oficial.
- **FR-011**: El cliente y el sidecar MUST asociar resultados por `id`, aceptar únicamente
  una respuesta completa y válida para el conjunto solicitado y no aplicar resultados
  parciales.
- **FR-012**: El orden de IA MUST usar `ai_score` descendente y, en empate, `created_at`
  ascendente y luego `id` ascendente. La respuesta debe incluir o permitir obtener los
  campos necesarios para ese desempate.
- **FR-013**: La fórmula y los factores de `ai_score` MUST ajustarse a la constitución:
  `round(0.50 * D + 0.30 * P + 0.20 * S, 4)`, con factores y límites de fecha fijados
  allí. Los resultados semánticos externos no se tratarán como deterministas; las pruebas
  de la fórmula usarán valores semánticos fijos.
- **FR-014**: Si la IA falla o supera 20 segundos en la interfaz, la persona usuaria MUST
  poder seguir gestionando y ordenando tareas manualmente; MUST conservarse la prioridad
  y no generarse puntuaciones de IA ficticias ni reintentos automáticos.
- **FR-015**: Durante una espera de IA de hasta 20 segundos, la interfaz MUST mostrar
  progreso y evitar solicitudes duplicadas. Tras timeout, MUST actualizar el tablero antes
  de permitir un nuevo intento.
- **FR-016**: La interfaz MUST separar los estados de carga de consulta, guardado por
  tarea, eliminación y priorización, e impedir acciones duplicadas sobre la misma
  operación.
- **FR-017**: La interfaz MUST diferenciar errores de autenticación `401`, permisos `403`,
  recurso inexistente `404`, conflicto `409`, solicitud no procesable `422`, límite
  `429` y errores de IA `502`, `503` y `504`; MUST ofrecer reintento solo cuando sea
  seguro y explícito.
- **FR-018**: El servidor MUST comprobar autenticación, pertenencia al proyecto y permiso
  para cada operación protegida del backend oficial. La interfaz MUST mostrar acciones
  según el rol conocido, pero no sustituir la autorización del servidor. El sidecar local
  MUST escuchar solo en `127.0.0.1` y MUST NOT exponerse como servicio público.
- **FR-019**: La interfaz MUST ofrecer navegación completa por teclado, etiquetas
  asociadas a campos, errores asociados a sus campos, foco visible, mensajes de carga y
  error anunciables, y textos además de color para indicar estado o prioridad.
- **FR-020**: Los diálogos MUST gestionar foco inicial, cierre por Escape cuando no se
  está confirmando una operación y devolución del foco a quien los abrió.
- **FR-021**: En pantallas estrechas, la persona usuaria MUST poder recorrer las columnas
  y ejecutar todas las acciones sin arrastrar tareas ni depender de desplazamiento
  horizontal.
- **FR-022**: La interfaz MUST presentar títulos, descripciones y razones de IA como
  texto y MUST conservar los cambios no confirmados ante errores de red.
- **FR-023**: Antes de priorizar, la interfaz MUST indicar que los títulos y descripciones
  se enviarán a Google Gemini. El sidecar local MUST recibir solo las tareas `TODO`
  necesarias, limitar tamaño y frecuencia, y no registrar contenido ni la clave API.

### Dependencias del integrante 1

Estas ampliaciones no forman parte del OpenAPI vigente ni se consideran implementadas:

- Publicar `POST /projects/{project_id}/tasks/prioritize` bajo `/v1`, junto con
  autenticación, permisos MEMBER/ADMIN, persistencia, esquema de respuesta, errores y
  límites. La forma propuesta está en `.spec/modules/ai-agent.md`; esta dependencia
  bloquea la integración de producción, no el sidecar local.
- Garantizar autorización de proyecto y rol para lectura y escritura, y proveer a la
  interfaz una fuente autorizada para conocer si el usuario es MEMBER, ADMIN o VIEWER.
  `AuthResponse` no expone rol; el OpenAPI vigente tampoco documenta todos los errores
  `401`/`403` de operaciones protegidas.
- Confirmar el valor predeterminado de `status` como `TODO` y la política para `priority`
  al crear; `CreateTaskRequest` exige `project_id` y `title`, pero no fija un default de
  prioridad.
- Acordar la semántica de `PUT /tasks/{id}` y documentar cómo se limpian `due_date` y
  `assigned_to`. El esquema actual no declara esos campos como nullable en
  `UpdateTaskRequest`.
- Publicar respuestas de error coherentes para las operaciones protegidas y los errores
  usados en los criterios; añadir los límites, tiempo de respuesta del proveedor y
  conducta transaccional propuestos para IA cuando se aprueben.
- Proveer una forma de identificar el proyecto activo; el OpenAPI vigente no expone un
  listado de proyectos o miembros. Esta especificación no añade selector remoto de
  proyectos ni de responsables.

### Key Entities *(include if feature involves data)*

- **Task**: tarea de un proyecto, identificada por `id` y `project_id`, con `title`,
  `description` opcional, `status`, `priority`, `assigned_to` opcional, `due_date`
  opcional, `ai_score` opcional y `created_at`.
- **Project**: ámbito al que pertenecen las tareas; el usuario debe tener acceso para
  consultar o modificarlas.
- **Prioritization result**: resultado local asociado a una tarea por `id`, con
  `ai_score` y una razón textual; se conserva en memoria y no está definido en OpenAPI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En todas las pruebas de aceptación del tablero, el 100 % de las tareas
  devueltas con estados válidos aparece exactamente una vez en la columna correspondiente.
- **SC-002**: Las operaciones de crear, editar, cambiar estado, eliminar y filtrar
  completan sus escenarios de aceptación con valores OpenAPI exactos; una mutación fallida
  no se presenta como confirmada en ningún escenario.
- **SC-003**: El 100 % de las acciones principales del tablero, formularios y diálogos se
  puede completar usando solo teclado en las pruebas de accesibilidad.
- **SC-004**: En el 100 % de los casos de error o timeout de IA, el usuario conserva
  disponibles las acciones manuales y no se altera `priority` ni se inventa `ai_score`.
- **SC-005**: Con iguales factores D, P y S, las pruebas de puntuación producen el mismo
  `ai_score` redondeado a cuatro decimales; los valores de frontera de fecha y los dos
  ejemplos de la constitución pasan.
- **SC-006**: Tras 20 segundos sin respuesta de priorización, el usuario recibe una
  indicación de timeout y puede continuar manualmente sin un reintento automático.
- **SC-007**: El estado de carga, vacío, éxito o error se diferencia en el 100 % de las
  pruebas de consulta, de modo que un error nunca se interpreta como ausencia de tareas.

## Assumptions

- La persona usuaria ya está autenticada y dispone de un identificador de un proyecto
  accesible; descubrir o crear proyectos y administrar miembros queda fuera de este
  alcance.
- Los valores de estado y prioridad son exactamente los enums actuales: `TODO`,
  `IN_PROGRESS`, `DONE`; `HIGH`, `MEDIUM`, `LOW`. No existe `URGENT`.
- Las tareas nuevas quedan en `TODO` por valor predeterminado del servidor cuando ese
  comportamiento sea confirmado; la prioridad elegida se envía explícitamente porque el
  contrato no define su valor por defecto.
- La fecha límite se muestra en hora local y se intercambia en ISO 8601 con zona horaria.
- El timeout de interfaz de 20 segundos y el plazo de proveedor de 15 segundos son la
  propuesta documentada para IA y requieren confirmación del integrante 1 antes de ser un
  compromiso de servicio.
- El contrato de IA aún no existe. Sus criterios son una especificación de comportamiento
  futuro y no implican disponibilidad actual.
- Comentarios, arrastrar y soltar, seleccionar responsables sin una fuente autorizada y
  listar proyectos quedan fuera del MVP.
- La autorización del servidor es obligatoria aunque la interfaz no disponga de rol para
  decidir qué acciones mostrar; resolver cómo exponer el rol es dependencia del
  integrante 1.
