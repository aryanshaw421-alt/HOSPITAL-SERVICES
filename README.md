# Ateek Aryan Hospital - AI-Powered Hospital Management System

Ateek Aryan Hospital is a full-stack hospital management web app designed to help hospitals manage patients, doctors, appointments, medical records, billing, and notifications in one place. It also includes an AI assistant for common support tasks.

## 🌟 What this project does

This application lets you:
- manage hospital staff and departments
- register and manage patients
- view and manage doctor profiles
- book, cancel, and track appointments
- view medical records and billing information
- use an AI-powered chatbot for hospital-related questions
- switch between admin, doctor, and patient dashboards

## 🏥 Main Features

- 3 user roles: Admin, Doctor, and Patient
- Role-based access control
- AI-powered chatbot for hospital info and appointment guidance
- Appointment booking and tracking
- Medical record management
- Billing and payment tracking
- Dark mode support
- Responsive design for desktop and mobile
- In-app notifications

## 🛠️ Tech Stack

| Layer | Technologies |
|------|--------------|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js |
| Database | MySQL (or demo mode for local testing) |
| Authentication | JWT, bcryptjs |
| AI | Google Gemini API (optional) |
| Icons | React Icons |

## ✅ Requirements

Before you begin, make sure you have these installed:
- Node.js 18+ recommended
- npm 9+ (comes with Node.js)
- MySQL 8+ if you want to use the real database mode
- A terminal such as Terminal, iTerm, or VS Code terminal

## 📦 Installation Guide

### 1. Clone the project

```bash
git clone <your-repository-url>
cd Ateek_Aryan_Hospital
```

### 2. Install dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

## 🔧 Environment Setup

Create or update the backend environment file:

```bash
cd backend
nano .env
```

Example:

```env
PORT=5001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ateek_aryan_hospital
JWT_SECRET=ateek_aryan_hospital_jwt_secret_key_2026
JWT_REFRESH_SECRET=ateek_aryan_hospital_refresh_secret_key_2026
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

> If you do not want to connect to MySQL right away, the project also supports a demo mode for local testing.

## 🗄️ Database Setup

### Option A: Use MySQL
If you have MySQL installed, run:

```bash
mysql -u root -p < database/schema.sql
```

You may need to enter your MySQL password.

### Option B: Demo mode
If you do not have MySQL available, the app can still run using built-in demo data for local testing.

## ▶️ How to Run the Project

Open two terminals.

### Terminal 1: Start the backend
```bash
cd backend
npm start
```

### Terminal 2: Start the frontend
```bash
cd frontend
npm run dev
```

After both are running:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001/api/health

## 👤 Demo Accounts

You can log in using these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ateekaryanhospital.com | admin123 |
| Doctor | dr.sharma@ateekaryanhospital.com | admin123 |
| Patient | patient@example.com | admin123 |

## 🧭 How to Use the App

### As an Admin
- view hospital dashboards
- manage departments and staff
- monitor appointments and billing
- inspect patient and doctor activity

### As a Doctor
- view scheduled appointments
- review patient records
- update treatment notes
- manage personal dashboard

### As a Patient
- register or log in
- book appointments
- view medical records
- pay bills
- chat with the AI assistant

## 📁 Project Structure

```text
Ateek_Aryan_Hospital/
├── backend/
│   ├── src/
│   │   ├── config/       # database and AI configuration
│   │   ├── controllers/  # request handlers
│   │   ├── middleware/   # auth and error handling
│   │   ├── routes/       # API routes
│   │   └── index.js      # backend entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/   # reusable UI components
│   │   ├── context/      # auth and theme context
│   │   ├── lib/          # API client
│   │   └── pages/        # page components
│   ├── package.json
│   └── index.html
├── database/
│   └── schema.sql        # SQL schema and seed data
└── README.md
```

## 🧩 Dependencies Overview

### Backend dependencies
- express: web server
- cors: cross-origin access
- dotenv: environment variables
- jsonwebtoken: authentication tokens
- bcryptjs: password hashing
- mysql2: MySQL database connection
- multer: file uploads
- helmet: security headers
- morgan: request logging
- express-rate-limit: API rate limiting

### Frontend dependencies
- react: UI library
- react-dom: rendering
- react-router-dom: page routing
- axios: API requests
- tailwindcss: styling
- framer-motion: animations
- lucide-react / react-icons: icons
- recharts: charts and analytics
- react-hot-toast: notifications

## 🛠️ Troubleshooting

### Port already in use
If port 5001 or 5173 is already occupied, change the relevant port in:
- backend/.env for the backend port
- frontend/vite.config.js for the frontend dev server

### Login not working
- confirm the backend is running
- check that your credentials match the demo accounts
- ensure the backend is reachable at http://localhost:5001/api/health

### AI chatbot not working
The AI chatbot is optional. If no Gemini API key is configured, the app will use a built-in fallback response.

## 💡 Development Notes

To build the frontend for production:

```bash
cd frontend
npm run build
```

To start the backend in development mode:

```bash
cd backend
npm run dev
```

## 🎨 Design Theme

- Primary color: blue
- Secondary color: teal
- Accent color: green
- Font: Inter
- Style: modern, responsive, glass-like UI

---

© 2026 Ateek Aryan Hospital. All rights reserved.
