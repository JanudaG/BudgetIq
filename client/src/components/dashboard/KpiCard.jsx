// One reusable card for all four KPI tiles at the top of the dashboard.
// The four cards in Figma look almost identical, so instead of writing the
// same markup four times we write it once and pass different props.
//
// Props are the "inputs" of a component. Optional ones (badge, subLabel,
// progress) are simply left out when a card doesn't need them.
function KpiCard({
  label,
  value,
  badge, // { text, tone: 'success' | 'info', icon?: <element> }
  subLabel, // small muted text next to the label, e.g. "72% utilized"
  progress, // number 0-100, shows a thin progress bar when provided
  footerLabel,
  footerValue,
  footerTone = 'default', // 'default' | 'success' | 'info' | 'danger'
  boxedFooter = true,
}) {
  return (
    <article className="card kpi-card">
      <div>
        <div className="kpi-card__head">
          <span className="kpi-card__label">{label}</span>
          {badge && (
            <span className={`badge badge--${badge.tone}`}>
              {badge.icon}
              {badge.text}
            </span>
          )}
          {subLabel && <span className="kpi-card__sub">{subLabel}</span>}
        </div>

        <p className="kpi-card__value">{value}</p>

        {progress !== undefined && (
          <div className="progress progress--thin">
            <div className="progress__fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
      </div>

      <div className={boxedFooter ? 'kpi-card__footer kpi-card__footer--boxed' : 'kpi-card__footer'}>
        <span className="kpi-card__footer-label">{footerLabel}</span>
        <span className={`kpi-card__footer-value tone--${footerTone}`}>{footerValue}</span>
      </div>
    </article>
  )
}

export default KpiCard
