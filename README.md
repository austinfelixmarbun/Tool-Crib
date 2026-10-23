# Tool Crib DPM

A dashboard application for Tool Crib management, covering borrowing, returning, inventory tracking, and reporting (Audit Logs).

> **Internship Project at PT Dirgantara Indonesia (PTDI)**
> This project was developed as part of my internship program at **PT Dirgantara Indonesia**. This repository is published as a **portfolio / code showcase only**. It is not an open-source project and is not intended to be deployed, distributed, or reused by third parties.

---

## About the Project

Tool Crib DPM was built to support the daily operations of a tool crib: tracking who borrows which tools, when they are returned, what is currently in stock, and keeping a clear audit trail of every transaction.

### Key Features

*   **Borrowing & Returning**: record tool loans and returns.
*   **Inventory Tracking**: monitor tool availability and stock.
*   **Audit Logs & Reporting**: a traceable history of activity in the system.
*   **Role-Based Access**: separate roles for Admin, Production Control (PC), and Quality Control (QC).
*   **Secure Authentication**: user passwords are hashed with Argon2.

---

## Technology Overview

This application is built as a monorepo using modern technologies:

*   **Frontend**: React v19, Vite, TailwindCSS (located in `apps/dashboard`)
*   **Backend**: Node.js, Express, Drizzle ORM, TypeScript (located in `apps/api`)
*   **Database**: PostgreSQL
*   **Containerization**: Docker & Docker Compose

---

## Folder Structure

```
ToolCrib/
├── backend/                               Backend Application (Layered Architecture)
│   ├── src/
│   │   ├── config/                        1. Configuration Layer
instance
│   │   ├── routes/                        2. HTTP Routing Layer (Endpoints)
│   │   ├── controllers/                   3. Controller Layer (Req/Res Handling)
│   │   ├── services/                      4. Service Layer (Business Logic)
extensions
│   │   ├── repositories/                  5. Data Access Layer (Drizzle Queries)
│   │   ├── dtos/                          6. DTO & Validation Layer (Zod Schemas)
│   │   ├── middlewares/                   7. Middleware Layer
│   │   ├── db/                            8. Database & Schema Definitions
│   │   ├── types/                         9. TypeScript Global Types
│   │   ├── utils/                         10. Utility Layer
│
├── frontend/                              Frontend Application (React 19 + Vite)
│   ├── src/
│   │   ├── assets/                        Logos, icons, branding images
│   │   ├── components/                    Reusable Presentation Components
(html5-qrcode)
│   │   ├── context/                       React Context State Management
persistence
│   │   ├── hooks/                         Custom React Hooks
│   │   ├── lib/                           Core Utilities
│   │   ├── pages/                         Application Route Views
│   │   ├── services/                      Frontend API Services
│   │   ├── utils/                         Frontend Utilities
```

---

## Note on Usage

This repository is shared to demonstrate my work and technical skills. Setup instructions, default accounts, and seed data have intentionally been left out. The system was designed for internal use at PT Dirgantara Indonesia and is not meant to be run or deployed outside of that context.

---

## Copyright & Credits

**Created by:** Austin Felix Marbun
**Copyright © 2026 Austin Felix Marbun. All rights reserved.**

This project was developed as part of an internship initiative at **PT Dirgantara Indonesia**. The source code is made visible for portfolio and review purposes only. It may not be copied, modified, redistributed, or used commercially without permission from the author and PT Dirgantara Indonesia.
