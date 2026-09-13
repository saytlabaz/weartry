-- Auth.js Supabase Adapter, rəsmi qaydaya görə, öz cədvəllərini `next_auth`
-- adlı ayrıca sxemdə saxlamağı gözləyir (bax: https://authjs.dev/getting-started/adapters/supabase).
-- Bu sxemi `public`-in yerinə istifadə etməyin səbəbi: @auth/supabase-adapter
-- Supabase client-i `db: { schema: "next_auth" }` ilə yaradır — cədvəllər
-- `public`-də olsaydı, adapter onları TAPA BİLMƏZDİ və Google girişi 500 xəta verərdi.
create schema if not exists next_auth;

grant usage on schema next_auth to service_role;
grant all on all tables in schema next_auth to service_role;
grant all on all sequences in schema next_auth to service_role;
grant all on all routines in schema next_auth to service_role;
alter default privileges in schema next_auth grant all on tables to service_role;
alter default privileges in schema next_auth grant all on sequences to service_role;

create table if not exists next_auth.users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  gender text,
  "emailVerified" timestamptz,
  image text,
  created_at timestamptz default now()
);

create table if not exists next_auth.accounts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references next_auth.users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  unique(provider, "providerAccountId")
);

create table if not exists next_auth.sessions (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references next_auth.users(id) on delete cascade,
  expires timestamptz not null,
  "sessionToken" text not null unique
);

create table if not exists next_auth.verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

-- Yalnız service_role girişi (server-side, Auth.js adapter və OTP route-ları üçün)
alter table next_auth.users enable row level security;
alter table next_auth.accounts enable row level security;
alter table next_auth.sessions enable row level security;
alter table next_auth.verification_tokens enable row level security;

create policy "Service role full access users" on next_auth.users for all using (true) with check (true);
create policy "Service role full access accounts" on next_auth.accounts for all using (true) with check (true);
create policy "Service role full access sessions" on next_auth.sessions for all using (true) with check (true);
create policy "Service role full access verification_tokens" on next_auth.verification_tokens for all using (true) with check (true);

-- WearTry-a məxsus əlavə cədvəllər (adi `public` sxemində)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references next_auth.users(id) on delete set null,
  email text not null,
  status text not null default 'pending',
  items jsonb not null,
  shipping_address jsonb not null,
  payment_method text not null,
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references next_auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Row Level Security aktivləşdir
alter table public.orders enable row level security;
alter table public.wishlists enable row level security;

-- Service role tam giriş (server-side)
create policy "Service role full access orders" on public.orders for all using (true) with check (true);
create policy "Service role full access wishlists" on public.wishlists for all using (true) with check (true);
