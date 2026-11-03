# Modelo de datos del frontend

Este modelo describe los datos que la interfaz muestra y envía; no crea ni modifica
entidades en el backend. Los nombres de campos y enums siguen
`Framework con IA/.spec/api/openapi-spec.yaml`.

## Task

Una tarea que pertenece a un único proyecto.

| Campo | Tipo de contrato | Reglas de uso en frontend |
|---|---|---|
| `id` | UUID string, requerido en respuesta | Clave estable de la tarea. |
| `project_id` | UUID string, requerido en respuesta y creación | Identifica el proyecto activo; no es `user_id`. |
| `title` | string, requerido | No aceptar vacío ni espacios en blanco en el formulario. El contrato aún no define longitud máxima. |
| `description` | string, opcional en `Task` y creación | Mostrar como texto, nunca como HTML. |
| `status` | enum requerido en respuesta: `TODO`, `IN_PROGRESS`, `DONE` | Presentación: Pendiente, En curso, Terminada. |
| `priority` | enum requerido en respuesta: `HIGH`, `MEDIUM`, `LOW`; opcional en creación | Presentación: Alta, Media, Baja. No hay `URGENT` ni default publicado. |
| `assigned_to` | UUID string o `null` en respuesta; opcional sin `null` en creación/actualización | No ofrecer selección remota sin fuente autorizada de miembros; la actualización no especifica cómo borrar el valor. |
| `ai_score` | number o `null` en respuesta | Nullable. El contrato actual no declara rango. No inventar puntuaciones ni asumir puntuación cuando sea `null`. |
| `due_date` | date-time string o `null` en respuesta; opcional sin `null` en creación/actualización | Mostrar en hora local; enviar ISO 8601 con zona cuando se incluya. La actualización no especifica cómo borrar el valor. |
| `created_at` | date-time string, requerido en respuesta | Usar solo para orden estable si el flujo lo requiere. |

### Relaciones

- Un `Project` puede tener varias tareas; cada tarea pertenece a un `project_id`.
- La interfaz necesita un identificador de proyecto accesible. El contrato actual no
  define el listado de proyectos.
- `assigned_to` refiere a un usuario, pero el OpenAPI no define listado de miembros.

### Ciclo de estado

Los valores aceptados son `TODO`, `IN_PROGRESS` y `DONE`. No se especifica una máquina
de transiciones restrictiva; el cliente ofrece esos valores y refleja el cambio solo tras
la respuesta confirmada del servidor.

## Filtros de vista

Estado de presentación; no es una entidad persistida:

| Campo | Valores |
|---|---|
| `status` | sin filtro, `TODO`, `IN_PROGRESS`, `DONE` |
| `priority` | sin filtro, `HIGH`, `MEDIUM`, `LOW` |
| `project_id` | UUID conocido del proyecto activo |

El filtro combinado conserva ambos parámetros; limpiar filtros restaura la consulta del
proyecto sin parámetros. La respuesta debe seguir siendo fuente de verdad para las
mutaciones; no modificar la colección de tareas por filtrar.

## Sesión del cliente

- `token`: valor recibido en `AuthResponse` tras `POST /auth/login`.
- Vida: memoria del proceso de la interfaz; no guardar en `localStorage`, URL, logs o
  fixtures compartidos.
- En modo demo no se requiere una sesión real; los datos de tarea son fixtures y mutaciones volátiles.
- El rol no es parte de `AuthResponse`. No inferir rol a partir del token o del perfil.

## Estado de carga y resultado

El estado UI se mantiene por operación: carga de tablero, guardado de una tarea,
eliminación, filtro/refresco y priorización. Un fallo conserva el borrador y la tarea
confirmada anterior; la respuesta de éxito actualiza la vista. Una respuesta de otra
selección de proyecto/filtros no reemplaza el contexto vigente.

## Resultado de priorización

El sidecar local devuelve `project_id`, `reference_time`, `scoring_version` y una lista de
`id`, `ai_score` y razón textual. No es un DTO publicado en OpenAPI ni se persiste.

- Se asociarán resultados por `id` con el conjunto de `TODO` solicitado.
- Se rechazará el lote completo si faltan identificadores, hay duplicados/IDs ajenos o
  valores inválidos; no se aplicarán resultados parciales.
- El ranking será `ai_score` descendente, `created_at` ascendente y luego `id` ascendente.
- La prioridad y el estado manuales se conservan; el servidor local calcula la fórmula.

La UI vuelve a consultar el snapshot antes de aplicar el ranking. El sidecar no tiene acceso
a la base de datos, no verifica permisos ni ofrece persistencia transaccional. Producción
requiere integrar autorización y persistencia en un backend protegido; no se modifica el
OpenAPI actual.

## Fixture de modo demo

El servicio demo entrega tareas reproducibles con los enums válidos. Sus operaciones
modifican solo la copia en memoria y se pierden al recargar. La acción IA, si se ejecuta,
llama al servicio Gemini local real; no usa una respuesta simulada.
