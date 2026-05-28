import { useAuth } from '../hooks/useAuth.jsx'

const icons = {
  dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  arrival: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  departure: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  plane: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l3.8 3.8-.8 4 4-1 3.8 3.8z"/>
    </svg>
  ),
  anchor: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/>
      <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
    </svg>
  ),
  report: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
}

export default function Sidebar({ currentPage, navigate }) {
  const { user, profile, isAdmin, signOut } = useAuth()

  const initials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-mark">WU</div>
          <div>
            <div className="sidebar-brand">WESTPAQ · UTC</div>
            <div className="sidebar-sub">Travel Log System</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <span className="nav-section-label">Overview</span>
          <button
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigate('dashboard')}
          >
            <icons.dashboard />
            Dashboard
          </button>
        </div>

        <div className="nav-section">
          <span className="nav-section-label">International</span>
          <button
            className={`nav-item ${currentPage === 'international-arrivals' ? 'active' : ''}`}
            onClick={() => navigate('international-arrivals')}
          >
            <icons.arrival />
            Arrivals
          </button>
          <button
            className={`nav-item ${currentPage === 'international-departures' ? 'active' : ''}`}
            onClick={() => navigate('international-departures')}
          >
            <icons.departure />
            Departures
          </button>
        </div>

        <div className="nav-section">
          <span className="nav-section-label">Domestic</span>
          <button
            className={`nav-item ${currentPage === 'domestic' ? 'active' : ''}`}
            onClick={() => navigate('domestic')}
          >
            <icons.plane />
            Domestic Flights
          </button>
        </div>

        <div className="nav-section">
          <span className="nav-section-label">Offshore</span>
          <button
            className={`nav-item ${currentPage === 'offshore' ? 'active' : ''}`}
            onClick={() => navigate('offshore')}
          >
            <icons.anchor />
            Offshore Log
          </button>
        </div>

        <div className="nav-section">
          <span className="nav-section-label">Analytics</span>
          <button
            className={`nav-item ${currentPage === 'reports' ? 'active' : ''}`}
            onClick={() => navigate('reports')}
          >
            <icons.report />
            Reports
          </button>
          {isAdmin && (
            <button
              className={`nav-item ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => navigate('users')}
            >
              <icons.users />
              User Management
            </button>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials(displayName)}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role">{profile?.role || 'support'}</div>
          </div>
          <button className="logout-btn" onClick={signOut} title="Sign out">
            <icons.logout />
          </button>
        </div>
      </div>
    </aside>
  )
}
