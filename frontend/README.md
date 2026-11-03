# TaskManager AI — frontend

Frontend React + TypeScript + Vite + Tailwind CSS para el tablero Kanban del integrante 2.
El contrato OpenAPI existente es la fuente de verdad; este frontend no modifica ni amplía
el backend.

## Requisitos

- Node.js compatible con Vite 8 y npm.
- El modo demo funciona sin backend.
- El modo API necesita una instancia accesible, credenciales de usuario y un UUID de
  proyecto existente. El OpenAPI actual no ofrece listado de proyectos.

## Instalación y modo demostración

```powershell
Set-Location .\frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

`.env.example` selecciona `VITE_DATA_MODE=demo`. La página presenta el tablero sin una
etiqueta de modo; en esta configuración, las tareas son datos locales y los cambios se
mantienen solo en memoria: se pierden al recargar y nunca se envían a la API de tareas.
La acción de priorización sí envía títulos y descripciones al servicio Gemini configurado.
Si el servicio no está iniciado, la interfaz informa el error y conserva disponible el
orden manual.

## Priorización real con Gemini

Se requiere Node.js 20.6 o posterior y una clave de Gemini API. La clave se configura
solo en el servidor local `ai-service`; no ponerla en `.env.local` del frontend ni en
ninguna variable `VITE_*`.

En una terminal de PowerShell:

```powershell
Set-Location .\ai-service
npm install
Copy-Item .env.example .env
```

Edita `ai-service/.env` y sustituye `GEMINI_API_KEY` por tu clave. Después inicia el
servicio:

```powershell
npm start
```

En otra terminal, desde `frontend/`, ejecuta:

```powershell
npm run dev
```

La app envía al servicio local las tareas `TODO` del proyecto. El servidor envía a Gemini
solo título y descripción para obtener el factor semántico; calcula localmente la fecha,
la prioridad y la fórmula final. La API Key nunca se envía al navegador. Las prioridades
originales no cambian y los scores/recomendaciones solo viven en memoria del frontend:
no se guardan en la base de datos y se pierden al recargar.

El servicio está limitado a `127.0.0.1`, acepta por defecto los orígenes locales de Vite
y limita las solicitudes. No tiene autenticación de usuario ni persiste tareas; es para
desarrollo local y no se debe exponer a Internet ni desplegar como servicio público sin
añadir autenticación y autorización. La solicitud de priorización también transmite
títulos y descripciones a Google Gemini.

Para validar la fórmula y el servicio sin consumir la API de Gemini:

```powershell
Set-Location .\ai-service
npm test
```

## Modo API

Configurar `frontend/.env.local` con datos públicos (no incluir tokens ni secretos):

```dotenv
VITE_DATA_MODE=api
VITE_API_BASE_URL=https://api.taskmanagement.local/v1
VITE_PROJECT_ID=00000000-0000-4000-8000-000000000000
```

`VITE_PROJECT_ID` debe ser el UUID real de un proyecto accesible. `VITE_API_BASE_URL`
incluye `/v1` una sola vez. Ejecutar `npm run dev`; la interfaz solicitará credenciales
mediante `POST /auth/login` y mantendrá el JWT solo en memoria. Al recargar se requiere
iniciar sesión de nuevo. El servidor conserva la autoridad de permisos.

## Comandos

```powershell
npm run dev
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run preview
npm run generate:types
```

Las pruebas unitarias, de componentes e integración usan Vitest, Testing Library y MSW.
Las pruebas Playwright tienen un recorrido demo y otro en modo API usando MSW,
explícitamente mockeado; ninguno acredita una conexión real al backend.

## Accesibilidad y limitaciones

Los formularios usan labels, errores asociados y conservación del borrador; los estados se
anuncian y el diálogo de eliminación permite teclado, Escape y retorno del foco. El tablero
se adapta a móvil sin depender de arrastrar. La prueba axe automatiza reglas estructurales;
la revisión humana con lector de pantalla debe realizarse antes de una entrega de
producción.

### Revisión manual realizada

- En la página, la navegación con Tab alcanza el enlace principal y el botón de creación;
  el foco visible aparece en los controles.
- El formulario permite crear una tarea y anuncia el resultado con `role="status"`.
- El diálogo de eliminación recibe el foco, mantiene el ciclo con Tab, cierra con Escape
  y devuelve el foco al botón que lo abrió.
- En Chromium a 375 × 812 px, el documento no presenta desbordamiento horizontal.
- No se verificó con lector de pantalla ni con un backend real. La ruta Gemini autónoma
  se prueba con mocks y pruebas del servicio; no implica persistencia ni autorización API.

## Dependencias pendientes del integrante 1

- **DEP-AUTH**: comprobación server-side por petición y pruebas de acceso denegado.
- **DEP-ROL**: fuente/contrato de membresía; el cliente no infiere roles.
- **DEP-PUT**: aclarar reemplazo/parcial y cómo limpiar campos opcionales.
- **DEP-PROYECTO**: el contrato no lista proyectos; se configura un UUID conocido.
- **DEP-SCORE**: pruebas de backend de la fórmula constitucional con valores D/P/S fijos,
  límites temporales, redondeo y entradas inválidas; gate de aceptación.
- **DEP-IA de producción**: el endpoint oficial debe integrarse con autorización,
  persistencia y OpenAPI antes de desplegar la función conectada a usuarios reales. Ya
  existe una integración real local con Gemini, independiente del backend del equipo;
  T038-T040 siguen bloqueadas solo para la integración oficial.

Ninguna de estas dependencias se presenta como implementada por el frontend.
