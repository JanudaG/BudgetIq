import { useState } from "react";
import KpiCard from "../components/dashboard/KpiCard.jsx";
import EnvelopeCard from "../components/dashboard/EnvelopeCard.jsx";
import QuickAddForm from "../components/dashboard/QuickAddForm.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";
import { IconTrendUp, IconArrowRight } from "../components/common/Icon.jsx";
import { ACCOUNT_SUMMARY, MONTHLY } from "../constants/mockData.js";
import { formatCurrency } from "../utils/format.js";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const total = (list) => list.reduce((sum, t) => sum + t.amount, 0);

function Dashboard({
  transactions,
  envelopes,
  onAddTransaction,
  accounts,
  onNavigate,
  user,
}) {
  // Which period button looks selected. It's only visual for now; later it
  // can decide which transactions get counted.
  const [period, setPeriod] = useState("month");

  // ---- Everything below is DERIVED from `transactions` on every render. ----
  // None of it is stored in state, so it can't go stale: log a transaction
  // and App re-renders, which re-runs this function with the new array.
  const incomeList = transactions.filter((t) => t.type === "income");
  const expenseList = transactions.filter((t) => t.type === "expense");

  const income = total(incomeList);
  const expenses = total(expenseList);

  const incomeGoalPercent = Math.round((income / MONTHLY.incomeGoal) * 100);
  const spendingPercent = Math.round((expenses / MONTHLY.spendingCap) * 100);
  const buffer = MONTHLY.spendingCap - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const savingsDelta = savingsRate - MONTHLY.savingsTarget;

  // Build { 'Food & Dining': 840, 'Transportation': 310, ... } in one pass.
  const spentByCategory = {};
  expenseList.forEach((t) => {
    spentByCategory[t.category] = (spentByCategory[t.category] || 0) + t.amount;
  });

  return (
    <>
      <div className="welcome">
        <div>
          <h1 className="welcome__title">
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="welcome__sub">
            Here is your real-time financial health and monthly cash flow
            summary.
          </p>
        </div>
        <div className="segmented">
          <button
            type="button"
            className={period === "month" ? "is-active" : ""}
            onClick={() => setPeriod("month")}
          >
            This Month (Oct 1 - Oct 31)
          </button>
          <button
            type="button"
            className={period === "compare" ? "is-active" : ""}
            onClick={() => setPeriod("compare")}
          >
            Compare with Sept
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard
          label="Total Net Worth"
          value={formatCurrency(ACCOUNT_SUMMARY.netWorth)}
          badge={{
            tone: "success",
            text: `+${ACCOUNT_SUMMARY.netWorthChange}%`,
            icon: <IconTrendUp size={12} />,
          }}
          footerLabel="Liquid Assets"
          footerValue={formatCurrency(ACCOUNT_SUMMARY.liquidAssets)}
        />
        <KpiCard
          label="Monthly Income"
          value={formatCurrency(income)}
          badge={{ tone: "info", text: `${incomeGoalPercent}% of Goal` }}
          footerLabel="Next Expected"
          footerValue={`${MONTHLY.nextIncome.label} (${formatCurrency(MONTHLY.nextIncome.amount)})`}
          footerTone="info"
        />
        <KpiCard
          label="Monthly Spending"
          subLabel={`${spendingPercent}% utilized`}
          value={formatCurrency(expenses)}
          progress={spendingPercent}
          footerLabel="Buffer Remaining"
          footerValue={`${buffer >= 0 ? "+" : "-"}${formatCurrency(Math.abs(buffer))}`}
          footerTone={buffer >= 0 ? "success" : "danger"}
          boxedFooter={false}
        />
        <KpiCard
          label="Net Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          badge={
            savingsDelta >= 0
              ? { tone: "success", text: "Optimal Health" }
              : { tone: "danger", text: "Below Target" }
          }
          footerLabel={`vs ${MONTHLY.savingsTarget}% Target`}
          footerValue={`${savingsDelta >= 0 ? "+" : ""}${savingsDelta.toFixed(1)}% buffer`}
          footerTone={savingsDelta >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="main-grid">
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">
                Budget Allocation &amp; Envelope Health
              </h2>
              <p className="card__sub">
                Real-time expenditure limits tracking against envelope caps
              </p>
            </div>
            <button
              type="button"
              className="link-btn"
              onClick={() => onNavigate("budget")}
            >
              View all categories
              <IconArrowRight size={16} />
            </button>
          </div>

          <div className="envelope-grid">
            {envelopes.slice(0, 4).map((env) => (
              <EnvelopeCard
                key={env.id}
                category={env.category}
                subtitle={env.subtitle}
                spent={spentByCategory[env.category] || 0}
                limit={env.limit}
              />
            ))}
          </div>
        </section>

        <div className="side-column">
          <QuickAddForm
            onAddTransaction={onAddTransaction}
            accounts={accounts}
          />
          <RecentActivity
            transactions={transactions}
            onViewAll={() => onNavigate("transactions")}
          />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
