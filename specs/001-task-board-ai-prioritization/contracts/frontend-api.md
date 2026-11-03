# Contrato entre frontend y API

Este documento describe cómo el frontend consume el contrato existente. No constituye una
ampliación del OpenAPI y no modifica ningún archivo del integrante 1. Fuente de verdad:
`Framework con IA/.spec/api/openapi-spec.yaml`.

## Configuración

- URL de servidor OpenAPI: `https://api.taskmanagement.local/v1`.
- Configurar una sola `API_BASE_URL` pública para el frontend con el prefijo `/v1`
  incluido; no concatenar un segundo `/v1` en los paths.
- Para peticiones protegidas, enviar `Authorization: Bearer <token>` obtenido de
  `POST /auth/login`; mantenerlo en memoria.
- No enviar credenciales de proveedores de IA desde el navegador ni incluirlas en
  configuración `VITE_*`.
- El modo demo está fuera del contrato HTTP: se activa explícitamente, usa fixtures
  locales, muestra aviso persistente y no llama ni escribe en la API.

## Operaciones disponibles

| Método y ruta, relativa a la base `/v1` | Uso del frontend | Entrada/salida según OpenAPI |
|---|---|---|
| `POST /auth/login` | Iniciar sesión en modo API | Recibe email/password; `200` retorna `AuthResponse` con token y usuario; `401` error. |
| `GET /projects/{project_id}/tasks` | Cargar tareas y aplicar filtros | Query opcional `status`: `TODO`, `IN_PROGRESS`, `DONE`; `priority`: `HIGH`, `MEDIUM`, `LOW`. `200` retorna array de `Task`. |
| `POST /tasks` | Crear tarea | JSON `CreateTaskRequest`; `project_id` y `title` son requeridos. `201` retorna `Task`. |
| `GET /tasks/{id}` | Leer detalle | `200` retorna `Task`; `404` error. |
| `PUT /tasks/{id}` | Editar campos documentados | JSON `UpdateTaskRequest`; `200` retorna `Task`; `400` error. |
| `DELETE /tasks/{id}` | Eliminar tras confirmación | `204` sin cuerpo; `404` error. No intentar parsear JSON en `204`. |

### Enums y campos

- `Task.status`: `TODO`, `IN_PROGRESS`, `DONE`.
- `Task.priority`: `HIGH`, `MEDIUM`, `LOW`.
- `Task` requiere `id`, `project_id`, `title`, `status`, `priority` y `created_at`.
- `description` es opcional; `assigned_to` y `due_date` permiten `null` en `Task`;
  `ai_score` también permite `null`.
- `CreateTaskRequest` requiere `project_id` y `title`; `priority`, `description`,
  `assigned_to` y `due_date` son opcionales.
- `UpdateTaskRequest` contiene campos opcionales `title`, `description`, `status`,
  `priority`, `assigned_to` y `due_date`; no declara explícitamente `null`.

## Manejo de errores en el cliente

Usar el estado HTTP y el formato de error publicado por cada operación. El OpenAPI actual
no define respuestas `401`/`403` uniformes para todas las operaciones protegidas; la
interfaz debe soportar errores devueltos por el servidor sin inventar un esquema nuevo.
Un `401` requiere reautenticación; un `403` indica denegación de permiso sin cerrar la
sesión. Para red, conservar el borrador y permitir un reintento explícito y seguro. Las
solicitudes de creación no se reintentan automáticamente.

## Dependencias pendientes del integrante 1

1. **Rol y permisos**: `AuthResponse` no contiene rol; no hay operación documentada para
   conocer membresía. No condicionar acceso a permisos inferidos desde el cliente; el
   servidor decide y la UI maneja `403`.
2. **PUT y campos limpiables**: confirmar si `PUT` es reemplazo o actualización parcial y
   cómo enviar limpieza de `due_date` y `assigned_to`, dado que el esquema actual no
   permite `null` en `UpdateTaskRequest`.
3. **Defaults**: confirmar asignación de `TODO` y política de prioridad; el esquema de
   creación no define un default.
4. **IA**: publicar ruta, método, autorización, request/response, errores, límites,
   atomicidad y timeout de priorización. No existe actualmente una ruta
   `POST /projects/{project_id}/tasks/prioritize` en OpenAPI.
5. **Proyecto activo**: definir cómo obtiene el usuario un `project_id`; el contrato no
   incluye listado de proyectos.

Hasta cerrar DEP-IA y DEP-SCORE, la integración IA real debe permanecer deshabilitada y
la funcionalidad no puede declararse completa. Los errores y códigos HTTP que se prueben
en frontend dependerán del contrato publicado; ante fallos, el usuario debe conservar
prioridad/estado y poder continuar manualmente. El fallback manual no depende de esa ruta.

### Gates externos de aceptación (integrante 1)

- **DEP-AUTH**: verificar autorización en el servidor en cada petición protegida,
  incluyendo acceso al proyecto y permiso requerido; denegar por defecto y probar en el
  backend usuarios sin acceso o con rol insuficiente. La interfaz maneja las respuestas
  publicadas, pero no sustituye estas verificaciones.
- **DEP-SCORE**: probar en el backend la fórmula constitucional con D/P/S fijos, los
  resultados `0.9000` y `0.1000`, los límites temporales, el redondeo y el rechazo de
  entradas semánticas inválidas. El frontend no calcula ni valida la fórmula como fuente
  de verdad.
- **DEP-IA**: publicar endpoint y DTOs, incluidos códigos de error, límite/timeout y
  atomicidad; definir ranking por `ai_score` descendente con desempates por `created_at`
  e `id`. Las pruebas del frontend deben usar exclusivamente ese contrato y comprobar
  continuidad manual para los errores que se documenten.
