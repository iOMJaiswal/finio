import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import summaryRouter from './routes/summary.js';
import transactionsRouter from './routes/transactions.js';
import budgetRouter from './routes/budget.js';
import goalsRouter from './routes/goals.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
}));
app.use(express.json());

// API routes
app.use('/api/summary', summaryRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetRouter);
app.use('/api/goals', goalsRouter);

// Serve static files in production (local / Render only — Vercel serves the client separately)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Export for Vercel serverless; listen when running locally or on Render
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Finio server running on http://localhost:${PORT}`);
  });
}

export default app;
