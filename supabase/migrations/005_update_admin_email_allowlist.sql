drop policy if exists "Admin users can read own verification rows" on public.admin_email_verifications;
create policy "Admin users can read own verification rows"
on public.admin_email_verifications
for select
to authenticated
using (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
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
    'mohammedelkamani1@gmail.com'
  )
)
with check (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
    'mohammedelkamani1@gmail.com'
  )
);

drop policy if exists "Admin users can insert own verification rows" on public.admin_email_verifications;
create policy "Admin users can insert own verification rows"
on public.admin_email_verifications
for insert
to authenticated
with check (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
    'mohammedelkamani1@gmail.com'
  )
);

drop policy if exists "Admin users can delete own verification rows" on public.admin_email_verifications;
create policy "Admin users can delete own verification rows"
on public.admin_email_verifications
for delete
to authenticated
using (
  auth.uid() = user_id
  and lower(auth.jwt() ->> 'email') in (
    'mohammedelkamani1@gmail.com'
  )
);
