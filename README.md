# WanderWorld

A full-stack tour-booking application built with React + Node.js + MongoDB.

## Prerequisites

- Node.js >= 20
- npm >= 10
- MongoDB Atlas account (or local MongoDB 7+)
- Stripe test-mode account
- IBM Cloud account with watsonx.ai access
- Cloudinary account

## Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd wanderworld
npm install

# 2. Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Fill in all values in both .env files

# 3. Start development servers (both client + server)
npm run dev
```

The backend starts on `http://localhost:4000` and the frontend on `http://localhost:5173`.

## Running Tests

```bash
# Backend tests
npm run test --workspace=server

# Frontend tests
npm run test --workspace=client

# Coverage reports
npm run coverage --workspace=server
npm run coverage --workspace=client
```

## Environment Variables

See [`server/.env.example`](server/.env.example) and [`client/.env.example`](client/.env.example) for all required variables with descriptions.

## Architecture

```
wanderworld/
  client/       React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
  server/       Node.js + Express + TypeScript + Mongoose
```

See architecture diagram in repository root for a visual overview.

## Roles

| Role | Capabilities |
|------|-------------|
| Traveler | Browse tours, book, leave reviews, AI planner |
| Tour Guide | Manage own tours, view bookings for own tours |
| Admin | Full oversight: users, tours, bookings |
