import { IconArrowRight } from "../common/Icon.jsx";
import { formatCurrency, formatShortDate } from "../../utils/format.js";
import CategoryIcon from "../common/CategoryIcon.jsx";

function RecentActivity({ transactions, onViewAll }) {
  const recent = transactions.slice(0, 5);

  return (
    <section className="card">
      <div className="card__header">
        <h2 className="card__title">Recent Activity</h2>
        <span className="live-dot" title="Live" />
      </div>

      <ul className="activity-list">
        {recent.map((t) => {
          const isIncome = t.type === "income";
          return (
            <li className="activity-item" key={t.id}>
              <div className="activity-item__left">
                <span
                  className={`activity-item__icon${isIncome ? " is-income" : ""}`}
                >
                  <CategoryIcon category={t.category} size={20} />
                </span>
                <div>
                  <p className="activity-item__name">{t.name}</p>
                  <p className="activity-item__meta">
                    {formatShortDate(t.date)} • {t.category}
                  </p>
                </div>
              </div>
              <div className="activity-item__right">
                <p
                  className={`activity-item__amount${isIncome ? " is-income" : ""}`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </p>
                <p className="activity-item__meta">
                  {isIncome ? "Cleared" : t.account}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="link-btn link-btn--footer"
        onClick={onViewAll}
      >
        View all transactions in ledger
        <IconArrowRight size={16} />
      </button>
    </section>
  );
}

export default RecentActivity;
