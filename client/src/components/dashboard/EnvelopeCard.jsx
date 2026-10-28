import { formatMoney } from "../../utils/currency.js";
import CategoryIcon from "../common/CategoryIcon.jsx";
function EnvelopeCard({ category, subtitle, spent, limit, currency = "USD" }) {
  const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const danger = percent >= 90;
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
        <span
          className={`badge ${danger ? "badge--danger" : "badge--success"}`}
        >
          {percent}% spent
        </span>
      </div>
      <div className="envelope__amounts">
        <span className="envelope__spent">{formatMoney(spent, currency)}</span>
        <span className="envelope__limit">
          Limit: {formatMoney(limit, currency)}
        </span>
      </div>
      <div className="progress">
        <div
          className={`progress__fill${danger ? " is-danger" : ""}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
export default EnvelopeCard;
