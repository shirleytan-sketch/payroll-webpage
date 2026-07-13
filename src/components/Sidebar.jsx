import { NavLink } from 'react-router-dom'
import {
  IconLogo,
  IconDashboard,
  IconReport,
  IconDataEntry,
  IconMaster,
  IconWorkers,
  IconAdmin,
} from './icons.jsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: IconDashboard, end: true },
  { to: '/report', label: 'Report', icon: IconReport },
  { to: '/data-entry', label: 'Data Entry', icon: IconDataEntry },
  { to: '/piece-rate-master', label: 'Piece Rate Master', icon: IconMaster },
  { to: '/workers', label: 'Workers', icon: IconWorkers },
  { to: '/admin', label: 'Admin', icon: IconAdmin },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <IconLogo />
        </div>
        <div className="brand-text">
          <div className="name">Piece Rate</div>
          <div className="sub">MJM Mill Payroll</div>
        </div>
      </div>

      <nav className="navlist">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">Rate Version 10 &middot; Effective 01.05.2026</div>
    </aside>
  )
}
