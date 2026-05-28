import { useState } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TravelLog from './pages/TravelLog.jsx'
import Reports from './pages/Reports.jsx'
import UsersAdmin from './pages/UsersAdmin.jsx'
import Sidebar from './components/Sidebar.jsx'

function AppInner() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" style={{ width: 32, height: 32 }} />
        <p>Loading Travel System...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard navigate={setCurrentPage} />
      case 'international-arrivals': return <TravelLog type="international_arrival" />
      case 'international-departures': return <TravelLog type="international_departure" />
      case 'domestic': return <TravelLog type="domestic" />
      case 'offshore': return <TravelLog type="offshore" />
      case 'reports': return <Reports />
      case 'users': return <UsersAdmin />
      default: return <Dashboard navigate={setCurrentPage} />
    }
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} navigate={setCurrentPage} />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
