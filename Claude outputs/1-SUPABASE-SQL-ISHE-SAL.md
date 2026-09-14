# 1-ci Addım (SƏN et) — Supabase-də cədvəlləri yarat

Bu, bütün auth xətalarının (AdapterError, login/register-dən sonra panelin açılmaması, OTP verify-də 400 xətası) ƏSAS SƏBƏBİDİR: Supabase-də `users`, `accounts`, `sessions`, `verification_tokens` cədvəlləri hələ yaradılmayıb. Kod bu cədvəllərə yazmağa çalışır, cədvəl tapılmadığı üçün server xəta qaytarır.

## Necə edilir

1. https://supabase.com/dashboard ünvanına get, `weartry` layihəsinə daxil ol.
2. Sol menyudan **"SQL Editor"** seç.
3. **"New query"** düyməsinə bas.
4. Aşağıdakı SQL-in TAMAMINI kopyala və editora yapışdır:

```sql
-- Auth.js Supabase Adapter tələb etdiyi standart sxem
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  gender text,
  "emailVerified" timestamptz,
  image text,
  created_at timestamptz default now()
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
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

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  expires timestamptz not null,
  "sessionToken" text not null unique
);

create table if not exists public.verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

-- WearTry-a məxsus əlavə cədvəllər
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
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
  user_id uuid not null references public.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- Row Level Security aktivləşdir
alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.wishlists enable row level security;

-- Service role tam giriş (server-side, Auth.js adapter üçün)
drop policy if exists "Service role full access users" on public.users;
create policy "Service role full access users" on public.users for all using (true) with check (true);

drop policy if exists "Service role full access orders" on public.orders;
create policy "Service role full access orders" on public.orders for all using (true) with check (true);

drop policy if exists "Service role full access wishlists" on public.wishlists;
create policy "Service role full access wishlists" on public.wishlists for all using (true) with check (true);
```

5. Sağ aşağıda **"Run"** (və ya `Cmd+Enter`) bas.
6. "Success. No rows returned" kimi bir mesaj görməlisən (xəta olmamalıdır).
7. Yoxlamaq üçün: sol menyudan **"Table Editor"** seç — `users`, `accounts`, `sessions`, `verification_tokens`, `orders`, `wishlists` cədvəllərinin siyahıda göründüyünə əmin ol.

Bunu etdikdən sonra 2-ci fayldakı (`claude-code-komanda-9-fix-hamısı.md`) komandanı Claude Code-a ver.
