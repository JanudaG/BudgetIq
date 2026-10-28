import { useState } from "react";
import { todayISO } from "../utils/format.js";
import { formatMoney } from "../utils/currency.js";

const sum = (items) =>
  items.reduce((total, item) => total + Number(item.amount || 0), 0);

const monthName = (key) =>
  new Date(`${key}-01T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

function previousMonths(endMonth, count = 6) {
  const [year, month] = endMonth.split("-").map(Number);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(Date.UTC(year, month - count + index, 1));
    return date.toISOString().slice(0, 7);
  });
}

function InsightCard({
  label,
  value,
  badge,
  badgeTone = "",
  footer,
  progress,
}) {
  return (
    <article className="card insight-card">
      <div className="insight-card__heading">
        <span>{label}</span>
        {badge && (
          <span className={`insight-card__badge ${badgeTone}`}>{badge}</span>
        )}
      </div>
      <p className="insight-card__value">{value}</p>
      {progress !== undefined && (
        <div className="insight-card__track">
          <div
            className="insight-card__progress"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      <p className="insight-card__footer">{footer}</p>
    </article>
  );
}

function getPeriodBounds(monthKey, period) {
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  let start;
  if (period === "quarterly") {
    start = new Date(Date.UTC(year, Math.floor((month - 1) / 3) * 3, 1));
  } else if (period === "ytd") {
    start = new Date(Date.UTC(year, 0, 1));
  } else if (period === "trailing") {
    start = new Date(Date.UTC(year, month - 12, 1));
  } else {
    start = first;
  }
  const end =
    period === "quarterly"
      ? new Date(Date.UTC(year, Math.floor((month - 1) / 3) * 3 + 3, 1))
      : period === "ytd"
        ? new Date(Date.UTC(year, month, 1))
        : period === "trailing"
          ? new Date(Date.UTC(year, month, 1))
          : new Date(Date.UTC(year, month, 1));
  const months =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth();
  const startKey = start.toISOString().slice(0, 7);
  const endKey = end.toISOString().slice(0, 7);
  return { startKey, endKey, months };
}

const ALLOCATION_COLORS = [
  "#0058BE",
  "#2170E4",
  "#A7C2FF",
  "#59627A",
  "#14233B",
  "#818AA5",
  "#009668",
  "#6A5ACD",
];

function CategoryAllocation({ rows, total, type, currency = "LKR" }) {
  const formatCurrency = (amount) => formatMoney(amount, currency);
  // An SVG circle has a circumference of 2 * PI * r.
  const radius = 76;
  const circumference = 2 * Math.PI * radius;

  const segments = rows.map(([name, amount], index) => {
    const fraction = total > 0 ? amount / total : 0;
    const offset =
      total > 0
        ? rows
            .slice(0, index)
            .reduce((sum, [, preceding]) => sum + preceding / total, 0)
        : 0;
    return {
      name,
      amount,
      fraction,
      offset,
      color: ALLOCATION_COLORS[index % ALLOCATION_COLORS.length],
    };
  });

  return (
    <div className="allocation-widget">
      <div className="allocation-donut">
        <svg
          viewBox="0 0 200 200"
          role="img"
          aria-label={`${type === "expense" ? "Expense" : "Income"} allocation by category`}
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#EFF4FF"
            strokeWidth="24"
          />
          {segments.map((segment) => (
            <circle
              key={segment.name}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="24"
              strokeDasharray={`${segment.fraction * circumference} ${circumference}`}
              strokeDashoffset={-segment.offset * circumference}
              transform="rotate(-90 100 100)"
            >
              <title>{`${segment.name}: ${formatCurrency(segment.amount)} (${(segment.fraction * 100).toFixed(1)}%)`}</title>
            </circle>
          ))}
        </svg>
        <div className="allocation-donut__center">
          <span>Total {type === "expense" ? "Outflow" : "Inflow"}</span>
          <strong>{formatCurrency(total)}</strong>
          <small>{total > 0 ? "100% categorized" : "No activity"}</small>
        </div>
      </div>
      {segments.length > 0 ? (
        <ul className="allocation-list">
          {segments.map((segment) => (
            <li key={segment.name} className="allocation-list__item">
              <span
                className="allocation-list__color"
                style={{ backgroundColor: segment.color }}
              />
              <span className="allocation-list__name">{segment.name}</span>
              <span className="allocation-list__percent">
                {(segment.fraction * 100).toFixed(0)}%
              </span>
              <strong className="allocation-list__amount">
                {formatCurrency(segment.amount)}
              </strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="analytics-empty">
          No {type} transactions in the selected period.
        </p>
      )}
    </div>
  );
}

function Analytics({ transactions = [], settings, preferredCurrency = "LKR" }) {
  const formatCurrency = (amount) => formatMoney(amount, preferredCurrency);
  // Keep all figures in one currency even if the caller passes the full ledger.
  const currencyTransactions = transactions.filter(
    (item) => item.currency === preferredCurrency,
  );
  const currentMonth = todayISO().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [categoryType, setCategoryType] = useState("expense");
  const [period, setPeriod] = useState("quarterly");

  const availableMonths = [
    ...new Set([
      currentMonth,
      ...currencyTransactions
        .map((item) => String(item.date || "").slice(0, 7))
        .filter((m) => /^\d{4}-\d{2}$/.test(m)),
    ]),
  ]
    .sort()
    .reverse();

  const bounds = getPeriodBounds(selectedMonth, period);
  const selected = currencyTransactions.filter((item) => {
    const date = String(item.date || "").slice(0, 7);
    return date >= bounds.startKey && date < bounds.endKey;
  });
  const savingsTarget = settings?.savingsTarget ?? 30;
  const discretionaryLimit = settings?.discretionaryLimit ?? 30;
  const discretionaryCategories = new Set(
    (settings?.discretionaryCategories ?? []).map((category) =>
      category.trim().toLowerCase(),
    ),
  );
  const income = sum(selected.filter((item) => item.type === "income"));
  const expenses = sum(selected.filter((item) => item.type === "expense"));
  const monthlyBurn = expenses / bounds.months;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : null;
  const discretionarySpending = sum(
    selected.filter(
      (item) =>
        item.type === "expense" &&
        discretionaryCategories.has(
          String(item.category || "")
            .trim()
            .toLowerCase(),
        ),
    ),
  );
  const discretionaryRatio =
    expenses > 0 ? (discretionarySpending / expenses) * 100 : null;

  // Compare average spending against the preceding period of equal length.
  const [startYear, startMonth] = bounds.startKey.split("-").map(Number);
  const priorStart = new Date(
    Date.UTC(startYear, startMonth - 1 - bounds.months, 1),
  )
    .toISOString()
    .slice(0, 7);
  const priorExpenses = sum(
    currencyTransactions.filter(
      (item) =>
        item.type === "expense" &&
        String(item.date || "").slice(0, 7) >= priorStart &&
        String(item.date || "").slice(0, 7) < bounds.startKey,
    ),
  );
  const priorBurn = priorExpenses / bounds.months;
  const burnChange =
    priorBurn > 0 ? ((monthlyBurn - priorBurn) / priorBurn) * 100 : null;

  const categoryTotals = Object.entries(
    selected
      .filter((item) => item.type === categoryType)
      .reduce((acc, item) => {
        const name = item.category || "Uncategorized";
        acc[name] = (acc[name] || 0) + Number(item.amount || 0);
        return acc;
      }, {}),
  ).sort((a, b) => b[1] - a[1]);

  const categoryTotal = sum(
    selected.filter((item) => item.type === categoryType),
  );
  const months = previousMonths(selectedMonth);
  const monthlyTotals = months.map((key) => {
    const items = currencyTransactions.filter((item) =>
      String(item.date || "").startsWith(key),
    );
    return {
      key,
      income: sum(items.filter((item) => item.type === "income")),
      expense: sum(items.filter((item) => item.type === "expense")),
    };
  });
  const maximum = Math.max(
    1,
    ...monthlyTotals.flatMap((item) => [item.income, item.expense]),
  );

  return (
    <>
      <div className="welcome analytics-heading">
        <div>
          <p className="eyebrow">
            <span className="eyebrow__label">
              REAL-TIME FISCAL INTELLIGENCE
            </span>
          </p>
          <h1 className="welcome__title">
            Financial Analytics &amp; Predictive Insights
          </h1>
          <p className="welcome__sub">
            Spending intelligence, category allocation, savings performance and
            financial resilience.
          </p>
        </div>
        <div
          className="insight-periods"
          role="group"
          aria-label="Analysis period"
        >
          {[
            ["monthly", "Monthly"],
            ["quarterly", "Quarterly"],
            ["ytd", "Year to Date"],
            ["trailing", "Trailing 12M"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={period === value ? "is-active" : ""}
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="analytics-period-detail">
        <label className="analytics-month-picker">
          Period ending
          <select
            aria-label="Select analysis month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {monthName(month)}
              </option>
            ))}
          </select>
        </label>
        <span>
          Showing {bounds.startKey} to {bounds.endKey} (end exclusive)
        </span>
      </div>

      <div className="analytics-metrics">
        <InsightCard
          label="Average Monthly Burn"
          value={formatCurrency(monthlyBurn)}
          badge={
            burnChange === null
              ? "No benchmark"
              : `${burnChange > 0 ? "+" : ""}${burnChange.toFixed(1)}%`
          }
          badgeTone={
            burnChange === null ? "" : burnChange <= 0 ? "positive" : "negative"
          }
          footer={
            priorBurn > 0
              ? `Previous period average: ${formatCurrency(priorBurn)}`
              : "No previous-period spending benchmark"
          }
        />
        <InsightCard
          label="Savings Efficiency"
          value={savingsRate === null ? "N/A" : `${savingsRate.toFixed(1)}%`}
          badge={
            savingsRate === null
              ? "No income"
              : `${savingsRate - savingsTarget >= 0 ? "+" : ""}${(savingsRate - savingsTarget).toFixed(1)} pp`
          }
          badgeTone={
            savingsRate === null
              ? ""
              : savingsRate >= savingsTarget
                ? "positive"
                : "negative"
          }
          progress={savingsRate === null ? 0 : savingsRate}
          footer={`Your savings-rate target: ${savingsTarget}%`}
        />
        <InsightCard
          label="Runway Projection"
          value="N/A"
          badge="—"
          footer="Requires verified liquid reserves; not available from transactions alone"
        />
        <InsightCard
          label="Discretionary Spend Ratio"
          value={
            discretionaryRatio === null
              ? "N/A"
              : `${discretionaryRatio.toFixed(1)}%`
          }
          badge={
            discretionaryRatio === null
              ? "No spending"
              : discretionaryRatio <= discretionaryLimit
                ? "Within guide"
                : "Above guide"
          }
          badgeTone={
            discretionaryRatio === null
              ? ""
              : discretionaryRatio <= discretionaryLimit
                ? "positive"
                : "negative"
          }
          footer={`${discretionaryLimit}% personal ceiling · ${formatCurrency(discretionarySpending)} discretionary spending`}
        />
      </div>

      <div className="analytics-grid">
        <section className="card analytics-panel">
          <div className="card__header">
            <div>
              <h2 className="card__title">Cash Flow Trend</h2>
              <p className="card__sub">
                Six months ending {monthName(selectedMonth)}
              </p>
            </div>
          </div>
          <div className="analytics-legend">
            <span>
              <i className="analytics-legend__dot analytics-legend__dot--income" />{" "}
              Income
            </span>
            <span>
              <i className="analytics-legend__dot analytics-legend__dot--expense" />{" "}
              Expenses
            </span>
          </div>
          <div
            className="analytics-chart"
            role="img"
            aria-label="Income and expenses for six months"
          >
            {monthlyTotals.map((month) => (
              <div className="analytics-chart__column" key={month.key}>
                <div className="analytics-chart__bars">
                  <div
                    className="analytics-chart__bar analytics-chart__bar--income"
                    style={{ height: `${(month.income / maximum) * 100}%` }}
                    title={`${monthName(month.key)} income: ${formatCurrency(month.income)}`}
                  />
                  <div
                    className="analytics-chart__bar analytics-chart__bar--expense"
                    style={{ height: `${(month.expense / maximum) * 100}%` }}
                    title={`${monthName(month.key)} expenses: ${formatCurrency(month.expense)}`}
                  />
                </div>
                <span className="analytics-chart__month">
                  {monthName(month.key).split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
          <div className="analytics-trend-table ledger-scroll">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Income</th>
                  <th>Expenses</th>
                  <th>Net</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTotals.map((month) => (
                  <tr key={month.key}>
                    <td>{monthName(month.key)}</td>
                    <td>{formatCurrency(month.income)}</td>
                    <td>{formatCurrency(month.expense)}</td>
                    <td>{formatCurrency(month.income - month.expense)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card analytics-panel">
          <div className="card__header analytics-category-header">
            <div>
              <h2 className="card__title">Category Breakdown</h2>
              <p className="card__sub">
                {bounds.startKey} through selected period ·{" "}
                {categoryType === "expense" ? "Expenses" : "Income"}
              </p>
            </div>
            <select
              aria-label="Category transaction type"
              value={categoryType}
              onChange={(event) => setCategoryType(event.target.value)}
            >
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
          <CategoryAllocation
            rows={categoryTotals}
            total={categoryTotal}
            type={categoryType}
            currency={preferredCurrency}
          />
        </section>
      </div>

      <p className="analytics-note">
        Based on the signed-in user's saved transactions and financial settings.
        Savings and discretionary benchmarks follow your saved preferences.
        Runway remains unavailable until reliable liquid-reserve data is
        integrated. Monthly averages include months with no transactions.
      </p>
    </>
  );
}

export default Analytics;