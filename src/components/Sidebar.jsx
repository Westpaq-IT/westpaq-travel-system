import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Sidebar({ currentPage, navigate }) {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = profile?.full_name || user?.email || 'User'
  const initials = (n) => (n || '?').split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()

  function handleNavigate(page) {
    navigate(page)
    setMobileOpen(false)
  }

  const navItem = (page, label, icon) => (
    <button
      key={page}
      className={`nav-item ${currentPage === page ? 'active' : ''}`}
      onClick={() => handleNavigate(page)}
    >
      {icon}
      {label}
    </button>
  )

  const IconDash    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  const IconArr     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  const IconDep     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  const IconPlane   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l3.8 3.8-.8 4 4-1 3.8 3.8z"/></svg>
  const IconAnchor  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>
  const IconReport  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  const IconUsers   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  const IconClose   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  const IconMenu    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
  const IconSignOut = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="./westpaq_logo-01.png"
            alt="Westpaq"
            style={{ height: 36, width: 'auto', objectFit: 'contain', flexShrink: 0 }}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div style={{ flex: 1 }}>
            <div className="sidebar-brand">WESTPAQ</div>
            <div className="sidebar-sub">Travel Log System</div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="mobile-close-btn"
            style={{ display: 'none' }}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        <div className="nav-section">
          <span className="nav-section-label">Overview</span>
          {navItem('dashboard', 'Dashboard', <IconDash />)}
        </div>
        <div className="nav-section">
          <span className="nav-section-label">International</span>
          {navItem('international-arrivals', 'Arrivals', <IconArr />)}
          {navItem('international-departures', 'Departures', <IconDep />)}
        </div>
        <div className="nav-section">
          <span className="nav-section-label">Domestic</span>
          {navItem('domestic', 'Domestic Flights', <IconPlane />)}
        </div>
        <div className="nav-section">
          <span className="nav-section-label">Offshore</span>
          {navItem('offshore', 'Offshore Log', <IconAnchor />)}
        </div>
        <div className="nav-section">
          <span className="nav-section-label">Analytics</span>
          {navItem('reports', 'Reports', <IconReport />)}
          {isAdmin && navItem('users', 'User Management', <IconUsers />)}
        </div>
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--charcoal-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
          <div className="user-avatar">{initials(displayName)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div className="user-role">{profile?.role || 'support'}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '10px 12px',
            background: '#7B1414', border: 'none', borderRadius: 8,
            color: 'white', cursor: 'pointer', fontSize: 13.5,
            fontFamily: 'inherit', fontWeight: 600, transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#9B1C1C'}
          onMouseOut={e => e.currentTarget.style.background = '#7B1414'}
        >
          <IconSignOut />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="mobile-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          className="mobile-menu-btn"
          aria-label="Open menu"
        >
          <IconMenu />
        </button>
        <img
          src="./westpaq_logo-01.png"
          alt="Westpaq"
          style={{ height: 28, width: 'auto', objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--charcoal)' }}>
          WESTPAQ
        </div>
      </div>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Desktop sidebar (always visible) ── */}
      <aside className={`sidebar desktop-sidebar`}>
        {sidebarContent}
      </aside>

      {/* ── Mobile sidebar (slides in) ── */}
      <aside className={`sidebar mobile-sidebar ${mobileOpen ? 'mobile-sidebar-open' : ''}`}>
        {sidebarContent}
      </aside>
    </>
  )
}
