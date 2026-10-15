function StatCard({ label, icon, iconClass, value, valueClass = '', children }) {
  return (
    <div className="stat">
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        <span className={`stat__icon ${iconClass}`}>{icon}</span>
      </div>
      <p className={`stat__value ${valueClass}`}>{value}</p>
      <div className="stat__foot">{children}</div>
    </div>
  )
}

export default StatCard