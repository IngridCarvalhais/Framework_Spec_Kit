# System Overview & Architecture

## 1. Entorno Tecnológico
- **Backend Framework:** Node.js (Express / NestJS) o Python (FastAPI).
- **Base de Datos Relacional:** PostgreSQL 15+.
- **Protocolo de Comunicación:** REST API para operaciones CRUD y HTTP tradicional.
- **Protocolo Tiempo Real:** WebSockets (WS / WSS) para eventos bidireccionales en vivo.

## 2. Configuración Global y Persistencia
- **Gestión de BD:** Migraciones de base de datos automatizadas mediante ORM (ej. Prisma / TypeORM / SQLAlchemy).
- **Variables de Entorno Requeridas:**
  ```env
  PORT=3000
  DATABASE_URL=postgresql://user:password@localhost:5432/taskdb?schema=public
  JWT_SECRET=super_secret_jwt_key_spec_kit
  JWT_EXPIRES_IN=24h
  WS_PORT=3001