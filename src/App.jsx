import { useState, useCallback, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Report from './pages/Report.jsx'
import StationReport from './pages/StationReport.jsx'
import Placeholder from './pages/Placeholder.jsx'
import { mockMill, mockPeriod } from './data/mockDashboard.js'
import {
  IconDataEntry,
  IconMaster,
  IconWorkers,
  IconPenalty,
  IconAdmin,
} from './components/icons.jsx'

// HashRouter keeps this working on GitHub Pages without any server-side
// rewrite rules for a static /payroll-webpage/ project site.

function Shell() {
  const [theme, setTheme] = useState(null) // null = follow system preference

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const isDark =
        current === 'dark' ||
        (current === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
      return isDark ? 'light' : 'dark'
    })
  }, [])

  // data-theme must live on <html> so it can override prefers-color-scheme
  // in both directions, matching the tokens defined in styles/tokens.css.
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [theme])

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar
          mill={mockMill}
          period={mockPeriod}
          onRefresh={() => window.location.reload()}
          onToggleTheme={toggleTheme}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
          <Route path="/report/:slug" element={<StationReport />} />
          <Route
            path="/data-entry"
            element={
              <Placeholder
                icon={IconDataEntry}
                title="Data Entry"
                description="Daily production logging (cages tipped, kernel MT, lab tests, mopping weight) will live here."
              />
            }
          />
          <Route
            path="/piece-rate-master"
            element={
              <Placeholder
                icon={IconMaster}
                title="Piece Rate Master"
                description="Versioned piece rate tables per department and station will live here."
              />
            }
          />
          <Route
            path="/workers"
            element={
              <Placeholder
                icon={IconWorkers}
                title="Workers"
                description="The employee roster with role, station, and basic wage will live here."
              />
            }
          />
          <Route
            path="/penalty-incentive"
            element={
              <Placeholder
                icon={IconPenalty}
                title="Penalty & Incentive"
                description="Penalty and incentive rules, and this period's applied entries, will live here."
              />
            }
          />
          <Route
            path="/admin"
            element={
              <Placeholder
                icon={IconAdmin}
                title="Admin"
                description="User access and company/mill management will live here."
              />
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
