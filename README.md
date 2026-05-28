# Westpaq-UTC Travel Management System

## Setup Instructions

### 1. Supabase Setup
1. Create a free account at https://supabase.com
2. Create a new project (e.g. "westpaq-travel")
3. Run the SQL in `supabase-schema.sql` in the Supabase SQL Editor
4. Copy your Project URL and Anon Key from Settings > API

### 2. Configure the App
Edit `src/config.js` and update:
- `SUPABASE_URL` with your Project URL
- `SUPABASE_ANON_KEY` with your Anon public key

### 3. Deploy to GitHub Pages
1. Push this repo to GitHub
2. In GitHub repo Settings > Pages, set source to GitHub Actions
3. The included workflow will auto-deploy on push

### 4. First Admin Login
- Sign up at the app using **it@westpaq.com**
- Then run this in Supabase SQL Editor to grant admin rights:
  ```sql
  UPDATE user_profiles SET role = 'admin'
  WHERE id = (SELECT id FROM auth.users WHERE email = 'it@westpaq.com');
  ```

## Features
- International Arrivals & Departures tracking
- Domestic Departures & Arrivals (Nigeria domestic flights)
- Offshore Departures & Arrivals (Bonga North)
- Dashboard with upcoming flights (7-day view)
- Search and filter by name, company, flight number
- Export to PDF and Excel
- User authentication (Admin + Support roles)
- Audit trail for all changes
