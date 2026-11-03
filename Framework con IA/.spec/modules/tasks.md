# Gestión de tareas e historias de usuario
Estado: especificación de UX y comportamiento del integrante 2. Basada en el OpenAPI
recibido, versión 1.0.0. El frontend está implementado; la priorización IA conectada
usa un servicio Gemini local independiente. La integración oficial de producción
continúa pendiente de autorización y contrato del integrante 1.

## Alcance y responsabilidades
El integrante 2 define experiencia de usuario y comportamiento observable. El integrante
1 mantiene modelos, permisos y contrato OpenAPI. Las historias describen el comportamiento
esperado y no declaran implementadas las dependencias externas.
MVP: tablero de un proyecto conocido, CRUD de tareas y priorización asistida. Comentarios son una ampliación soportada por el contrato. No se presupone que existan listados de proyectos, miembros o espacios: faltan sus endpoints.

## Datos y valores compatibles
- Task pertenece a project_id; no usar user_id como propietario de Task.
- status: TODO, IN_PROGRESS, DONE; etiquetas visibles: Pendiente, En curso, Terminada.
- priority: HIGH, MEDIUM, LOW; etiquetas: Alta, Media, Baja. No existe URGENT.
- title obligatorio; descripción opcional; due_date opcional en ISO 8601 con zona horaria; assigned_to opcional; ai_score opcional y nullable.
- La fecha se muestra en hora local y se envía normalizada a UTC.
- No añadir complexity al formulario: ese campo no existe en el contrato.
- Defaults propuestos para acordar con integrante 1: TODO y MEDIUM. El cliente envía MEDIUM explícitamente al crear; el servidor debe asignar TODO.
- Límite de título propuesto: 100 caracteres después de trim; debe incorporarse al contrato antes de considerarlo obligación compartida.

## HU-T01: consultar tablero
Como usuario con acceso al proyecto quiero ver mis tareas agrupadas por estado.
Given un proyecto accesible, When abro el tablero, Then se llama GET /projects/{project_id}/tasks y cada tarea aparece en una sola columna según status.
Given una respuesta vacía, When termina la carga, Then se muestra un estado vacío con acción Crear tarea si tengo permisos.
Given un fallo de consulta, When termina la petición, Then aparece Reintentar y no se interpreta el fallo como lista vacía.
Given una consulta anterior y otra posterior, When la anterior termina más tarde, Then no sobrescribe la vista de la consulta posterior.

## HU-T02: crear
Como MEMBER o ADMIN quiero registrar una tarea.
Given un título no vacío, When confirmo el formulario, Then se envía POST /tasks con project_id, title y priority y se incorpora la respuesta 201 al tablero.
Given un título compuesto solo por espacios, When intento guardar, Then se muestra un error junto al campo y no se envía la petición.
Given un envío en curso, When vuelvo a pulsar Guardar, Then no se genera otra petición.
Given un error de API, When falla el guardado, Then se mantienen los datos introducidos y se permite reintentar.

## HU-T03: editar y cambiar estado
Como MEMBER o ADMIN quiero actualizar una tarea.
Given una tarea, When abro su detalle, Then se recupera GET /tasks/{id} y se ofrece edición.
Given una edición válida, When guardo, Then se usa PUT /tasks/{id} y se representa la respuesta 200.
Given una tarea TODO, When selecciono En curso con teclado o ratón, Then se envía status IN_PROGRESS y solo se cambia de columna después del éxito.
Given un fallo, When termina el cambio, Then la tarea conserva su estado anterior y se muestra el error.
La semántica de PUT con campos parciales debe acordarse; hasta entonces enviar todos los campos editables conocidos, omitiendo los opcionales ausentes. Limpiar fecha o asignación requiere nullable en UpdateTaskRequest: no inventar cadenas vacías.

## HU-T04: eliminar
Given una tarea editable, When pulso Eliminar, Then se abre confirmación indicando su título.
Given que confirmo, When DELETE /tasks/{id} devuelve 204, Then se retira la tarjeta sin intentar leer JSON de la respuesta.
Given que cancelo o falla el borrado, Then la tarea permanece.

## HU-T05: filtrar
Given un proyecto, When selecciono prioridad o estado, Then se usan los parámetros documentados priority y status, respetando sus mayúsculas.
Given filtros activos, Then la interfaz los muestra y permite limpiarlos.
La priorización abarca todas las TODO del proyecto, no solo las visibles con filtros.

## HU-T06: priorizar con IA
Given tareas TODO en el proyecto activo, When pulsa Priorizar con IA, Then se envían al servicio local Gemini, se indica carga y se bloquean envíos duplicados.
Given una respuesta válida, Then se actualizan ai_score y el orden de TODO, sin modificar priority ni status.
Given cero TODO, Then el botón está deshabilitado y se explica que no hay pendientes.
Given fallo o timeout, Then siguen disponibles las prioridades manuales y se conserva el tablero.
El navegador no recibe la clave del proveedor. Los scores y razones se conservan solo en
memoria; el sidecar local no autoriza usuarios ni persiste los resultados. La integración
de producción queda pendiente hasta que el integrante 1 publique e implemente su contrato.

## HU-T07: permisos y sesión
Given un VIEWER en integración de producción, Then puede consultar pero no crear, editar, borrar ni priorizar; el backend oficial valida sus permisos.
Given un 401, Then se solicita iniciar sesión de nuevo y se descartan datos privados al salir.
Given un 403, Then se muestra falta de permiso sin expulsar al usuario.
El sidecar local de Gemini no autentica ni autoriza usuarios y solo se permite para
desarrollo en localhost. No desplegarlo con datos reales.
Los roles existen en auth.md pero no se exponen en AuthResponse; recibirlos es una dependencia pendiente.

## HU-T08: comentarios (ampliación)
Given el detalle de una tarea, When consulto comentarios, Then se usa GET /tasks/{id}/comments.
Given permiso confirmado por servidor y texto no vacío, When envío un comentario, Then POST /tasks/{id}/comments devuelve 201 y se muestra el resultado sin interpretar contenido como HTML.

## Hecho cuando
Cada historia tiene prueba de aceptación; enums coinciden con OpenAPI; errores y navegación por teclado funcionan; ninguna acción se presenta como persistida antes de la respuesta del servidor. Pruebas con mocks se distinguen de integración real.
