# Módulo de Autenticación, Usuarios y Gestión de Datos

## 1. Modelos de Base de Datos (Entidades)

### User
- `id`: UUID (Primary Key)
- `email`: String (Unique, Not Null)
- `password_hash`: String (Not Null)
- `name`: String (Not Null)
- `created_at`: Timestamp (Default: NOW())
- `updated_at`: Timestamp (Default: NOW())

### Workspace
- `id`: UUID (Primary Key)
- `name`: String (Not Null)
- `created_at`: Timestamp (Default: NOW())

### WorkspaceMember
- `workspace_id`: UUID (Foreign Key -> Workspace.id)
- `user_id`: UUID (Foreign Key -> User.id)
- `role`: Enum (`ADMIN`, `MEMBER`, `VIEWER`)
- *Primary Key Compuesta:* (`workspace_id`, `user_id`)

### Project
- `id`: UUID (Primary Key)
- `workspace_id`: UUID (Foreign Key -> Workspace.id)
- `name`: String (Not Null)
- `description`: Text (Optional)
- `created_at`: Timestamp (Default: NOW())

### Task
- `id`: UUID (Primary Key)
- `project_id`: UUID (Foreign Key -> Project.id)
- `title`: String (Not Null)
- `description`: Text
- `status`: Enum (`TODO`, `IN_PROGRESS`, `DONE`)
- `priority`: Enum (`HIGH`, `MEDIUM`, `LOW`)
- `assigned_to`: UUID (Foreign Key -> User.id, Nullable)
- `ai_score`: Float (Nullable, asignado por motor de IA)
- `due_date`: Timestamp (Nullable)
- `created_at`: Timestamp (Default: NOW())

### Comment
- `id`: UUID (Primary Key)
- `task_id`: UUID (Foreign Key -> Task.id)
- `user_id`: UUID (Foreign Key -> User.id)
- `content`: Text (Not Null)
- `created_at`: Timestamp (Default: NOW())

### Tag & TaskTag
- `Tag`: `id` (UUID), `name` (String), `color` (String)
- `TaskTag`: `task_id` (FK), `tag_id` (FK)

---

## 2. Flujo de Autenticación JWT
1. El usuario envía credenciales en `POST /auth/login`.
2. El servidor verifica las credenciales y responde con un JWT con el payload `{ userId, email }`.
3. El cliente adjunta el token en la cabecera `Authorization: Bearer <token>` para las peticiones protegidas.

---

## 3. Criterios de Aceptación (Gherkin)

```gherkin
Feature: Autenticación y Control de Acceso por Roles

  Scenario: Registro exitoso de usuario
    Given un email no registrado "user@example.com" y una contraseña válida
    When el cliente envía una petición POST a /auth/register
    Then el sistema responde con HTTP 201 Created y retorna el perfil creado sin el hash de contraseña[cite: 3].

  Scenario: Bloqueo de edición a usuario con rol Viewer
    Given un usuario autenticado con rol "VIEWER" en el proyecto
    When intenta realizar una petición PUT a /tasks/{id} con un nuevo título
    Then el sistema responde con HTTP 403 Forbidden y mensaje "Sin permisos de edición".

  Scenario: Creación de tarea por usuario con permisos
    Given un token JWT válido de un usuario con rol "MEMBER" o "ADMIN"
    When el cliente envía POST a /tasks con título y descripción
    Then el sistema responde con HTTP 201 Created, asigna el estado "TODO" y emite el evento WebSocket "task:updated"[cite: 3].