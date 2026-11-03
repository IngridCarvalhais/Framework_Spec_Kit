# TaskManager AI

Aplicacion web de tablero Kanban con React, TypeScript y Vite. Incluye datos de
demostracion y un servicio Node local opcional que utiliza OpenAI para sugerir el orden
de prioridad de las tareas pendientes.

## Requisitos

- Node.js 22.12 o posterior y npm.
- Una clave API de OpenAI solo para probar la priorizacion real.

## Ejecutar la aplicacion en modo demo

Desde la raiz del repositorio, en PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
Set-Location frontend
npm ci
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://localhost:5173`. El modo demo usa
fixtures locales; los cambios no se guardan al recargar la pagina.

## Activar la priorizacion con OpenAI

La clave debe permanecer en el servicio Node y nunca debe ponerse en el frontend ni en
variables `VITE_*`.

En una terminal, desde la raiz:

```powershell
Copy-Item ai-service\.env.example ai-service\.env
```

Edita `ai-service\.env` y sustituye `OPENAI_API_KEY` por tu clave. El modelo por defecto
es `gpt-4o-mini`; se puede cambiar con `OPENAI_MODEL`. No compartas ni subas el archivo
`.env`.

Despues instala dependencias e inicia el servicio:

```powershell
Set-Location ai-service
npm ci
npm start
```

En otra terminal, desde la raiz, inicia el frontend:

```powershell
Set-Location frontend
npm ci
npm run dev
```

El servicio IA esta pensado unicamente para desarrollo local: no autentica usuarios ni
autoriza el acceso a proyectos. No lo expongas a Internet ni lo uses en produccion sin
integrar autenticacion y autorizacion. Al priorizar, los titulos y descripciones se
envian a OpenAI. Las recomendaciones no se persisten.

## Validacion

```powershell
Set-Location frontend
npm run lint
npm run build
```
