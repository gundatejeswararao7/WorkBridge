WorkBridge

A two-way work marketplace where people can offer their skills, discover opportunities, and connect with others to get work done.

WorkBridge is a full-stack web application designed to connect people who offer services with people who need work done. Users can create profiles, showcase their skills and work, discover other users, send work requests, and manage their collaborations through a single platform.

✨ Features
👤 User Profiles

Create and customize your professional profile

Add skills and areas of expertise

Add profile information and location

Showcase completed work and projects

View other users' profiles

💼 Work Marketplace

Browse available work and services

Publish work that you can offer

View detailed work information

Discover opportunities based on skills and interests

🔎 Search & Discovery

Search for people and professionals

Discover users by skills

Find relevant work opportunities

Location-based discovery support

🤝 Work Requests

Send work requests to other users

Receive and manage incoming requests

Track request status

Accept or manage collaboration requests

⭐ Reviews

Leave reviews after completing work

Build credibility through completed work

View reviews on user profiles

🔐 Authentication

Secure authentication with Supabase Auth

User registration and login

Password reset functionality

Protected application routes

🛡️ Security

Supabase Row Level Security (RLS)

Protected backend routes

Environment-based configuration

Authentication middleware

🏗️ Tech Stack
Layer	Technology
Frontend	React, Vite, TypeScript
Styling	Tailwind CSS
Backend	Node.js, Express, TypeScript
Database	Supabase PostgreSQL
Authentication	Supabase Auth
API	REST API
Database Security	Supabase RLS
📁 Project Structure
WorkBridge/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_extensions.sql
│   │   ├── 002_tables.sql
│   │   ├── 003_rls.sql
│   │   ├── 004_seed.sql
│   │   ├── 005_storage.sql
│   │   └── 006_search_function.sql
│   └── complete_setup.sql
│
├── .gitignore
└── README.md

🚀 Getting Started

Follow the steps below to run WorkBridge locally.

Prerequisites

Make sure you have the following installed:

Node.js 18+

npm

Git

A Supabase project

You can verify Node.js and npm with:

node --version
npm --version

1. Clone the Repository
git clone https://github.com/gundatejeswararao7/WorkBridge.git
cd WorkBridge

🗄️ 2. Configure Supabase

WorkBridge uses Supabase for:

PostgreSQL database

Authentication

Row Level Security

Storage

Database functions

Create a new project in Supabase and obtain your project credentials.

Run the Database Setup

The SQL migrations are located in:

supabase/migrations/


Run the migrations in the following order:

001_extensions.sql
002_tables.sql
003_rls.sql
004_seed.sql
005_storage.sql
006_search_function.sql


You can also use:

supabase/complete_setup.sql


if you want to apply the complete database setup.

Important: Run the SQL scripts in the correct order because later migrations may depend on objects created by earlier migrations.

⚙️ 3. Backend Setup

Navigate to the backend:

cd backend


Install dependencies:

npm install


Create your environment file:

cp .env.example .env


On Windows PowerShell, you can use:

Copy-Item .env.example .env


Open .env and configure your Supabase credentials.

Then start the backend development server:

npm run dev


The backend will start in development mode.

🎨 4. Frontend Setup

Open another terminal and navigate to the frontend:

cd frontend


Install dependencies:

npm install


Create the environment file:

cp .env.example .env


On Windows PowerShell:

Copy-Item .env.example .env


Configure the required Supabase and API values in .env.

Start the frontend:

npm run dev


Vite will provide a local development URL in the terminal, typically:

http://localhost:5173

🔑 Environment Variables

Both the frontend and backend use environment variables.

Backend

Create:

backend/.env


using:

backend/.env.example

Frontend

Create:

frontend/.env


using:

frontend/.env.example


Never commit .env files containing real credentials or secret keys. Use .env.example files to document required variables.

🔄 Application Flow

The general WorkBridge flow looks like this:

                    ┌──────────────────┐
                    │     WorkBridge   │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
       ┌──────▼──────┐               ┌──────▼──────┐
       │    Users    │               │    Work     │
       │  & Profiles │               │ Marketplace │
       └──────┬──────┘               └──────┬──────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                      ┌──────▼──────┐
                      │ Work Request│
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │ Collaboration│
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │   Reviews   │
                      └─────────────┘

🧩 Backend Architecture

The backend follows a route/service architecture.

Request
   │
   ▼
Express Route
   │
   ▼
Middleware
   │
   ▼
Service Layer
   │
   ▼
Supabase
   │
   ▼
PostgreSQL

Backend modules include:

Authentication

Profiles

Skills

Work

Requests

Reviews

Search

This structure keeps API routes and business logic separated and easier to maintain.

🖥️ Frontend Architecture

The frontend is built with React and TypeScript.

Major application areas include:

Landing Page

Authentication

Dashboard

Browse Work

Give Work

My Work

Requests

Search People

User Profiles

Profile Management

Work Details

Reusable UI components are located under:

frontend/src/components/

🔐 Authentication & Authorization

WorkBridge uses Supabase Auth for authentication.

Authenticated users can access protected functionality such as:

Managing their profile

Creating work

Sending requests

Managing received requests

Leaving reviews

Backend authentication middleware validates authenticated requests before protected operations are performed.

Database-level access is additionally protected using Row Level Security (RLS).

🗃️ Database

WorkBridge uses Supabase PostgreSQL as its database.

The database setup includes functionality for:

User profiles

Skills

Work listings

Work requests

Reviews

Search

Storage

Row Level Security policies

Seed data

Database migrations are maintained in:

supabase/migrations/

🧪 Development

For development, run the backend and frontend in separate terminals.

Terminal 1 — Backend
cd backend
npm install
npm run dev

Terminal 2 — Frontend
cd frontend
npm install
npm run dev

📦 Production Build

Build the frontend:

cd frontend
npm run build


Build the backend:

cd backend
npm run build


Before deploying, make sure production environment variables are configured correctly.

🛠️ Troubleshooting
Frontend cannot connect to backend

Check:

Backend is running

Frontend API URL is correct

Backend port matches the frontend configuration

CORS configuration allows the frontend origin

Authentication is not working

Check:

Supabase URL

Supabase public/anon key

Supabase Auth configuration

Frontend environment variables

Database errors

Check:

All migrations have been executed

Migrations were executed in the correct order

Supabase credentials are correct

RLS policies are configured correctly

Environment variables are not detected

Make sure:

.env exists in the correct project directory

Variable names match .env.example

The development server was restarted after changing .env

🌱 Contributing

Contributions are welcome.

To contribute:

git clone https://github.com/gundatejeswararao7/WorkBridge.git
cd WorkBridge


Create a new branch:

git checkout -b feature/your-feature


Make your changes, test them locally, and commit:

git add .
git commit -m "Add your feature"


Push your branch:

git push origin feature/your-feature


Then open a pull request.

📌 Project Status

WorkBridge is actively being developed. Features and architecture may evolve as the project grows.

👨‍💻 Author

Gundatejeswararao7

GitHub:
https://github.com/gundatejeswararao7

📄 License

This project is currently available for development and educational purposes.

Add an appropriate open-source license if you intend to allow external contributions or redistribution.

⭐ WorkBridge

Find work. Offer skills. Build connections.

WorkBridge aims to make it easier for people to discover opportunities, showcase their abilities, and connect through meaningful work.
