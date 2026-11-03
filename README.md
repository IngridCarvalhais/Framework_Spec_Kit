# TaskManager AI

Aplicación web de tablero Kanban con React, TypeScript y Vite. Incluye datos de
demostración y un servicio Node local opcional que utiliza Gemini para sugerir el orden
de prioridad de las tareas pendientes.

## Requisitos

- Node.js 22.12 o posterior y npm.
- Una clave de Gemini API solo si se quiere probar la priorización real.

## Ejecutar la aplicación en modo demo

Desde la raíz del repositorio, en PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env.local
Set-Location frontend
npm ci
npm run dev
```

Abre la URL que muestre Vite, normalmente `http://localhost:5173`. El modo demo usa
fixtures locales; los cambios no se guardan al recargar la página.

## Activar la priorización real con Gemini

La clave debe permanecer en el servicio Node y nunca debe ponerse en el frontend ni en
variables `VITE_*`.

En una terminal, desde la raíz:

```powershell
Copy-Item ai-service\.env.example ai-service\.env
```

Edita `ai-service\.env` y sustituye el valor de `GEMINI_API_KEY` por tu propia clave.
Después instala dependencias e inicia el servicio:

```powershell
Set-Location ai-service
npm ci
npm start
```

En otra terminal, desde la raíz, inicia el frontend:

```powershell
Set-Location frontend
npm ci
npm run dev
```

El servicio IA está pensado únicamente para desarrollo local: no autentica usuarios ni
autoriza el acceso a proyectos. No lo expongas a Internet ni lo uses como servicio de
producción sin integrar autenticación y autorización. Al priorizar, los títulos y las
descripciones de tareas se envían a Google Gemini. Las recomendaciones no se persisten.

## Validación

```powershell
Set-Location frontend
npm run lint
npm run build
```

La integración Gemini es opcional; requiere una clave propia y se configura en
`ai-service/.env`, nunca en el frontend. El servicio local no autentica ni autoriza
usuarios y no debe exponerse a Internet.
