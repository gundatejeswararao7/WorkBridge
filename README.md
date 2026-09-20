# WorkBridge

WorkBridge is a two-way work marketplace where users can offer services and find work.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth

## Setup Instructions

### 1. Supabase Setup
Run the SQL migrations located in the `supabase/migrations` folder to set up the database tables, RLS policies, and seed data.

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env based on .env.example
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Create .env based on .env.example
npm run dev
```
