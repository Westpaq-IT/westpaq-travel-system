import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth.jsx'
import { format, parseISO } from 'date-fns'

export default function UsersAdmin() {
  const { isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const { data } = await supabase.from('user_profiles').select('*').order('created_at')
    setUsers(data || [])
    setLoading(false)
  }

  async function updateRole(id, role) {
    await supabase.from('user_profiles').update({ role }).eq('id', id)
    fetchUsers()
  }

  if (!isAdmin) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h3>Admin access required</h3>
          <p>Only administrators can manage users.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage system access and roles</div>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <div className="card-header">
            <span className="card-title">System Users</span>
            <span style={{ fontSize: 12, color: 'var(--mist)' }}>{users.length} account{users.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ padding: '0 0 8px' }}>
            <div className="config-banner" style={{ margin: '12px 16px', borderRadius: 'var(--radius-md)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div>
                New users who sign up get <strong>Support</strong> role by default.
                Promote users to <strong>Admin</strong> to give them full delete and user management access.
                You can also run: <code>UPDATE user_profiles SET role = 'admin' WHERE id = '...'</code> in Supabase SQL Editor.
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ width: 160 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: u.role === 'admin' ? 'var(--red)' : 'var(--slate)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0,
                        }}>
                          {(u.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13.5 }}>{u.full_name || 'Unknown'}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--mist)' }}>{u.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-arrival' : 'badge-na'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--mist)', fontSize: 13 }}>
                      {u.created_at ? format(parseISO(u.created_at), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.role !== 'admin' ? (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => updateRole(u.id, 'admin')}
                          >
                            Promote to Admin
                          </button>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => { if (window.confirm('Demote this user to Support?')) updateRole(u.id, 'support') }}
                            style={{ color: 'var(--red)' }}
                          >
                            Demote
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
