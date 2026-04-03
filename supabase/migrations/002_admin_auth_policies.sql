drop policy if exists "Public can read movements" on public.machine_movements;
drop policy if exists "Public can read declarations" on public.daily_declarations;
drop policy if exists "Public can read declaration items" on public.declaration_machine_items;

create policy "Admin can read movements"
on public.machine_movements
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'ayoubbhalli2003@gmail.com',
    'mohammedelkamani1@gmail.com'
  )
);

create policy "Admin can read declarations"
on public.daily_declarations
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'ayoubbhalli2003@gmail.com',
    'mohammedelkamani1@gmail.com'
  )
);

create policy "Admin can read declaration items"
on public.declaration_machine_items
for select
to authenticated
using (
  lower(auth.jwt() ->> 'email') in (
    'ayoubbhalli2003@gmail.com',
    'mohammedelkamani1@gmail.com'
  )
);

drop policy if exists "Public can read machines" on public.machines;
create policy "Public can read machines"
on public.machines
for select
to anon, authenticated
using (true);
