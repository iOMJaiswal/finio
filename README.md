# Finio — Your money, finally clear.

A premium personal finance dashboard built with React, TypeScript, and Node.js. Dark-mode-first fintech aesthetic with real-time data visualization.

![Finio](https://img.shields.io/badge/Finio-Personal%20Finance-4F7EFF)

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: @tanstack/react-query
- **Routing**: React Router v6
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Fonts**: Plus Jakarta Sans + Syne (Google Fonts)

## Prerequisites

- Node.js 18+
- npm 9+

## Getting Started

### 1. Install dependencies

```bash
# Root dependencies (server)
npm install

# Client dependencies
cd client && npm install && cd ..
```

### 2. Seed the database

```bash
npm run seed
```

This generates 12 months of realistic transaction data, budgets, and savings goals.

### 3. Start development servers

```bash
npm run dev
```

This starts both:
- **API server** on `http://localhost:3001`
- **Vite dev server** on `http://localhost:5173`

The Vite dev server proxies `/api` requests to the Express backend.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3001`  | API server port |

## Production Build

```bash
npm run build
npm start
```

The Express server will serve the built client from `client/dist`.

## Project Structure

```
finio/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── charts/        # Recharts visualizations
│   │   │   ├── layout/        # Sidebar, TopBar, MobileNav
│   │   │   ├── transactions/  # Transaction list & filters
│   │   │   └── ui/            # Card, Button, Badge, etc.
│   │   ├── context/           # DateRangeContext
│   │   ├── hooks/             # React Query hooks
│   │   ├── lib/               # API client, formatters, categories
│   │   ├── pages/             # Dashboard, Transactions, Budget, Goals, Reports
│   │   └── types/             # TypeScript interfaces
│   └── vite.config.ts
├── server/                    # Express API
│   ├── db.js                  # SQLite setup
│   ├── seed.js                # Data generator
│   ├── index.js               # Server entry
│   └── routes/                # API endpoints
└── README.md
```

## Features

- **Overview Dashboard** — Balance, income, expenses, savings rate with sparklines
- **Transaction Ledger** — Full-text search, category filters, infinite scroll
- **Budget Tracking** — Visual progress bars, over-budget alerts
- **Goal Management** — Circular progress rings, milestone tracking
- **Reports** — Spending trends, income breakdown, CSV export
- **Responsive** — Desktop sidebar, tablet icon-only sidebar, mobile bottom tabs
- **Animations** — Page transitions, count-up numbers, staggered reveals

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/summary?month=YYYY-MM` | Monthly summary stats |
| GET | `/api/transactions` | Paginated transactions with filters |
| GET | `/api/transactions/monthly-totals` | Income/expense totals by month |
| GET | `/api/transactions/by-category` | Category breakdown |
| GET | `/api/transactions/net-worth-history` | Net worth over time |
| GET | `/api/transactions/spending-trends` | Category spending trends |
| GET | `/api/budgets` | Budget categories with spending |
| PUT | `/api/budgets/:id` | Update budget limit |
| POST | `/api/budgets` | Create budget category |
| GET | `/api/goals` | All goals |
| POST | `/api/goals` | Create a goal |
| PATCH | `/api/goals/:id/contribute` | Add funds to a goal |

---

Built as a portfolio project showcasing UI/UX design, data visualization, and frontend engineering.
