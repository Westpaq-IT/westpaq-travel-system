import { useState, useEffect } from 'react'
import { supabase, FLIGHT_TYPE_LABELS, COMPANIES } from '../lib/supabase'
import { format, parseISO, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns'

export default function Reports() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all')

  useEffect(() => { fetchAll() }, [period])

  async function fetchAll() {
    setLoading(true)
    let q = supabase.from('travel_records').select('*').eq('archived', false)

    if (period === '30d') {
      const d = format(subMonths(new Date(), 1), 'yyyy-MM-dd')
      q = q.or(`arrival_date.gte.${d},departure_date.gte.${d}`)
    } else if (period === '90d') {
      const d = format(subMonths(new Date(), 3), 'yyyy-MM-dd')
      q = q.or(`arrival_date.gte.${d},departure_date.gte.${d}`)
    } else if (period === '6m') {
      const d = format(subMonths(new Date(), 6), 'yyyy-MM-dd')
      q = q.or(`arrival_date.gte.${d},departure_date.gte.${d}`)
    }

    const { data: records } = await q
    setData(records || [])
    setLoading(false)
  }

  // Derived analytics
  const byType = Object.entries(
    data.reduce((acc, r) => { acc[r.flight_type] = (acc[r.flight_type] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1])

  const byCompany = Object.entries(
    data.reduce((acc, r) => {
      const c = r.company || 'Unknown'
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10)

  const byNat = Object.entries(
    data.reduce((acc, r) => {
      const n = r.nationality || 'Unknown'
      acc[n] = (acc[n] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const maxCompany = byCompany[0]?.[1] || 1
  const maxNat = byNat[0]?.[1] || 1
  const maxType = byType[0]?.[1] || 1

  const typeColors = {
    international_arrival: '#065F46',
    international_departure: '#1E40AF',
    domestic: '#6B21A8',
    offshore: '#B45309',
  }

  function handleExportAll() {
    const headers = ['ID', 'Type', 'Name', 'Position', 'Company', 'Nationality', 'Reason', 'Departure Date', 'Arrival Date', 'ETA', 'ETD', 'Flight #', 'From', 'To', 'Ticket', 'Accommodation', 'Remarks']
    const rows = data.map(r => [
      r.id, FLIGHT_TYPE_LABELS[r.flight_type], r.name, r.position, r.company, r.nationality,
      r.reason,
      r.departure_date ? format(parseISO(r.departure_date), 'dd/MM/yyyy') : '',
      r.arrival_date ? format(parseISO(r.arrival_date), 'dd/MM/yyyy') : '',
      r.eta_time || '', r.etd_time || '', r.flight_number || '',
      r.departure_from || '', r.arrival_to || '', r.ticket_booking || '', r.accommodation || '', r.remarks || ''
    ].map(v => `"${String(v || '').replace(/"/g, '""')}"`))
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `westpaq-travel-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const BarRow = ({ label, value, max, color }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
        <span style={{ color: 'var(--charcoal)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--smoke)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${(value / max) * 100}%`,
          background: color || 'var(--red)',
          borderRadius: 3,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Travel data insights — Bonga North Project</div>
        </div>
        <div className="header-actions">
          <div className="section-tabs">
            {[['all', 'All Time'], ['30d', '30 Days'], ['90d', '90 Days'], ['6m', '6 Months']].map(([v, l]) => (
              <button
                key={v}
                className={`section-tab ${period === v ? 'active' : ''}`}
                onClick={() => setPeriod(v)}
              >{l}</button>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleExportAll}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export All
          </button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="stats-grid" style={{ padding: 0, marginBottom: 20 }}>
              <div className="stat-card">
                <div className="stat-accent" style={{ background: 'var(--red)' }} />
                <div className="stat-label">Total Records</div>
                <div className="stat-value">{data.length.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-accent" style={{ background: '#065F46' }} />
                <div className="stat-label">Int'l Arrivals</div>
                <div className="stat-value">{data.filter(r => r.flight_type === 'international_arrival').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-accent" style={{ background: '#1E40AF' }} />
                <div className="stat-label">Int'l Departures</div>
                <div className="stat-value">{data.filter(r => r.flight_type === 'international_departure').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-accent" style={{ background: '#6B21A8' }} />
                <div className="stat-label">Domestic Flights</div>
                <div className="stat-value">{data.filter(r => r.flight_type === 'domestic').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-accent" style={{ background: '#B45309' }} />
                <div className="stat-label">Offshore Log</div>
                <div className="stat-value">{data.filter(r => r.flight_type === 'offshore').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-accent" style={{ background: 'var(--steel)' }} />
                <div className="stat-label">Companies</div>
                <div className="stat-value">{new Set(data.map(r => r.company).filter(Boolean)).size}</div>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>

              {/* By Type */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">By Flight Type</span>
                </div>
                <div className="card-body">
                  {byType.length === 0 ? <p style={{ color: 'var(--mist)', fontSize: 13 }}>No data</p> :
                    byType.map(([type, count]) => (
                      <BarRow
                        key={type}
                        label={FLIGHT_TYPE_LABELS[type] || type}
                        value={count}
                        max={maxType}
                        color={typeColors[type]}
                      />
                    ))
                  }
                </div>
              </div>

              {/* By Company */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">By Company</span>
                </div>
                <div className="card-body">
                  {byCompany.length === 0 ? <p style={{ color: 'var(--mist)', fontSize: 13 }}>No data</p> :
                    byCompany.map(([company, count]) => (
                      <BarRow key={company} label={company} value={count} max={maxCompany} color="var(--red)" />
                    ))
                  }
                </div>
              </div>

              {/* By Nationality */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">By Nationality</span>
                </div>
                <div className="card-body">
                  {byNat.length === 0 ? <p style={{ color: 'var(--mist)', fontSize: 13 }}>No data</p> :
                    byNat.map(([nat, count]) => (
                      <BarRow key={nat} label={nat} value={count} max={maxNat} color="#1E40AF" />
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Reason breakdown */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Travel Reason Breakdown</span>
                <span style={{ fontSize: 12, color: 'var(--mist)' }}>{data.length} total records</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {Object.entries(
                    data.reduce((acc, r) => {
                      const reason = r.reason || 'Not specified'
                      acc[reason] = (acc[reason] || 0) + 1
                      return acc
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).map(([reason, count]) => (
                    <div key={reason} style={{
                      background: 'var(--cloud)',
                      border: '1px solid var(--smoke)',
                      borderRadius: 100,
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                    }}>
                      <span style={{ fontWeight: 500 }}>{reason}</span>
                      <span style={{
                        background: 'var(--red)',
                        color: 'white',
                        borderRadius: 100,
                        padding: '1px 7px',
                        fontSize: 11,
                        fontWeight: 600,
                      }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
