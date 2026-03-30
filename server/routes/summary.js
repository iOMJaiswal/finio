import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET /api/summary?month=YYYY-MM
router.get('/', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, m] = month.split('-').map(Number);

    const prevMonth = m === 1
      ? `${year - 1}-12`
      : `${year}-${String(m - 1).padStart(2, '0')}`;

    // Sparkline data (last 8 months)
    const sparklineMonths = [];
    for (let i = 7; i >= 0; i--) {
      let sm = m - i;
      let sy = year;
      while (sm <= 0) { sm += 12; sy--; }
      sparklineMonths.push(`${sy}-${String(sm).padStart(2, '0')}`);
    }

    const allMonths = Array.from(new Set([...sparklineMonths, month, prevMonth]));
    const placeholders = allMonths.map((_, i) => `$${i + 1}`).join(', ');

    const monthRows = await sql.unsafe(
      `WITH months AS (
         SELECT UNNEST(ARRAY[${placeholders}]::text[]) AS month
       ),
       month_totals AS (
         SELECT
           m.month,
           COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses
         FROM months m
         LEFT JOIN transactions t
           ON SUBSTRING(t.date, 1, 7) = m.month
         GROUP BY m.month
       )
       SELECT
         m.month,
         mt.income,
         mt.expenses,
         COALESCE(lb.balance_after, 0) AS balance
       FROM months m
       JOIN month_totals mt ON mt.month = m.month
       LEFT JOIN LATERAL (
         SELECT t.balance_after
         FROM transactions t
         WHERE SUBSTRING(t.date, 1, 7) <= m.month
         ORDER BY t.date DESC, t.id DESC
         LIMIT 1
       ) lb ON true
       ORDER BY m.month`,
      allMonths
    );

    const monthMap = Object.fromEntries(
      monthRows.map((r) => [r.month, {
        income: Number(r.income) || 0,
        expenses: Number(r.expenses) || 0,
        balance: Number(r.balance) || 0,
      }])
    );

    const current = monthMap[month] || { income: 0, expenses: 0, balance: 0 };
    const previous = monthMap[prevMonth] || { income: 0, expenses: 0, balance: 0 };

    const currentSavingsRate = current.income > 0
      ? ((current.income - current.expenses) / current.income) * 100
      : 0;
    const previousSavingsRate = previous.income > 0
      ? ((previous.income - previous.expenses) / previous.income) * 100
      : 0;

    const latestBalanceRows = await sql`
      SELECT balance_after FROM transactions ORDER BY date DESC, id DESC LIMIT 1
    `;

    const totalBalance = latestBalanceRows[0] ? Number(latestBalanceRows[0].balance_after) : 0;
    const prevTotalBalance = previous.balance;

    const sparklineData = sparklineMonths.map((monthStr) => {
      const stats = monthMap[monthStr] || { income: 0, expenses: 0, balance: 0 };
      return {
        month: monthStr,
        income: stats.income,
        expenses: stats.expenses,
        balance: stats.balance,
        savingsRate: stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0,
      };
    });

    const incomeChange = previous.income > 0
      ? ((current.income - previous.income) / previous.income) * 100
      : 0;
    const expenseChange = previous.expenses > 0
      ? ((current.expenses - previous.expenses) / previous.expenses) * 100
      : 0;
    const balanceChange = prevTotalBalance > 0
      ? ((totalBalance - prevTotalBalance) / prevTotalBalance) * 100
      : 0;

    res.json({
      totalBalance,
      monthlyIncome: current.income,
      monthlyExpenses: current.expenses,
      savingsRate: currentSavingsRate,
      vsLastMonth: {
        balance: balanceChange,
        income: incomeChange,
        expenses: expenseChange,
        savings: currentSavingsRate - previousSavingsRate,
      },
      sparkline: sparklineData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
