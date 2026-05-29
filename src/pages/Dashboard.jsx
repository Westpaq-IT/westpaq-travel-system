import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, addDays, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns'

const TYPE_COLORS = {
  international_arrival:   { accent: '#065F46', label: "Int'l Arrival",   badge: 'badge-arrival'   },
  international_departure: { accent: '#1E40AF', label: "Int'l Departure", badge: 'badge-departure' },
  domestic:                { accent: '#6B21A8', label: 'Domestic',         badge: 'badge-domestic'  },
  offshore:                { accent: '#B45309', label: 'Offshore',         badge: 'badge-offshore'  },
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <span style={{ marginRight: 10 }}>
      <span style={{ color: 'var(--mist)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        {label}:{' '}
      </span>
      <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 500 }}>{value}</span>
    </span>
  )
}

function TimeBlock({ eta, etd, accent }) {
  const etaDisplay = eta ? eta.slice(0, 5) : null
  const etdDisplay = etd ? etd.slice(0, 5) : null

  if (!etaDisplay && !etdDisplay) {
    return (
      <div style={{ minWidth: 60, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--silver)' }}>--:--</div>
      </div>
    )
  }

  return (
    <div style={{ minWidth: 60, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {etaDisplay && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: accent, lineHeight: 1 }}>
            {etaDisplay}
          </div>
          <div style={{ fontSize: 9, color: 'var(--mist)', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 2 }}>
            ETA
          </div>
        </div>
      )}
      {etdDisplay && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: accent, lineHeight: 1 }}>
            {etdDisplay}
          </div>
          <div style={{ fontSize: 9, color: 'var(--mist)', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 2 }}>
            ETD
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ navigate }) {
  const [stats, setStats] = useState({ total: 0, arrivals: 0, departures: 0, domestic: 0, offshore: 0, upcoming7: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const next7  = format(addDays(new Date(), 7), 'yyyy-MM-dd')

    const [totalRes, upcomingRes, recentRes] = await Promise.all([
      supabase.from('travel_records').select('flight_type', { count: 'exact' }).eq('archived', false),
      supabase.from('travel_records')
        .select('*').eq('archived', false)
        .or(`arrival_date.gte.${today},departure_date.gte.${today}`)
        .or(`arrival_date.lte.${next7},departure_date.lte.${next7}`)
        .order('arrival_date', { ascending: true })
        .limit(50),
      supabase.from('travel_records')
        .select('*').eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    if (totalRes.data) {
      const counts = totalRes.data.reduce((acc, r) => {
        acc[r.flight_type] = (acc[r.flight_type] || 0) + 1
        return acc
      }, {})
      setStats({
        total:      totalRes.count || 0,
        arrivals:   counts.international_arrival   || 0,
        departures: counts.international_departure || 0,
        domestic:   counts.domestic  || 0,
        offshore:   counts.offshore  || 0,
        upcoming7:  (upcomingRes.data || []).length,
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
    if (isToday(d))    return 'Today'
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
    { label: 'Total Records',     value: stats.total,      accent: '#636366', nav: 'dashboard'                },
    { label: "Int'l Arrivals",    value: stats.arrivals,   accent: '#065F46', nav: 'international-arrivals'   },
    { label: "Int'l Departures",  value: stats.departures, accent: '#1E40AF', nav: 'international-departures' },
    { label: 'Domestic Flights',  value: stats.domestic,   accent: '#6B21A8', nav: 'domestic'                 },
    { label: 'Offshore Log',      value: stats.offshore,   accent: '#B45309', nav: 'offshore'                 },
    { label: 'Upcoming (7 days)', value: stats.upcoming7,  accent: '#9B1C1C', nav: 'dashboard'                },
  ]

  const grouped = groupByDay(upcoming)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">
            Bonga North Project — Travel Overview · {format(new Date(), 'EEEE, d MMMM yyyy')}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('international-arrivals')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:15,height:15}}>
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Record
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card" onClick={() => navigate(s.nav)} style={{ cursor: 'pointer' }}>
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

          {/* ── Upcoming flights ── */}
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
                      const route = f.departure_from && f.arrival_to
                        ? `${f.departure_from} → ${f.arrival_to}`
                        : f.departure_from || f.arrival_to || null

                      return (
                        <div key={f.id} className="flight-row" style={{ alignItems: 'flex-start', paddingTop: 14, paddingBottom: 14, gap: 14 }}>

                          {/* ETA / ETD block */}
                          <TimeBlock eta={f.eta_time} etd={f.etd_time} accent={tc.accent} />

                          {/* Divider line */}
                          <div style={{ width: 1, background: 'var(--smoke)', alignSelf: 'stretch', flexShrink: 0 }} />

                          {/* Main info */}
                          <div className="flight-info" style={{ flex: 1 }}>
                            <div className="flight-name" style={{ marginBottom: 3 }}>{f.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--mist)', marginBottom: 5 }}>
                              {[f.company, f.position, f.nationality].filter(Boolean).join(' · ')}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                              <Detail label="Route"  value={route} />
                              <Detail label="Reason" value={f.reason} />
                              <Detail label="Ticket" value={f.ticket_booking} />
                              <Detail label="Stay"   value={f.accommodation} />
                              {f.visa_status && <Detail label="Visa"   value={f.visa_status} />}
                              {f.status      && <Detail label="Status" value={f.status} />}
                            </div>
                            {f.remarks && (
                              <div style={{ fontSize: 11, color: 'var(--mist)', marginTop: 4, fontStyle: 'italic' }}>
                                {f.remarks}
                              </div>
                            )}
                          </div>

                          {/* Right: flight number + badge */}
                          <div style={{ textAlign: 'right', flexShrink: 0, paddingTop: 2 }}>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: tc.accent, marginBottom: 5 }}>
                              {f.flight_number || '—'}
                            </div>
                            <span className={`badge ${tc.badge}`} style={{ fontSize: 10 }}>
                              {tc.label}
                            </span>
                          </div>

                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent entries ── */}
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
                const date = r.arrival_date || r.departure_date
                return (
                  <div key={r.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--smoke)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.accent, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--mist)' }}>
                          {[r.company, r.position].filter(Boolean).join(' · ')} · {tc.label}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: tc.accent }}>
                          {date ? format(parseISO(date), 'dd MMM') : '—'}
                        </div>
                        {r.flight_number && (
                          <div style={{ fontSize: 11, color: 'var(--mist)' }}>{r.flight_number}</div>
                        )}
                      </div>
                    </div>
                    {/* Time + detail line */}
                    <div style={{ marginTop: 5, marginLeft: 18, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {r.eta_time && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: tc.accent }}>
                          ETA {r.eta_time.slice(0, 5)}
                        </span>
                      )}
                      {r.etd_time && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: tc.accent }}>
                          ETD {r.etd_time.slice(0, 5)}
                        </span>
                      )}
                      {r.nationality    && <Detail label="Nat"    value={r.nationality} />}
                      {r.reason         && <Detail label="Reason" value={r.reason} />}
                      {r.ticket_booking && <Detail label="Ticket" value={r.ticket_booking} />}
                      {(r.departure_from || r.arrival_to) && (
                        <Detail label="Route" value={[r.departure_from, r.arrival_to].filter(Boolean).join(' → ')} />
                      )}
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
