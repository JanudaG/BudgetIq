import { useState } from "react";
import { IconBolt, IconPlusCircle } from "../common/Icon.jsx";
import { CATEGORIES } from "../../constants/categories.js";
import { todayISO } from "../../utils/format.js";

// A "controlled form": every input's value lives in state, and every
// keystroke goes through onChange -> setState -> re-render -> value={...}.
// React is always the single source of truth for what's in the form.
function QuickAddForm({ onAddTransaction, accounts = [] }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[1]); // Food & Dining, like the design
  const [accountId, setAccountId] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [formError, setFormError] = useState("");

  function handleSubmit(event) {
    event.preventDefault(); // without this the browser reloads the page on submit

    const numericAmount = Number(amount);
    if (!(numericAmount > 0) || !description.trim()) {
      setFormError("Enter an amount above 0 and a description.");
      return;
    }
    setFormError("");
    onAddTransaction({
      name: description.trim(),
      category: type === "income" ? "Income" : category,
      accountId,
      account: accounts.find((a) => a.id === accountId)?.name ?? null,
      type,
      amount: numericAmount,
      date: todayISO(),
    });

    // Clear the fields that change every time; keep category/account selected,
    // because you often log several purchases in a row.
    setAmount("");
    setDescription("");
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
          <button
            type="button"
            className={type === "expense" ? "is-active" : ""}
            onClick={() => setType("expense")}
          >
            Expense
          </button>
          <button
            type="button"
            className={type === "income" ? "is-active" : ""}
            onClick={() => setType("income")}
          >
            Income
          </button>
        </div>
        <label className="field">
          <span className="field__label">Amount ($ USD)</span>
          <span className="field__money">
            <span className="field__prefix">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </span>
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">Account</span>

            <select
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              required
            >
              <option value="">Select an account</option>

              {accounts
                .filter((a) => a.currency === "USD")
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.currency})
                  </option>
                ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field__label">Description / Merchant</span>
          <input
            type="text"
            placeholder="e.g. Whole Foods Market"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        {formError && <p className="form-error">{formError}</p>}
        <button type="submit" className="btn-dark btn-dark--full">
          <IconPlusCircle size={18} />
          Log Transaction
        </button>
      </form>
    </section>
  );
}

export default QuickAddForm;
