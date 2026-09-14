-- Bu layihədə Auth.js adapter cədvəlləri `next_auth` sxemindədir (001-ə bax),
-- `public` deyil — ona görə aşağıdakı ALTER/CREATE-lər də `next_auth`-ı
-- hədəfləyir. `public`-i istifadə etsəydik, bu sütunlar/cədvəllər real
-- `users` cədvəlindən tamam ayrı, istifadəsiz qalardı.

alter table next_auth.users add column if not exists password_hash text;
alter table next_auth.users add column if not exists phone text;
alter table next_auth.users add column if not exists first_name text;
alter table next_auth.users add column if not exists last_name text;

-- Rate-limit / blok cədvəli (şifrə ilə giriş cəhdləri VƏ OTP təsdiq cəhdləri üçün ortaq)
create table if not exists next_auth.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  identifier text not null, -- email
  attempt_type text not null, -- 'login_password' | 'otp_verify'
  failed_count int not null default 1,
  blocked_until timestamptz,
  updated_at timestamptz default now(),
  unique(identifier, attempt_type)
);

alter table next_auth.auth_attempts enable row level security;
drop policy if exists "Service role full access auth_attempts" on next_auth.auth_attempts;
create policy "Service role full access auth_attempts" on next_auth.auth_attempts for all using (true) with check (true);

-- Qeydiyyat / email-dəyişimi / şifrə-bərpası / şifrə-dəyişimi üçün gözləyən OTP kodları.
-- user_id qeydiyyat zamanı hələ istifadəçi yaranmayıb deyə NULL ola bilir;
-- bütün axınlar `identifier` (email) + `change_type` ilə axtarılır.
create table if not exists next_auth.pending_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references next_auth.users(id) on delete cascade,
  identifier text not null,
  change_type text not null, -- 'register' | 'email' | 'password_reset' | 'password_change'
  new_value text,
  code text not null,
  expires timestamptz not null,
  created_at timestamptz default now()
);

alter table next_auth.pending_changes enable row level security;
drop policy if exists "Service role full access pending_changes" on next_auth.pending_changes;
create policy "Service role full access pending_changes" on next_auth.pending_changes for all using (true) with check (true);

-- 001-də `next_auth` sxemi üçün `alter default privileges` artıq işə salınıb,
-- amma bunu təkrar (zərərsiz) yazırıq ki, fayl özü tək başına da tam olsun.
grant all on all tables in schema next_auth to service_role;
grant all on all sequences in schema next_auth to service_role;
