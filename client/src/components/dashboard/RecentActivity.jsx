import { formatDate } from "../../utils/format.js";
import { formatMoney } from "../../utils/currency.js";
function RecentActivity({ transactions = [], onViewAll }) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2 className="card__title">Recent Activity</h2>
          <p className="card__sub">Latest recorded transactions</p>
        </div>
        <button type="button" className="link-btn" onClick={onViewAll}>
          View all
        </button>
      </div>
      <div className="ledger-scroll">
        <table className="ledger">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((t) => (
              <tr key={t.id}>
                <td>{formatDate(t.date)}</td>
                <td>{t.name}</td>
                <td>
                  {t.type === "income" ? "+" : "−"}
                  {formatMoney(t.amount, t.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {transactions.length === 0 && (
        <p className="card__sub">No transactions in this period.</p>
      )}
    </section>
  );
}
export default RecentActivity;
