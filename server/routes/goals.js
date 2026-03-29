import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const goals = await sql`SELECT * FROM goals ORDER BY created_at DESC`;
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  try {
    const { name, emoji, target_amount, current_amount, target_date, color } = req.body;

    if (!name || !emoji || !target_amount || !target_date || !color) {
      return res.status(400).json({ error: 'Required fields: name, emoji, target_amount, target_date, color' });
    }

    const [row] = await sql`
      INSERT INTO goals (name, emoji, target_amount, current_amount, target_date, color)
      VALUES (${name}, ${emoji}, ${target_amount}, ${current_amount || 0}, ${target_date}, ${color})
      RETURNING id
    `;

    res.json({ id: row.id, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/goals/:id/contribute
router.patch('/:id/contribute', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'amount must be positive' });
    }

    const goals = await sql`SELECT * FROM goals WHERE id = ${req.params.id}`;
    if (goals.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = goals[0];
    const newAmount = Number(goal.current_amount) + Number(amount);
    await sql`UPDATE goals SET current_amount = ${newAmount} WHERE id = ${req.params.id}`;

    res.json({ success: true, current_amount: newAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const rows = await sql`DELETE FROM goals WHERE id = ${req.params.id} RETURNING id`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
