import { formatCurrency } from '../../utils/format.js'
import CategoryIcon from '../common/CategoryIcon.jsx'

function EnvelopeCard({ category, subtitle, spent, limit }) {
  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0
  const isDanger = percent >= 90

  return (
    <div className="envelope">
      <div className="envelope__top">
        <div className="envelope__who">
          <span className="envelope__icon">
            <CategoryIcon category={category} size={18} />
          </span>
          <div>
            <p className="envelope__name">{category}</p>
            <p className="envelope__sub">{subtitle}</p>
          </div>
        </div>
        <span className={`badge ${isDanger ? 'badge--danger' : 'badge--success'}`}>{percent}% spent</span>
      </div>

      <div className="envelope__amounts">
        <span className="envelope__spent">{formatCurrency(spent)}</span>
        <span className="envelope__limit">Limit: {formatCurrency(limit)}</span>
      </div>

      <div className="progress">
        <div
          className={`progress__fill${isDanger ? ' is-danger' : ''}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  )
}

export default EnvelopeCard
