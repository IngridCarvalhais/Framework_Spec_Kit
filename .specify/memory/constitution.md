<!--
Sync Impact Report
Version change: sin versión (plantilla sin completar) -> 1.0.0
Principios añadidos:
- I. Contrato OpenAPI como fuente de verdad
- II. Autorización comprobada en el servidor
- III. Secretos de IA exclusivamente en el backend
- IV. Accesibilidad y continuidad manual
- V. Puntuación de IA determinista y verificable
Secciones añadidas: Seguridad y protección de datos; Verificación y flujo de desarrollo.
Secciones eliminadas: ninguna; la plantilla no contenía secciones definidas.
TODO: confirmar la fecha original de ratificación con el equipo.
-->
# Constitución de TaskManager AI

## Principios fundamentales

### I. Contrato OpenAPI como fuente de verdad
Toda integración entre cliente y servidor debe ajustarse al contrato OpenAPI publicado:
rutas, esquemas, enums, autenticación, códigos HTTP y respuestas. Un cambio incompatible
requiere actualizar y revisar el contrato antes de implementar o consumir el comportamiento.
Las propuestas aún no incorporadas al OpenAPI, incluida la priorización con IA, deben
identificarse como pendientes y no presentarse como capacidades disponibles.

### II. Autorización comprobada en el servidor
El servidor debe autenticar cada operación protegida y comprobar en cada petición que el
usuario tiene acceso al proyecto y el rol necesario para la acción. La autorización debe
denegarse por defecto; ocultar o deshabilitar controles en la interfaz no sustituye esta
comprobación. El servidor debe rechazar el acceso antes de leer o enviar datos del proyecto
a un proveedor externo.

### III. Secretos de IA exclusivamente en el backend
Las claves y credenciales de proveedores de IA deben residir y utilizarse solo en el backend,
mediante configuración segura del entorno o un gestor de secretos. No deben incluirse en
el código, paquetes, almacenamiento ni peticiones del cliente, ni en registros. La interfaz
debe comunicarse con el backend y nunca directamente con el proveedor usando una clave
privilegiada.

### IV. Accesibilidad y continuidad manual
Las tareas deben poder consultarse y gestionarse mediante controles accesibles por teclado,
etiquetas asociadas a campos, foco visible, errores vinculados a sus campos y mensajes de
estado anunciables. El color debe acompañarse de texto y ninguna acción debe depender
exclusivamente de arrastrar elementos. Si la IA falla, la gestión manual debe seguir
disponible; se conservarán las prioridades y cambios del usuario, y no se inventarán
puntuaciones de IA.

### V. Puntuación de IA determinista y verificable
Para las tareas TODO, con D como factor de fecha, P como prioridad y S como puntuación
semántica validada en [0, 1], la fórmula debe ser
`ai_score = round(0.50 * D + 0.30 * P + 0.20 * S, 4)`.
P debe valer HIGH=1, MEDIUM=0.5 y LOW=0. D debe valer 1 si la fecha límite está vencida
o dentro de las próximas 24 horas inclusive; 0.75 si está a más de 24 y hasta 72 horas;
0.5 si está a más de 72 y hasta 168 horas; 0.25 si está a más de 168 horas; y 0 si no
hay fecha. La referencia temporal debe fijarse en UTC. El cálculo debe realizarse en el
servidor y no debe modificar prioridad ni estado. Las pruebas deben verificar los valores
de frontera, los ejemplos D=1/P=1/S=0.5 -> 0.9000 y D=0/P=0/S=0.5 -> 0.1000,
así como el redondeo y el rechazo de entradas semánticas inválidas. Con los mismos D, P
y S, el resultado debe ser idéntico.

## Seguridad y protección de datos
El backend debe limitar los datos enviados al proveedor de IA a los estrictamente
necesarios para la tarea autorizada. No debe transmitir JWT, correo electrónico, hash de
contraseña ni comentarios. Los títulos, descripciones y respuestas del proveedor deben
tratarse como datos no confiables, nunca como instrucciones ejecutables. Antes de persistir
resultados, el backend debe validar rango, tipo y correspondencia exacta de identificadores;
un lote inválido debe rechazarse íntegramente, sin escrituras parciales.

## Verificación y flujo de desarrollo
Los cambios deben incluir pruebas que comprueben conformidad con OpenAPI y criterios de
aceptación relevantes. Las pruebas de autorización deben verificar rechazos en el servidor,
incluidos usuarios sin acceso y roles insuficientes. La fórmula de `ai_score` debe probarse
con valores semánticos fijos para aislar y verificar el cálculo determinista. Las pruebas
de interfaz deben cubrir navegación por teclado, mensajes accesibles y continuidad manual
ante errores o tiempos de espera de IA. La interfaz debe reflejar el éxito de una mutación
solo después de la respuesta satisfactoria del servidor.

## Gobernanza
Esta constitución prevalece sobre prácticas o documentación incompatibles. Para modificarla
se requiere una propuesta documentada con motivo, principios y secciones afectados, impacto
en contrato, implementación y pruebas, y aprobación de las personas responsables del
proyecto. Las modificaciones se versionarán según SemVer: MAJOR para cambios incompatibles
en principios, MINOR para principios o requisitos nuevos o ampliados materialmente y PATCH
para aclaraciones sin cambio normativo. Cada revisión de cambios debe comprobar su
conformidad con esta constitución; las desviaciones requieren corrección o una enmienda
aprobada antes de dar el cambio por conforme.

**Versión**: 1.0.0 | **Ratificada**: TODO(RATIFICATION_DATE): confirmar fecha original con el equipo | **Última enmienda**: 2026-10-30
