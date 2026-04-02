create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  numero_parc text not null,
  categorie text not null,
  marque text,
  modele text,
  localisation_actuelle text,
  statut_actuel text not null default 'disponible',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint machines_numero_parc_key unique (numero_parc),
  constraint machines_numero_parc_not_blank check (btrim(numero_parc) <> ''),
  constraint machines_categorie_not_blank check (btrim(categorie) <> ''),
  constraint machines_statut_actuel_allowed check (
    statut_actuel in ('disponible', 'entree', 'sortie', 'transfert', 'chantier', 'atelier', 'panne', 'maintenance', 'retour')
  )
);

create table if not exists public.daily_declarations (
  id uuid primary key default gen_random_uuid(),
  nom_complet text not null,
  telephone text,
  email text,
  societe text,
  localisation text not null,
  date_declaration date not null,
  remarque text,
  canal_envoi text,
  created_at timestamptz not null default now(),
  constraint daily_declarations_nom_complet_not_blank check (btrim(nom_complet) <> ''),
  constraint daily_declarations_localisation_not_blank check (btrim(localisation) <> ''),
  constraint daily_declarations_canal_envoi_allowed check (
    canal_envoi is null or canal_envoi in ('email', 'whatsapp', 'systeme', 'manuel')
  )
);

create table if not exists public.machine_movements (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references public.machines(id) on delete cascade,
  numero_parc text not null,
  date_mouvement timestamptz not null default now(),
  type_mouvement text not null,
  localisation_depart text,
  localisation_arrivee text,
  chantier text,
  remarque text,
  declared_by text,
  source_declaration_id uuid null references public.daily_declarations(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint machine_movements_numero_parc_not_blank check (btrim(numero_parc) <> ''),
  constraint machine_movements_type_mouvement_allowed check (
    type_mouvement in ('entree', 'sortie', 'transfert', 'chantier', 'atelier', 'panne', 'maintenance', 'retour')
  )
);

create table if not exists public.declaration_machine_items (
  id uuid primary key default gen_random_uuid(),
  declaration_id uuid not null references public.daily_declarations(id) on delete cascade,
  machine_id uuid not null references public.machines(id) on delete cascade,
  numero_parc text not null,
  categorie text not null,
  statut_declare text not null,
  localisation_declaration text,
  created_at timestamptz not null default now(),
  constraint declaration_machine_items_numero_parc_not_blank check (btrim(numero_parc) <> ''),
  constraint declaration_machine_items_categorie_not_blank check (btrim(categorie) <> ''),
  constraint declaration_machine_items_statut_declare_allowed check (
    statut_declare in ('disponible', 'entree', 'sortie')
  )
);

create index if not exists idx_machines_numero_parc on public.machines (numero_parc);
create index if not exists idx_machines_categorie on public.machines (categorie);
create index if not exists idx_machines_localisation_actuelle on public.machines (localisation_actuelle);
create index if not exists idx_machines_statut_actuel on public.machines (statut_actuel);

create index if not exists idx_machine_movements_machine_id on public.machine_movements (machine_id);
create index if not exists idx_machine_movements_numero_parc on public.machine_movements (numero_parc);
create index if not exists idx_machine_movements_date_mouvement on public.machine_movements (date_mouvement desc);
create index if not exists idx_machine_movements_type_mouvement on public.machine_movements (type_mouvement);
create index if not exists idx_machine_movements_localisation_depart on public.machine_movements (localisation_depart);
create index if not exists idx_machine_movements_localisation_arrivee on public.machine_movements (localisation_arrivee);
create index if not exists idx_machine_movements_source_declaration_id on public.machine_movements (source_declaration_id);

create index if not exists idx_daily_declarations_date_declaration on public.daily_declarations (date_declaration desc);
create index if not exists idx_daily_declarations_localisation on public.daily_declarations (localisation);
create index if not exists idx_daily_declarations_nom_complet on public.daily_declarations (nom_complet);

create index if not exists idx_declaration_machine_items_declaration_id on public.declaration_machine_items (declaration_id);
create index if not exists idx_declaration_machine_items_machine_id on public.declaration_machine_items (machine_id);
create index if not exists idx_declaration_machine_items_numero_parc on public.declaration_machine_items (numero_parc);
create index if not exists idx_declaration_machine_items_categorie on public.declaration_machine_items (categorie);

drop trigger if exists set_machines_updated_at on public.machines;
create trigger set_machines_updated_at
before update on public.machines
for each row
execute function public.set_updated_at();

alter table public.machines enable row level security;
alter table public.machine_movements enable row level security;
alter table public.daily_declarations enable row level security;
alter table public.declaration_machine_items enable row level security;

drop policy if exists "Public can read machines" on public.machines;
create policy "Public can read machines"
on public.machines
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert machines" on public.machines;
create policy "Public can insert machines"
on public.machines
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can update machines" on public.machines;
create policy "Public can update machines"
on public.machines
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read movements" on public.machine_movements;
create policy "Public can read movements"
on public.machine_movements
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert movements" on public.machine_movements;
create policy "Public can insert movements"
on public.machine_movements
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read declarations" on public.daily_declarations;
create policy "Public can read declarations"
on public.daily_declarations
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert declarations" on public.daily_declarations;
create policy "Public can insert declarations"
on public.daily_declarations
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can read declaration items" on public.declaration_machine_items;
create policy "Public can read declaration items"
on public.declaration_machine_items
for select
to anon, authenticated
using (true);

drop policy if exists "Public can insert declaration items" on public.declaration_machine_items;
create policy "Public can insert declaration items"
on public.declaration_machine_items
for insert
to anon, authenticated
with check (true);
