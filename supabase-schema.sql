-- ============================================================
-- WESTPAQ-UTC TRAVEL LOG SYSTEM — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type flight_type as enum (
  'international_arrival',
  'international_departure',
  'domestic',
  'offshore'
);

create type visa_status as enum (
  'APPROVED', 'PENDING', 'N/A', 'OK', 'U/P', 'N/R', 'TWP', '-', 'other'
);

create type travel_reason as enum (
  'BUSINESS TRIP', 'LEAVE', 'TAM Mob', 'BUSINESS', 'N/R', 'other'
);

create type ticket_status as enum (
  'ok', 'OK', 'pending', 'cancelled', 'other'
);

-- ============================================================
-- TRAVEL RECORDS TABLE
-- ============================================================
create table travel_records (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references auth.users(id),

  -- Classification
  flight_type     flight_type not null,

  -- Person info
  name            text not null,
  position        text,
  company         text,
  nationality     text,

  -- Visa (international only)
  visa_type       text,
  visa_status     text,

  -- Travel details
  reason          text,
  departure_date  date,
  arrival_date    date,
  eta_time        time,
  etd_time        time,
  flight_number   text,
  route           text,
  departure_from  text,
  arrival_to      text,

  -- Logistics
  ticket_booking  text,
  accommodation   text,
  remarks         text,

  -- Offshore specific
  status          text,

  -- Soft delete
  archived        boolean not null default false
);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table audit_log (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users(id),
  user_email    text,
  action        text not null, -- 'INSERT' | 'UPDATE' | 'DELETE'
  table_name    text not null,
  record_id     uuid,
  old_data      jsonb,
  new_data      jsonb
);

-- ============================================================
-- USER PROFILES (roles)
-- ============================================================
create table user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'support', -- 'admin' | 'support'
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Travel records: everyone (authenticated) can read; only admins can write
alter table travel_records enable row level security;

create policy "Allow authenticated read"
  on travel_records for select
  using (auth.role() = 'authenticated');

create policy "Allow insert for authenticated"
  on travel_records for insert
  with check (auth.role() = 'authenticated');

create policy "Allow update for authenticated"
  on travel_records for update
  using (auth.role() = 'authenticated');

create policy "Allow delete for admins"
  on travel_records for delete
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Audit log: read-only for everyone, insert via trigger
alter table audit_log enable row level security;

create policy "Allow read audit log"
  on audit_log for select
  using (auth.role() = 'authenticated');

-- User profiles: everyone can read their own, admins read all
alter table user_profiles enable row level security;

create policy "Users can read own profile"
  on user_profiles for select
  using (auth.uid() = id or exists (
    select 1 from user_profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins can insert profiles"
  on user_profiles for insert
  with check (exists (
    select 1 from user_profiles where id = auth.uid() and role = 'admin'
  ));

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on travel_records
  for each row execute function update_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'support')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index idx_travel_flight_type on travel_records(flight_type);
create index idx_travel_arrival_date on travel_records(arrival_date);
create index idx_travel_departure_date on travel_records(departure_date);
create index idx_travel_company on travel_records(company);
create index idx_travel_name on travel_records using gin(to_tsvector('english', name));
create index idx_travel_archived on travel_records(archived);

-- ============================================================
-- SEED: First Admin User
-- 1. Sign up at your deployed app using: it@westpaq.com
-- 2. Then run this in the Supabase SQL Editor to grant admin role:
-- ============================================================
-- UPDATE user_profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'it@westpaq.com');
