# TaskManager AI

Aplicacion web de tablero Kanban con React, TypeScript y Vite. Incluye datos de
demostracion y un servicio Node local opcional que utiliza OpenAI o Gemini para sugerir
el orden de prioridad de las tareas pendientes.

## Requisitos

- Node.js 22.12 o posterior y npm.
- Una clave de OpenAI o Gemini solo si se quiere probar la priorizacion real.

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

## Activar la priorizacion real con OpenAI o Gemini

La clave debe permanecer en el servicio Node y nunca debe ponerse en el frontend ni en
variables `VITE_*`.

En una terminal, desde la raiz:

```powershell
Copy-Item ai-service\.env.example ai-service\.env
```

Para usar OpenAI, edita `ai-service\.env` y configura `AI_PROVIDER=openai`,
`OPENAI_API_KEY` y, opcionalmente, `OPENAI_MODEL` (por defecto `gpt-4o-mini`). Para usar
Gemini, configura `AI_PROVIDER=gemini` y `GEMINI_API_KEY`. No compartas ni subas el
archivo `.env`.

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
autoriza el acceso a proyectos. No lo expongas a Internet ni lo uses como servicio de
produccion sin integrar autenticacion y autorizacion. Al priorizar, los titulos y las
descripciones de tareas se envian al proveedor elegido. Las recomendaciones no se persisten.

## Validacion

```powershell
Set-Location frontend
npm run lint
npm run build
```

La integracion con OpenAI/Gemini es opcional; requiere una clave propia y se configura en
`ai-service\.env`, nunca en el frontend. El servicio local no autentica ni autoriza
usuarios y no debe exponerse a Internet.
