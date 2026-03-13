# 🛡️ IronGuard Ledger - Complete MERN Business Ledger Management System

A **production-ready**, fully responsive MERN stack application for managing business transactions, customers, suppliers, inventory, and financial reports.

---

## ✨ Features

✅ **Complete Transaction Management** (Sales, Purchases, Returns, Payments)
✅ **Multi-Item Transactions** with receipt views and audit trails
✅ **Customer & Supplier Ledgers** with running balances
✅ **Inventory Management** with stock tracking and auto-updates
✅ **Advanced Reports** with MongoDB aggregation pipelines
✅ **Role-Based Access Control** (Owner/Manager)
✅ **JWT Authentication** with HTTP-Only Cookies
✅ **Soft Delete** transactions with audit tracking
✅ **CSV/PDF Export** for all reports and ledgers
✅ **Responsive Design** (Desktop, Tablet, Mobile)
✅ **Skeleton Loaders** and smooth data transitions
✅ **Server-Side Pagination** with TanStack Query
✅ **Global Date Format** (DD/MM/YYYY HH:mm)

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin handling

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Axios** - HTTP client
- **Recharts** - Charts & graphs
- **React Hot Toast** - Notifications
- **html2canvas & jsPDF** - Export functionality

---

## 📋 Project Structure
iron-guard-ledger/ ├── backend/ │ ├── api/ │ │ ├── controllers/ # Request handlers │ │ ├── services/ # Business logic │ │ ├── routes/ # API endpoints │ │ ├── middleware/ # Auth, error handling │ │ ├── models/ # Mongoose schemas │ │ ├── index.js # Express app │ │ └── seed.js # Database seeding │ ├── .env # Environment variables │ ├── package.json │ └── README.md │ ├── frontend/ │ ├── src/ │ │ ├── pages/ # Page components │ │ ├── components/ # Reusable components │ │ │ └── modals/ # Modal components │ │ ├── hooks/ # Custom hooks │ │ ├── store/ # Zustand stores │ │ ├── services/ # API calls │ │ ├── utils/ # Utilities │ │ ├── App.jsx # Main app │ │ └── main.jsx # Entry point │ ├── index.html │ ├── vite.config.js │ ├── tailwind.config.js │ ├── .env │ ├── package.json │ └── README.md │ ├── vercel.json # Vercel deployment config ├── package.json # Root package.json └── README.md # This file

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v16+ and npm
- MongoDB account (local or cloud)
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd iron-guard-ledger
cd backend
npm install
MONGODB_URI=mongodb+srv://your_user:your_password@your_cluster.mongodb.net/ledger-hr
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
npm run seed
Default Credentials:

Owner: owner@ironguard.com / owner123456
Manager: manager@ironguard.com / manager123456
Step 4: Start Backend Server

npm run dev
Server runs on http://localhost:5000
Frontend Setup

cd ../frontend
npm install

Start Frontend Development Server
npm run dev


🛠️ Development Workflow
Backend Development
bash
cd backend
npm run dev              # Start dev server with auto-reload
npm run seed             # Seed database
Frontend Development
bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build


---

## **73. Backend README.md**

```markdown name=backend/README.md
# IronGuard Ledger - Backend API

Complete REST API for ledger management with MongoDB, Express, and JWT authentication.

---

## 🚀 Quick Start

```bash
npm install
npm run seed           # Setup database with admin user
npm run dev            # Start development server