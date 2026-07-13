export default function StatTile({ icon: Icon, label, value, sub, tone, variant }) {
  const tileClass = ['tile', variant ? `tile-${variant}` : null].filter(Boolean).join(' ')
  const valueClass = ['tile-value', tone].filter(Boolean).join(' ')

  return (
    <div className={tileClass}>
      <div className="tile-top">
        <div className="tile-icon">
          <Icon size={14} />
        </div>
        <span className="tile-label">{label}</span>
      </div>
      <div className={valueClass}>{value}</div>
      {sub ? <div className="tile-sub">{sub}</div> : null}
    </div>
  )
}
