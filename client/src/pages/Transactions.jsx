import { formatCurrency, formatDate } from '../utils/format.js'

function Transactions({ transactions, onDeleteTransaction }) {
  return (
    <>
      <h1>Transactions &amp; Ledger</h1>

      <ul>
        {transactions.map((t) => (
          <li key={t.id}>
            {formatDate(t.date)} · {t.name} · {t.category} ·{' '}
            {t.type === 'income' ? '+' : '-'}
            {formatCurrency(t.amount)}{' '}
            <button type="button" onClick={() => onDeleteTransaction(t.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default Transactions


