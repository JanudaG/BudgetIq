import { useState } from "react";
import { IconBolt, IconPlusCircle } from "../common/Icon.jsx";
import { CATEGORIES } from "../../constants/categories.js";
import { todayISO } from "../../utils/format.js";

function QuickAddForm({ onAddTransaction, accounts = [] }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1] ?? CATEGORIES[0] ?? "Shopping");
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const currency = selectedAccount?.currency;

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    const numericAmount = Number(amount);
    if (!description.trim() || !amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError("Enter a description and an amount greater than zero.");
      return;
    }
    if (!selectedAccount || !["USD", "LKR"].includes(currency)) {
      setFormError("Select a valid USD or LKR account.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await onAddTransaction({
        name: description.trim(),
        category: type === "income" ? "Income" : category,
        accountId: selectedAccount.id,
        account: selectedAccount.name,
        currency,
        type,
        amount: numericAmount,
        date: todayISO(),
      });

      // Only clear inputs after the API confirms that the transaction was saved.
      setAmount("");
      setDescription("");
    } catch (error) {
      setFormError(error.message || "Could not save the transaction.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card quick-add">
      <div className="card__header">
        <h2 className="card__title">
          <IconBolt size={16} className="quick-add__bolt" />
          Quick Add Transaction
        </h2>
        <span className="chip">Sync Active</span>
      </div>

      <form className="quick-add__form" onSubmit={handleSubmit}>
        <div className="segmented">
          <button type="button" className={type === "expense" ? "is-active" : ""}
            onClick={() => setType("expense")} disabled={saving}>
            Expense
          </button>
          <button type="button" className={type === "income" ? "is-active" : ""}
            onClick={() => setType("income")} disabled={saving}>
            Income
          </button>
        </div>

        <label className="field">
          <span className="field__label">
            Amount ({currency ?? "select an account"})
          </span>
          <span className="field__money">
            <span className="field__prefix">{currency === "LKR" ? "Rs." : currency === "USD" ? "$" : "—"}</span>
            <input type="number" min="0.01" step="0.01" placeholder="0.00"
              value={amount} onChange={(event) => setAmount(event.target.value)}
              disabled={saving} required />
          </span>
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving}>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Account</span>
            <select value={accountId} onChange={(event) => setAccountId(event.target.value)}
              disabled={saving} required>
              <option value="">Select an account</option>
              {accounts.filter((a) => ["USD", "LKR"].includes(a.currency)).map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field__label">Description / Merchant</span>
          <input type="text" placeholder="e.g. Weekly Groceries" value={description}
            onChange={(event) => setDescription(event.target.value)} disabled={saving} required />
        </label>

        {formError && <p className="form-error" role="alert">{formError}</p>}
        <button type="submit" className="btn-dark btn-dark--full" disabled={saving || accounts.length === 0}>
          <IconPlusCircle size={18} />
          {saving ? "Saving..." : "Log Transaction"}
        </button>
      </form>
    </section>
  );
}

export default QuickAddForm;


