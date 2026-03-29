import 'dotenv/config';
import sql from './db.js';

async function seed() {
  console.log('Setting up Finio schema and seeding database...');

  // Create tables
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date TEXT NOT NULL,
      merchant TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL UNIQUE,
      monthly_limit REAL NOT NULL,
      color TEXT NOT NULL,
      icon TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Clear existing data
  await sql`DELETE FROM transactions`;
  await sql`DELETE FROM budgets`;
  await sql`DELETE FROM goals`;

  // Seed budgets
  const budgets = [
    { category: 'Food & Dining', monthly_limit: 8000, color: '#F97316', icon: 'UtensilsCrossed' },
    { category: 'Transport', monthly_limit: 5000, color: '#3B82F6', icon: 'Car' },
    { category: 'Shopping', monthly_limit: 12000, color: '#A855F7', icon: 'ShoppingBag' },
    { category: 'Utilities', monthly_limit: 4000, color: '#06B6D4', icon: 'Zap' },
    { category: 'Entertainment', monthly_limit: 2000, color: '#EC4899', icon: 'Film' },
    { category: 'Health', monthly_limit: 3000, color: '#22C55E', icon: 'Heart' },
    { category: 'Others', monthly_limit: 2000, color: '#8B5CF6', icon: 'MoreHorizontal' },
  ];

  for (const b of budgets) {
    await sql`INSERT INTO budgets (category, monthly_limit, color, icon) VALUES (${b.category}, ${b.monthly_limit}, ${b.color}, ${b.icon})`;
  }

  // Seed goals
  const goals = [
    { name: 'Goa Vacation', emoji: '🏖️', target_amount: 50000, current_amount: 32000, target_date: '2025-12-31', color: '#F97316' },
    { name: 'New Car Down Payment', emoji: '🚗', target_amount: 500000, current_amount: 180000, target_date: '2027-12-31', color: '#3B82F6' },
    { name: 'MacBook Pro', emoji: '💻', target_amount: 200000, current_amount: 140000, target_date: '2026-03-31', color: '#A855F7' },
    { name: 'Emergency Fund', emoji: '🏠', target_amount: 300000, current_amount: 285000, target_date: '2025-06-30', color: '#22C55E' },
  ];

  for (const g of goals) {
    await sql`INSERT INTO goals (name, emoji, target_amount, current_amount, target_date, color) VALUES (${g.name}, ${g.emoji}, ${g.target_amount}, ${g.current_amount}, ${g.target_date}, ${g.color})`;
  }

  // Generate 12 months of transactions (Jan 2025 – Dec 2025)
  const transactions = [];
  let runningBalance = 350000;

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const expenseTemplates = {
    'Food & Dining': [
      { merchant: 'Swiggy', min: 350, max: 800 },
      { merchant: 'Zomato', min: 200, max: 600 },
      { merchant: 'Starbucks', min: 400, max: 700 },
      { merchant: 'Barbeque Nation', min: 800, max: 1500 },
      { merchant: "Haldiram's", min: 200, max: 500 },
      { merchant: "Domino's Pizza", min: 300, max: 700 },
    ],
    'Transport': [
      { merchant: 'Ola', min: 150, max: 400 },
      { merchant: 'Uber', min: 200, max: 500 },
      { merchant: 'BEST Bus Pass', min: 500, max: 500 },
      { merchant: 'HP Petrol Pump', min: 2000, max: 3500 },
    ],
    'Shopping': [
      { merchant: 'Amazon', min: 500, max: 5000 },
      { merchant: 'Myntra', min: 800, max: 3000 },
      { merchant: 'D-Mart', min: 1500, max: 4000 },
      { merchant: 'Flipkart', min: 600, max: 8000 },
    ],
    'Utilities': [
      { merchant: 'Tata Power', min: 1800, max: 3000 },
      { merchant: 'Jio Recharge', min: 299, max: 299 },
      { merchant: 'Airtel DTH', min: 450, max: 450 },
    ],
    'Entertainment': [
      { merchant: 'Netflix Subscription', min: 649, max: 649 },
      { merchant: 'Spotify Premium', min: 119, max: 119 },
      { merchant: 'BookMyShow', min: 400, max: 1200 },
    ],
    'Health': [
      { merchant: 'Pharmeasy', min: 300, max: 1500 },
      { merchant: 'Cult.fit Membership', min: 1500, max: 1500 },
      { merchant: 'Apollo Pharmacy', min: 200, max: 800 },
    ],
    'Others': [
      { merchant: 'Paytm Transfer', min: 100, max: 500 },
      { merchant: 'Google Pay Transfer', min: 100, max: 400 },
      { merchant: 'ATM Withdrawal', min: 500, max: 2000 },
    ],
  };

  for (let month = 0; month < 12; month++) {
    const year = 2025;
    const mo = month + 1;
    const daysInMonth = new Date(year, mo, 0).getDate();

    const salaryAmount = 85000;
    runningBalance += salaryAmount;
    transactions.push({ date: `${year}-${String(mo).padStart(2, '0')}-01`, merchant: 'Salary Credit - Infosys', category: 'Income', type: 'income', amount: salaryAmount, balance_after: runningBalance });

    if (Math.random() > 0.4) {
      const freelanceAmount = rand(8000, 12000);
      const freelanceDay = rand(10, 20);
      runningBalance += freelanceAmount;
      transactions.push({ date: `${year}-${String(mo).padStart(2, '0')}-${String(freelanceDay).padStart(2, '0')}`, merchant: 'Freelance Payment - Upwork', category: 'Income', type: 'income', amount: freelanceAmount, balance_after: runningBalance });
    }

    if (Math.random() > 0.5) {
      const interestAmount = rand(200, 500);
      const interestDay = rand(25, Math.min(28, daysInMonth));
      runningBalance += interestAmount;
      transactions.push({ date: `${year}-${String(mo).padStart(2, '0')}-${String(interestDay).padStart(2, '0')}`, merchant: 'Interest Credit - SBI', category: 'Income', type: 'income', amount: interestAmount, balance_after: runningBalance });
    }

    const numExpenses = rand(20, 30);
    const categories = Object.keys(expenseTemplates);

    for (let i = 0; i < numExpenses; i++) {
      const category = pick(categories);
      const template = pick(expenseTemplates[category]);
      const amount = rand(template.min, template.max);
      const day = rand(1, daysInMonth);
      runningBalance -= amount;
      transactions.push({ date: `${year}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`, merchant: template.merchant, category, type: 'expense', amount, balance_after: runningBalance });
    }
  }

  transactions.sort((a, b) => a.date.localeCompare(b.date));

  let balance = 350000;
  for (const t of transactions) {
    if (t.type === 'income') balance += t.amount;
    else balance -= t.amount;
    t.balance_after = balance;
  }

  for (const t of transactions) {
    await sql`INSERT INTO transactions (date, merchant, category, type, amount, balance_after, notes) VALUES (${t.date}, ${t.merchant}, ${t.category}, ${t.type}, ${t.amount}, ${t.balance_after}, '')`;
  }

  console.log(`Seeded ${transactions.length} transactions, ${budgets.length} budgets, ${goals.length} goals.`);
  await sql.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
