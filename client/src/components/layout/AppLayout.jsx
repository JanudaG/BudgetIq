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
} from '../common/Icon.jsx'
import { MONTHLY_TARGET } from '../../constants/mockData.js'
import { formatCurrency } from '../../utils/format.js'

// The sidebar is described as data and rendered with .map(): adding a nav
// item later is one new line here, not a copy-pasted block of JSX.
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Overview', icon: IconGrid },
  { key: 'budget', label: 'Budget Planner', icon: IconPie },
  { key: 'transactions', label: 'Transactions & Ledger', icon: IconReceipt },
  { key: 'analytics', label: 'Analytics & Insights', icon: IconAnalytics },
  { key: 'accounts', label: 'Accounts & Cards', icon: IconCard },
  { key: 'settings', label: 'Settings & Rules', icon: IconSliders },
]

function AppLayout({ children, activeLink, onNavigate }) {
  const targetPercent = Math.round((MONTHLY_TARGET.used / MONTHLY_TARGET.cap) * 100)

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

          <nav className="nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.key}
                  className={`nav-item${activeLink === item.key ? ' active' : ''}`}
                  href={`#${item.key}`}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </a>
              )
            })}
          </nav>
        </div>

        <div className="target">
          <div className="target__top">
            <span className="target__label">Monthly Target</span>
            <span className="badge badge--success">{targetPercent}% used</span>
          </div>
          <div className="progress progress--thin">
            <div className="progress__fill progress__fill--dark" style={{ width: `${targetPercent}%` }} />
          </div>
          <div className="target__bottom">
            <span>
              {formatCurrency(MONTHLY_TARGET.used).replace('.00', '')} /{' '}
              {formatCurrency(MONTHLY_TARGET.cap).replace('.00', '')}
            </span>
            <span className="target__link">Summary</span>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button type="button" className="period-select">
              <IconCalendar size={18} />
              <span>October 2026</span>
              <IconChevronDown size={12} />
            </button>
            <div className="search-wrap">
              <IconSearch size={18} className="search-wrap__icon" />
              <input
                className="search"
                type="search"
                placeholder="Search transactions, merchants, categories..."
                readOnly
              />
            </div>
          </div>

          <div className="topbar__right">
            <button type="button" className="btn-dark" onClick={() => onNavigate('dashboard')}>
              <IconPlus size={14} />
              Add Transaction
            </button>
            <button type="button" className="icon-btn" aria-label="Notifications">
              <IconBell size={18} />
              <span className="icon-btn__dot" />
            </button>
            <div className="user">
              <div className="user__text">
                <p className="user__name">Elena Vance</p>
                <p className="user__plan">Pro Plan</p>
              </div>
              <span className="avatar">EV</span>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout
