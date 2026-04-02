import { formatDisplayDate } from './formatDeclaration';

export const movementTypeColors = {
  entree: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  sortie: 'border-rose-200 bg-rose-50 text-rose-800',
  transfert: 'border-amber-200 bg-amber-50 text-amber-800',
  chantier: 'border-sky-200 bg-sky-50 text-sky-800',
  atelier: 'border-slate-200 bg-slate-100 text-slate-800',
  panne: 'border-red-200 bg-red-50 text-red-700',
  maintenance: 'border-violet-200 bg-violet-50 text-violet-800',
  retour: 'border-teal-200 bg-teal-50 text-teal-800',
};

export function mapInventoryMachineToRow(machine) {
  return {
    id: machine.id,
    numero_parc: machine.numeroParc,
    categorie: machine.categorie,
    marque: machine.marque || '',
    modele: machine.type || '',
    localisation_actuelle: machine.localisation || '',
    statut_actuel: 'disponible',
    source_sheet: machine.sourceSheet || '',
  };
}

export function normalizeMachineRow(machine) {
  if (!machine) {
    return null;
  }

  return {
    ...machine,
    marque: machine.marque || '',
    modele: machine.modele || machine.type || '',
    localisation_actuelle: machine.localisation_actuelle || machine.localisation || '',
    statut_actuel: machine.statut_actuel || 'disponible',
  };
}

export function normalizeMovementRow(movement) {
  if (!movement) {
    return null;
  }

  return {
    ...movement,
    machine_id: movement.machine_id || movement.machine?.id || '',
    numero_parc: movement.numero_parc || movement.machine?.numero_parc || '',
    type_mouvement: movement.type_mouvement || 'transfert',
    localisation_depart: movement.localisation_depart || '',
    localisation_arrivee: movement.localisation_arrivee || '',
    chantier: movement.chantier || '',
    remarque: movement.remarque || '',
  };
}

export function getMovementTypeLabel(type, t) {
  const key = `history.movementTypes.${type}`;
  const translated = t ? t(key) : key;
  return translated === key ? type : translated;
}

export function getMovementTone(type) {
  return movementTypeColors[type] || 'border-slate-200 bg-slate-50 text-slate-700';
}

export function getMovementDateLabel(movement, locale = 'fr-FR') {
  if (!movement?.date_mouvement) {
    return '-';
  }

  return new Date(movement.date_mouvement).toLocaleString(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function buildTrajectorySummary(movements = [], fallbackLocation = '') {
  const orderedLocations = [];

  movements
    .slice()
    .sort((left, right) => new Date(left.date_mouvement) - new Date(right.date_mouvement))
    .forEach((movement) => {
      if (movement.localisation_depart && orderedLocations.at(-1) !== movement.localisation_depart) {
        orderedLocations.push(movement.localisation_depart);
      }

      if (movement.localisation_arrivee && orderedLocations.at(-1) !== movement.localisation_arrivee) {
        orderedLocations.push(movement.localisation_arrivee);
      }
    });

  if (!orderedLocations.length && fallbackLocation) {
    orderedLocations.push(fallbackLocation);
  }

  return orderedLocations;
}

export function getLatestMovement(movements = []) {
  return movements
    .slice()
    .sort((left, right) => new Date(right.date_mouvement) - new Date(left.date_mouvement))[0] || null;
}

export function getMovementSummaryLine(movement, t, locale) {
  const movementLabel = getMovementTypeLabel(movement.type_mouvement, t);
  const dateLabel = getMovementDateLabel(movement, locale);
  const from = movement.localisation_depart || t('history.noDeparture');
  const to = movement.localisation_arrivee || movement.chantier || t('history.noArrival');
  return `${dateLabel} - ${movementLabel} - ${from} → ${to}`;
}

export function filterLocalMovements(movements, filters = {}) {
  return movements.filter((movement) => {
    const matchesSearch =
      !filters.search ||
      [movement.numero_parc, movement.type_mouvement, movement.localisation_depart, movement.localisation_arrivee, movement.chantier]
        .join(' ')
        .toLowerCase()
        .includes(filters.search.toLowerCase());
    const matchesType = !filters.typeMouvement || movement.type_mouvement === filters.typeMouvement;
    const matchesFrom = !filters.localisationDepart || movement.localisation_depart === filters.localisationDepart;
    const matchesTo = !filters.localisationArrivee || movement.localisation_arrivee === filters.localisationArrivee;
    const movementDate = movement.date_mouvement ? new Date(movement.date_mouvement) : null;
    const matchesStart = !filters.dateStart || !movementDate || movementDate >= new Date(`${filters.dateStart}T00:00:00`);
    const matchesEnd = !filters.dateEnd || !movementDate || movementDate <= new Date(`${filters.dateEnd}T23:59:59`);

    return matchesSearch && matchesType && matchesFrom && matchesTo && matchesStart && matchesEnd;
  });
}

export function exportMovementsAsCsv(movements = []) {
  const header = ['Numero Parc', 'Date Mouvement', 'Type', 'Depart', 'Arrivee', 'Chantier', 'Remarque'];
  const rows = movements.map((movement) => [
    movement.numero_parc,
    movement.date_mouvement,
    movement.type_mouvement,
    movement.localisation_depart,
    movement.localisation_arrivee,
    movement.chantier,
    movement.remarque,
  ]);

  return [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatHistoryDate(dateValue) {
  return formatDisplayDate(dateValue);
}
