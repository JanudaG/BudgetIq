// Fixed lists the app uses everywhere (form dropdowns, icons, validation).
// These are permanent constants. Unlike mockData.js, they will NOT be
// replaced by the backend, so they live in their own file.

export const CATEGORIES = [
  'Housing & Utilities',
  'Food & Dining',
  'Transportation',
  'Tech & Media',
  'Health & Wellness',
  'Shopping',
  'Insurance',
  'Travel',
  'Gifts',
]

export const PAYMENT_ACCOUNTS = ['Chase ••4821', 'Amex ••1002', 'Capital One']

export const ENVELOPE_GROUPS = [
  { name: 'Fixed Essentials', description: 'Non-discretionary obligations & recurring commitments' },
  { name: 'Variable Lifestyle', description: 'Daily lifestyle, culinary, and transport categories' },
  { name: 'Tech & SaaS', description: 'Cloud, software & entertainment services' },
  { name: 'Savings & Wealth', description: 'Travel funds and long-term sinking goals' },
]
