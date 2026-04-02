insert into public.machines (
  numero_parc,
  categorie,
  marque,
  modele,
  localisation_actuelle,
  statut_actuel
)
values
  ('2210/04', 'BOBCAT', 'CATERPILLAR', '277C', 'BIR JDID REFORMER', 'disponible'),
  ('2210/07', 'BOBCAT', 'BOBCAT', 'S130', 'CASA-AIN CHOUK', 'disponible'),
  ('2210/08', 'BOBCAT', 'BOBCAT', 'S130', 'RABAT TGCC', 'disponible'),
  ('3120/01', 'ALIMENTATEUR SUR CHENILLES', 'VOGELE', 'MT 3000-2L', 'ATELIER VIAS', 'disponible'),
  ('3110/05', 'FINISSEUR', 'VOGELE', 'SUPER BOY', 'ATELIER VIAS', 'disponible'),
  ('2310/10', 'MINI PELLE', 'CATERPILLAR', '305 E2', 'AGADIR', 'disponible'),
  ('2320/02', 'TRACTO-PELLE', 'CATERPILLAR', '428E', 'TANGER', 'disponible'),
  ('2330/10', 'PELLE PNEUS', 'CATERPILLAR', 'M320D', 'ATELIER VIAS', 'disponible')
on conflict (numero_parc) do update
set
  categorie = excluded.categorie,
  marque = excluded.marque,
  modele = excluded.modele,
  localisation_actuelle = excluded.localisation_actuelle,
  statut_actuel = excluded.statut_actuel,
  updated_at = now();

insert into public.machine_movements (
  machine_id,
  numero_parc,
  date_mouvement,
  type_mouvement,
  localisation_depart,
  localisation_arrivee,
  chantier,
  remarque,
  declared_by
)
select
  id,
  numero_parc,
  '2026-03-10T08:00:00+00:00',
  'transfert',
  'AGADIR',
  'RABAT TGCC',
  'RABAT TGCC',
  'Transfert chantier de démonstration',
  'Seed script'
from public.machines
where numero_parc = '2210/08';

insert into public.machine_movements (
  machine_id,
  numero_parc,
  date_mouvement,
  type_mouvement,
  localisation_depart,
  localisation_arrivee,
  chantier,
  remarque,
  declared_by
)
select
  id,
  numero_parc,
  '2026-03-18T09:30:00+00:00',
  'atelier',
  'RABAT TGCC',
  'ATELIER VIAS',
  'ATELIER VIAS',
  'Retour atelier de démonstration',
  'Seed script'
from public.machines
where numero_parc = '3110/05';

insert into public.daily_declarations (
  nom_complet,
  telephone,
  email,
  societe,
  localisation,
  date_declaration,
  remarque,
  canal_envoi
)
values (
  'Déclaration test',
  '+212600000000',
  'test@vias.ma',
  'VIAS',
  'ATELIER VIAS',
  '2026-04-02',
  'Déclaration seed de démonstration',
  'email'
)
on conflict do nothing;
