
# BudgetIQ — Personal Finance Management Dashboard

**BudgetIQ** is a full-stack personal finance web application for recording income and expenses, managing accounts and budget envelopes, tracking savings goals, and reviewing financial analytics. It supports **USD and LKR** without combining different currencies in financial totals.

**Repository:** [JanudaG/BudgetIq](https://github.com/JanudaG/BudgetIq)  
**Project type:** Web Application Development mini-project

## Features

- **User accounts and authentication:** Register, sign in, and access user-specific data using JWT authentication and hashed passwords.
- **Transactions & Ledger:** Create, view, edit, and delete income/expense transactions; search, filter, and sort records by details, category, account, type, and date/amount ordering.
- **Accounts & Cards:** Manage bank/cash account records and calculate balances from opening balances plus linked transactions.
- **USD/LKR support:** Record transactions against accounts in either currency. A transaction uses its linked account's currency. The ledger can show both currencies together, while financial summary calculations use the selected reporting currency.
- **Budget Planner:** Create category-based spending envelopes, set limits, manage rollover preferences, and compare monthly spending against allocations.
- **Savings Goals:** Set a target, optional deadline and linked account, and track individual savings contributions.
- **Financial Analytics:** Examine spending by category, monthly cash flow, savings efficiency, average monthly burn, and discretionary spending against adjustable targets.
- **Settings & Rules:** Save reporting currency, savings targets, discretionary limits, runway goals, and discretionary categories per user.
- **Responsive interface:** React UI styled with custom CSS, Flexbox, CSS Grid, and media queries.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, JavaScript (JSX), Vite 8 |
| Styling | Vanilla CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Authentication | JSON Web Tokens (JWT), bcryptjs |
| API | REST endpoints with JSON payloads |

## Project structure

```text
BudgetIq/
├── client/
│   ├── src/
│   │   ├── api/              # Backend API requests
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # Categories and shared constants
│   │   ├── pages/            # Dashboard, Transactions, Budget, etc.
│   │   ├── utils/            # Dates, currency and balance calculations
│   │   ├── App.jsx           # App state and page routing
│   │   └── App.css           # Application styling
│   └── package.json
├── server/
│   ├── src/
│   │   ├── middleware/       # JWT authentication middleware
│   │   ├── models/           # Mongoose data models
│   │   ├── routes/           # API routes
│   │   └── server.js         # Express setup and MongoDB connection
│   └── package.json
└── README.md
```

## Prerequisites

Install the following before starting:

- **Node.js and npm** compatible with the installed Vite version (Node.js 20.19+ or 22.12+ for Vite 8; a current supported Node LTS release is recommended).
- A running **MongoDB** instance, local or hosted (for example, MongoDB Atlas).
- Git (if cloning the repository).

## Installation and local setup

### 1. Clone the repository

```bash
git clone https://github.com/JanudaG/BudgetIq.git
cd BudgetIq
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a file named **`server/.env`** with the following values. Replace the example values with your own credentials:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/budgetiq
JWT_SECRET=replace_with_a_long_random_secret
PORT=5000
```

- For MongoDB Atlas, replace `MONGO_URI` with your cluster's connection string.
- **Never commit `.env` files or real credentials to GitHub.**
- `PORT` is optional; the backend defaults to `5000`.

Start the server:

```bash
npm run dev
```

Expected startup messages (when the database is available):

```text
MongoDB connected
API running on http://localhost:5000
```

### 3. Configure the frontend

Open **another terminal** at the repository root:

```bash
cd client
npm install
```

The frontend defaults to `http://localhost:5000/api`. If your backend uses another URL, create **`client/.env`**:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Start Vite:

```bash
npm run dev
```

Open the **local URL shown by Vite** (commonly `http://localhost:5173`; the port may differ if already in use).

### 4. Use BudgetIQ

1. Register a user account and sign in.
2. Create an account in USD or LKR.
3. Add an income or expense transaction linked to that account.
4. Use **Settings & Rules** to choose the preferred reporting currency.
5. Review **Overview**, **Transactions**, **Budget Planner**, **Analytics**, and **Savings Goals**.

## Currency handling

BudgetIQ stores amounts **in their original currency**, rather than using a live exchange rate.

- Each account has a currency of `USD` or `LKR`.
- New transactions inherit their linked account's currency.
- Account balances are calculated separately for each account in its own currency.
- The Transactions ledger can display both currencies, with each amount labeled appropriately.
- Summary totals and analytics are restricted to the preferred reporting currency selected in Settings.
- Budget envelopes also have a currency and are compared only against spending in that currency.
- **Switching preferred currency does not convert money or change account records.**

For example, a **LKR 5,000** expense and a **USD 100** expense are reported separately; they must not be added together into one total.

## Database models and relationships

BudgetIQ uses the following MongoDB/Mongoose models:

| Model | Purpose | Key relationships |
|---|---|---|
| `User` | Account credentials and profile | Parent of user-owned records |
| `Account` | Bank/cash accounts and opening balances | Owned by User; referenced by Transaction and optionally SavingsGoal |
| `Transaction` | Income and expense records | Owned by User; optionally linked to Account for older data, required for new transactions |
| `Envelope` | Budget limits by category and currency | Owned by User |
| `SavingsGoal` | Savings targets and deadlines | Owned by User; optionally linked to Account |
| `SavingsContribution` | Contributions toward savings goals | Owned by User; belongs to SavingsGoal |
| `FinancialSettings` | Reporting preferences and benchmarks | One settings document per User |

The project uses MongoDB ObjectId references for relationships. Ownership checks restrict access to the authenticated user's records.

## API overview

Base URL (default): `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Sign in and receive JWT |
| `GET` | `/auth/me` | Get current user |
| `GET`, `POST` | `/transactions` | List / create transactions |
| `PATCH`, `DELETE` | `/transactions/:id` | Update / delete a transaction |
| `GET`, `POST` | `/accounts` | List / create accounts |
| `PATCH`, `DELETE` | `/accounts/:id` | Update / delete an account |
| `GET`, `POST` | `/envelopes` | List / create budget envelopes |
| `PATCH`, `DELETE` | `/envelopes/:id` | Update / delete an envelope |
| `GET`, `POST` | `/savings-goals` | List / create savings goals |
| `PATCH`, `DELETE` | `/savings-goals/:id` | Update / delete a savings goal |
| `GET`, `POST` | `/savings-goals/:goalId/contributions` | List / create goal contributions |
| `PATCH`, `DELETE` | `/savings-goals/:goalId/contributions/:id` | Update / delete goal contributions |
| `GET`, `PATCH` | `/settings` | Read / update financial settings |
| `GET` | `/health` | API health check |

Except for registration, login, and health, API operations require a JWT in the `Authorization: Bearer <token>` header.

## Validation and safeguards

- Authentication is required for private endpoints, and documents are queried by the signed-in user's ID.
- Transaction amounts must be positive, and transaction dates use `YYYY-MM-DD`.
- Transactions may only reference accounts owned by the same user and must use the linked account's currency.
- Account currency changes and account deletion are restricted when transactions are linked to the account.
- Savings goals validate linked account ownership and currency consistency.
- Savings goal contributions are stored against their parent goals.
- Financial settings validate percentage targets and currency choices.

## Checks and production build

**Frontend** (from `client/`):

```bash
npm run lint
npm run build
```

To preview the built frontend:

```bash
npm run preview
```

**Backend** (from `server/`):

```bash
node --check src/server.js
npm start
```

These are the commands available in the repository; this README does **not** claim automated unit or integration tests that have not been configured.

## Known limitations

- **No automatic currency conversion:** USD and LKR are tracked independently; there is no live FX conversion.
- **Historical records:** Older transactions or envelopes without verified currency information may be excluded from currency-specific reports until classified.
- **Budget category uniqueness:** An existing MongoDB unique index on `(userId, category)` may restrict creating the same budget category in two currencies until an index migration is completed.
- **Savings contributions are tracking entries:** Recording a contribution does not itself transfer money or debit a linked account.
- **Runway projection:** The analytics interface shows `N/A` until verified liquid-reserve data is integrated into that calculation.
- **Development setup:** The documented configuration is for local development; a production deployment needs appropriate hosting, network restrictions, secrets management, and CORS settings.

## Screenshots

Suggested screenshots for final submission (add screenshots to `docs/screenshots/`, then link them here):

- Dashboard / Overview
- Transactions & Ledger
- Budget Planner
- Accounts & Cards (USD and LKR)
- Analytics & Insights
- Savings Goals
- Settings & Rules

## License

No separate open-source license has been declared for this repository. All rights are reserved unless the repository owner adds a license.
