import { useState } from 'react'
import EnvelopeCard from '../components/dashboard/EnvelopeCard.jsx'
import StatCard from '../components/common/StatCard.jsx'
import { IconPie, IconReceipt, IconBolt, IconShield } from '../components/common/Icon.jsx'
import { CATEGORIES, ENVELOPE_GROUPS } from '../constants/categories.js'
import { formatCurrency } from '../utils/format.js'

const sum = (list) => list.reduce((s, n) => s + n, 0)
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

function Budget({ transactions, envelopes, onAddEnvelope, onUpdateEnvelope, onDeleteEnvelope }) {
  // ---- Derived numbers (nothing here is stored in state) ----
  const income = sum(transactions.filter((t) => t.type === 'income').map((t) => t.amount))
  const expenseList = transactions.filter((t) => t.type === 'expense')
  const expenses = sum(expenseList.map((t) => t.amount))

  const spentByCategory = {}
  expenseList.forEach((t) => {
    spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount
  })
  const spentOf = (env) => spentByCategory[env.category] || 0

  const allocated = sum(envelopes.map((e) => e.limit))
  const critical = envelopes.filter((e) => e.limit > 0 && spentOf(e) / e.limit >= 0.9)

  // Money left unspent in envelopes that have Rollover switched on.
  const rolloverReserve = sum(
    envelopes.filter((e) => e.rollover).map((e) => Math.max(e.limit - spentOf(e), 0)),
  )

  // One object per group, with its envelopes and totals.
  const groups = ENVELOPE_GROUPS.map((g) => {
    const items = envelopes.filter((e) => e.group === g.name)
    return { ...g, items, limit: sum(items.map((e) => e.limit)), spent: sum(items.map(spentOf)) }
  })

  // ---- Create-envelope form ----
  const available = CATEGORIES.filter((c) => !envelopes.some((e) => e.category === c))
  const [group, setGroup] = useState(ENVELOPE_GROUPS[0].name)
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const chosen = category || available[0]

  function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(limit)
    if (!chosen || !(amount > 0)) return
    onAddEnvelope({ category: chosen, group, subtitle: 'Custom envelope', limit: amount, rollover: false })
    setCategory('')
    setLimit('')
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
            Allocate your monthly income across spending categories, manage rollovers, and set threshold limits.
          </p>
        </div>
      </div>

      <div className="stat-strip">
        <StatCard label="Total Allocated" icon={<IconPie size={14} />} iconClass="is-blue" value={formatCurrency(allocated)}>
          <span className="badge badge--info">{pct(allocated, income)}%</span>
          <span>of {formatCurrency(income)} income</span>
        </StatCard>

        <StatCard label="Total Spent to Date" icon={<IconReceipt size={14} />} iconClass="is-red" value={formatCurrency(expenses)}>
          <span className="badge badge--info">Burn {pct(expenses, income)}%</span>
          <span>{formatCurrency(income - expenses)} left</span>
        </StatCard>

        <StatCard label="Rollover Reserve" icon={<IconBolt size={14} />} iconClass="is-dark" value={formatCurrency(rolloverReserve)} valueClass="is-income">
          <span>Carries to next month</span>
        </StatCard>

        <StatCard label="Critical Envelopes" icon={<IconShield size={14} />} iconClass="is-red" value={`${critical.length} Flags`}>
          <span>
            {critical.length ? `${critical.length} of ${envelopes.length} over 90%` : 'All envelopes healthy'}
          </span>
        </StatCard>
      </div>

      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.name} className="card budget-group">
              <div className="card__header">
                <div>
                  <h2 className="card__title">{g.name}</h2>
                  <p className="card__sub">{g.description}</p>
                </div>
                <div className="budget-group__sum">
                  <strong>
                    {formatCurrency(g.spent)} / {formatCurrency(g.limit)}
                  </strong>
                  <span>{pct(g.spent, g.limit)}% group burn</span>
                </div>
              </div>

              <div className="envelope-grid">
                {g.items.map((env) => (
                  <div key={env.id} className="envelope-wrap">
                    <EnvelopeCard
                      category={env.category}
                      subtitle={env.subtitle}
                      spent={spentOf(env)}
                      limit={env.limit}
                    />
                    <div className="envelope-controls">
                      <label>
                        Limit $
                        <input
                          type="number"
                          min="1"
                          value={env.limit}
                          onChange={(e) => onUpdateEnvelope(env.id, { limit: Number(e.target.value) })}
                        />
                      </label>
                      <label className="envelope-controls__check">
                        <input
                          type="checkbox"
                          checked={env.rollover}
                          onChange={(e) => onUpdateEnvelope(env.id, { rollover: e.target.checked })}
                        />
                        Rollover
                      </label>
                      <button type="button" className="ledger__delete" onClick={() => onDeleteEnvelope(env.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ),
      )}

      <section className="card budget-group">
        <h2 className="card__title">Allocation Split</h2>
        <p className="card__sub">How your {formatCurrency(allocated)} is divided across groups</p>
        {allocated > 0 && (
          <>
            <div className="split">
              {groups.map(
                (g, i) =>
                  g.limit > 0 && (
                    <div key={g.name} className={`split__seg split__seg--${i}`} style={{ width: `${(g.limit / allocated) * 100}%` }} />
                  ),
              )}
            </div>
            <ul className="split__legend">
              {groups.map((g, i) => (
                <li key={g.name}>
                  <span className={`split__dot split__seg--${i}`} />
                  {g.name} · {formatCurrency(g.limit)} ({pct(g.limit, allocated)}%)
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="card budget-new">
        <h2 className="card__title">Create New Budget Envelope</h2>
        {available.length === 0 ? (
          <p className="card__sub">Every category already has an envelope.</p>
        ) : (
          <form className="budget-form" onSubmit={handleSubmit}>
            <select value={chosen} onChange={(e) => setCategory(e.target.value)}>
              {available.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              {ENVELOPE_GROUPS.map((g) => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
            <input type="number" min="1" placeholder="Monthly limit" value={limit} onChange={(e) => setLimit(e.target.value)} />
            <button type="submit" className="btn-dark">Create Envelope</button>
          </form>
        )}
      </section>
    </>
  )
}

export default Budget