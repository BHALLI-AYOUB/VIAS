create table if not exists public.admin_email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  verified boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint admin_email_verifications_email_not_blank check (btrim(email) <> ''),
  constraint admin_email_verifications_code_hash_not_blank check (btrim(code_hash) <> '')
);

create index if not exists idx_admin_email_verifications_user_id on public.admin_email_verifications (user_id);
create index if not exists idx_admin_email_verifications_email on public.admin_email_verifications (email);
create index if not exists idx_admin_email_verifications_expires_at on public.admin_email_verifications (expires_at desc);
create index if not exists idx_admin_email_verifications_verified on public.admin_email_verifications (verified);

alter table public.admin_email_verifications enable row level security;

drop policy if exists "Admin users can read own verification rows" on public.admin_email_verifications;
create policy "Admin users can read own verification rows"
on public.admin_email_verifications
for select
to authenticated
using (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
    'ayoubbhalli2003@gmail.com',
    'mohammedelkamani1@gmail.com'
  )
);

drop policy if exists "Admin users can update own verification rows" on public.admin_email_verifications;
create policy "Admin users can update own verification rows"
on public.admin_email_verifications
for update
to authenticated
using (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
    'ayoubbhalli2003@gmail.com',
    'mohammedelkamani1@gmail.com'
  )
)
with check (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
    'ayoubbhalli2003@gmail.com',
    'mohammedelkamani1@gmail.com'
  )
);
