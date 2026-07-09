# Amazon Orders Management Portal

A full-stack, end-to-end admin dashboard developed to manage a massive dataset of Amazon order documents (21k+ records) with seamless analytics, responsive UI layouts, and a secure backend service architecture.

## Overview

This project provides a professional management panel for viewing and filtering real-time logistics data, financial KPIs, and order statuses. Recently refactored to focus on maximizing workspace real estate by migrating from a dated sidebar approach to a sleek, modern top-navigation model.

## Features

- **Dynamic Analytics Dashboard:** Visualizes operations and key metrics utilizing Recharts.
- **Robust Full-Width Layout:** Entirely redesigned to discard bulky collapsed sidebars in favor of a clean, horizontal `Sticky Glass Navbar`.
- **Data Normalization:** Backend and frontend pipelines effectively handle dataset anomalies (e.g., merging case-insensitive anomalies like "Shipped" / "shipped" seamlessly for unified charting).
- **Security & Roles:** Role-based access embedded into the UI tabbed navigation (e.g. Vendors vs Admins).
- **Modern UI Palette:** Enriched 10-color scheme for status indications, glass-morphism aesthetic elements, and dynamic animated blob backgrounds.

## Tech Stack

**Frontend:**
- React (Vite)
- TailwindCSS (Styling, layout & custom utilities)
- Lucide-React (Iconography)
- Framer Motion (Animations)
- Recharts (Data visualization)

**Backend:**
- Node.js & Express.js
- MongoDB / Mongoose (Analytics Aggregation Pipelines)
- CORS configured for multi-port local dev interactions (`5173`, `5174`)

## Getting Started

### 1. Backend Server Setup
1. Open a terminal in the `/backend` directory.
2. Ensure you have your `.env` configured (refer to `.env.example`).
3. Start the node server:
   ```bash
   npm install
   npm run dev
   ```

### 2. Frontend Client Setup
1. Open a separate terminal in the `/frontend` directory.
2. Start the Vite server:
   ```bash
   npm install
   npm run dev
   ```
3. Open your browser and navigate to the localhost port (usually `http://localhost:5173` or `5174`).

## Recent Enhancements
- Expanded chart colors to accurately support dynamic data statuses without clashing.
- Re-architected `MainLayout.jsx` and `Navbar.jsx` to achieve a true, full-width data dashboard experience.
- Implemented responsive, non-colliding `Legend` structures for Data Charts.
- Refined currency formatting logic to cleanly render global financial numbers (`en-US` metric styling).

## Engineer
**Jal Patel**
