# Tool Crib DPM

A comprehensive dashboard application for Tool Crib management, covering borrowing, returning, inventory tracking, and reporting (Audit Logs).

## Technology Overview

This application is built using a Monorepo architecture with modern technologies:
*   **Frontend**: React v19, Vite, TailwindCSS (located in `apps/dashboard/`)
*   **Backend**: Node.js, Express, Drizzle ORM (located in `apps/api/`)
*   **Database**: PostgreSQL
*   **Containerization**: Docker & Docker Compose

## Prerequisites

Before starting, ensure to have the following installed:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop) (Highly recommended for easy setup)
*   [Node.js](https://nodejs.org/) (Version 18 or newer - **only if running manually**)
*   [PostgreSQL](https://www.postgresql.org/) (**Only if running manually** - Docker provides a database container)

---

## How to Run (Docker Method - Recommended)

The easiest and fastest way to run the complete application (Database, Backend, Frontend).

1.  **Clone this repository.**
2.  **Run with Docker Compose:**
    Open a terminal in the project root folder and run:
    ```bash
    docker-compose up --build
    ```
    *Wait until all containers are running and connected.*

3.  **Access the Application:**
    *   **Frontend (Dashboard):** [http://localhost:5173](http://localhost:5173)
    *   **Backend (API):** [http://localhost:3001](http://localhost:3001)

---

## How to Run Manually (Development)

Use this method if you want to run services separately for development.

### 1. Setup Backend (API)

1.  Ensure **PostgreSQL** service is running on your machine.
2.  Navigate to the API directory:
    ```bash
    cd apps/api
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Setup Environment Variables:
    *   Create a `.env` file from `.env.example`.
    *   Ensure the connection string matches your local PostgreSQL setup:
        ```env
        DATABASE_URL=postgres://<username>:<password>@localhost:5432/<database_name>
        ```
5.  Setup Database (Create the database manually first in PostgreSQL):
    ```bash
    npm run db:migrate # to run database migrations
    npx tsx src/db/seed.ts # to seed initial data (Default users, etc.)
    ```
6.  Start API server:
    ```bash
    npm run dev
    ```
    The server will run on port `3001`.

### 2. Setup Frontend (Dashboard)

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd apps/dashboard
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Frontend server:
    ```bash
    npm run dev
    ```
    The frontend will run at [http://localhost:5173](http://localhost:5173).

---

## Default Accounts (Seed Data)

Use the following accounts for first-time login (if you ran the seeding script):

| Role | Employee ID / NIK | Password |
| :--- | :--- | :--- |
| **Admin** | `10293` | `password123` |
| **Production Control (PC)** | `PC001` | `password123` |
| **Quality Control (QC)** | `QC001` | `password123` |

> [!NOTE]
> **Security Note on Default Passwords:**
> The default password `password123` found in the database seeder (`seed.ts`) and scripts is strictly for local development and testing convenience. It is not an accidentally leaked private credential. Passwords stored in the database are always hashed using the Argon2 algorithm. For production environments, these passwords must be changed immediately after setup.

---

## Folder Structure

```
tool-crib/
├── apps/
│   ├── api/                # Backend Workspace (Express + TypeScript)
│   │   ├── src/            # Backend Source Code (Routes, Middlewares, Services)
│   │   └── drizzle/        # Database Migrations folder
│   └── dashboard/          # Frontend Workspace (React + Vite + TailwindCSS)
│       ├── src/            # Frontend Source Code (Components, Hooks, Contexts)
│       └── public/         # Static Frontend Assets
├── docker-compose.yml      # Docker Orchestration Configuration
├── package.json            # Monorepo Workspaces Configuration
└── README.md               # Project Documentation
```
---

## Copyright

**Copyright © 2026 Austin Felix Marbun.** **Created by:** Austin Felix Marbun  

---

> All rights reserved. Companies may use this project for internal purposes, but the author remains credited as the original creator. This project was developed as part of an internship initiative at **PT Dirgantara Indonesia**.