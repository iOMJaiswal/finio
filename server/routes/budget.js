import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const budgets = await sql`SELECT * FROM budgets`;

    const result = await Promise.all(budgets.map(async (b) => {
      const [spentRow] = await sql`
        SELECT COALESCE(SUM(amount), 0) as total FROM transactions
        WHERE type = 'expense' AND category = ${b.category} AND SUBSTRING(date, 1, 7) = ${month}
      `;
      const spent = Number(spentRow.total);

      const recentTxns = await sql`
        SELECT id, date, merchant, amount FROM transactions
        WHERE type = 'expense' AND category = ${b.category} AND SUBSTRING(date, 1, 7) = ${month}
        ORDER BY date DESC LIMIT 3
      `;

      return {
        ...b,
        spent,
        remaining: b.monthly_limit - spent,
        percentage: b.monthly_limit > 0 ? (spent / b.monthly_limit) * 100 : 0,
        recentTransactions: recentTxns,
      };
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { monthly_limit } = req.body;

    if (monthly_limit == null || monthly_limit <= 0) {
      return res.status(400).json({ error: 'monthly_limit must be positive' });
    }

    const rows = await sql`UPDATE budgets SET monthly_limit = ${monthly_limit} WHERE id = ${id} RETURNING id`;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/budgets
router.post('/', async (req, res) => {
  try {
    const { category, monthly_limit, color, icon } = req.body;

    if (!category || !monthly_limit || !color || !icon) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [row] = await sql`
      INSERT INTO budgets (category, monthly_limit, color, icon)
      VALUES (${category}, ${monthly_limit}, ${color}, ${icon})
      RETURNING id
    `;

    res.json({ id: row.id, success: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const rows = await sql`DELETE FROM budgets WHERE id = ${req.params.id} RETURNING id`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

export default router;
