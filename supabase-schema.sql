-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Bookings table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  tracking_id text unique not null,
  user_id uuid references public.profiles(id) on delete set null,

  -- Sender details
  sender_name text not null,
  sender_phone text not null,
  sender_address text not null,
  sender_city text not null,
  sender_pincode text not null,
  sender_state text not null,

  -- Receiver details
  receiver_name text not null,
  receiver_phone text not null,
  receiver_address text not null,
  receiver_city text not null,
  receiver_pincode text not null,
  receiver_state text not null,

  -- Package details
  package_type text not null check (package_type in ('document', 'parcel', 'fragile', 'heavy')),
  weight_kg numeric(6,2) not null,
  description text,

  -- Pricing
  amount integer not null, -- in paise

  -- Payment
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,

  -- Booking status
  status text default 'pending' check (status in ('pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),

  estimated_delivery date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings enable row level security;

create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users can insert own bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

-- Allow tracking without login (public tracking by tracking_id handled in API)

-- Tracking updates table
create table public.tracking_updates (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade,
  status text not null,
  location text,
  description text not null,
  created_at timestamptz default now()
);

alter table public.tracking_updates enable row level security;

create policy "Anyone can view tracking updates" on public.tracking_updates
  for select using (true);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.handle_updated_at();

-- Run these additional queries in Supabase SQL Editor

-- Add COD and driver fields to bookings table
alter table public.bookings
  add column if not exists payment_method text default 'online' check (payment_method in ('online', 'cod')),
  add column if not exists cod_charge integer default 0,
  add column if not exists driver_name text,
  add column if not exists driver_phone text;

-- Admin whitelist table
create table if not exists public.admin_users (
  id uuid default uuid_generate_v4() primary key,
  identifier text unique not null, -- email or phone
  name text,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;

create policy "Admins can read admin_users" on public.admin_users
  for select using (true);
