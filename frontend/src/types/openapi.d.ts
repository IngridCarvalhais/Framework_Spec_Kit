export interface paths {
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Registro de usuario */
        post: operations["registerUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Inicio de sesión */
        post: operations["loginUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crear un nuevo espacio de trabajo */
        post: operations["createWorkspace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/projects/{project_id}/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar tareas de un proyecto con filtros */
        get: operations["getProjectTasks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Crear una nueva tarea */
        post: operations["createTask"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener detalle de una tarea */
        get: operations["getTaskById"];
        /** Actualizar una tarea */
        put: operations["updateTask"];
        post?: never;
        /** Eliminar una tarea */
        delete: operations["deleteTask"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks/{id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Obtener comentarios de una tarea */
        get: operations["getTaskComments"];
        put?: never;
        /** Crear comentario en una tarea */
        post: operations["createComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        User: {
            /** Format: uuid */
            id: string;
            /** Format: email */
            email: string;
            name: string;
            /** Format: date-time */
            created_at: string;
        };
        Workspace: {
            /** Format: uuid */
            id: string;
            name: string;
            /** Format: date-time */
            created_at: string;
        };
        Task: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            project_id: string;
            title: string;
            description?: string;
            /** @enum {string} */
            status: "TODO" | "IN_PROGRESS" | "DONE";
            /** @enum {string} */
            priority: "HIGH" | "MEDIUM" | "LOW";
            /** Format: uuid */
            assigned_to?: string | null;
            /** Format: float */
            ai_score?: number | null;
            /** Format: date-time */
            due_date?: string | null;
            /** Format: date-time */
            created_at: string;
        };
        Comment: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            task_id: string;
            /** Format: uuid */
            user_id: string;
            content: string;
            /** Format: date-time */
            created_at: string;
        };
        AuthRegisterRequest: {
            /** Format: email */
            email: string;
            password: string;
            name: string;
        };
        AuthLoginRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        AuthResponse: {
            token: string;
            user: components["schemas"]["User"];
        };
        CreateTaskRequest: {
            /** Format: uuid */
            project_id: string;
            title: string;
            description?: string;
            /** @enum {string} */
            priority?: "HIGH" | "MEDIUM" | "LOW";
            /** Format: uuid */
            assigned_to?: string;
            /** Format: date-time */
            due_date?: string;
        };
        UpdateTaskRequest: {
            title?: string;
            description?: string;
            /** @enum {string} */
            status?: "TODO" | "IN_PROGRESS" | "DONE";
            /** @enum {string} */
            priority?: "HIGH" | "MEDIUM" | "LOW";
            /** Format: uuid */
            assigned_to?: string;
            /** Format: date-time */
            due_date?: string;
        };
    };
    responses: {
        /** @description Respuesta de error estándar */
        ErrorResponse: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": {
                    statusCode: number;
                    message: string;
                    error?: string;
                };
            };
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    registerUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthRegisterRequest"];
            };
        };
        responses: {
            /** @description Usuario creado exitosamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["User"];
                };
            };
            400: components["responses"]["ErrorResponse"];
        };
    };
    loginUser: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AuthLoginRequest"];
            };
        };
        responses: {
            /** @description Login exitoso y retorno de token JWT */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponse"];
                };
            };
            401: components["responses"]["ErrorResponse"];
        };
    };
    createWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    name: string;
                };
            };
        };
        responses: {
            /** @description Espacio de trabajo creado correctamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Workspace"];
                };
            };
            400: components["responses"]["ErrorResponse"];
        };
    };
    getProjectTasks: {
        parameters: {
            query?: {
                status?: "TODO" | "IN_PROGRESS" | "DONE";
                priority?: "HIGH" | "MEDIUM" | "LOW";
            };
            header?: never;
            path: {
                project_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de tareas recuperada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Task"][];
                };
            };
            400: components["responses"]["ErrorResponse"];
        };
    };
    createTask: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateTaskRequest"];
            };
        };
        responses: {
            /** @description Tarea creada correctamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Task"];
                };
            };
            400: components["responses"]["ErrorResponse"];
        };
    };
    getTaskById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detalle de la tarea obtenido */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Task"];
                };
            };
            404: components["responses"]["ErrorResponse"];
        };
    };
    updateTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTaskRequest"];
            };
        };
        responses: {
            /** @description Tarea actualizada exitosamente */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Task"];
                };
            };
            400: components["responses"]["ErrorResponse"];
        };
    };
    deleteTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tarea eliminada exitosamente */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            404: components["responses"]["ErrorResponse"];
        };
    };
    getTaskComments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de comentarios recuperada */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Comment"][];
                };
            };
            404: components["responses"]["ErrorResponse"];
        };
    };
    createComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    content: string;
                };
            };
        };
        responses: {
            /** @description Comentario creado correctamente */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Comment"];
                };
            };
            400: components["responses"]["ErrorResponse"];
        };
    };
}
