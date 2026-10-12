// Seed data. Later this whole file gets replaced by API calls to your
// Express/MongoDB backend, so keep the *shape* of these objects in mind:
// that shape is what your database models will need to match.
//
// The numbers are chosen so the dashboard totals match your Figma design
// (income $12,450.00, spending $6,842.15, and so on).
//
// TEMPORARY FILE: when the Express/MongoDB backend is ready, the data below
// comes from API calls (src/api/) and this file gets deleted.
// The fixed lists (CATEGORIES, PAYMENT_ACCOUNTS) are in constants/categories.js.

// One "envelope" = a spending limit for one category.
// Note there is NO `spent` field here: how much has been spent is
// calculated from the transactions, so it can never get out of sync.
export const initialEnvelopes = [
  { id: 'housing', category: 'Housing & Utilities', subtitle: 'Fixed Recurring', limit: 2500 },
  { id: 'food', category: 'Food & Dining', subtitle: 'Variable Lifestyle', limit: 1200 },
  { id: 'transport', category: 'Transportation', subtitle: 'Fuel & Transit', limit: 500 },
  { id: 'tech', category: 'Tech & Media', subtitle: 'SaaS & Services', limit: 250 },
]

export const initialTransactions = [
  { id: 1, name: 'Salary', category: 'Income', account: null, type: 'income', amount: 9000, date: '2026-10-01' },
  { id: 2, name: 'Rent — October', category: 'Housing & Utilities', account: 'Chase ••4821', type: 'expense', amount: 2200, date: '2026-10-01' },
  { id: 3, name: 'Blue Bottle Coffee', category: 'Food & Dining', account: 'Amex ••1002', type: 'expense', amount: 83, date: '2026-10-03' },
  { id: 4, name: 'Adobe Creative Cloud', category: 'Tech & Media', account: 'Chase ••4821', type: 'expense', amount: 59.99, date: '2026-10-04' },
  { id: 5, name: 'Con Edison', category: 'Housing & Utilities', account: 'Chase ••4821', type: 'expense', amount: 200, date: '2026-10-05' },
  { id: 6, name: 'MTA Metrocard', category: 'Transportation', account: 'Chase ••4821', type: 'expense', amount: 127, date: '2026-10-06' },
  { id: 7, name: 'Costco', category: 'Food & Dining', account: 'Capital One', type: 'expense', amount: 312.5, date: '2026-10-08' },
  { id: 8, name: 'Anniversary Gift', category: 'Gifts', account: 'Amex ••1002', type: 'expense', amount: 414, date: '2026-10-09' },
  { id: 9, name: 'Freelance Invoice', category: 'Income', account: null, type: 'income', amount: 1050, date: '2026-10-10' },
  { id: 10, name: 'Figma', category: 'Tech & Media', account: 'Chase ••4821', type: 'expense', amount: 45, date: '2026-10-10' },
  { id: 11, name: 'Delta Airlines', category: 'Travel', account: 'Amex ••1002', type: 'expense', amount: 842.75, date: '2026-10-11' },
  { id: 12, name: 'Thai Basil', category: 'Food & Dining', account: 'Chase ••4821', type: 'expense', amount: 86.3, date: '2026-10-12' },
  { id: 13, name: 'Netflix', category: 'Tech & Media', account: 'Amex ••1002', type: 'expense', amount: 22.99, date: '2026-10-13' },
  { id: 14, name: 'Whole Foods Market', category: 'Food & Dining', account: 'Chase ••4821', type: 'expense', amount: 215.4, date: '2026-10-14' },
  { id: 15, name: 'Dropbox', category: 'Tech & Media', account: 'Chase ••4821', type: 'expense', amount: 27.03, date: '2026-10-14' },
  { id: 16, name: 'Uber', category: 'Transportation', account: 'Amex ••1002', type: 'expense', amount: 134.5, date: '2026-10-15' },
  { id: 17, name: 'Nordstrom', category: 'Shopping', account: 'Capital One', type: 'expense', amount: 1150.4, date: '2026-10-16' },
  { id: 18, name: 'State Farm Insurance', category: 'Insurance', account: 'Chase ••4821', type: 'expense', amount: 420, date: '2026-10-16' },
  { id: 19, name: 'Equinox Fitness Club', category: 'Health & Wellness', account: 'Capital One', type: 'expense', amount: 280, date: '2026-10-17' },
  { id: 20, name: 'Shell Oil Fuel', category: 'Transportation', account: 'Amex ••1002', type: 'expense', amount: 48.5, date: '2026-10-18' },
  { id: 21, name: 'Apple Store Services', category: 'Tech & Media', account: 'Chase ••4821', type: 'expense', amount: 29.99, date: '2026-10-19' },
  { id: 22, name: "Trader Joe's", category: 'Food & Dining', account: 'Chase ••4821', type: 'expense', amount: 142.8, date: '2026-10-20' },
  { id: 23, name: 'Stripe Payout / Client', category: 'Income', account: null, type: 'income', amount: 2400, date: '2026-10-21' },
]

// Values the dashboard shows that don't come from transactions yet.
// They get real sources later (accounts and goals in the database).
export const ACCOUNT_SUMMARY = { netWorth: 148920.5, netWorthChange: 4.2, liquidAssets: 42310 }
export const MONTHLY = {
  incomeGoal: 13250,
  nextIncome: { label: 'Oct 28', amount: 3100 },
  spendingCap: 9500,
  savingsTarget: 40,
}
export const MONTHLY_TARGET = { used: 4320, cap: 6000 }
