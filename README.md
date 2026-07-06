# Amazon E-commerce Orders Management System (Fullstack)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

## 1. Project Overview
The **Amazon E-commerce Orders Management System** is an enterprise-grade, highly scalable fullstack application built using the MERN stack (MongoDB, Express, React, Node.js). It handles the complete lifecycle of e-commerce orders, mimicking the architectural complexity of modern logistics platforms like Amazon. 

It features advanced order processing, a rich interactive frontend dashboard, deep shipping logistics, native database aggregations for revenue tracking, and a zero-trust administrative security model.

---

## 2. Frontend Architecture (React + Vite)
The frontend is a modern Single Page Application (SPA) designed with a focus on speed, responsiveness, and premium UX.

### Tech Stack
- **Framework:** React 18 powered by Vite for lightning-fast HMR.
- **Styling:** Tailwind CSS (with complex custom theme configuration).
- **State & Data Fetching:** TanStack React Query (for caching and synchronization) and Zustand (for lightweight global UI state).
- **Routing:** React Router DOM (v6) with Protected Route logic.
- **Data Visualization:** Recharts for responsive, animated analytics dashboards.

### Frontend Features
- **Authentication:** Secure login pages with JWT persistence in `localStorage`, guarded by a `<ProtectedRoute>` wrapper that strictly forces unauthenticated users to log in.
- **Interactive Dashboard:** Beautiful glassmorphism UI elements, micro-animations via Framer Motion, and live Recharts showing revenue and order distributions.
- **Order & Shipping Management:** Rich data tables for viewing paginated orders, tracking shipments, and utilizing bulk operations.
- **Responsive Layout:** A collapsible sidebar and mobile-friendly top navigation bar that dynamically scales down seamlessly.
- **Global Error & Toast Handling:** Robust global error boundaries and a context-based Toast notification system.

---

## 3. Backend Architecture (Node.js + Express)
The backend employs a modern **Domain-Driven Design (DDD)** combined with a strict **MVC** and **Service Layer** separation. This ensures maximum maintainability, testability, and scalability. Route definitions are isolated from request extraction, which is in turn isolated from database logic.

### Tech Stack
- **Runtime Environment:** Node.js (v18+)
- **Database & ODM:** MongoDB Atlas & Mongoose
- **Validation:** Joi
- **Security:** bcryptjs (password hashing), jsonwebtoken (JWT)
- **Logging:** Morgan & custom JSON file auditing

### Backend Features
- **Advanced Order Logistics:** Full lifecycle management including statuses, automated invoices, re-ordering, cancellations, and soft-archiving.
- **Enterprise Bulk Operations:** Native MongoDB batch processing to handle thousands of concurrent mutations efficiently.
- **Shipping Integration:** Delivery routing matrices, weekend-aware ETAs, label generation, and step-by-step tracking trails.
- **Zero-Trust RBAC:** Granular JWT role enforcement, lockout prevention, and tamper-evident administrative audit logging.
- **Analytics Pipelines:** Native MongoDB aggregation pipelines computing gross revenue, net margins, and time-bucketed sales reports in real-time.

---

## 4. Fullstack Request Flow
1. **Client Request:** React triggers a data fetch via `axios` intercepted by TanStack Query. The Bearer JWT is automatically attached to the HTTP headers.
2. **Global Middleware:** Node.js logs the request (Morgan) and parses JSON.
3. **Route & Auth:** Express directs traffic; Auth middleware verifies the JWT signature and Role constraints.
4. **Validation:** Payload is validated against strict Joi schemas preventing injection.
5. **Controller & Service:** The Controller extracts data and passes it to the Service Layer, which executes highly optimized (e.g., `.lean()`) Mongoose queries.
6. **Response & Render:** The backend sends a standardized `ApiResponse`. React Query caches the data and immediately renders the UI updates.

---

## 5. Security Best Practices
- **Passwords:** Never returned in queries (`select: false`).
- **NoSQL Injection:** Mitigated by Joi schema sanitization enforcing exact 24-character ObjectIds.
- **Token Security:** JWT Tokens are stateless, cryptographically secure (HMAC SHA-256), and validated against password change timestamps.
- **Route Fencing:** Frontend routes are strictly fenced by AuthContext providers, while backend telemetry is fenced behind `restrictTo("admin")`.

---

## 6. Local Setup & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas cluster URL (or local MongoDB)

### Repository Clone
```bash
git clone https://github.com/jalpatel2646/amazon_orders_jal_patel.git
cd amazon_orders_jal_patel
```

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `/backend` folder:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0...
   JWT_SECRET=super_secret_key_change_me
   JWT_EXPIRES_IN=7d
   ALLOWED_ORIGINS=http://localhost:5173
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a new, separate terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the `/frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## 7. Useful npm Scripts

### Backend (`/backend`)
- `npm run dev`: Boots the development server with live-reloading via nodemon.
- `npm start`: Boots the production server.
- `npm run seed`: Injects dummy users and orders into the database for testing.
- `npm run seed:destroy`: Wipes the entire database clean.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server with HMR.
- `npm run build`: Compiles the React application for production.
- `npm run preview`: Locally previews the compiled production build.
- `npm run lint`: Runs ESLint for syntax and formatting checks.

---

## 8. API Documentation
Refer to the `API_DOCUMENTATION.md` file located in the `/backend` directory for a detailed list of all endpoints, parameters, and instructions on setting up Postman Environments with dynamic pre-request scripts.
  