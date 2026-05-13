# Modern Banking Portal

A production-grade banking web application built with React, TypeScript, Node.js, Express, Prisma, and PostgreSQL.

## Tech Stack

**Frontend:** React 18 · TypeScript · Tailwind CSS · Redux Toolkit · React Hook Form · Zod  
**Backend:** Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · JWT · Winston · Zod

## Features

- 🔐 JWT authentication with refresh token rotation
- 💳 Multi-account management (up to 5 accounts per user)
- 💸 Deposits, withdrawals, and transfers (atomic transactions)
- 📋 Transaction history with pagination and filtering
- 👤 User profile management & password change
- 🔍 KYC document submission and admin review
- ⚙️ Admin dashboard with user management
- 🚦 Rate limiting on all endpoints
- 🐳 Docker Compose for local development

## Getting Started

### With Docker Compose

```bash
docker compose up --build
```

Frontend → http://localhost  
Backend API → http://localhost:3000

### Manual Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Default Credentials

| Role  | Email                    | Password     |
|-------|--------------------------|--------------|
| Admin | admin@bankingportal.com  | Admin@123456 |
| User  | john.doe@example.com     | User@123456  |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET | /api/accounts | User | List accounts |
| POST | /api/transactions/transfer | User | Transfer funds |
| GET | /api/admin/dashboard | Admin | Admin stats |