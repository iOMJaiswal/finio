import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET /api/budgets
router.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const budgets = await sql`
      SELECT
        b.id,
        b.category,
        b.monthly_limit,
        b.color,
        b.icon,
        COALESCE(sp.total, 0) AS spent
      FROM budgets b
      LEFT JOIN (
        SELECT category, SUM(amount) AS total
        FROM transactions
        WHERE type = 'expense' AND SUBSTRING(date, 1, 7) = ${month}
        GROUP BY category
      ) sp ON sp.category = b.category
      ORDER BY b.id
    `;

    const recentRows = await sql`
      SELECT category, id, date, merchant, amount
      FROM (
        SELECT
          t.category,
          t.id,
          t.date,
          t.merchant,
          t.amount,
          ROW_NUMBER() OVER (PARTITION BY t.category ORDER BY t.date DESC, t.id DESC) AS rn
        FROM transactions t
        WHERE t.type = 'expense' AND SUBSTRING(t.date, 1, 7) = ${month}
      ) ranked
      WHERE rn <= 3
      ORDER BY category, date DESC, id DESC
    `;

    const recentByCategory = {};
    for (const row of recentRows) {
      if (!recentByCategory[row.category]) recentByCategory[row.category] = [];
      recentByCategory[row.category].push({
        id: row.id,
        date: row.date,
        merchant: row.merchant,
        amount: Number(row.amount),
      });
    }

    const result = budgets.map((b) => {
      const spent = Number(b.spent) || 0;
      const monthlyLimit = Number(b.monthly_limit) || 0;
      return {
        ...b,
        spent,
        remaining: monthlyLimit - spent,
        percentage: monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0,
        recentTransactions: recentByCategory[b.category] || [],
      };
    });

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
