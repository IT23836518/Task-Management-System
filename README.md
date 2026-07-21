# Task Management System

A premium, full-stack Task Management web application featuring secure JWT authentication, a interactive dashboard, full CRUD operations, dynamic filtering/sorting/searching, and elegant toast alerts.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite + TypeScript), Lucide Icons, Axios, Vanilla CSS (Custom HSL Dark Theme)
- **Backend**: Node.js + Express.js (TypeScript), Prisma ORM, Zod Schema Validation, bcryptjs, jsonwebtoken
- **Database**: PostgreSQL (Prisma Migrations & Client)

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

Create a `.env` file inside the `backend/` directory using the following variables:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:1234@localhost:5432/task_manager?schema=public"
JWT_SECRET="45f9a72b21c4323c21a4f028b123d4e92a83f94857c0e812d4a5b6c7d8e9f0a1"
JWT_EXPIRES_IN="1d"
```

---

## 🚀 Installation & Setup

Follow these steps to run the application locally.

### 1. Database Setup

Ensure you have **PostgreSQL** installed and running on your system. 

The application is configured to connect to PostgreSQL with:
- **User**: `postgres`
- **Password**: `1234`
- **Port**: `5432`

> [!NOTE]
> Prisma will automatically create the `task_manager` database during the migration process.

### 2. Backend Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run migrations to create tables and set up models:
   ```bash
   npx prisma migrate dev --name init --schema=../database/schema.prisma
   ```
4. Seed the database with the default administrator account:
   ```bash
   npx ts-node ../database/seed.ts
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on **http://localhost:5000**.

### 3. Frontend Installation

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be hosted on **http://localhost:5173**. Open this URL in your web browser.

---

## 🔐 Default Credentials

To authenticate, log in with these pre-seeded credentials:
- **Email**: `admin@test.com`
- **Password**: `123456`

---

## 📋 API Documentation

### Authentication Endpoints

- **`POST /api/auth/login`**: Authenticates user and returns JWT.
  - **Body**: `{ "email": "admin@test.com", "password": "123456" }`
  - **Response**: `{ "success": true, "token": "...", "user": { "id": "...", "name": "...", "email": "..." } }`

### Task Endpoints (Protected - Require `Authorization: Bearer <token>`)

- **`GET /api/tasks`**: Retrieve all tasks. Supports parameters:
  - `search`: Search task titles (case-insensitive).
  - `status`: Filter by `PENDING`, `IN_PROGRESS`, or `COMPLETED`.
  - `priority`: Filter by `LOW`, `MEDIUM`, or `HIGH`.
  - `sortBy`: Sort by `newest`, `oldest`, or `dueDate`.
- **`GET /api/tasks/metrics`**: Get task completion metrics (total, pending, progress, completed, overdue).
- **`GET /api/tasks/:id`**: Get task details by ID.
- **`POST /api/tasks`**: Create a new task.
  - **Body**: `{ "title": "Title", "description": "Text", "priority": "MEDIUM", "status": "PENDING", "dueDate": "ISO Date String" }`
- **`PUT /api/tasks/:id`**: Update task fields.
- **`DELETE /api/tasks/:id`**: Delete a task by ID.

---

## 💭 Assumptions Made

1. **Task Ownership**: Each user can only view, edit, update, or delete tasks they created. Security checks are enforced in the backend.
2. **Timezones**: Due dates are validated ignoring timezones (date-only comparison) on both frontend and backend to avoid client-server offsets.
3. **No User Registration**: As per the assessment specification, a registration interface is omitted. The seeded user account is the sole entryway.

---

## ⚠️ Known Limitations

1. **Token Refresh**: Access tokens are valid for 24 hours. Refresh token rotations are omitted for architectural simplicity.
2. **File Attachments**: Tasks do not support document attachments.
