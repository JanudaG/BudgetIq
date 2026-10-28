import { useState } from 'react'
import EnvelopeCard from '../components/dashboard/EnvelopeCard.jsx'
import StatCard from '../components/common/StatCard.jsx'
import { IconPie, IconReceipt, IconBolt, IconShield } from '../components/common/Icon.jsx'
import { CATEGORIES, ENVELOPE_GROUPS } from '../constants/categories.js'
import { formatMoney } from '../utils/currency.js'

const sum = (values) => values.reduce((total, value) => total + value, 0)
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0)
const currentMonth = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}

function EnvelopeControls({ env, onUpdateEnvelope, onDeleteEnvelope }) {
  const [draftLimit, setDraftLimit] = useState(String(env.limit))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function saveLimit(event) {
    event.preventDefault()
    const nextLimit = Number(draftLimit)

    if (!draftLimit.trim() || !Number.isFinite(nextLimit) || nextLimit <= 0) {
      setError('Enter a budget limit greater than zero.')
      return
    }
    if (nextLimit === env.limit) return

    setBusy(true)
    setError('')
    try {
      await onUpdateEnvelope(env.id, { limit: nextLimit })
    } catch (err) {
      setError(err.message || 'Could not update the limit.')
    } finally {
      setBusy(false)
    }
  }

  async function changeRollover(event) {
    const nextValue = event.target.checked
    setBusy(true)
    setError('')
    try {
      await onUpdateEnvelope(env.id, { rollover: nextValue })
    } catch (err) {
      setError(err.message || 'Could not update rollover.')
    } finally {
      setBusy(false)
    }
  }

  async function removeEnvelope() {
    if (!window.confirm(`Remove the “${env.category}” budget envelope? Your transactions will not be deleted.`)) return
    setBusy(true)
    setError('')
    try {
      await onDeleteEnvelope(env.id)
    } catch (err) {
      setError(err.message || 'Could not remove the envelope.')
      setBusy(false)
    }
  }

  return (
    <div className="envelope-controls" style={{ flexWrap: 'wrap', gap: 8 }}>
      <form onSubmit={saveLimit} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <label htmlFor={`limit-${env.id}`}>Limit {env.currency}</label>
        <input
          id={`limit-${env.id}`}
          type="number"
          min="0.01"
          step="0.01"
          required
          value={draftLimit}
          onChange={(event) => setDraftLimit(event.target.value)}
          disabled={busy}
          style={{ marginLeft: 0 }}
        />
        <button type="submit" disabled={busy || Number(draftLimit) === env.limit}>Save</button>
      </form>
      <label className="envelope-controls__check">
        <input type="checkbox" checked={env.rollover} onChange={changeRollover} disabled={busy} />
        Rollover
      </label>
      <button type="button" className="ledger__delete" onClick={removeEnvelope} disabled={busy}>
        Remove
      </button>
      {error && <p role="alert" className="form-error" style={{ flexBasis: '100%' }}>{error}</p>}
    </div>
  )
}

