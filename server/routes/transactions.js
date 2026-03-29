import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const {
      month,
      category,
      type,
      search,
      page = '1',
      limit = '20',
      sort = 'date_desc',
    } = req.query;

    let where = [];
    let params = [];
    let p = 0;

    if (month) {
      where.push(`SUBSTRING(date, 1, 7) = $${++p}`);
      params.push(month);
    }

    if (category) {
      const cats = String(category).split(',');
      const placeholders = cats.map(() => `$${++p}`).join(',');
      where.push(`category IN (${placeholders})`);
      params.push(...cats);
    }

    if (type && type !== 'all') {
      where.push(`type = $${++p}`);
      params.push(type);
    }

    if (search) {
      where.push(`(merchant ILIKE $${++p} OR category ILIKE $${++p})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const sortMap = {
      date_desc: 'date DESC, id DESC',
      date_asc: 'date ASC, id ASC',
      amount_desc: 'amount DESC',
      amount_asc: 'amount ASC',
    };
    const orderBy = sortMap[sort] || sortMap.date_desc;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    const [countRow] = await sql.unsafe(
      `SELECT COUNT(*) as count FROM transactions ${whereClause}`,
      params
    );
    const total = parseInt(countRow.count);

    const transactions = await sql.unsafe(
      `SELECT * FROM transactions ${whereClause} ORDER BY ${orderBy} LIMIT $${p + 1} OFFSET $${p + 2}`,
      [...params, limitNum, offset]
    );

    res.json({
      transactions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/monthly-totals?months=6
router.get('/monthly-totals', async (req, res) => {
  try {
    const months = parseInt(req.query.months || '6', 10);
    const baseMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [baseYear, baseM] = baseMonth.split('-').map(Number);

    const monthStrs = [];
    for (let i = months - 1; i >= 0; i--) {
      let mm = baseM - i;
      let yy = baseYear;
      while (mm <= 0) { mm += 12; yy--; }
      monthStrs.push(`${yy}-${String(mm).padStart(2, '0')}`);
    }

    const rows = await sql`
      SELECT SUBSTRING(date, 1, 7) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      GROUP BY SUBSTRING(date, 1, 7)
    `;

    const rowMap = {};
    for (const r of rows) rowMap[r.month] = r;

    const results = monthStrs.map(m => {
      const r = rowMap[m];
      const income = r ? Number(r.income) : 0;
      const expenses = r ? Number(r.expenses) : 0;
      return { month: m, income, expenses, net: income - expenses };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/by-category?month=YYYY-MM
router.get('/by-category', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const rows = await sql`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE type = 'expense' AND SUBSTRING(date, 1, 7) = ${month}
      GROUP BY category
      ORDER BY total DESC
    `;

    const grandTotal = rows.reduce((sum, r) => sum + Number(r.total), 0);

    const colorMap = {
      'Food & Dining': '#F97316',
      'Transport': '#3B82F6',
      'Shopping': '#A855F7',
      'Utilities': '#06B6D4',
      'Entertainment': '#EC4899',
      'Health': '#22C55E',
      'Others': '#8B5CF6',
    };

    const result = rows.map(r => ({
      category: r.category,
      total: Number(r.total),
      percentage: grandTotal > 0 ? (Number(r.total) / grandTotal) * 100 : 0,
      color: colorMap[r.category] || '#8B5CF6',
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/net-worth-history?months=12
router.get('/net-worth-history', async (req, res) => {
  try {
    const months = parseInt(req.query.months || '12', 10);
    const baseMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [baseYear, baseM] = baseMonth.split('-').map(Number);

    const monthStrs = [];
    for (let i = months - 1; i >= 0; i--) {
      let mm = baseM - i;
      let yy = baseYear;
      while (mm <= 0) { mm += 12; yy--; }
      monthStrs.push(`${yy}-${String(mm).padStart(2, '0')}`);
    }

    const results = await Promise.all(
      monthStrs.map(async (monthStr) => {
        const rows = await sql`
          SELECT balance_after FROM transactions
          WHERE SUBSTRING(date, 1, 7) <= ${monthStr}
          ORDER BY date DESC, id DESC LIMIT 1
        `;
        return { month: monthStr, netWorth: rows[0] ? Number(rows[0].balance_after) : 0 };
      })
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/spending-trends?months=6
router.get('/spending-trends', async (req, res) => {
  try {
    const months = parseInt(req.query.months || '6', 10);
    const baseMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [baseYear, baseM] = baseMonth.split('-').map(Number);

    const categories = ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Health', 'Others'];

    const monthStrs = [];
    for (let i = months - 1; i >= 0; i--) {
      let mm = baseM - i;
      let yy = baseYear;
      while (mm <= 0) { mm += 12; yy--; }
      monthStrs.push(`${yy}-${String(mm).padStart(2, '0')}`);
    }

    const rows = await sql`
      SELECT SUBSTRING(date, 1, 7) as month, category, SUM(amount) as total
      FROM transactions
      WHERE type = 'expense'
        AND category = ANY(${categories})
        AND SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      GROUP BY SUBSTRING(date, 1, 7), category
    `;

    const dataMap = {};
    for (const r of rows) {
      if (!dataMap[r.month]) dataMap[r.month] = {};
      dataMap[r.month][r.category] = Number(r.total);
    }

    const results = monthStrs.map(m => {
      const entry = { month: m };
      for (const cat of categories) entry[cat] = dataMap[m]?.[cat] || 0;
      return entry;
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/income-breakdown?months=6
router.get('/income-breakdown', async (req, res) => {
  try {
    const months = parseInt(req.query.months || '6', 10);
    const baseMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [baseYear, baseM] = baseMonth.split('-').map(Number);

    const monthStrs = [];
    for (let i = months - 1; i >= 0; i--) {
      let mm = baseM - i;
      let yy = baseYear;
      while (mm <= 0) { mm += 12; yy--; }
      monthStrs.push(`${yy}-${String(mm).padStart(2, '0')}`);
    }

    const rows = await sql`
      SELECT merchant, SUM(amount) as total
      FROM transactions
      WHERE type = 'income' AND SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      GROUP BY merchant
      ORDER BY total DESC
    `;

    const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);
    const result = rows.map(r => ({
      source: r.merchant,
      total: Number(r.total),
      percentage: grandTotal > 0 ? (Number(r.total) / grandTotal) * 100 : 0,
    }));

    res.json({ sources: result, totalIncome: grandTotal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/category-deep-dive?category=Food+%26+Dining&months=6
router.get('/category-deep-dive', async (req, res) => {
  try {
    const category = req.query.category;
    const months = parseInt(req.query.months || '6', 10);
    const baseMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [baseYear, baseM] = baseMonth.split('-').map(Number);

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const monthStrs = [];
    for (let i = months - 1; i >= 0; i--) {
      let mm = baseM - i;
      let yy = baseYear;
      while (mm <= 0) { mm += 12; yy--; }
      monthStrs.push(`${yy}-${String(mm).padStart(2, '0')}`);
    }

    const monthlyRows = await sql`
      SELECT SUBSTRING(date, 1, 7) as month, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE type = 'expense' AND category = ${category}
        AND SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      GROUP BY SUBSTRING(date, 1, 7)
    `;

    const monthMap = {};
    for (const r of monthlyRows) monthMap[r.month] = Number(r.total);
    const monthlySpending = monthStrs.map(m => ({ month: m, total: monthMap[m] || 0 }));
    const avgMonthly = monthlySpending.reduce((s, r) => s + r.total, 0) / monthlySpending.length;

    const topMerchants = await sql`
      SELECT merchant, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE type = 'expense' AND category = ${category}
        AND SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      GROUP BY merchant
      ORDER BY total DESC
      LIMIT 5
    `;

    const biggestRows = await sql`
      SELECT * FROM transactions
      WHERE type = 'expense' AND category = ${category}
        AND SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      ORDER BY amount DESC
      LIMIT 1
    `;

    res.json({
      monthlySpending,
      avgMonthly,
      topMerchants: topMerchants.map(r => ({ ...r, total: Number(r.total), count: Number(r.count) })),
      biggestTransaction: biggestRows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transactions/monthly-savings
router.get('/monthly-savings', async (req, res) => {
  try {
    const months = parseInt(req.query.months || '12', 10);
    const baseMonth = req.query.month || new Date().toISOString().slice(0, 7);
    const [baseYear, baseM] = baseMonth.split('-').map(Number);

    const monthStrs = [];
    for (let i = months - 1; i >= 0; i--) {
      let mm = baseM - i;
      let yy = baseYear;
      while (mm <= 0) { mm += 12; yy--; }
      monthStrs.push(`${yy}-${String(mm).padStart(2, '0')}`);
    }

    const rows = await sql`
      SELECT SUBSTRING(date, 1, 7) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE SUBSTRING(date, 1, 7) = ANY(${monthStrs})
      GROUP BY SUBSTRING(date, 1, 7)
    `;

    const rowMap = {};
    for (const r of rows) rowMap[r.month] = r;

    const results = monthStrs.map(m => {
      const r = rowMap[m];
      const income = r ? Number(r.income) : 0;
      const expenses = r ? Number(r.expenses) : 0;
      const savings = income - expenses;
      const savingsRate = income > 0 ? (savings / income) * 100 : 0;
      return { month: m, income, expenses, savings, savingsRate };
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
