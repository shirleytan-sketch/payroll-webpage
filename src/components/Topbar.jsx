import { IconBuilding, IconChevron, IconRefresh, IconMoon } from './icons.jsx'

export default function Topbar({ mill, period, onRefresh, onToggleTheme }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="picker">
          <div className="icon-chip">
            <IconBuilding />
          </div>
          <div>
            <span className="label-eyebrow">Mill</span>
            <span className="label-value">{mill}</span>
          </div>
          <IconChevron />
        </div>
        <div className="picker">
          <div>
            <span className="label-eyebrow">Pay Period</span>
            <span className="label-value">{period}</span>
          </div>
          <IconChevron />
        </div>
      </div>
      <div className="topbar-right">
        <button className="icon-btn" title="Refresh" onClick={onRefresh}>
          <IconRefresh />
        </button>
        <button className="icon-btn" title="Toggle dark mode" onClick={onToggleTheme}>
          <IconMoon />
        </button>
      </div>
    </div>
  )
}
