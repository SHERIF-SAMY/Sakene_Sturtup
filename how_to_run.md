# How to Run Agarly

This guide provides the necessary steps to set up and run the Agarly platform on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your local environment:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually installed with Node.js) or another package manager like Yarn / pnpm

## Getting Started

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Agrly
   ```

2. **Install dependencies**:
   Run the following command in the project root directory:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   If the project requires a `.env` file (e.g., for Supabase integration), create it in the root directory and define the required variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**:
   To start the application in development mode with Hot Module Replacement (HMR), run:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) (or the port specified in your terminal) in your browser to view the app.

## Additional Commands

- **Build for Production**:
  To create an optimized production-ready build:
  ```bash
  npm run build
  ```
  This will type-check the project and output static files into the `dist` directory.

- **Preview Production Build**:
  To locally preview the built application:
  ```bash
  npm run preview
  ```

- **Lint Code**:
  To check for code issues using ESLint:
  ```bash
  npm run lint
  ```

## Technologies
- **React 19**
- **Vite**
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase**
