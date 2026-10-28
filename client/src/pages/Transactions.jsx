import { useState } from "react";
import CategoryIcon from "../components/common/CategoryIcon.jsx";
import StatCard from "../components/common/StatCard.jsx";
import {
  IconAnalytics,
  IconTrendUp,
  IconPlus,
  IconSearch,
} from "../components/common/Icon.jsx";
import { formatDate } from "../utils/format.js";
import { formatMoney } from "../utils/currency.js";

const total = (list) => list.reduce((sum, t) => sum + Number(t.amount || 0), 0);

function Transactions({
  transactions,
  preferredCurrency = "LKR",
  onDeleteTransaction,
  onUpdateTransaction,
  accounts = [],
  onNavigate,
}) {
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState("all");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Summary totals use only the preferred reporting currency.
  // The ledger below still displays transactions from both currencies.
  const reportingTransactions = transactions.filter(
    (t) => t.currency === preferredCurrency,
  );
  const incomeTransactions = reportingTransactions.filter(
    (t) => t.type === "income",
  );
  const expenseTransactions = reportingTransactions.filter(
    (t) => t.type === "expense",
  );
  const income = total(incomeTransactions);
  const expenses = total(expenseTransactions);
  const netCashFlow = income - expenses;

  // Keep a legacy account name only when a transaction has no linked account ID.
  function getAccountName(transaction) {
    if (transaction.accountId) {
      const linkedAccount = accounts.find(
        (item) => item.id === transaction.accountId,
      );
      return linkedAccount?.name ?? "Unknown account";
    }
    return transaction.account || "Unassigned";
  }

  const accountNames = [...new Set(transactions.map(getAccountName))].filter(
    (name) => name !== "Unassigned",
  );

  const reportingAccountCount = new Set(
    reportingTransactions.map(getAccountName).filter((name) => name !== "Unassigned"),
  ).size;

  const categories = [...new Set(transactions.map((t) => t.category))];

  // ---- Table rows: every filter must pass ----
  const visible = transactions.filter((t) => {
    const text =
      `${t.name} ${t.category} ${getAccountName(t)} ${t.amount}`.toLowerCase();
    return (
      text.includes(query.toLowerCase()) &&
      (account === "all" || getAccountName(t) === account) &&
      (category === "all" || t.category === category) &&
      (type === "all" || t.type === type)
    );
  });

  const sortedTransactions = [...visible].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.date.localeCompare(a.date);

      case "oldest":
        return a.date.localeCompare(b.date);

      case "highest":
        return b.amount - a.amount;

      case "lowest":
        return a.amount - b.amount;

      case "name":
        return a.name.localeCompare(b.name);

      default:
        return 0;
    }
  });

  function clearFilters() {
    setQuery("");
    setAccount("all");
    setCategory("all");
    setType("all");
    setSortBy("newest");
  }
  function startEditing(transaction) {
    setEditingTransaction({ ...transaction });
    setEditError("");
  }

  async function saveEdit(event) {
    event.preventDefault();

    if (!editingTransaction) return;

    const amount = Number(editingTransaction.amount);

    if (
      !editingTransaction.name.trim() ||
      !editingTransaction.category.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setEditError("Please enter a valid name, category and amount.");
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      await onUpdateTransaction(editingTransaction.id, {
        name: editingTransaction.name.trim(),
        category: editingTransaction.category.trim(),
        account: editingTransaction.account,
        accountId: editingTransaction.accountId,
        type: editingTransaction.type,
        amount,
        date: editingTransaction.date,
      });

      setEditingTransaction(null);
    } catch (error) {
      setEditError(error.message || "Failed to update transaction.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(transaction) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${transaction.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await onDeleteTransaction(transaction.id);
    } catch (error) {
      window.alert(error.message || "Failed to delete transaction.");
    }
  }
  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__label">Ledger &amp; Audit</span>
            <span className="eyebrow__dot" />
            <span>Real-time sync active</span>
          </p>
          <h1 className="welcome__title">Transactions &amp; Ledger</h1>
          <p className="welcome__sub">
            Audit, filter, and categorize real-time inflows and outflows across
            all linked accounts.
          </p>
        </div>
        <button
          type="button"
          className="btn-dark"
          onClick={() => onNavigate("dashboard")}
        >
          <IconPlus size={14} />
          Add Transaction
        </button>
      </div>

      <div className="stat-strip">
        <StatCard
          label="Gross Activity"
          icon={<IconAnalytics size={14} />}
          iconClass="is-blue"
          value={formatMoney(income + expenses, preferredCurrency)}
        >
          <strong>{reportingTransactions.length} {preferredCurrency} transactions</strong>
          <span>• Across {reportingAccountCount} named accounts</span>
        </StatCard>

        <StatCard
          label="Net Inflows"
          icon={<IconTrendUp size={14} />}
          iconClass="is-dark"
          value={`+${formatMoney(income, preferredCurrency)}`}
          valueClass="is-income"
        >
          <span className="badge badge--success">
            {incomeTransactions.length} inflows
          </span>
          <span>All recorded dates</span>
        </StatCard>

        <StatCard
          label="Total Outflows"
          icon={<IconTrendUp size={14} />}
          iconClass="is-red"
          value={`-${formatMoney(expenses, preferredCurrency)}`}
        >
          <span className="badge badge--info">
            {expenseTransactions.length} outflows
          </span>
          <span>All recorded dates</span>
        </StatCard>

        <StatCard
          label="Net Cash Flow"
          icon={<IconAnalytics size={14} />}
          iconClass="is-blue"
          value={formatMoney(netCashFlow, preferredCurrency)}
          valueClass={netCashFlow >= 0 ? "is-income" : ""}
        >
          <span>Income minus expenses</span>
          <span>All recorded dates</span>
        </StatCard>
      </div>

      <section className="card">
        <div className="filters">
          <div className="search-wrap filters__search">
            <IconSearch size={18} className="search-wrap__icon" />
            <input
              className="search"
              type="search"
              placeholder="Search by merchant, category, account, or amount..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select value={account} onChange={(e) => setAccount(e.target.value)}>
            <option value="all">All Accounts ({accountNames.length})</option>
            {accountNames.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">Type: All Flows</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort transactions"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Amount: High to Low</option>
            <option value="lowest">Amount: Low to High</option>
            <option value="name">Name: A to Z</option>
          </select>
          <button type="button" className="link-btn" onClick={clearFilters}>
            Clear Filters
          </button>
          <span className="filters__count">
            {visible.length} of {transactions.length} items shown
          </span>
        </div>
        <div className="ledger-scroll">
          <table className="ledger">
            <thead>
              <tr>
                <th>Date</th>
                <th>Merchant / Description</th>
                <th>Category</th>
                <th>Account</th>
                <th className="ledger__right">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{formatDate(t.date)}</td>
                  <td className="ledger__name">{t.name}</td>
                  <td>
                    <span className="ledger__cat">
                      <CategoryIcon category={t.category} size={16} />
                      {t.category}
                    </span>
                  </td>
                  <td>{getAccountName(t)}</td>
                  <td
                    className={`ledger__right ledger__amount${t.type === "income" ? " is-income" : ""}`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {["USD", "LKR"].includes(t.currency)
                      ? formatMoney(t.amount, t.currency)
                      : `${Number(t.amount).toFixed(2)} (currency unclassified)`}
                  </td>
                  <td>
                    <button type="button" onClick={() => startEditing(t)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="ledger__delete"
                      onClick={() => handleDelete(t)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <p className="ledger__empty">No transactions match your filters.</p>
        )}
      </section>

      {editingTransaction && (
        <section
          className="card"
          style={{ padding: "24px", marginTop: "20px" }}
        >
          <h2>Edit Transaction</h2>

          <form onSubmit={saveEdit}>
            <label>
              Description
              <input
                required
                value={editingTransaction.name}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Amount ({editingTransaction.currency || "currency unclassified"})
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={editingTransaction.amount}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    amount: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Category
              <input
                required
                value={editingTransaction.category}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    category: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Account
              <select
                value={editingTransaction.accountId ?? ""}
                onChange={(e) => {
                  const selectedAccount = accounts.find(
                    (account) => account.id === e.target.value,
                  );

                  setEditingTransaction({
                    ...editingTransaction,
                    accountId: selectedAccount?.id ?? null,
                    account: selectedAccount?.name ?? null,
                    currency: selectedAccount?.currency,
                  });
                }}
                required
              >
                <option value="">Select an account</option>

                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type
              <select
                value={editingTransaction.type}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    type: e.target.value,
                  })
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>

            <label>
              Date
              <input
                type="date"
                required
                value={editingTransaction.date}
                onChange={(e) =>
                  setEditingTransaction({
                    ...editingTransaction,
                    date: e.target.value,
                  })
                }
              />
            </label>

            {editError && <p className="form-error">{editError}</p>}

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button type="submit" className="btn-dark" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingTransaction(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}

export default Transactions;
