import { useState } from "react";
import {
  IconGrid,
  IconPie,
  IconReceipt,
  IconAnalytics,
  IconCard,
  IconSliders,
  IconSearch,
  IconPlus,
  IconBell,
  IconCalendar,
  IconChevronDown,
} from "../common/Icon.jsx";
import { formatMoney } from "../../utils/currency.js";
const NAV_ITEMS = [
  { key: "dashboard", label: "Overview", icon: IconGrid },
  { key: "budget", label: "Budget Planner", icon: IconPie },
  { key: "transactions", label: "Transactions & Ledger", icon: IconReceipt },
  { key: "analytics", label: "Analytics & Insights", icon: IconAnalytics },
  { key: "accounts", label: "Accounts & Cards", icon: IconCard },
  { key: "savings", label: "Savings Goals", icon: IconPie },
  { key: "settings", label: "Settings & Rules", icon: IconSliders },
];
function AppLayout({
  children,
  activeLink,
  onNavigate,
  user,
  onLogout,
  transactions = [],
  envelopes = [],
  preferredCurrency = "USD",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  function go(page) {
    onNavigate(page);
    setMenuOpen(false);
  }
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.currency === preferredCurrency &&
        t.date?.startsWith(currentMonth),
    )
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalBudget = envelopes
    .filter((e) => e.currency === preferredCurrency)
    .reduce((s, e) => s + Number(e.limit || 0), 0);
  const percentage =
    totalBudget > 0 ? Math.round((monthlyExpenses / totalBudget) * 100) : 0;
  const initials = (user?.name || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__top">
          <div className="brand">
            <span className="brand__mark">B</span>
            <div>
              <p className="brand__name">BudgetIQ</p>
              <p className="brand__sub">Financial OS</p>
            </div>
          </div>
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="budgetiq-navigation"
            onClick={() => setMenuOpen((p) => !p)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <nav
            id="budgetiq-navigation"
            className={`nav ${menuOpen ? "nav--open" : ""}`}
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.key}
                  className={`nav-item${activeLink === item.key ? " active" : ""}`}
                  href={`#${item.key}`}
                  onClick={() => go(item.key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>
        <div className="target">
          <div className="target__top">
            <span className="target__label">
              Monthly Budget ({preferredCurrency})
            </span>
            <span className="badge badge--info">
              {totalBudget > 0 ? `${percentage}% used` : "Not set"}
            </span>
          </div>
          <div className="progress progress--thin">
            <div
              className="progress__fill progress__fill--dark"
              style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          <div className="target__bottom">
            <span>
              {formatMoney(monthlyExpenses, preferredCurrency)} /{" "}
              {formatMoney(totalBudget, preferredCurrency)}
            </span>
            <span className="target__link">This month</span>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <div className="period-select">
              <IconCalendar size={18} />
              <span>
                {now.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {preferredCurrency}
              </span>
              <IconChevronDown size={12} />
            </div>
            <div className="search-wrap">
              <IconSearch size={18} className="search-wrap__icon" />
              <input
                className="search"
                type="search"
                placeholder="Search in Transactions & Ledger"
                readOnly
                aria-label="Search available in Transactions & Ledger"
              />
            </div>
          </div>
          <div className="topbar__right">
            <button
              type="button"
              className="btn-dark"
              onClick={() => go("dashboard")}
            >
              <IconPlus size={14} />
              Add Transaction
            </button>
            <span
              className="icon-btn"
              role="img"
              aria-label="Notifications unavailable"
            >
              <IconBell size={18} />
            </span>
            <div className="user">
              <div className="user__text">
                <p className="user__name">{user?.name || "BudgetIQ User"}</p>
                <p className="user__plan">{user?.email}</p>
              </div>
              <span className="avatar">{initials}</span>
              <button type="button" className="logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
export default AppLayout;
