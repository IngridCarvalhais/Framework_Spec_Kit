# Guía de ejecución y validación

Esta guía valida el frontend y el sidecar local de IA del integrante 2. La conexión real a
Gemini requiere una clave propia y no implica que exista el endpoint del backend oficial.

## Prerrequisitos de la entrega

- Node.js y npm compatibles con la versión declarada en `frontend/package.json`.
- Acceso a la raíz del proyecto y a la carpeta `frontend/`.
- Para modo API: instancia accesible de la API y proyecto/usuario autorizados. El host
  OpenAPI actual es `https://api.taskmanagement.local/v1`; la resolución `.local` puede
  requerir configuración local.
- Para invocar Gemini real, configura y arranca `ai-service/` según `frontend/README.md`.
  La ruta local no autoriza usuarios ni persiste resultados y no debe exponerse fuera de
  la máquina.

## Instalar y arrancar en modo demo

```powershell
Set-Location .\frontend
npm ci
$env:VITE_DATA_MODE = 'demo'
npm run dev
```

Resultado esperado: tablero con datos fixture, columnas `TODO`, `IN_PROGRESS`, `DONE`,
filtros y formularios disponibles. Crear/editar/eliminar solo actualiza estado volátil;
recargar restaura fixtures. Con `ai-service/` iniciado y una clave válida, el botón de IA
envía las tareas pendientes a Gemini. Sin el servicio, muestra un error y mantiene el orden
manual disponible.

## Arrancar en modo API

```powershell
Set-Location .\frontend
$env:VITE_DATA_MODE = 'api'
$env:VITE_API_BASE_URL = 'https://api.taskmanagement.local/v1'
$env:VITE_PROJECT_ID = '<UUID-del-proyecto-conocido>'
npm run dev
```

`VITE_PROJECT_ID` debe ser el UUID de un proyecto existente al que el usuario tenga
acceso; el OpenAPI no define una operación para listar proyectos. También se puede guardar
esta configuración pública en `frontend/.env.local` (no incluir tokens ni secretos):

```dotenv
VITE_DATA_MODE=api
VITE_API_BASE_URL=https://api.taskmanagement.local/v1
VITE_PROJECT_ID=<UUID-del-proyecto-conocido>
```

Resultado esperado: la aplicación requiere login documentado y usa el proyecto conocido
configurado. La red muestra paths relativos `/auth/login`,
`/projects/{project_id}/tasks` y `/tasks/{id}` sin duplicar `/v1`. No introducir claves
secretas en variables cliente. La disponibilidad final requiere backend levantado y
accesible, autorización comprobada por el backend (DEP-AUTH) y el project UUID correcto.

## Pruebas y compilación

```powershell
Set-Location .\frontend
npm run test
npm run test:e2e
npm run build
```

Resultado esperado:
- Unit y componentes cubren estados, formularios, filtros, acciones de teclado, errores,
  borradores preservados y separación de modo demo.
- Integración HTTP con MSW comprueba Bearer, paths, query params y payloads contra
  `contracts/frontend-api.md`; `204` no se parsea como JSON.
- End-to-end cubre tablero, CRUD y filtros en demo; el recorrido de API usa MSW claramente
  identificado como mock, no como servicio real.
- Build de producción termina sin errores de tipos.

Las pruebas end-to-end incluyen un recorrido del modo API con MSW; es un mock, no una
prueba de integración con el backend real.

## Comprobaciones manuales de accesibilidad

1. Completar consulta, filtros, formulario y diálogo de eliminación usando solo teclado.
2. Confirmar foco visible, labels, vínculo de errores a campos, anuncios de carga/error y
   retorno de foco desde el diálogo.
3. Confirmar que prioridad y estado se entienden sin depender del color.
4. Repetir en viewport móvil y comprobar que las acciones no requieren arrastrar ni
   desplazamiento horizontal obligatorio.

## Límites de producción

Antes de considerar completa la integración API real, verificar el login, `project_id`,
permisos, semántica del PUT, limpieza de opcionales y respuestas de error contra la API
publicada. La integración Gemini de este proyecto es local y no reemplaza la ruta de
producción: antes de exponerla a usuarios, exigir autenticación/autorización, persistencia
atómica y contrato publicado en el backend oficial.
