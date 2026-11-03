# Especificación de interfaz y estado
Responsable: integrante 2. La implementación actual está en `frontend/` con React,
TypeScript, Vite y Tailwind CSS 4. La IA real se conecta al servicio Gemini local
independiente descrito en `ai-agent.md`; la integración de producción con el endpoint
oficial sigue pendiente de autorización y contrato OpenAPI.

## Pantallas
1. Acceso: login y registro; registro no implica login porque la API devuelve User sin token.
2. Tablero de proyecto: encabezado con proyecto, filtros, Nueva tarea y Priorizar con IA; columnas Pendiente, En curso, Terminada.
3. Formulario de tarea: título, descripción, prioridad y fecha límite. assigned_to solo cuando exista una fuente autorizada de miembros.
4. Detalle: datos completos, edición, cambio de estado y confirmación de borrado; comentarios como ampliación.
No ofrecer selectores remotos de proyectos o miembros hasta disponer de sus contratos. Para desarrollo usar project_id de fixture claramente identificado.

## Componentes propuestos
- AuthPage y AuthForm: credenciales, validación y mensajes de autenticación.
- ProjectBoard: coordina proyecto activo, consulta y filtros.
- BoardColumn y TaskCard: agrupación por estado; muestra prioridad con texto y color, fecha y score si existe.
- TaskForm y TaskDetail: borrador, errores por campo y guardado.
- StatusSelect: alternativa accesible al arrastre. Drag and drop queda fuera del MVP.
- PriorityControls: solicitud IA y orden manual.
- ConfirmDeleteDialog: confirmar, cancelar y gestionar foco.
- FeedbackBanner y LoadingState: errores, progreso y reintento.
- CommentPanel: ampliación opcional.

## Estado y flujo de datos
- Estado de servidor separado del borrador del formulario: tasksById y listas de ids por proyecto.
- Estados de carga separados: consulta, guardado por tarea, borrado y priorización; bloquear solicitudes IA duplicadas sin bloquear la gestión manual.
- Filtros como estado de vista; no alterar el conjunto original de tareas.
- Consultas GET cancelables y numeradas; descartar respuestas antiguas al cambiar de proyecto o filtros.
- Mutaciones pesimistas: actualizar la tarjeta tras confirmar servidor. Evitar doble envío y no reintentar POST automáticamente.
- Tras priorizar, unir scores por id; volver a consultar el snapshot y descartar el ranking si cambió alguna tarea durante el análisis.
- El servicio HTTP centraliza URL base configurable, Bearer, estados de error y 204 sin JSON.
- Token de acceso mantenido en memoria en este diseño; recargar requiere nuevo login mientras no exista mecanismo de renovación. No guardar claves del proveedor en React.
- La API no expone rol del workspace en AuthResponse. Mostrar acciones de escritura solo cuando se conozcan permisos; la autorización final corresponde al servidor.

## Accesibilidad y adaptación
Etiquetas vinculadas a campos; errores asociados al campo; navegación completa por teclado; foco visible; mensajes de estado anunciables; colores acompañados de texto.
Diálogos con foco inicial, Escape para cerrar cuando no se está confirmando una operación, y devolución del foco al botón de origen.
En móvil, columnas apiladas; sin exigir arrastre o desplazamiento horizontal para completar acciones.
Renderizar descripciones y razones como texto, nunca como HTML arbitrario.

## Estados de interfaz verificables
- Cargando: indicador y mensaje sin anunciar estado vacío.
- Sin tareas: explicación y acción permitida.
- Error de red: conservar borrador y ofrecer Reintentar.
- 401: sesión caducada; acceso de nuevo.
- 403: permisos insuficientes.
- 404: recurso no disponible y actualizar listado.
- 409 en IA: datos modificados; refrescar antes de reintentar.
- 429: esperar y respetar Retry-After cuando exista.
- 502/503/504: aviso de IA y continuidad manual.

## Dependencias para cerrar la integración API de producción
Confirmar defaults, semántica de PUT, limpieza de opcionales, fuente de roles/proyectos y
contrato de IA con el integrante 1. Los fixtures sirven para desarrollo y demostración,
pero no representan persistencia ni la integración real de Gemini. El servicio local real
no tiene autorización de usuarios ni persistencia y no debe exponerse públicamente.
