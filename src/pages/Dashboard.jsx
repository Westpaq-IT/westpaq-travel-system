import { useState, useEffect } from 'react'
import { supabase, FLIGHT_TYPE_LABELS } from '../lib/supabase'
import { format, addDays, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns'

const TYPE_COLORS = {
  international_arrival: { accent: '#065F46', label: 'Int\'l Arrival', badge: 'badge-arrival' },
  international_departure: { accent: '#1E40AF', label: 'Int\'l Departure', badge: 'badge-departure' },
  domestic: { accent: '#6B21A8', label: 'Domestic', badge: 'badge-domestic' },
  offshore: { accent: '#B45309', label: 'Offshore', badge: 'badge-offshore' },
}

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState({ total: 0, arrivals: 0, departures: 0, domestic: 0, offshore: 0, upcoming7: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const next7 = format(addDays(new Date(), 7), 'yyyy-MM-dd')

    const [totalRes, upcomingRes, recentRes] = await Promise.all([
      supabase.from('travel_records').select('flight_type', { count: 'exact' }).eq('archived', false),
      supabase.from('travel_records')
        .select('*')
        .eq('archived', false)
        .or(`arrival_date.gte.${today},departure_date.gte.${today}`)
        .or(`arrival_date.lte.${next7},departure_date.lte.${next7}`)
        .order('arrival_date', { ascending: true })
        .limit(50),
      supabase.from('travel_records')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    if (totalRes.data) {
      const counts = totalRes.data.reduce((acc, r) => {
        acc[r.flight_type] = (acc[r.flight_type] || 0) + 1
        return acc
      }, {})
      setStats({
        total: totalRes.count || 0,
        arrivals: counts.international_arrival || 0,
        departures: counts.international_departure || 0,
        domestic: counts.domestic || 0,
        offshore: counts.offshore || 0,
        upcoming7: (upcomingRes.data || []).length,
      })
    }

    if (upcomingRes.data) {
      const now = new Date()
      const filtered = upcomingRes.data.filter(r => {
        const d = r.arrival_date || r.departure_date
        if (!d) return false
        const date = parseISO(d)
        return date >= startOfDay(now) && date <= addDays(now, 7)
      }).sort((a, b) => {
        const da = a.arrival_date || a.departure_date
        const db = b.arrival_date || b.departure_date
        return new Date(da) - new Date(db)
      })
      setUpcoming(filtered)
    }

    if (recentRes.data) setRecent(recentRes.data)
    setLoading(false)
  }

  function dayLabel(dateStr) {
    if (!dateStr) return 'TBD'
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Today'
    if (isTomorrow(d)) return 'Tomorrow'
    return format(d, 'EEEE, d MMM')
  }

  function groupByDay(records) {
    const groups = {}
    records.forEach(r => {
      const d = r.arrival_date || r.departure_date || 'TBD'
      if (!groups[d]) groups[d] = []
      groups[d].push(r)
    })
    return groups
  }

  const statCards = [
    { label: 'Total Records', value: stats.total, accent: '#636366', nav: 'dashboard' },
    { label: 'Int\'l Arrivals', value: stats.arrivals, accent: '#065F46', nav: 'international-arrivals' },
    { label: 'Int\'l Departures', value: stats.departures, accent: '#1E40AF', nav: 'international-departures' },
    { label: 'Domestic Flights', value: stats.domestic, accent: '#6B21A8', nav: 'domestic' },
    { label: 'Offshore Log', value: stats.offshore, accent: '#B45309', nav: 'offshore' },
    { label: 'Upcoming (7 days)', value: stats.upcoming7, accent: '#9B1C1C', nav: 'dashboard' },
  ]

  const grouped = groupByDay(upcoming)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Bonga North Project — Travel Overview · {format(new Date(), 'EEEE, d MMMM yyyy')}</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('international-arrivals')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Record
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            onClick={() => navigate(s.nav)}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-accent" style={{ background: s.accent }} />
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">
              {loading ? <span style={{ opacity: 0.3 }}>—</span> : s.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

          {/* Upcoming flights */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Upcoming Flights (Next 7 Days)</span>
              <span style={{ fontSize: 12, color: 'var(--mist)' }}>{upcoming.length} scheduled</span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : upcoming.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2l3.8 3.8-.8 4 4-1 3.8 3.8z"/>
                </svg>
                <h3>No upcoming flights</h3>
                <p>No travel records scheduled for the next 7 days</p>
              </div>
            ) : (
              <div className="flight-timeline">
                {Object.entries(grouped).map(([date, flights]) => (
                  <div key={date} className="day-group">
                    <div className="day-label">{dayLabel(date)}</div>
                    {flights.map(f => {
                      const tc = TYPE_COLORS[f.flight_type] || TYPE_COLORS.domestic
                      const time = f.eta_time || f.etd_time
                      return (
                        <div key={f.id} className="flight-row">
                          <div className="flight-time" style={{ color: tc.accent }}>
                            {time ? time.slice(0, 5) : '--:--'}
                          </div>
                          <div className="flight-info">
                            <div className="flight-name">{f.name}</div>
                            <div className="flight-meta">
                              {f.company} · {f.position}
                              {f.accommodation ? ` · ${f.accommodation}` : ''}
                            </div>
                          </div>
                          <div className="flight-right">
                            <div className="flight-number" style={{ color: tc.accent }}>
                              {f.flight_number || '—'}
                            </div>
                            <div className="flight-route">
                              <span className={`badge ${tc.badge}`} style={{ fontSize: 10 }}>
                                {tc.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent entries */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Entries</span>
            </div>
            <div>
              {loading ? (
                <div style={{ padding: 30, textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : recent.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}>
                  <p>No records yet</p>
                </div>
              ) : recent.map(r => {
                const tc = TYPE_COLORS[r.flight_type] || TYPE_COLORS.domestic
                return (
                  <div key={r.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--smoke)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.accent, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--mist)' }}>
                        {r.company} · {tc.label}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--mist)', flexShrink: 0 }}>
                      {r.arrival_date ? format(parseISO(r.arrival_date), 'dd MMM') :
                       r.departure_date ? format(parseISO(r.departure_date), 'dd MMM') : '—'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
