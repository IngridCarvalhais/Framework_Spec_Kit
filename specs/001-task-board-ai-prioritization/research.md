# Investigación y decisiones

## Stack y organización del frontend

**Decisión**: Crear una única aplicación en `frontend/` con React, TypeScript, Vite y
Tailwind CSS 4 usando la integración oficial de Vite. Separar presentación y servicios
HTTP/demo, manteniendo el estado de formulario local y derivando las columnas y filtros
de la colección de tareas.

**Rationale**: Coincide con los requisitos del integrante 2 y permite evitar estado
duplicado. Una segunda librería de estado o caché no se justifica para el único proyecto
contemplado.

**Alternativas consideradas**: React sin TypeScript; un framework full-stack; añadir una
librería global de estado desde el inicio. Se descartan para limitar esta entrega al
cliente y no duplicar funciones del backend.

## Contrato API existente

**Decisión**: Tratar el archivo `.spec/api/openapi-spec.yaml` como referencia de solo
lectura y generar tipos de TypeScript dentro del frontend. En el repositorio de trabajo
actual se encuentra en `Framework con IA/.spec/api/openapi-spec.yaml`. Configurar la URL
base en un único lugar, incluyendo `/v1` exactamente una vez, y construir sobre ella las
rutas de operación.

**Rationale**: El servidor OpenAPI ya declara `https://api.taskmanagement.local/v1` y sus
paths no repiten `/v1`; concatenar dos prefijos rompe las peticiones. Los tipos generados
reducen el drift de compilación, pero no validan por sí solos respuestas HTTP; las
fronteras de red aún requieren pruebas y comprobaciones de datos.

**Alternativas consideradas**: Copiar manualmente enums y DTOs al frontend; cambiar paths
o servidor OpenAPI para ajustarlos a la aplicación. La primera alternativa permite
divergencia; la segunda pertenece al integrante 1 y está fuera del alcance.

**Riesgo/dependencia**: La API está alojada en un dominio `.local`; para una prueba real
se necesita backend y resolución local disponibles. El modo de desarrollo no debe
presentar MSW o datos demo como integración real.

## Separación de modo API y modo demo

**Decisión**: Requerir selección explícita `api` o `demo` mediante configuración pública
de Vite. Mostrar una etiqueta fija del modo demo y explicar que los cambios son volátiles
y no se guardan en el servidor. Ante fallos API mostrar el error; nunca cambiar a demo
automáticamente. Las variables `VITE_*` solo transportan configuración no secreta.

**Rationale**: Hace verificable la diferencia entre fixture y backend real, evita
resultados exitosos engañosos y protege secretos. El modo demo es útil para entregar y
evaluar el frontend antes de disponer del servicio.

**Alternativas consideradas**: Fallback automático a fixtures; fixtures persistidos en
almacenamiento local; llamadas reales simuladas con una respuesta de IA fija. Se
descartan porque ocultan fallos, aparentan persistencia o confunden demo con IA real.

## Pruebas de interfaz y accesibilidad

**Decisión**: Usar Vitest y React Testing Library con `user-event` y `jest-dom` para
comportamiento y accesibilidad; MSW para probar integración HTTP; Playwright para un
conjunto pequeño de recorridos completos. Añadir análisis automatizado de accesibilidad
y revisar manualmente el flujo solo con teclado.

**Rationale**: Las consultas basadas en roles y nombres accesibles prueban el resultado
observable, no detalles internos de componentes. MSW permite verificar las rutas y
payloads acordados sin modificar el backend. La automatización de accesibilidad no prueba
por completo navegación, foco o uso con lector de pantalla.

**Alternativas consideradas**: Probar solo lógica de funciones; depender exclusivamente
de snapshots; considerar un análisis automatizado como certificación de accesibilidad. No
cubren interacciones reales, errores de red ni recorrido completo de teclado.

## Componentes accesibles

**Decisión**: Representar cada columna con un encabezado y una lista de tareas; usar
controles HTML nativos etiquetados, mensajes de error enlazados, texto además de color y
alternativas operables con teclado para cambiar estado. Diálogos deben seguir el patrón
WAI-ARIA para foco inicial, ciclo de tabulación, Escape cuando sea seguro y retorno del
foco.

**Rationale**: El contrato y la especificación excluyen depender del arrastre y requieren
que los errores y estados de carga sean anunciables.

**Alternativas consideradas**: Interacciones exclusivamente drag-and-drop y distintivos
basados únicamente en color; no satisfacen los requisitos de accesibilidad.

## Dependencias de API y criterios de cierre

**Decisión**: Implementar exclusivamente las operaciones OpenAPI existentes. Mantener la
priorización IA como dependencia bloqueante para modo API y documentar sin efectuar
cambios en los archivos del integrante 1.

**Rationale**: OpenAPI ofrece `GET /projects/{project_id}/tasks`, `POST /tasks`,
`GET/PUT/DELETE /tasks/{id}` y enums concretos, pero no ofrece priorización IA ni rol en
`AuthResponse`. `UpdateTaskRequest` no declara `null` para limpiar fecha o asignación y
no se especifica si PUT reemplaza o combina campos.

**Alternativas consideradas**: Añadir una ruta asumida en el frontend; inferir el rol;
enviar `null` o campos parciales sin contrato. Se descartan para preservar el contrato.

**Dependencias pendientes del integrante 1**:
- Publicar y acordar endpoint, permisos, DTOs y errores de priorización IA.
- Definir una fuente de roles/MEMBER/ADMIN/VIEWER sin confiar en inferencias del cliente.
- Resolver la semántica de PUT y cómo limpiar `due_date` y `assigned_to`.
- Confirmar defaults de creación y respuestas `401`/`403` consistentes.
- Disponer de una instancia de backend de desarrollo accesible para la verificación final.

## Fuentes de referencia

- [React: Managing State](https://react.dev/learn/managing-state)
- [openapi-typescript](https://openapi-ts.dev/introduction)
- [Vite: Env Variables and Modes](https://vite.dev/guide/env-and-mode)
- [Tailwind CSS: Installation with Vite](https://tailwindcss.com/docs/installation/using-vite)
- [Vitest](https://vitest.dev/guide/)
- [Testing Library: Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Mock Service Worker](https://mswjs.io/docs/)
- [Playwright](https://playwright.dev/docs/intro)
- [WAI-ARIA: Dialog Modal Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
