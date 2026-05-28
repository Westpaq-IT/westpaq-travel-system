import { useState } from 'react'
import { NATIONALITIES, VISA_TYPES, VISA_STATUSES, REASONS } from '../lib/supabase'

const DOMESTIC_PORTS = ['LAG', 'PHC', 'ABJ', 'ABV', 'KAN', 'ENU', 'WARI', 'BEN', 'IBA', 'ILR', 'Jos']
const OFFSHORE_LOCS = ['LAG', 'Offshore', 'Bonga North', 'FPSO', 'Vessel']

// Primary companies get quick-pick buttons; anything else goes in free-text
const PRIMARY_COMPANIES = ['WESTPAQ', 'UTC']

function CompanyField({ value, onChange }) {
  // Determine if current value is a primary company or a custom one
  const isPrimary = PRIMARY_COMPANIES.includes(value)
  const [mode, setMode] = useState(
    !value ? 'none' : isPrimary ? 'primary' : 'other'
  )
  const [otherText, setOtherText] = useState(
    !isPrimary && value ? value : ''
  )

  function selectPrimary(company) {
    setMode('primary')
    setOtherText('')
    onChange(company)
  }

  function selectOther() {
    setMode('other')
    onChange(otherText)
  }

  function handleOtherChange(e) {
    setOtherText(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div>
      {/* Quick-pick row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {PRIMARY_COMPANIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => selectPrimary(c)}
            style={{
              padding: '7px 18px',
              borderRadius: 8,
              border: value === c ? '2px solid var(--red)' : '1.5px solid var(--smoke)',
              background: value === c ? 'var(--red)' : 'white',
              color: value === c ? 'white' : 'var(--charcoal)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.3px',
              transition: 'all 0.15s',
            }}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          onClick={selectOther}
          style={{
            padding: '7px 18px',
            borderRadius: 8,
            border: mode === 'other' ? '2px solid var(--red)' : '1.5px solid var(--smoke)',
            background: mode === 'other' ? 'var(--red-light)' : 'white',
            color: mode === 'other' ? 'var(--red-dark)' : 'var(--slate)',
            fontWeight: 500,
            fontSize: 13.5,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
        >
          Other…
        </button>
      </div>

      {/* Free-text input shown when "Other" is selected */}
      {mode === 'other' && (
        <input
          className="form-control"
          type="text"
          value={otherText}
          onChange={handleOtherChange}
          placeholder="Type company name (e.g. BMG, Atlantic Blue Water)"
          autoFocus
        />
      )}
    </div>
  )
}

export default function TravelForm({ type, record, onSave, onClose }) {
  const isEdit = !!record
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const empty = {
    name: '', position: '', company: '', nationality: '',
    visa_type: '', visa_status: '',
    reason: '', departure_date: '', arrival_date: '',
    eta_time: '', etd_time: '', flight_number: '',
    route: '', departure_from: '', arrival_to: '',
    ticket_booking: '', accommodation: '', remarks: '', status: '',
  }

  const [form, setForm] = useState(record ? { ...empty, ...record } : empty)

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }
  function setVal(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name is required'); return }

    setSaving(true)
    const err = await onSave(form)
    if (err) setError(err.message || 'Failed to save. Please try again.')
    setSaving(false)
  }

  const typeLabel = {
    international_arrival: 'International Arrival',
    international_departure: 'International Departure',
    domestic: 'Domestic Flight',
    offshore: 'Offshore Log Entry',
  }[type]

  const showVisa = type === 'international_arrival'
  const showArrivalDate = type === 'international_arrival'
  const showDepartureDate = type !== 'offshore'
  const showDomPorts = type === 'domestic'
  const showOffshoreFields = type === 'offshore'
  const showETA = type === 'international_arrival' || type === 'domestic'
  const showETD = type === 'international_departure' || type === 'domestic'

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isEdit ? 'Edit Record' : `Add ${typeLabel}`}
            </div>
            <div className="modal-subtitle">Bonga North Project — Travel Log</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--red-light)', color: 'var(--red-dark)', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* Person */}
            <div style={{ marginBottom: 4, fontWeight: 600, fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
              Person Details
            </div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group span-2">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={set('name')} placeholder="e.g. JOHN SMITH" required />
              </div>
              <div className="form-group">
                <label className="form-label">Position / Title</label>
                <input className="form-control" value={form.position} onChange={set('position')} placeholder="e.g. Project Manager" />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <CompanyField
                  value={form.company}
                  onChange={v => setVal('company', v)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nationality</label>
                <select className="form-control" value={form.nationality} onChange={set('nationality')}>
                  <option value="">Select...</option>
                  {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <hr className="section-divider" />

            {/* Visa (international arrivals) */}
            {showVisa && (
              <>
                <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                  Visa Information
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Visa Type</label>
                    <select className="form-control" value={form.visa_type} onChange={set('visa_type')}>
                      <option value="">Select...</option>
                      {VISA_TYPES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Visa Status</label>
                    <select className="form-control" value={form.visa_status} onChange={set('visa_status')}>
                      <option value="">Select...</option>
                      {VISA_STATUSES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <hr className="section-divider" />
              </>
            )}

            {/* Offshore status */}
            {showOffshoreFields && (
              <>
                <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                  Offshore Status
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={form.status} onChange={set('status')}>
                      <option value="">Select...</option>
                      <option>OK</option><option>Pending</option><option>Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departure From</label>
                    <select className="form-control" value={form.departure_from} onChange={set('departure_from')}>
                      <option value="">Select...</option>
                      {OFFSHORE_LOCS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arrival To</label>
                    <select className="form-control" value={form.arrival_to} onChange={set('arrival_to')}>
                      <option value="">Select...</option>
                      {OFFSHORE_LOCS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <hr className="section-divider" />
              </>
            )}

            {/* Domestic ports */}
            {showDomPorts && (
              <>
                <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                  Route
                </div>
                <div className="form-grid" style={{ marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Departure From</label>
                    <select className="form-control" value={form.departure_from} onChange={set('departure_from')}>
                      <option value="">Select port...</option>
                      {DOMESTIC_PORTS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Arrival To</label>
                    <select className="form-control" value={form.arrival_to} onChange={set('arrival_to')}>
                      <option value="">Select port...</option>
                      {DOMESTIC_PORTS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <hr className="section-divider" />
              </>
            )}

            {/* Flight details */}
            <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
              Flight Details
            </div>
            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Reason for Travel</label>
                <select className="form-control" value={form.reason} onChange={set('reason')}>
                  <option value="">Select...</option>
                  {REASONS.map(r => <option key={r}>{r}</option>)}
                  <option>TAM Mob</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Flight Number</label>
                <input className="form-control" value={form.flight_number} onChange={set('flight_number')} placeholder="e.g. AF 132" />
              </div>
              {showDepartureDate && (
                <div className="form-group">
                  <label className="form-label">
                    {type === 'domestic' ? 'Date' : 'Departure Date'}
                  </label>
                  <input type="date" className="form-control" value={form.departure_date} onChange={set('departure_date')} />
                </div>
              )}
              {showArrivalDate && (
                <div className="form-group">
                  <label className="form-label">Arrival Date (Lagos)</label>
                  <input type="date" className="form-control" value={form.arrival_date} onChange={set('arrival_date')} />
                </div>
              )}
              {type === 'offshore' && (
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={form.departure_date} onChange={set('departure_date')} />
                </div>
              )}
              {showETA && (
                <div className="form-group">
                  <label className="form-label">ETA (WAT)</label>
                  <input type="time" className="form-control" value={form.eta_time} onChange={set('eta_time')} />
                </div>
              )}
              {showETD && (
                <div className="form-group">
                  <label className="form-label">ETD (WAT)</label>
                  <input type="time" className="form-control" value={form.etd_time} onChange={set('etd_time')} />
                </div>
              )}
              {type !== 'domestic' && type !== 'offshore' && (
                <div className="form-group">
                  <label className="form-label">Home Country Dep. Date</label>
                  <input type="date" className="form-control" value={form.departure_date} onChange={set('departure_date')} />
                </div>
              )}
            </div>

            <hr className="section-divider" />

            {/* Logistics */}
            <div style={{ fontWeight: 600, fontSize: 11, color: 'var(--mist)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
              Logistics
            </div>
            <div className="form-grid" style={{ marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label">Ticket Booking Status</label>
                <select className="form-control" value={form.ticket_booking} onChange={set('ticket_booking')}>
                  <option value="">Select...</option>
                  <option value="ok">OK</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Accommodation</label>
                <input className="form-control" value={form.accommodation} onChange={set('accommodation')} placeholder="e.g. Eko Hotel, Bourdillon D3" />
              </div>
              <div className="form-group span-2">
                <label className="form-label">Remarks</label>
                <input className="form-control" value={form.remarks} onChange={set('remarks')} placeholder="Additional notes..." />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {isEdit ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