function Budget({ transactions, envelopes, onAddEnvelope, onUpdateEnvelope, onDeleteEnvelope, preferredCurrency = 'USD' }) {
  const formatCurrency = (value) => formatMoney(value, preferredCurrency);
  const month = currentMonth()
  const monthTransactions = transactions.filter((transaction) => transaction.date?.startsWith(month) && transaction.currency === preferredCurrency)
  const income = sum(monthTransactions.filter((t) => t.type === 'income').map((t) => t.amount))
  const expenseList = monthTransactions.filter((t) => t.type === 'expense')
  const expenses = sum(expenseList.map((t) => t.amount))

  const spentByCategory = {}
  expenseList.forEach((transaction) => {
    spentByCategory[transaction.category] = (spentByCategory[transaction.category] || 0) + transaction.amount
  })
  const spentOf = (env) => spentByCategory[env.category] || 0

  const allocated = sum(envelopes.map((env) => env.limit))
  const critical = envelopes.filter((env) => env.limit > 0 && spentOf(env) / env.limit >= 0.9)
  const rolloverReserve = sum(
    envelopes.filter((env) => env.rollover).map((env) => Math.max(env.limit - spentOf(env), 0)),
  )

  const groups = ENVELOPE_GROUPS.map((group) => {
    const items = envelopes.filter((env) => env.group === group.name)
    return {
      ...group,
      items,
      limit: sum(items.map((env) => env.limit)),
      spent: sum(items.map(spentOf)),
    }
  })

  const available = CATEGORIES.filter((c) => !envelopes.some((env) => env.category === c))
  const [group, setGroup] = useState(ENVELOPE_GROUPS[0].name)
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const chosen = available.includes(category) ? category : available[0]

  async function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(limit)
    if (!chosen || !limit.trim() || !Number.isFinite(amount) || amount <= 0) {
      setCreateError('Choose a category and enter a limit greater than zero.')
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      await onAddEnvelope({
        category: chosen,
        group,
        subtitle: 'Custom envelope',
        limit: amount,
        currency: preferredCurrency,
        rollover: false,
      })
      setCategory('')
      setLimit('')
    } catch (err) {
      setCreateError(err.message || 'Could not create the budget envelope.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__label">Allocation Engine</span>
            <span className="eyebrow__dot" />
            <span>Live Synchronized</span>
          </p>
          <h1 className="welcome__title">Budget Planner &amp; Envelope Allocation</h1>
          <p className="welcome__sub">
            Manage budget limits and compare them with transaction spending for {month}.
          </p>
        </div>
      </div>

      <div className="stat-strip">
        <StatCard label="Total Allocated" icon={<IconPie size={14} />} iconClass="is-blue" value={formatCurrency(allocated)}>
          <span className="badge badge--info">{pct(allocated, income)}%</span>
          <span>of {formatCurrency(income)} income</span>
        </StatCard>
        <StatCard label="Total Spent This Month" icon={<IconReceipt size={14} />} iconClass="is-red" value={formatCurrency(expenses)}>
          <span className="badge badge--info">Burn {pct(expenses, income)}%</span>
          <span>{formatCurrency(income - expenses)} balance</span>
        </StatCard>
        <StatCard label="Estimated Rollover" icon={<IconBolt size={14} />} iconClass="is-dark" value={formatCurrency(rolloverReserve)} valueClass="is-income">
          <span>Unspent funds in rollover-enabled envelopes (not yet carried forward)</span>
        </StatCard>
        <StatCard label="Critical Envelopes" icon={<IconShield size={14} />} iconClass="is-red" value={`${critical.length} Flags`}>
          <span>{critical.length ? `${critical.length} of ${envelopes.length} at 90% or more` : 'All envelopes below 90%'}</span>
        </StatCard>
      </div>

      {groups.map((groupItem) => groupItem.items.length > 0 && (
        <section key={groupItem.name} className="card budget-group">
          <div className="card__header">
            <div>
              <h2 className="card__title">{groupItem.name}</h2>
              <p className="card__sub">{groupItem.description}</p>
            </div>
            <div className="budget-group__sum">
              <strong>{formatCurrency(groupItem.spent)} / {formatCurrency(groupItem.limit)}</strong>
              <span>{pct(groupItem.spent, groupItem.limit)}% group burn</span>
            </div>
          </div>
          <div className="envelope-grid">
            {groupItem.items.map((env) => (
              <div key={env.id} className="envelope-wrap">
                <EnvelopeCard category={env.category} subtitle={env.subtitle} spent={spentOf(env)} limit={env.limit} currency={preferredCurrency} />
                <EnvelopeControls
                  key={`${env.id}-${env.limit}`}
                  env={env}
                  onUpdateEnvelope={onUpdateEnvelope}
                  onDeleteEnvelope={onDeleteEnvelope}
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="card budget-group">
        <h2 className="card__title">Allocation Split</h2>
        <p className="card__sub">How your {formatCurrency(allocated)} is divided across groups</p>
        {allocated > 0 ? (
          <>
            <div className="split">
              {groups.map((g, index) => g.limit > 0 && (
                <div key={g.name} className={`split__seg split__seg--${index}`} style={{ width: `${(g.limit / allocated) * 100}%` }} />
              ))}
            </div>
            <ul className="split__legend">
              {groups.map((g, index) => (
                <li key={g.name}>
                  <span className={`split__dot split__seg--${index}`} />
                  {g.name} · {formatCurrency(g.limit)} ({pct(g.limit, allocated)}%)
                </li>
              ))}
            </ul>
          </>
        ) : <p className="card__sub">Create an envelope to see your allocation split.</p>}
      </section>

      <section className="card budget-new">
        <h2 className="card__title">Create New Budget Envelope</h2>
        {available.length === 0 ? (
          <p className="card__sub">Every category already has an envelope.</p>
        ) : (
          <form className="budget-form" onSubmit={handleSubmit}>
            <select aria-label="Budget category" value={chosen} onChange={(e) => setCategory(e.target.value)} disabled={creating}>
              {available.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select aria-label="Envelope group" value={group} onChange={(e) => setGroup(e.target.value)} disabled={creating}>
              {ENVELOPE_GROUPS.map((g) => <option key={g.name} value={g.name}>{g.name}</option>)}
            </select>
            <input aria-label="Monthly limit" type="number" min="0.01" step="0.01" required placeholder="Monthly limit" value={limit} onChange={(e) => setLimit(e.target.value)} disabled={creating} />
            <button type="submit" className="btn-dark" disabled={creating}>{creating ? 'Creating...' : 'Create Envelope'}</button>
            {createError && <p role="alert" className="form-error" style={{ flexBasis: '100%' }}>{createError}</p>}
          </form>
        )}
      </section>
    </>
  )
}

export default Budget
