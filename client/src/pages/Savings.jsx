import { useEffect, useState } from "react";
import { api } from "../api/api.js";

const blankGoal = { name: "", targetAmount: "", currency: "USD", deadline: "" };
const blankContribution = { amount: "", date: new Date().toLocaleDateString("en-CA"), note: "" };

function money(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: currency === "LKR" ? "LKR" : "USD",
  }).format(amount);
}

function Savings() {
  const [goals, setGoals] = useState([]);
  const [contributions, setContributions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState(blankGoal);
  const [contributingTo, setContributingTo] = useState(null);
  const [editingContribution, setEditingContribution] = useState(null);
  const [contributionForm, setContributionForm] = useState(blankContribution);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const items = await api.getSavingsGoals();
        const lists = await Promise.all(
          items.map((goal) => api.getSavingsContributions(goal.id))
        );
        if (active) {
          setGoals(items);
          setContributions(Object.fromEntries(items.map((goal, i) => [goal.id, lists[i]])));
        }
      } catch (err) {
        if (active) setError(err.message || "Could not load savings goals.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  function startGoal(goal = null) {
    setEditingGoal(goal?.id ?? null);
    setGoalForm(goal ? {
      name: goal.name, targetAmount: String(goal.targetAmount),
      currency: goal.currency, deadline: goal.deadline || "",
    } : { ...blankGoal });
    setGoalOpen(true);
    setError("");
  }

  async function saveGoal(event) {
    event.preventDefault();
    const amount = Number(goalForm.targetAmount);
    if (goalForm.name.trim().length < 2 || !Number.isFinite(amount) || amount <= 0) {
      setError("Enter a goal name (at least two characters) and positive target amount.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = {
        name: goalForm.name.trim(), targetAmount: amount,
        currency: goalForm.currency, deadline: goalForm.deadline,
      };
      if (editingGoal) {
        const saved = await api.updateSavingsGoal(editingGoal, data);
        setGoals((current) => current.map((g) => g.id === saved.id ? saved : g));
      } else {
        const saved = await api.createSavingsGoal(data);
        setGoals((current) => [saved, ...current]);
        setContributions((current) => ({ ...current, [saved.id]: [] }));
      }
      setGoalOpen(false);
    } catch (err) {
      setError(err.message || "Could not save goal.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteGoal(goal) {
    if ((contributions[goal.id] || []).length) {
      setError("Remove this goal's contributions before deleting the goal.");
      return;
    }
    if (!window.confirm(`Delete savings goal “${goal.name}”?`)) return;
    setBusy(true);
    setError("");
    try {
      await api.deleteSavingsGoal(goal.id);
      setGoals((current) => current.filter((g) => g.id !== goal.id));
      setContributions((current) => {
        const next = { ...current };
        delete next[goal.id];
        return next;
      });
    } catch (err) {
      setError(err.message || "Could not delete goal.");
    } finally {
      setBusy(false);
    }
  }

  function startContribution(goalId, contribution = null) {
    setContributingTo(goalId);
    setEditingContribution(contribution?.id ?? null);
    setContributionForm(contribution ? {
      amount: String(contribution.amount), date: contribution.date,
      note: contribution.note || "",
    } : { ...blankContribution, date: new Date().toLocaleDateString("en-CA") });
    setError("");
  }

  async function saveContribution(event) {
    event.preventDefault();
    const amount = Number(contributionForm.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !contributionForm.date) {
      setError("Enter a positive contribution amount and a date.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = { ...contributionForm, amount };
      if (editingContribution) {
        const saved = await api.updateSavingsContribution(contributingTo, editingContribution, payload);
        setContributions((current) => ({
          ...current,
          [contributingTo]: (current[contributingTo] || []).map((c) => c.id === saved.id ? saved : c),
        }));
      } else {
        const saved = await api.createSavingsContribution(contributingTo, payload);
        setContributions((current) => ({
          ...current, [contributingTo]: [saved, ...(current[contributingTo] || [])],
        }));
      }
      setContributingTo(null);
      setEditingContribution(null);
    } catch (err) {
      setError(err.message || "Could not save contribution.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteContribution(goalId, contribution) {
    if (!window.confirm("Delete this savings contribution?")) return;
    setBusy(true);
    setError("");
    try {
      await api.deleteSavingsContribution(goalId, contribution.id);
      setContributions((current) => ({
        ...current, [goalId]: (current[goalId] || []).filter((c) => c.id !== contribution.id),
      }));
    } catch (err) {
      setError(err.message || "Could not delete contribution.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="app-status">Loading savings goals...</p>;

  return (
    <>
      <div className="welcome savings-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow__label">Wealth Planning</span></p>
          <h1 className="welcome__title">Savings Goals</h1>
          <p className="welcome__sub">Set targets, record contributions and monitor progress.</p>
        </div>
        <button className="btn-dark" type="button" onClick={() => startGoal()}>
          + New Goal
        </button>
      </div>
      <p className="savings-note">Contributions track goal progress only. They do not move money between bank accounts or modify account balances.</p>
      {error && <p className="savings-error" role="alert">{error}</p>}

      {goalOpen && (
        <section className="card savings-form-card">
          <h2 className="card__title">{editingGoal ? "Edit Savings Goal" : "Create Savings Goal"}</h2>
          <form className="savings-form" onSubmit={saveGoal}>
            <label>Goal name
              <input required minLength={2} maxLength={100} value={goalForm.name}
                onChange={(e) => setGoalForm((f) => ({ ...f, name: e.target.value }))} />
            </label>
            <label>Target amount
              <input required type="number" min="0.01" step="0.01" value={goalForm.targetAmount}
                onChange={(e) => setGoalForm((f) => ({ ...f, targetAmount: e.target.value }))} />
            </label>
            <label>Currency
              <select value={goalForm.currency}
                onChange={(e) => setGoalForm((f) => ({ ...f, currency: e.target.value }))}>
                <option value="USD">USD</option><option value="LKR">LKR</option>
              </select>
            </label>
            <label>Deadline (optional)
              <input type="date" value={goalForm.deadline}
                onChange={(e) => setGoalForm((f) => ({ ...f, deadline: e.target.value }))} />
            </label>
            <div className="savings-form__actions">
              <button type="submit" className="btn-dark" disabled={busy}>{busy ? "Saving..." : "Save Goal"}</button>
              <button type="button" onClick={() => setGoalOpen(false)} disabled={busy}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      {goals.length === 0 ? (
        <section className="card savings-empty">No savings goals yet. Create your first goal to get started.</section>
      ) : (
        <div className="savings-grid">
          {goals.map((goal) => {
            const items = contributions[goal.id] || [];
            const saved = items.reduce((sum, c) => sum + Number(c.amount || 0), 0);
            const remaining = Math.max(0, goal.targetAmount - saved);
            const percentage = goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;
            return (
              <section key={goal.id} className="card savings-card">
                <div className="savings-card__top">
                  <div>
                    <span className="savings-card__eyebrow">Savings goal · {goal.currency}</span>
                    <h2>{goal.name}</h2>
                  </div>
                  <span className="savings-card__percent">{percentage.toFixed(1)}%</span>
                </div>
                <p className="savings-card__amount">{money(saved, goal.currency)}</p>
                <p className="card__sub">of {money(goal.targetAmount, goal.currency)} target</p>
                <div className="savings-progress" role="progressbar" aria-label={`${goal.name} progress`}
                  aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, percentage)}>
                  <div style={{ width: `${Math.min(100, percentage)}%` }} />
                </div>
                <div className="savings-card__details">
                  <span>{money(remaining, goal.currency)} remaining</span>
                  <span>{goal.deadline ? `Due ${goal.deadline}` : "No deadline"}</span>
                </div>
                <div className="savings-card__actions">
                  <button type="button" onClick={() => startContribution(goal.id)}>+ Contribution</button>
                  <button type="button" onClick={() => startGoal(goal)}>Edit goal</button>
                  <button type="button" disabled={busy} className="savings-delete" onClick={() => deleteGoal(goal)}>Delete goal</button>
                </div>
                {contributingTo === goal.id && (
                  <form className="savings-form savings-contribution-form" onSubmit={saveContribution}>
                    <h3>{editingContribution ? "Edit contribution" : "Record contribution"}</h3>
                    <label>Amount ({goal.currency})
                      <input type="number" min="0.01" step="0.01" required value={contributionForm.amount}
                        onChange={(e) => setContributionForm((f) => ({ ...f, amount: e.target.value }))} />
                    </label>
                    <label>Date
                      <input type="date" required value={contributionForm.date}
                        onChange={(e) => setContributionForm((f) => ({ ...f, date: e.target.value }))} />
                    </label>
                    <label className="savings-form__wide">Note (optional)
                      <input maxLength={200} value={contributionForm.note}
                        onChange={(e) => setContributionForm((f) => ({ ...f, note: e.target.value }))} />
                    </label>
                    <div className="savings-form__actions">
                      <button type="submit" className="btn-dark" disabled={busy}>Save Contribution</button>
                      <button type="button" disabled={busy} onClick={() => setContributingTo(null)}>Cancel</button>
                    </div>
                  </form>
                )}
                {items.length > 0 && (
                  <div className="savings-history">
                    <h3>Contributions ({items.length})</h3>
                    {items.map((c) => (
                      <div className="savings-history__row" key={c.id}>
                        <div><strong>{money(c.amount, goal.currency)}</strong><small>{c.date}{c.note ? ` · ${c.note}` : ""}</small></div>
                        <div>
                          <button type="button" onClick={() => startContribution(goal.id, c)}>Edit</button>
                          <button type="button" className="savings-delete" disabled={busy} onClick={() => deleteContribution(goal.id, c)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export default Savings;
