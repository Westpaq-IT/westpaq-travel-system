import { useState, useEffect, useCallback } from 'react'
import { supabase, FLIGHT_TYPE_LABELS, COMPANIES, NATIONALITIES, VISA_TYPES, VISA_STATUSES, REASONS } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { useAuth } from '../hooks/useAuth.jsx'
import TravelForm from '../components/TravelForm.jsx'

const PAGE_SIZE = 20

const TYPE_CONFIG = {
  international_arrival: {
    color: '#065F46', bg: '#D1FAE5', badge: 'badge-arrival',
    cols: ['name', 'position', 'company', 'nationality', 'visa_status', 'reason', 'departure_date', 'arrival_date', 'eta_time', 'flight_number', 'ticket_booking', 'accommodation'],
    headers: ['Name', 'Position', 'Company', 'Nat', 'Visa', 'Reason', 'Dep. Date', 'Arr. Date', 'ETA', 'Flight #', 'Ticket', 'Accomm.'],
  },
  international_departure: {
    color: '#1E40AF', bg: '#DBEAFE', badge: 'badge-departure',
    cols: ['name', 'position', 'company', 'nationality', 'reason', 'departure_date', 'flight_number', 'etd_time', 'ticket_booking', 'accommodation'],
    headers: ['Name', 'Position', 'Company', 'Nat', 'Reason', 'Dep. Date', 'Flight #', 'ETD', 'Ticket', 'Accomm.'],
  },
  domestic: {
    color: '#6B21A8', bg: '#EDE9FE', badge: 'badge-domestic',
    cols: ['name', 'position', 'company', 'departure_from', 'arrival_to', 'reason', 'departure_date', 'etd_time', 'eta_time', 'flight_number', 'ticket_booking', 'accommodation'],
    headers: ['Name', 'Position', 'Company', 'From', 'To', 'Reason', 'Date', 'ETD', 'ETA', 'Flight #', 'Ticket', 'Accomm.'],
  },
  offshore: {
    color: '#B45309', bg: '#FEF3C7', badge: 'badge-offshore',
    cols: ['name', 'position', 'company', 'nationality', 'status', 'departure_from', 'arrival_to', 'reason', 'departure_date', 'ticket_booking'],
    headers: ['Name', 'Position', 'Company', 'Nat', 'Status', 'From', 'To', 'Reason', 'Date', 'Booking'],
  },
}

function formatCell(key, value) {
  if (!value || value === '-' || value === 'null') return <span style={{ color: 'var(--silver)' }}>—</span>
  if (key === 'arrival_date' || key === 'departure_date') {
    try { return format(parseISO(value), 'dd MMM yyyy') } catch { return value }
  }
  if (key === 'eta_time' || key === 'etd_time') {
    return value.slice(0, 5)
  }
  if (key === 'visa_status' || key === 'status') {
    const v = String(value).toUpperCase()
    if (['OK', 'APPROVED', 'ok'].includes(v)) return <span className="badge badge-ok">{value}</span>
    if (['PENDING', 'U/P'].includes(v)) return <span className="badge badge-pending">{value}</span>
    if (['N/A', '-', 'N/R'].includes(v)) return <span className="badge badge-na">{value}</span>
    return <span className="badge badge-approved">{value}</span>
  }
  return String(value)
}

export default function TravelLog({ type }) {
  const { isAdmin } = useAuth()
  const config = TYPE_CONFIG[type]
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('travel_records')
      .select('*', { count: 'exact' })
      .eq('flight_type', type)
      .eq('archived', false)

    if (search) {
      q = q.or(`name.ilike.%${search}%,company.ilike.%${search}%,flight_number.ilike.%${search}%,position.ilike.%${search}%`)
    }
    if (companyFilter) {
      q = q.ilike('company', `%${companyFilter}%`)
    }

    const sortCol = type === 'international_arrival' ? 'arrival_date' : 'departure_date'
    q = q.order(sortCol, { ascending: false, nullsFirst: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    const { data, count, error } = await q
    if (!error) {
      setRecords(data || [])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [type, search, companyFilter, page])

  useEffect(() => {
    setPage(0)
  }, [type, search, companyFilter])

  useEffect(() => {
    fetch()
  }, [fetch])

  async function handleDelete(id) {
    if (!window.confirm('Archive this record?')) return
    setDeleting(id)
    await supabase.from('travel_records').update({ archived: true }).eq('id', id)
    fetch()
    setDeleting(null)
  }

  async function handleSave(formData) {
    const payload = { ...formData, flight_type: type }

    if (editRecord) {
      const { error } = await supabase
        .from('travel_records')
        .update(payload)
        .eq('id', editRecord.id)
      if (!error) {
        setShowForm(false)
        setEditRecord(null)
        fetch()
      }
      return error
    } else {
      const { error } = await supabase
        .from('travel_records')
        .insert([payload])
      if (!error) {
        setShowForm(false)
        fetch()
      }
      return error
    }
  }

  function handleExportCSV() {
    const headers = config.headers
    const rows = records.map(r =>
      config.cols.map(c => {
        const v = r[c]
        if (!v) return ''
        if (c === 'arrival_date' || c === 'departure_date') {
          try { return format(parseISO(v), 'dd/MM/yyyy') } catch { return v }
        }
        return String(v).replace(/,/g, ';')
      })
    )
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const label = FLIGHT_TYPE_LABELS[type]
  const accentColor = config.color

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title" style={{ color: accentColor }}>{label}</div>
          <div className="page-subtitle">{total.toLocaleString()} record{total !== 1 ? 's' : ''} · Bonga North Project</div>
        </div>
        <div className="header-actions">
          <div className="search-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search name, company, flight..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCSV} title="Export CSV">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setEditRecord(null); setShowForm(true) }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Record
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <span style={{ fontSize: 12, color: 'var(--mist)', marginRight: 4 }}>Company:</span>
        <button
          className={`filter-chip ${companyFilter === '' ? 'active' : ''}`}
          onClick={() => setCompanyFilter('')}
        >All</button>
        {COMPANIES.map(c => (
          <button
            key={c}
            className={`filter-chip ${companyFilter === c ? 'active' : ''}`}
            onClick={() => setCompanyFilter(companyFilter === c ? '' : c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ margin: '0 28px 24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--smoke)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>#</th>
                {config.headers.map(h => <th key={h}>{h}</th>)}
                <th style={{ width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={config.headers.length + 2} style={{ textAlign: 'center', padding: 40 }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={config.headers.length + 2}>
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <h3>No records found</h3>
                      <p>{search ? `No results for "${search}"` : 'Click "Add Record" to log a flight'}</p>
                    </div>
                  </td>
                </tr>
              ) : records.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--mist)', fontWeight: 500, fontSize: 12 }}>
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  {config.cols.map(col => (
                    <td key={col}>{formatCell(col, r[col])}</td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => { setEditRecord(r); setShowForm(true) }}
                        title="Edit"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          title="Archive"
                          style={{ color: 'var(--red)' }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>
            Showing {Math.min(page * PAGE_SIZE + 1, total)}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total.toLocaleString()} records
          </span>
          <div className="page-buttons">
            <button className="page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = page <= 2 ? i : page + i - 2
              if (p >= totalPages) return null
              return (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p + 1}
                </button>
              )
            })}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next ›
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <TravelForm
          type={type}
          record={editRecord}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditRecord(null) }}
        />
      )}
    </>
  )
}
