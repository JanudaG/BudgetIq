

import { useState } from "react";
import KpiCard from "../components/dashboard/KpiCard.jsx";
import EnvelopeCard from "../components/dashboard/EnvelopeCard.jsx";
import QuickAddForm from "../components/dashboard/QuickAddForm.jsx";
import RecentActivity from "../components/dashboard/RecentActivity.jsx";
import { IconArrowRight } from "../components/common/Icon.jsx";
import { formatMoney } from "../utils/currency.js";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

const total = (list) =>
  list.reduce((sum, t) => sum + Number(t.amount || 0), 0);

function Dashboard({
  transactions = [],
  envelopes = [],
  onAddTransaction,
  accounts = [],
  settings,
  preferredCurrency = "LKR",
  onNavigate,
  user,
}) {
  const [period, setPeriod] = useState("month");

  const money = (amount) =>
    formatMoney(amount, preferredCurrency);

  const now = new Date();

  const monthKey = (date) =>
    `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

  const currentMonth = monthKey(now);

  const previousMonth = monthKey(
    new Date(now.getFullYear(), now.getMonth() - 1, 1)
  );

  const selectedMonth =
    period === "compare" ? previousMonth : currentMonth;

  // Only include transactions in the selected currency.
  const reportingTransactions = transactions.filter(
    (transaction) =>
      transaction.currency === preferredCurrency
  );

  const monthTransactions = reportingTransactions.filter(
    (transaction) =>
      transaction.date?.startsWith(selectedMonth)
  );

  const incomeList = monthTransactions.filter(
    (transaction) => transaction.type === "income"
  );

  const expenseList = monthTransactions.filter(
    (transaction) => transaction.type === "expense"
  );

  const income = total(incomeList);
  const expenses = total(expenseList);

  // Only include budget envelopes in the selected currency.
  const reportingEnvelopes = envelopes.filter(
    (envelope) =>
      envelope.currency === preferredCurrency
  );

  const allocated = reportingEnvelopes.reduce(
    (sum, envelope) =>
      sum + Number(envelope.limit || 0),
    0
  );

  const spendingPercent =
    allocated > 0
      ? Math.round((expenses / allocated) * 100)
      : null;

  const buffer = allocated - expenses;

  const savingsRate =
    income > 0
      ? ((income - expenses) / income) * 100
      : null;

  const savingsTarget = settings?.savingsTarget;

  const savingsDelta =
    savingsRate !== null && savingsTarget != null
      ? savingsRate - savingsTarget
      : null;

  // Calculate balances using only accounts in the
  // selected reporting currency.
  const reportingAccounts = accounts.filter(
    (account) =>
      account.currency === preferredCurrency
  );

  const trackedBalance = reportingAccounts.reduce(
    (sum, account) =>
      sum +
      Number(
        account.balance ??
        account.openingBalance ??
        0
      ),
    0
  );

  // Calculate liquid funds in the selected currency.
  const liquidBalance = reportingAccounts
    .filter((account) => account.isLiquid)
    .reduce(
      (sum, account) =>
        sum +
        Number(
          account.balance ??
          account.openingBalance ??
          0
        ),
      0
    );

  // Calculate current-period spending by category.
  const spentByCategory = {};

  expenseList.forEach((transaction) => {
    spentByCategory[transaction.category] =
      (spentByCategory[transaction.category] || 0) +
      Number(transaction.amount || 0);
  });

  return (
    <>
      <div className="welcome">
        <div>
          <h1 className="welcome__title">
            {getGreeting()},{" "}
            {user?.name?.split(" ")[0] || "there"} 👋
          </h1>

          <p className="welcome__sub">
            Here is your real-time financial health
            and monthly cash flow summary.
          </p>
        </div>

        <div className="segmented">
          <button
            type="button"
            className={
              period === "month" ? "is-active" : ""
            }
            onClick={() => setPeriod("month")}
          >
            This Month
          </button>

          <button
            type="button"
            className={
              period === "compare" ? "is-active" : ""
            }
            onClick={() => setPeriod("compare")}
          >
            Previous Month
          </button>
        </div>
      </div>

      <div className="kpi-row">
        <KpiCard
          label={`Tracked ${preferredCurrency} Balances`}
          value={money(trackedBalance)}
          badge={{
            tone: "info",
            text: `${reportingAccounts.length} ${preferredCurrency} accounts`,
          }}
          footerLabel={`Liquid ${preferredCurrency} Funds`}
          footerValue={
            reportingAccounts.length > 0
              ? money(liquidBalance)
              : `No ${preferredCurrency} accounts`
          }
        />

        <KpiCard
          label="Monthly Income"
          value={money(income)}
          badge={{
            tone: "info",
            text: `${incomeList.length} inflows`,
          }}
          footerLabel="Reporting Period"
          footerValue={selectedMonth}
        />

        <KpiCard
          label="Monthly Spending"
          value={money(expenses)}
          subLabel={
            spendingPercent === null
              ? "No budget configured"
              : `${spendingPercent}% of budget`
          }
          progress={
            spendingPercent === null
              ? undefined
              : Math.max(0, spendingPercent)
          }
          footerLabel="Budget Remaining"
          footerValue={
            allocated > 0
              ? money(buffer)
              : "Create a budget"
          }
          footerTone={
            buffer < 0 ? "danger" : "default"
          }
          boxedFooter={false}
        />

        <KpiCard
          label="Net Savings Rate"
          value={
            savingsRate === null
              ? "N/A"
              : `${savingsRate.toFixed(1)}%`
          }
          badge={
            savingsDelta === null
              ? {
                  tone: "info",
                  text: "No comparison",
                }
              : savingsDelta >= 0
                ? {
                    tone: "success",
                    text: "On Target",
                  }
                : {
                    tone: "danger",
                    text: "Below Target",
                  }
          }
          footerLabel={
            savingsTarget == null
              ? "Target unavailable"
              : `vs ${savingsTarget}% Target`
          }
          footerValue={
            savingsDelta === null
              ? "No comparison available"
              : `${savingsDelta.toFixed(1)} percentage points`
          }
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
                Real-time expenditure limits tracking
                against envelope caps
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
            {reportingEnvelopes.slice(0, 4).map(
              (envelope) => (
                <EnvelopeCard
                  key={envelope.id}
                  category={envelope.category}
                  subtitle={envelope.subtitle}
                  spent={
                    spentByCategory[
                      envelope.category
                    ] || 0
                  }
                  limit={envelope.limit}
                  currency={preferredCurrency}
                />
              )
            )}
          </div>
        </section>

        <div className="side-column">
          <QuickAddForm
            onAddTransaction={onAddTransaction}
            accounts={accounts}
          />

          <RecentActivity
            transactions={reportingTransactions}
            onViewAll={() =>
              onNavigate("transactions")
            }
          />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
