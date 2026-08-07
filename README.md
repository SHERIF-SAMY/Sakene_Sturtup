# Agarly - Student Housing Platform

Agarly is a modern, fast, and secure student housing platform designed to connect university students, brokers, and property owners. Moving away from traditional classified websites, Agarly provides an intuitive, trust-focused, and mobile-first experience similar to Airbnb and Uber.

## 🌟 Vision & Philosophy

Agarly's interface and user experience are built on four core pillars:
1. **Simplicity:** A streamlined interface where users never feel overwhelmed.
2. **Trust:** Instant verification badges, reviews, ratings, and real photos to ensure safety.
3. **Speed:** Access any apartment listing in less than three clicks.
4. **Mobile First:** Optimized for mobile devices, catering to the >80% mobile user base.

## 🚀 Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend/BaaS:** Supabase

## 📁 Project Structure

- `/src` - Source code for the React frontend application.
- `/api` - Backend Express API server (acts as a middleware to Supabase).
- `/public` - Static assets.
- `Agrly.md` - Complete Product & Business Blueprint.

## ⚙️ Getting Started

Follow these steps to set up the project locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Git

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd Agrly
npm install
```

### 3. Environment Variables
Copy the example environment file and fill in your Supabase credentials:
```bash
cp .env.example .env
```
Open `.env` and add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### 4. Running the Project

You need to run two servers concurrently: the backend API server and the Vite frontend.

**Open Terminal 1 (API Server):**
```bash
node api-server.js
```

**Open Terminal 2 (Frontend):**
```bash
npm run dev
```

*Note: If you are using Ngrok or need to expose the Vite server to your network, run:*
```bash
npm run dev -- --host
```

The application will now be running on `http://localhost:5173`.

## 📜 License

All rights reserved to Agarly.
