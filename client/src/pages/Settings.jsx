import { useState } from "react";

const CATEGORY_OPTIONS = [
  "Shopping",
  "Entertainment",
  "Dining",
  "Travel",
  "Food & Dining",
  "Groceries",
  "Housing & Utilities",
  "Transportation",
  "Health & Wellness",
  "Subscriptions",
  "Education",
];

function Settings({ settings, onSaveSettings }) {
  const [form, setForm] = useState(() => ({
    savingsTarget: String(settings.savingsTarget),
    discretionaryLimit: String(settings.discretionaryLimit),
    runwayTargetMonths: String(settings.runwayTargetMonths),
    discretionaryCategories: [...settings.discretionaryCategories],

    preferredCurrency: settings.preferredCurrency ?? "LKR",
  }));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = [
    ...new Set([...CATEGORY_OPTIONS, ...form.discretionaryCategories]),
  ];

  function updateNumber(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess("");
  }

  function toggleCategory(name) {
    setForm((prev) => ({
      ...prev,
      discretionaryCategories: prev.discretionaryCategories.includes(name)
        ? prev.discretionaryCategories.filter((c) => c !== name)
        : [...prev.discretionaryCategories, name],
    }));
    setSuccess("");
  }

  async function handleSave(event) {
    event.preventDefault();

    const savingsTarget = Number(form.savingsTarget);
    const discretionaryLimit = Number(form.discretionaryLimit);
    const runwayTargetMonths = Number(form.runwayTargetMonths);

    if (
      [
        form.savingsTarget,
        form.discretionaryLimit,
        form.runwayTargetMonths,
      ].some((v) => v.trim() === "") ||
      ![savingsTarget, discretionaryLimit, runwayTargetMonths].every(
        Number.isFinite,
      ) ||
      savingsTarget < 0 ||
      savingsTarget > 100 ||
      discretionaryLimit < 0 ||
      discretionaryLimit > 100 ||
      runwayTargetMonths < 0 ||
      runwayTargetMonths > 120
    ) {
      setError("Enter valid percentages (0–100) and runway months (0–120).");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await onSaveSettings({
        savingsTarget,
        discretionaryLimit,
        runwayTargetMonths,
        discretionaryCategories: form.discretionaryCategories,
        preferredCurrency: form.preferredCurrency,
      });

      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__label">Personalization</span>
          </p>
          <h1 className="welcome__title">Settings &amp; Rules</h1>
          <p className="welcome__sub">
            Customize financial benchmarks and spending classifications.
          </p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSave}>
        <section className="card settings-section">
          <h2 className="card__title">Financial Benchmarks</h2>
          <p className="card__sub">
            Set your personal targets for BudgetIQ analytics.
          </p>

          <div className="settings-fields">
            <label className="field">
              <span className="field__label">Savings Target (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={form.savingsTarget}
                onChange={(e) => updateNumber("savingsTarget", e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field__label">
                Discretionary Spending Limit (%)
              </span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={form.discretionaryLimit}
                onChange={(e) =>
                  updateNumber("discretionaryLimit", e.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field__label">Runway Target (months)</span>
              <input
                type="number"
                min="0"
                max="120"
                step="1"
                required
                value={form.runwayTargetMonths}
                onChange={(e) =>
                  updateNumber("runwayTargetMonths", e.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field__label">Preferred Reporting Currency</span>

              <select
                value={form.preferredCurrency}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredCurrency: event.target.value,
                  }))
                }
              >
                <option value="LKR">LKR — Sri Lankan Rupees</option>
                <option value="USD">USD — US Dollars</option>
              </select>
            </label>
          </div>
        </section>

        <section className="card settings-section">
          <h2 className="card__title">Discretionary Spending Categories</h2>
          <p className="card__sub">
            Select the categories you consider nonessential.
          </p>

          <div className="settings-categories">
            {categories.map((name) => (
              <label key={name} className="settings-category">
                <input
                  type="checkbox"
                  checked={form.discretionaryCategories.includes(name)}
                  onChange={() => toggleCategory(name)}
                />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </section>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="settings-success" role="status">
            {success}
          </p>
        )}

        <button className="btn-dark settings-save" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </>
  );
}

export default Settings;
