import { useState } from "react";

const ACCOUNT_TYPES = ["checking", "savings", "cash", "credit", "investment"];
const emptyForm = {
  name: "",
  type: "checking",
  institution: "",
  openingBalance: "0",
  currency: "USD",
  isLiquid: false,
};

function money(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "LKR" ? "LKR" : "USD",
  }).format(Number(value) || 0);
}

function Accounts({
  accounts = [],
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setFormOpen(true);
  }

  function startEdit(account) {
    setEditingId(account.id);
    setForm({
      name: account.name,
      type: account.type,
      institution: account.institution || "",
      openingBalance: String(account.openingBalance),
      currency: account.currency,
      isLiquid: Boolean(account.isLiquid),
    });
    setError("");
    setFormOpen(true);
  }

  function updateField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const openingBalance = Number(form.openingBalance);
    if (form.name.trim().length < 2 || !Number.isFinite(openingBalance)) {
      setError(
        "Enter an account name of at least 2 characters and a valid opening balance.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        institution: form.institution.trim(),
        openingBalance,
      };
      if (editingId) {
        await onUpdateAccount(editingId, payload);
      } else {
        await onAddAccount(payload);
      }
      setFormOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    } catch (err) {
      setError(err.message || "Could not save account.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(account) {
    if (
      !window.confirm(
        `Delete account "${account.name}"? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await onDeleteAccount(account.id);
      if (editingId === account.id) {
        setEditingId(null);
        setFormOpen(false);
      }
    } catch (err) {
      setError(err.message || "Could not delete account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="welcome accounts-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__label">Account Management</span>
          </p>
          <h1 className="welcome__title">Accounts &amp; Cards</h1>
          <p className="welcome__sub">
            Track USD and LKR account balances independently.
          </p>
        </div>
        <button type="button" className="btn-dark" onClick={startCreate}>
          + Add Account
        </button>
      </div>

      <p className="accounts-note">
        Calculated balances use only verified transactions in each account's
        currency. Legacy transactions without currency are excluded.
      </p>

      {error && !formOpen && (
        <p className="accounts-error" role="alert">
          {error}
        </p>
      )}

      <div className="accounts-grid">
        {accounts.map((account) => (
          <article className="card account-card" key={account.id}>
            <div className="account-card__top">
              <div>
                <span className="account-card__type">{account.type}</span>
                <h2>{account.name}</h2>
                <p className="card__sub">
                  {account.institution || "No institution specified"}
                </p>
              </div>
              {account.isLiquid && (
                <span className="badge badge--success">Liquid</span>
              )}
            </div>
            <p className="account-card__balance">
              {money(
                account.balance ?? account.openingBalance,
                account.currency,
              )}
            </p>
            <p className="card__sub">Calculated balance · {account.currency}</p>
            <div className="account-card__actions">
              <button
                type="button"
                disabled={busy}
                onClick={() => startEdit(account)}
              >
                Edit
              </button>
              <button
                type="button"
                className="ledger__delete"
                disabled={busy}
                onClick={() => handleDelete(account)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      {accounts.length === 0 && (
        <p className="accounts-empty">
          No accounts yet. Choose “Add Account” to create your first account.
        </p>
      )}

      {formOpen && (
        <section
          className="card accounts-form-card"
          aria-label={editingId ? "Edit account" : "New account"}
        >
          <h2 className="card__title">
            {editingId ? "Edit Account" : "Create New Account"}
          </h2>
          <form className="accounts-form" onSubmit={handleSubmit}>
            <label>
              Account Name
              <input
                required
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Personal Savings"
              />
            </label>
            <label>
              Account Type
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Institution (optional)
              <input
                value={form.institution}
                onChange={(e) => updateField("institution", e.target.value)}
                placeholder="e.g. Commercial Bank"
              />
            </label>
            <label>
              Opening Balance
              <input
                required
                type="number"
                step="0.01"
                value={form.openingBalance}
                onChange={(e) => updateField("openingBalance", e.target.value)}
              />
            </label>
            <label>
              Currency
              <select
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="LKR">LKR</option>
              </select>
            </label>
            <label className="accounts-liquid">
              <input
                type="checkbox"
                checked={form.isLiquid}
                onChange={(e) => updateField("isLiquid", e.target.checked)}
              />
              Funds are immediately accessible (liquid)
            </label>
            {error && (
              <p className="accounts-error" role="alert">
                {error}
              </p>
            )}
            <div className="accounts-form__actions">
              <button className="btn-dark" type="submit" disabled={busy}>
                {busy
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Account"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setFormOpen(false);
                  setError("");
                }}
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

export default Accounts;
