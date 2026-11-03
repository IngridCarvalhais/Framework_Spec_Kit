# Implementation Plan: Tablero de tareas y priorización con IA

**Branch**: `001-task-board-ai-prioritization` (valor de configuración de Spec Kit; no
verifica una rama Git activa) | **Date**: 2026-10-30 | **Spec**: [spec.md](spec.md)

**Input**: Funcionalidad del integrante 2. Cliente React, TypeScript, Vite y Tailwind CSS
en `frontend/`, servicio local Node/Express para Gemini, pruebas y guía de ejecución.

## Summary

Implementar un frontend accesible para un proyecto conocido, con tablero Kanban, filtros
por estado y prioridad, formularios CRUD y estados de carga y error. El modo `api`
consumirá solo las rutas y esquemas publicados en el OpenAPI existente; el modo `demo`
usará fixtures locales y operaciones no persistentes. Un sidecar local llama a Gemini sin
exponer la clave en el navegador; sus resultados son volátiles y el servicio no ofrece
autenticación o persistencia. No se modifican archivos del backend oficial, OpenAPI ni
colecciones Postman del integrante 1.

## Technical Context

**Language/Version**: TypeScript para la aplicación React; usar una versión estable
compatible con las versiones fijadas en el lockfile.

**Primary Dependencies**: React, Vite y Tailwind CSS 4 con su integración oficial de Vite.
Pruebas: Vitest, React Testing Library, `user-event`, `jest-dom`, MSW y Playwright para un
conjunto pequeño de pruebas end-to-end. Generar los tipos de contrato TypeScript desde el
OpenAPI existente, como artefacto del frontend; la fuente OpenAPI se consume en modo solo
lectura.

**Storage**: En modo API, persistencia y autoridad pertenecen al backend existente; el
frontend no persiste el token y lo mantiene en memoria. En modo demo, fixtures locales y
mutaciones en memoria volátil, sin prometer persistencia tras recargar.

**Testing**: Pruebas unitarias de presentación y lógica de filtros con Vitest; pruebas de
interacción mediante Testing Library y `user-event`; simulación de HTTP con MSW para
verificar rutas, encabezados, query parameters, payloads y respuestas `204`; Playwright
para los recorridos principales del modo demo y del modo API mockeado. Añadir comprobación
automatizada de accesibilidad y revisión manual de teclado; los escáneres automáticos no
sustituyen esta última.

**Target Platform**: Navegadores modernos de escritorio y móvil; diseño adaptable y
navegación por teclado conforme a WCAG 2.2 AA como objetivo de planificación.

**Project Type**: Aplicación web en `frontend/` y sidecar de desarrollo Node/Express en
`ai-service/`. El sidecar no sustituye al backend de producción.

**Performance Goals**: Las pruebas deben confirmar que cada pantalla diferencia carga,
vacío, éxito y error, y que una respuesta obsoleta no reemplaza el proyecto o filtros
actuales. No se fija una latencia del servidor que el contrato no garantice.

**Constraints**:
- Respetar `Task`, rutas, enums y payloads del OpenAPI vigente. No añadir ni modificar el
  contrato del integrante 1.
- La URL de servidor OpenAPI ya incluye `/v1`; la configuración de base URL debe incluir
  el prefijo una sola vez.
- El CRUD del modo demo usa fixtures y no llama ni persiste en la API de tareas. La acción
  Gemini es explícita y sí envía el snapshot al sidecar local; no es fallback de errores.
- No guardar secretos de proveedores ni exponerlos en variables `VITE_*`. El token de
  sesión vive en memoria.
- `AuthResponse` no incluye rol; la interfaz no debe inferir MEMBER, ADMIN o VIEWER.
  La autorización real corresponde al servidor.
- La API no contiene endpoint de priorización con IA. La integración real local de Gemini
  se distingue del contrato de producción, no tiene autorización ni persiste scores.
- No modificar `system-overview.md`, `auth.md`, `openapi-spec.yaml`, pruebas ni colecciones
  Postman del integrante 1.

**Scale/Scope**: Un proyecto activo conocido, tres columnas (`TODO`, `IN_PROGRESS`,
`DONE`), filtros por estado y prioridad, autenticación de sesión necesaria para el modo
API, CRUD de tareas, fallback manual y priorización real local con Gemini. Descubrimiento
de proyectos y miembros, comentarios, drag-and-drop, persistencia del score y autorización
de la ruta de priorización quedan fuera.

## Constitution Check

| Gate | Resultado | Evidencia / condición |
|---|---|---|
| Conformidad con OpenAPI | PASS | Consumir únicamente rutas y enums publicados. Los tipos generados derivan de una copia de lectura del contrato. |
| Autorización en el servidor | PASS CON DEPENDENCIA | Enviar Bearer en el modo API y mostrar errores del servicio; no asumir que controles ocultos autorizan operaciones. Falta un contrato para obtener el rol. |
| Secretos de IA en backend | PASS | Gemini se llama desde el sidecar Node; no incluir claves en el frontend. |
| Accesibilidad | PASS | Controles semánticos, alternativas a arrastre, soporte de teclado, errores enlazados, foco y anuncios de estado; validar manualmente además de pruebas automatizadas. |
| Continuidad manual | PASS | Orden manual disponible en demo y tras fallo; no alterar prioridad ni inventar `ai_score`. |
| Fórmula verificable | PASS CON DEPENDENCIA | El integrante 1 debe probar la fórmula de backend con D/P/S fijos. El frontend prueba la representación, orden y rechazo de respuestas inválidas; no recalcula el score ni duplica la fuente de verdad. |
| Integración de IA | PASS LOCAL / PENDIENTE PRODUCCIÓN | Sidecar local real integrado; no se habilita acceso público sin autorización y persistencia. |
| Alcance por integrante | PASS CON EXCEPCIÓN SOLICITADA | Se implementa `ai-service/` independiente; no se modifican archivos del integrante 1. |

No hay infracciones que requieran justificación de complejidad. Las dependencias bloqueantes
se registran en investigación y contrato frontend.

****Gates externos antes de declarar completa la integración de producción**: además de manejar
denegaciones en la interfaz, el integrante 1 debe verificar permisos en cada petición
protegida y probar rechazos por acceso o rol insuficiente (DEP-AUTH). También debe probar
en el backend la fórmula constitucional con D/P/S fijos, valores esperados, límites,
redondeo y entradas inválidas (DEP-SCORE). Estos gates no son implementación del integrante
2; el sidecar local calcula scores para desarrollo, pero no sustituye estos gates de
producción.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-board-ai-prioritization/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── frontend-api.md
└── tasks.md
```

### Source Code (repository root)

```text
frontend/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── src/
│   ├── app/
│   ├── components/
│   │   ├── board/
│   │   ├── forms/
│   │   └── feedback/
│   ├── features/
│   │   ├── auth/
│   │   └── tasks/
│   ├── services/
│   │   ├── api/
│   │   └── demo/
│   ├── styles/
│   └── types/
└── tests/
    ├── unit/
    ├── component/
    ├── integration/
    └── e2e/
```

**Structure Decision**: Un único frontend en la carpeta solicitada `frontend/`. Separar
los servicios API y demo para que la selección sea explícita y comprobable; conservar
presentación, estado de formularios y datos de servidor en capas diferenciadas. No se
añade una librería global de estado o caché en la primera fase: el estado derivado del
tablero se calcula desde las tareas y filtros actuales. MSW simula la API en tests, no
sustituye el modo demo que verá el usuario.

## Complexity Tracking

No se solicitan excepciones a la constitución ni proyectos adicionales.
