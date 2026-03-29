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

    const getMonthStats = async (monthStr) => {
      const [row] = await sql`
        SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
        FROM transactions
        WHERE SUBSTRING(date, 1, 7) = ${monthStr}
      `;
      return {
        income: Number(row.income) || 0,
        expenses: Number(row.expenses) || 0,
      };
    };

    const [current, previous] = await Promise.all([
      getMonthStats(month),
      getMonthStats(prevMonth),
    ]);

    const currentSavingsRate = current.income > 0
      ? ((current.income - current.expenses) / current.income) * 100
      : 0;
    const previousSavingsRate = previous.income > 0
      ? ((previous.income - previous.expenses) / previous.income) * 100
      : 0;

    const latestBalanceRows = await sql`
      SELECT balance_after FROM transactions ORDER BY date DESC, id DESC LIMIT 1
    `;
    const prevBalanceRows = await sql`
      SELECT balance_after FROM transactions WHERE SUBSTRING(date, 1, 7) <= ${prevMonth}
      ORDER BY date DESC, id DESC LIMIT 1
    `;

    const totalBalance = latestBalanceRows[0] ? Number(latestBalanceRows[0].balance_after) : 0;
    const prevTotalBalance = prevBalanceRows[0] ? Number(prevBalanceRows[0].balance_after) : 0;

    // Sparkline data (last 8 months)
    const sparklineMonths = [];
    for (let i = 7; i >= 0; i--) {
      let sm = m - i;
      let sy = year;
      while (sm <= 0) { sm += 12; sy--; }
      sparklineMonths.push(`${sy}-${String(sm).padStart(2, '0')}`);
    }

    const sparklineData = await Promise.all(
      sparklineMonths.map(async (monthStr) => {
        const stats = await getMonthStats(monthStr);
        const balRows = await sql`
          SELECT balance_after FROM transactions WHERE SUBSTRING(date, 1, 7) <= ${monthStr}
          ORDER BY date DESC, id DESC LIMIT 1
        `;
        return {
          month: monthStr,
          income: stats.income,
          expenses: stats.expenses,
          balance: balRows[0] ? Number(balRows[0].balance_after) : 0,
          savingsRate: stats.income > 0 ? ((stats.income - stats.expenses) / stats.income) * 100 : 0,
        };
      })
    );

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
