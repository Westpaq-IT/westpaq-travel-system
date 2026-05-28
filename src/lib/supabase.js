import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Flight type constants
export const FLIGHT_TYPES = {
  INTL_ARRIVAL: 'international_arrival',
  INTL_DEPARTURE: 'international_departure',
  DOMESTIC: 'domestic',
  OFFSHORE: 'offshore',
}

export const FLIGHT_TYPE_LABELS = {
  international_arrival: 'International Arrivals',
  international_departure: 'International Departures',
  domestic: 'Domestic Flights',
  offshore: 'Offshore Log',
}

export const COMPANIES = ['WESTPAQ', 'UTC', 'DBR', 'Others']

export const NATIONALITIES = [
  'NIG', 'BRA', 'USA', 'UK', 'LEB', 'CAM', 'EQG', 'CMR', 'NG', 'Other'
]

export const VISA_TYPES = ['VISA ON ARRIVAL', 'TWP', 'N/A', '-', 'Other']
export const VISA_STATUSES = ['APPROVED', 'OK', 'ok', 'PENDING', 'U/P', 'N/A', 'N/R', '-']
export const REASONS = ['BUSINESS TRIP', 'BUSINESS', 'LEAVE', 'TAM Mob', 'N/R', 'Other']
